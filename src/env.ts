import { z } from "zod";

/**
 * Runtime env validation.
 *
 * Add new keys here as phases progress. Keep server-only and client-exposed
 * (`NEXT_PUBLIC_*`) split — server-only schema is never imported into client
 * components. Importing this module on the server throws if required vars
 * are missing.
 *
 * Source of truth for the running list lives in plan_akcji/HAKUNA_BUILD_PLAN.md.
 */

const isServer = typeof window === "undefined";

const clientSchema = z.object({
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_MAPBOX_STYLE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

const serverSchema = clientSchema.extend({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = (isServer ? serverSchema : clientSchema).safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export type Env = typeof env;
