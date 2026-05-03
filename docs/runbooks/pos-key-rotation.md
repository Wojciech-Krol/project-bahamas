# POS encryption key rotation

`POS_CONFIG_ENCRYPTION_KEY` is the AES-256-GCM key used to encrypt
every row in `public.pos_integrations.config_encrypted`. The key is
read by `src/lib/pos/crypto.ts` at every encrypt / decrypt call.

When the key changes, every existing ciphertext becomes unreadable —
the GCM auth-tag check fails and `decryptConfig()` throws. There is
no automatic re-keying; partners would otherwise need to re-enter
upstream credentials after every rotation, which we never want.

This runbook covers the safe rotation procedure: dual-key window,
re-encrypt cron, retire the old key.

## When to rotate

- **Quarterly** as a hygiene baseline.
- **Immediately** if the operator suspects key disclosure (any team
  member with prior env access who has left, repo leak, etc.).
- **After** every change to the environment hosting the secret
  (provider migration, account compromise of Vercel / 1Password).

## Pre-flight (always do first)

1. Confirm there is a recent Supabase backup (Settings → Database →
   Backups → Latest). Rotation is reversible if the backup is good.
2. Note the current `POS_CONFIG_ENCRYPTION_KEY` value somewhere
   external + secure (1Password). You'll need it for the dual-key
   window.
3. Snapshot `pos_integrations` row counts per provider:
   ```sql
   select provider, count(*) from pos_integrations group by provider;
   ```
   Same number must come out at the end.

## Step 1 — Generate the new key

```sh
openssl rand -base64 32
```

Save the output. Call this `K_NEW` for the rest of the procedure.
The current value in production is `K_OLD`.

## Step 2 — Add a transitional decrypt fallback

Edit `src/lib/pos/crypto.ts` to also accept a second decryption key
read from `POS_CONFIG_ENCRYPTION_KEY_PREVIOUS`. Pseudocode:

```ts
function readKey(): Buffer { /* … unchanged */ }
function readPreviousKey(): Buffer | null { /* env var, optional */ }

export function decryptConfig(buf): Record<string, unknown> {
  try {
    return decryptWithKey(readKey(), buf);
  } catch (firstErr) {
    const prev = readPreviousKey();
    if (!prev) throw firstErr;
    return decryptWithKey(prev, buf);
  }
}
```

Ship this change as a normal PR and deploy it. After deploy, every
read still works against `K_OLD`; new writes use whatever
`POS_CONFIG_ENCRYPTION_KEY` is set to (still `K_OLD` at this point).

## Step 3 — Flip the env vars

In Vercel Production env (and every other deploy target):

- Set `POS_CONFIG_ENCRYPTION_KEY_PREVIOUS = K_OLD`
- Set `POS_CONFIG_ENCRYPTION_KEY = K_NEW`

Re-deploy. Now:

- New writes encrypt with `K_NEW`.
- Old rows still decrypt via the fallback to `K_OLD`.
- The cron `/api/cron/pos-sync` continues to function — every read
  succeeds, just maybe via the fallback.

## Step 4 — Re-encrypt every existing row

Run a one-off script (Vercel cron one-shot, local script with the
service-role key, or a Supabase Edge Function — pick whichever is
already trusted to hold the keys):

```ts
import { createAdminClient } from "@/src/lib/db/admin";
import { decryptConfig, encryptConfig, encryptedConfigToPostgres } from "@/src/lib/pos/crypto";

const admin = createAdminClient();
const { data, error } = await admin
  .from("pos_integrations")
  .select("id, config_encrypted");
if (error) throw error;

for (const row of data ?? []) {
  const plain = decryptConfig(row.config_encrypted);
  const reencrypted = encryptedConfigToPostgres(encryptConfig(plain));
  const { error: updateErr } = await admin
    .from("pos_integrations")
    .update({ config_encrypted: reencrypted })
    .eq("id", row.id);
  if (updateErr) {
    console.error(`re-encrypt failed for ${row.id}`, updateErr);
    process.exit(1);
  }
}
```

Run it. Confirm row count unchanged. Spot-check a few rows by
calling `decryptConfig` on the new ciphertext and inspecting the
result.

## Step 5 — Retire the old key

After Step 4 finishes successfully:

- Remove `POS_CONFIG_ENCRYPTION_KEY_PREVIOUS` from every env.
- Re-deploy.
- Wait 24 hours. Monitor `[pos-crypto]` errors in Sentry.
- Revert the transitional fallback in `src/lib/pos/crypto.ts` (the
  PR from Step 2). Ship as a normal PR.

## Rollback

If anything goes wrong in Steps 3 or 4:

- Restore `POS_CONFIG_ENCRYPTION_KEY = K_OLD` immediately.
- Leave `POS_CONFIG_ENCRYPTION_KEY_PREVIOUS = K_OLD` (idempotent).
- Re-deploy.
- The cron + integrations dashboard should recover within a deploy
  cycle.

If a row was partially re-encrypted with `K_NEW` and the env was
flipped back, that row will fail to decrypt. Restore that single
row from the Supabase backup taken in Pre-flight.

## See also

- `src/lib/pos/crypto.ts` — encrypt / decrypt implementation.
- `docs/runbooks/calendar-key-rotation.md` — same procedure for
  `CALENDAR_ENCRYPTION_KEY` (calendar OAuth tokens).
