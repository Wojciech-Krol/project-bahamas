# POS Integration Plan — Faza 1 (CSV) + Faza 2 (eFitness)

> **Status:** Ready for Claude Code auto-mode execution
> **Scope:** CSV adapter + eFitness adapter + fundament `POSAdapter` interface
> **Out of scope:** Reservio, Perfect Gym, SimplyBook, Eversports (Faza 3+, osobny plan)

---

## 0. Kontekst i zasady

### Dlaczego ta kolejność

1. **CSV najpierw** — zmusza do zaprojektowania kanonicznego schematu Hakuny *zanim* zaczniesz mapować obce API. Działa też jako fallback dla każdego POS bez API (WodGuru, GymManager, Fitnet, GYM System).
2. **eFitness drugi** — REST API, lider PL (800–1000 obiektów), pokrywa wszystkie kategorie Hakuny (taniec, sztuki walki, pływanie, joga, akademie). Polish UI, kasa fiskalna.
3. **Reservio, Perfect Gym, SimplyBook** — Faza 3, gdy interfejs `POSAdapter` jest już sprawdzony na dwóch realnych integracjach.

### Zasada — refaktor abstrakcji jest wbudowany w plan

`POSAdapter` interface w Fazie 1 ma minimalny kształt potrzebny dla CSV (batch import, read-only). W Fazie 2 jest **świadomie refaktoryzowany** pod realtime/webhooks/write operations gdy poznamy eFitness API. To nie jest porażka — to jest ten moment, w którym abstrakcja się krystalizuje na **realnych** danych.

**Nie wolno** projektować "uniwersalnego" interfejsu dla wszystkich POS-ów teraz. Trzeci adapter (Faza 3) ustabilizuje interfejs ostatecznie.

### STOP-points dla Claude Code

Claude Code MUSI się zatrzymać i zapytać Wojtka, jeśli:

**Faza 1 (CSV):**
- Schema kanonicznej `Session` lub `ClassDefinition` wymaga decyzji biznesowej (np. czy karnet 10-wejść = jeden product czy seria)
- `partners.owner_user_id` lub equivalent nie istnieje w obecnym schemacie
- Test fixture wymagałby prawdziwych danych partnera (anonymize first)
- Trzeba zmienić istniejący schemat z `app/lib/mockData.ts` w sposób niekompatybilny

**Faza 2 (eFitness):**
- **Brak dokumentacji API** — Claude Code zatrzymuje się i Wojtek kontaktuje eFitness
- **Brak sandbox/test environment** — to jest blocker, nie obejście
- Auth model okazuje się być inny niż OAuth2/API key (np. legacy session-based)
- Webhook signature scheme nie jest udokumentowany
- Rate limity są niejasne lub bardzo restrykcyjne (<10 req/min)
- API zwraca dane w sposób który nie mapuje się na schemat kanoniczny bez utraty informacji

---

## 1. Architektura — `POSAdapter` interface

### Lokalizacja

```
app/lib/pos/
├── types.ts                # POSAdapter interface, shared types, capabilities
├── registry.ts             # Map<pos_id, POSAdapter>
├── errors.ts               # POSError hierarchy
├── canonical/
│   ├── session.ts          # kanoniczny typ Session
│   ├── class.ts            # ClassDefinition
│   ├── instructor.ts
│   └── pricing.ts          # PricingRule
├── csv/
│   ├── adapter.ts          # CSVAdapter implements POSAdapter
│   ├── schema.ts           # Zod schemas dla każdego CSV typu
│   ├── parser.ts           # CSV → Zod-validated rows
│   ├── encoding.ts         # detekcja UTF-8 / Windows-1250
│   ├── mappers.ts          # parsed CSV → kanoniczne typy
│   ├── validator.ts        # cross-row walidacja (FK, duplikaty)
│   └── __tests__/
│       ├── fixtures/
│       │   ├── valid/
│       │   └── invalid/
│       ├── parser.test.ts
│       ├── mappers.test.ts
│       ├── validator.test.ts
│       └── adapter.integration.test.ts
└── efitness/
    ├── adapter.ts          # EFitnessAdapter implements POSAdapter
    ├── client.ts           # raw HTTP client, retry, rate limiting, auth
    ├── auth.ts             # OAuth/API key handling, token refresh
    ├── mappers.ts          # eFitness types → kanoniczne typy
    ├── webhooks.ts         # signature verification, event parsing
    ├── sync.ts             # pull/poll/reconcile logic
    └── __tests__/
        ├── fixtures/
        │   ├── api-responses/    # JSON snapshots z prawdziwego API
        │   └── webhook-payloads/
        ├── client.test.ts
        ├── mappers.test.ts
        ├── webhooks.test.ts
        └── sync.integration.test.ts
```

### `POSAdapter` interface — wersja Faza 1

W Fazie 1 interfejs jest minimalny — tylko batch import, bo CSV nie umie nic więcej.

```typescript
// app/lib/pos/types.ts

export interface POSAdapter {
  readonly id: string;                    // 'csv' | 'efitness'
  readonly capabilities: POSCapabilities;

  importSessions(input: POSImportInput): Promise<POSImportResult<Session>>;
  importClasses(input: POSImportInput): Promise<POSImportResult<ClassDefinition>>;
  importInstructors(input: POSImportInput): Promise<POSImportResult<Instructor>>;
  importPricing(input: POSImportInput): Promise<POSImportResult<PricingRule>>;
}

export interface POSCapabilities {
  canRead: boolean;
  canWrite: boolean;
  hasWebhooks: boolean;
  realtimeSync: boolean;
  supportsCancellation: boolean;
}

export interface POSImportInput {
  partnerId: string;
  source: { type: 'file'; storagePath: string } | { type: 'inline'; content: string };
  importJobId: string;       // dla idempotency + audit
}

export interface POSImportResult<T> {
  jobId: string;
  totalRows: number;
  successfulRows: number;
  errors: POSImportError[];
  upserted: T[];
}

export interface POSImportError {
  rowNumber: number;         // 1-indexed, liczone od pierwszego wiersza danych
  field?: string;
  code: 'VALIDATION' | 'FK_MISSING' | 'DUPLICATE' | 'ENCODING' | 'PARSE';
  message: string;           // PL friendly
  rawRow?: Record<string, unknown>;
}
```

### `POSAdapter` interface — refaktor w Fazie 2

Gdy zaczniemy implementować eFitness, interfejs rozszerzamy o realtime/write/webhooks:

```typescript
export interface POSAdapter {
  readonly id: string;
  readonly capabilities: POSCapabilities;

  // Faza 1 — batch import (każdy adapter musi)
  importSessions(input: POSImportInput): Promise<POSImportResult<Session>>;
  importClasses(input: POSImportInput): Promise<POSImportResult<ClassDefinition>>;
  importInstructors(input: POSImportInput): Promise<POSImportResult<Instructor>>;
  importPricing(input: POSImportInput): Promise<POSImportResult<PricingRule>>;

  // Faza 2 — realtime sync (opcjonalne, sprawdzaj capabilities)
  syncDelta?(input: POSDeltaSyncInput): Promise<POSDeltaSyncResult>;
  fullReconciliation?(input: POSReconciliationInput): Promise<POSReconciliationResult>;

  // Faza 2 — write operations (opcjonalne)
  createBooking?(input: CreateBookingInput): Promise<BookingResult>;
  cancelBooking?(input: CancelBookingInput): Promise<void>;

  // Faza 2 — webhooks (opcjonalne)
  verifyWebhookSignature?(req: WebhookRequest): boolean;
  parseWebhookEvent?(payload: unknown): POSEvent;
}
```

CSV ma `canRead: true`, reszta `false`. eFitness po Fazie 2 ma wszystko `true`. UI Hakuny **musi** sprawdzać `capabilities.canWrite` zanim wyrenderuje przycisk "Zarezerwuj przez Hakuna" — dla CSV pokazuje "Rezerwacja przez stronę partnera" + link.

---

## 2. Schemat kanoniczny Hakuny (wspólny dla wszystkich adapterów)

Wszystkie adaptery mapują do tego samego schematu. Frontend Hakuny zna **tylko** ten schemat.

### Migracje Supabase

#### Migration `001_pos_partners_extension.sql`

```sql
ALTER TABLE partners
  ADD COLUMN pos_provider text NOT NULL DEFAULT 'none'
    CHECK (pos_provider IN ('none', 'csv', 'efitness', 'reservio', 'perfect_gym', 'simplybook')),
  ADD COLUMN pos_config jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN pos_external_id text,                    -- partner ID w POS
  ADD COLUMN pos_credentials_encrypted text,           -- zaszyfrowany token/key
  ADD COLUMN last_pos_sync_at timestamptz,
  ADD COLUMN last_pos_sync_status text
    CHECK (last_pos_sync_status IN ('success', 'partial', 'failed', NULL));
```

#### Migration `002_classes.sql`

```sql
CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  external_id text NOT NULL,            -- ID w systemie partnera
  name text NOT NULL,
  description text,
  category text NOT NULL,               -- 'fitness' | 'dance' | 'language' | 'wellness' | 'kids' | 'martial_arts'
  duration_minutes int NOT NULL CHECK (duration_minutes > 0),
  capacity int CHECK (capacity > 0),
  level text,                           -- 'beginner' | 'intermediate' | 'advanced' | NULL
  language text DEFAULT 'pl',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, external_id)
);

CREATE INDEX idx_classes_partner ON classes(partner_id);
CREATE INDEX idx_classes_category ON classes(category);
```

#### Migration `003_instructors.sql`

```sql
CREATE TABLE instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  bio text,
  photo_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, external_id)
);

CREATE INDEX idx_instructors_partner ON instructors(partner_id);
```

#### Migration `004_sessions.sql`

```sql
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES instructors(id) ON DELETE SET NULL,
  external_id text NOT NULL,
  starts_at timestamptz NOT NULL,       -- ZAWSZE w UTC
  ends_at timestamptz NOT NULL,
  capacity int NOT NULL CHECK (capacity > 0),
  spots_left int NOT NULL CHECK (spots_left >= 0),
  price_minor int NOT NULL CHECK (price_minor >= 0),  -- grosze
  currency text NOT NULL DEFAULT 'PLN' CHECK (length(currency) = 3),
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  source_timezone text NOT NULL DEFAULT 'Europe/Warsaw',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, external_id),
  CHECK (ends_at > starts_at),
  CHECK (spots_left <= capacity)
);

CREATE INDEX idx_sessions_partner_time ON sessions(partner_id, starts_at);
CREATE INDEX idx_sessions_class ON sessions(class_id);
CREATE INDEX idx_sessions_upcoming ON sessions(starts_at)
  WHERE status = 'scheduled' AND starts_at > now();
```

#### Migration `005_pricing_rules.sql`

```sql
CREATE TABLE pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('single', 'pass_count', 'pass_unlimited', 'subscription')),
  price_minor int NOT NULL CHECK (price_minor >= 0),
  currency text NOT NULL DEFAULT 'PLN',
  pass_count int,                       -- NULL dla 'single' i 'pass_unlimited'
  validity_days int,                    -- ile dni ważny po zakupie
  applies_to_class_ids uuid[],          -- NULL = wszystkie klasy partnera
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, external_id)
);

CREATE INDEX idx_pricing_partner ON pricing_rules(partner_id);
```

#### Migration `006_pos_import_jobs.sql`

```sql
CREATE TABLE pos_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  pos_provider text NOT NULL,
  resource_type text NOT NULL
    CHECK (resource_type IN ('sessions', 'classes', 'instructors', 'pricing')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'parsing', 'validating', 'importing', 'completed', 'failed')),
  storage_path text,
  file_hash text,                       -- SHA-256, dla idempotency
  encoding text,
  total_rows int,
  successful_rows int,
  error_count int,
  errors jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT idempotent_import UNIQUE (partner_id, resource_type, file_hash)
);

CREATE INDEX idx_pos_import_jobs_partner ON pos_import_jobs(partner_id, started_at DESC);
CREATE INDEX idx_pos_import_jobs_status ON pos_import_jobs(status)
  WHERE status IN ('pending', 'parsing', 'validating', 'importing');
```

#### Migration `007_pos_sync_logs.sql` (Faza 2 — eFitness webhooks/polling)

```sql
CREATE TABLE pos_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  pos_provider text NOT NULL,
  sync_type text NOT NULL CHECK (sync_type IN ('webhook', 'poll', 'reconciliation', 'manual')),
  correlation_id uuid NOT NULL,         -- żeby grupować logi z jednego sync runa
  resource_type text,
  external_id text,                     -- ID zasobu w POS
  hakuna_id uuid,                       -- ID po stronie Hakuny (po mapowaniu)
  event_type text,                      -- 'created' | 'updated' | 'deleted' | 'error'
  payload jsonb,
  error_message text,
  duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pos_sync_logs_partner_time ON pos_sync_logs(partner_id, created_at DESC);
CREATE INDEX idx_pos_sync_logs_correlation ON pos_sync_logs(correlation_id);
CREATE INDEX idx_pos_sync_logs_errors ON pos_sync_logs(partner_id, created_at DESC)
  WHERE event_type = 'error';
```

#### Migration `008_rls_pos.sql`

```sql
-- Włącz RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sync_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: czy user jest ownerem partnera
CREATE OR REPLACE FUNCTION is_partner_owner(p_partner_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM partners
    WHERE id = p_partner_id AND owner_user_id = auth.uid()
  );
$$;

-- Sessions: public read dla scheduled future, partner write własne
CREATE POLICY "Public reads upcoming scheduled sessions" ON sessions
  FOR SELECT USING (status = 'scheduled' AND starts_at > now());

CREATE POLICY "Partners manage own sessions" ON sessions
  FOR ALL USING (is_partner_owner(partner_id))
  WITH CHECK (is_partner_owner(partner_id));

-- Classes, instructors, pricing: public read, partner write
CREATE POLICY "Public reads classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Partners manage own classes" ON classes
  FOR ALL USING (is_partner_owner(partner_id))
  WITH CHECK (is_partner_owner(partner_id));

CREATE POLICY "Public reads instructors" ON instructors FOR SELECT USING (true);
CREATE POLICY "Partners manage own instructors" ON instructors
  FOR ALL USING (is_partner_owner(partner_id))
  WITH CHECK (is_partner_owner(partner_id));

CREATE POLICY "Public reads pricing" ON pricing_rules FOR SELECT USING (true);
CREATE POLICY "Partners manage own pricing" ON pricing_rules
  FOR ALL USING (is_partner_owner(partner_id))
  WITH CHECK (is_partner_owner(partner_id));

-- Import jobs i sync logs: tylko partner widzi swoje
CREATE POLICY "Partners read own import jobs" ON pos_import_jobs
  FOR SELECT USING (is_partner_owner(partner_id));
CREATE POLICY "Partners insert own import jobs" ON pos_import_jobs
  FOR INSERT WITH CHECK (is_partner_owner(partner_id));

CREATE POLICY "Partners read own sync logs" ON pos_sync_logs
  FOR SELECT USING (is_partner_owner(partner_id));
```

**STOP-point:** Jeśli `partners.owner_user_id` nie istnieje, zatrzymaj się i zapytaj jak jest mapowanie partner → user (Supabase Auth).

---

## 3. FAZA 1 — CSV Adapter

### 3.1 Schemat CSV (kanoniczny dla partnerów)

#### `sessions.csv`

```
external_id,class_external_id,instructor_external_id,starts_at,ends_at,capacity,spots_left,price_pln,currency,status
SES-001,CLS-yoga-flow,INS-anna,2026-05-15 18:00,2026-05-15 19:00,12,8,50.00,PLN,scheduled
SES-002,CLS-yoga-flow,INS-anna,2026-05-16 18:00,2026-05-16 19:00,12,12,50.00,PLN,scheduled
```

**Reguły:**
- `external_id` — wymagane, unikalne w pliku, służy do upsert
- `starts_at`, `ends_at` — `YYYY-MM-DD HH:MM` w lokalnym czasie partnera (default Europe/Warsaw); akceptujemy też `DD.MM.YYYY HH:MM` z autodetekcją
- `price_pln` — w PLN (nie w groszach), z kropką lub przecinkiem; konwersja na `price_minor` w mapperze
- `currency` — opcjonalne, default PLN
- `status` — opcjonalne, default `scheduled`
- `instructor_external_id` — opcjonalne (pusty string OK)

#### `classes.csv`

```
external_id,name,description,category,duration_minutes,capacity,level,language
CLS-yoga-flow,Yoga Flow,"Dynamiczna joga dla średniozaawansowanych",wellness,60,12,intermediate,pl
CLS-hip-hop,Hip-Hop Beginner,"Taniec hip-hop dla początkujących",dance,90,20,beginner,pl
```

#### `instructors.csv`

```
external_id,name,bio,photo_url
INS-anna,Anna Kowalska,"Certyfikowana instruktorka jogi Vinyasa",https://example.com/anna.jpg
INS-marek,Marek Nowak,,
```

#### `pricing.csv`

```
external_id,name,rule_type,price_pln,pass_count,validity_days,applies_to_class_external_ids
PRC-single,Wejście jednorazowe,single,50.00,,,
PRC-10pack,Karnet 10 wejść,pass_count,400.00,10,90,
PRC-yoga-monthly,Karnet miesięczny joga,pass_unlimited,250.00,,30,"CLS-yoga-flow,CLS-yoga-yin"
```

### 3.2 Zod schemas

```typescript
// app/lib/pos/csv/schema.ts
import { z } from 'zod';

export const sessionRowSchema = z.object({
  external_id: z.string().min(1).max(100),
  class_external_id: z.string().min(1).max(100),
  instructor_external_id: z.string().max(100).optional().or(z.literal('')),
  starts_at: z.string().min(1),         // parsowane w mapperze
  ends_at: z.string().min(1),
  capacity: z.coerce.number().int().positive(),
  spots_left: z.coerce.number().int().nonnegative(),
  price_pln: z.string().min(1),         // "50.00" lub "50,00", konwersja w mapperze
  currency: z.string().length(3).default('PLN'),
  status: z.enum(['scheduled', 'cancelled', 'completed']).default('scheduled'),
}).refine(d => d.spots_left <= d.capacity, {
  message: 'spots_left nie może być większe niż capacity',
  path: ['spots_left'],
});

export const classRowSchema = z.object({
  external_id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(['fitness', 'dance', 'language', 'wellness', 'kids', 'martial_arts']),
  duration_minutes: z.coerce.number().int().positive(),
  capacity: z.coerce.number().int().positive().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional().or(z.literal('')),
  language: z.string().length(2).default('pl'),
});

export const instructorRowSchema = z.object({
  external_id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  bio: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal('')),
});

export const pricingRowSchema = z.object({
  external_id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  rule_type: z.enum(['single', 'pass_count', 'pass_unlimited', 'subscription']),
  price_pln: z.string().min(1),
  pass_count: z.coerce.number().int().positive().optional(),
  validity_days: z.coerce.number().int().positive().optional(),
  applies_to_class_external_ids: z.string().optional(),  // CSV list, parse w mapperze
});

export type SessionRow = z.infer<typeof sessionRowSchema>;
export type ClassRow = z.infer<typeof classRowSchema>;
export type InstructorRow = z.infer<typeof instructorRowSchema>;
export type PricingRow = z.infer<typeof pricingRowSchema>;
```

### 3.3 Pułapki CSV — jak je rozwiązać

| Pułapka | Rozwiązanie |
|---------|-------------|
| Encoding (Windows-1250 dla polskich systemów) | `chardet` na pierwszych 4KB → fallback chain `utf-8` → `windows-1250` → `iso-8859-2` |
| Daty `DD.MM.YYYY` vs `YYYY-MM-DD` vs Excel serial | Wykryj separator (`.` / `-` / `/`), regex match, fallback na `Date.parse`. Excel serial number → odrzuć z błędem "format daty" (zbyt ryzykowne autodetect) |
| Strefa czasowa | Default `Europe/Warsaw`, partner może override w pos_config. Loguj założenie w job |
| Duplikaty plików | SHA-256 hash całego pliku → unique constraint `(partner_id, resource_type, file_hash)` |
| Decimal separator (`50.00` vs `50,00`) | Normalizuj `,` → `.` przed parse |
| BOM (`\uFEFF`) | Strip pierwszych 3 bajtów jeśli wykryty |
| Trailing whitespace, Windows line endings | `parser` standardowo trimuje + obsługuje `\r\n` |
| Pusty wiersz w środku | Skip, ale liczy się do `rowNumber` żeby błędy się zgadzały |

### 3.4 Acceptance criteria — Faza 1

#### Task 1.1: Migracje DB

**AC:**
- [ ] Wszystkie 6 migracji (`001`–`006` i `008` RLS) z sekcji 2 zaaplikowane
- [ ] `npm run db:reset` przechodzi bez błędów
- [ ] RLS policies przetestowane: anon role nie może `INSERT` do sessions; partner może tylko swoje
- [ ] Index `idx_sessions_upcoming` widoczny w `EXPLAIN` dla query "upcoming sessions for partner X"

#### Task 1.2: `POSAdapter` interface + types

**AC:**
- [ ] `app/lib/pos/types.ts` zawiera interfejs z sekcji 1 (wersja Faza 1, bez webhook/realtime)
- [ ] `app/lib/pos/canonical/*.ts` zawiera czyste typy TypeScript (bez Zod, bez DB) dla `Session`, `ClassDefinition`, `Instructor`, `PricingRule`
- [ ] `app/lib/pos/registry.ts` eksportuje `getPOSAdapter(id: string): POSAdapter`
- [ ] `app/lib/pos/errors.ts`: `POSError` (base), `POSValidationError`, `POSEncodingError`, `POSDuplicateError`
- [ ] Wszystkie typy mają TSDoc

#### Task 1.3: Encoding detection

**AC:**
- [ ] `app/lib/pos/csv/encoding.ts` eksportuje `detectEncoding(buffer: Buffer): Promise<string>`
- [ ] Test: UTF-8 file → zwraca `'utf-8'`
- [ ] Test: Windows-1250 file z polskimi znakami → zwraca `'windows-1250'`
- [ ] Test: BOM-prefixed UTF-8 → zwraca `'utf-8'`, BOM stripped przed parse
- [ ] Fallback chain udokumentowany w komentarzu

#### Task 1.4: CSV parser

**AC:**
- [ ] `app/lib/pos/csv/parser.ts` eksportuje `parseCSV<T>(content: string, schema: ZodSchema<T>): ParseResult<T>`
- [ ] Używa `papaparse` (już w stacku przez frontend) lub `csv-parse` (Node-side)
- [ ] Każdy wiersz dostaje `rowNumber` (1-indexed, header = row 1, pierwszy data row = 2)
- [ ] Błąd Zod na wierszu → `POSImportError` z `code: 'VALIDATION'`, kontynuuje parsowanie
- [ ] Pusty wiersz → skip, nie zwiększa error count
- [ ] Test: 100-wierszowy plik z 3 błędnymi wierszami → 97 successful, 3 errors, dokładnie te `rowNumber`

#### Task 1.5: Mappers (CSV row → kanoniczny typ)

**AC:**
- [ ] `app/lib/pos/csv/mappers.ts`: pure functions, brak side effects
- [ ] `mapSessionRow(row, partnerTimezone): Session` — konwertuje `starts_at` lokalny → UTC, `price_pln` → `price_minor`
- [ ] Obsługuje formaty daty: `YYYY-MM-DD HH:MM`, `DD.MM.YYYY HH:MM`, `YYYY-MM-DDTHH:mm:ssZ` (ISO)
- [ ] Decimal separator: `,` → `.` przed parse
- [ ] DST handling: 2026-03-29 02:30 (nieistniejąca godzina) → error, nie silent shift
- [ ] 100% line coverage testami

#### Task 1.6: Cross-row validator

**AC:**
- [ ] `app/lib/pos/csv/validator.ts`: sprawdza FK między CSV-ami (sessions → classes → instructors)
- [ ] `validateSessions(rows, classes, instructors): POSImportError[]` — `class_external_id` musi istnieć w `classes` set
- [ ] Duplikaty `external_id` w pliku → error, nie tylko ostatni wygrywa
- [ ] `applies_to_class_external_ids` w pricing → wszystkie ID muszą istnieć
- [ ] Test fixtures w `__tests__/fixtures/invalid/missing-fk.csv`, `duplicate-keys.csv`

#### Task 1.7: CSV Adapter

**AC:**
- [ ] `app/lib/pos/csv/adapter.ts`: `class CSVAdapter implements POSAdapter`
- [ ] `capabilities`: `{ canRead: true, canWrite: false, hasWebhooks: false, realtimeSync: false, supportsCancellation: false }`
- [ ] `importSessions`: pobiera plik z Supabase Storage → encoding → parse → validate → upsert do `sessions`
- [ ] Upsert używa `(partner_id, external_id)` jako conflict key
- [ ] Aktualizuje `pos_import_jobs` row na każdym etapie (`status: parsing → validating → importing → completed`)
- [ ] Pełny flow w transakcji — jeśli upsert padnie w połowie, rollback
- [ ] Idempotency: drugi import tego samego pliku (file_hash match) → zwraca poprzedni wynik bez ponownego importu

#### Task 1.8: Background job worker

**AC:**
- [ ] Endpoint `POST /api/pos/import` przyjmuje `{ partnerId, resourceType, storagePath }`
- [ ] Tworzy `pos_import_jobs` row z `status: 'pending'`
- [ ] Triggeruje background processing (Supabase Edge Function lub Next.js API route z `runtime: 'nodejs'`)
- [ ] Aktualizuje status w realtime przez Supabase Realtime
- [ ] Timeout: 5 min, po tym `status: 'failed'`
- [ ] **STOP-point**: zapytaj o preferowany worker model (Supabase Edge Functions vs Vercel Cron vs zewnętrzny queue jak Upstash QStash)

#### Task 1.9: Partner dashboard UI

**AC:**
- [ ] `/dashboard/[partnerId]/pos/import` — strona z 4 tabami (sessions/classes/instructors/pricing)
- [ ] Każdy tab: drag-drop upload + przycisk "pobierz template CSV"
- [ ] Po upload: real-time progress (parsing → validating → importing)
- [ ] Po completed: tabela z błędami (rowNumber, field, message) + przycisk "pobierz CSV z błędami"
- [ ] Lista poprzednich import jobs z statusem
- [ ] i18n: PL/EN przez next-intl
- [ ] **NIE** używa localStorage/sessionStorage (zgodnie z Hakuna stack)

#### Task 1.10: Tests

**AC:**
- [ ] Unit: `parser.test.ts`, `mappers.test.ts`, `validator.test.ts`, `encoding.test.ts` — minimum 90% line coverage
- [ ] Integration: `adapter.integration.test.ts` z lokalnym Supabase (Docker) — happy path + 3 error scenarios
- [ ] Fixtures: minimum 8 valid + 6 invalid CSV w `__tests__/fixtures/`
- [ ] CI: testy przechodzą w GitHub Actions

---

## 4. FAZA 2 — eFitness Adapter

### 4.1 Pre-implementation checklist (BLOCKER — Claude Code STOP)

Zanim Claude Code napisze choćby jeden plik w `app/lib/pos/efitness/`, **MUSI** mieć odpowiedzi na te pytania od Wojtka:

- [ ] **Dokumentacja API** — link do oficjalnych docs (publiczne czy NDA)
- [ ] **Auth model** — OAuth2? API key per partner? Master key Hakuny?
- [ ] **Token lifecycle** — czy refresh token działa, jak długo żyje access token
- [ ] **Sandbox/test environment** — istnieje? jak go dostać?
- [ ] **Test partner account** — eFitness daje development account?
- [ ] **Rate limits** — req/min, req/day, per partner czy globalnie
- [ ] **Webhooks** — wspierane? jakie eventy? signature scheme?
- [ ] **Pagination** — cursor-based? offset? page tokens?
- [ ] **Idempotency** — czy `POST /booking` ma idempotency key support
- [ ] **Cancellation policy** — kto może anulować, w jakim oknie czasowym
- [ ] **Polish-specific** — kasa fiskalna integration, JPK, faktury VAT — czy API to w ogóle wystawia

**Bez tych odpowiedzi nie ma sensu pisać kodu.** Dopisywanie założeń do testów = ryzyko że cały adapter trzeba przepisać.

### 4.2 Strategia sync — pull/poll/reconcile

Trzy warstwy redundancji, każda łapie inne błędy:

1. **Webhook-driven** (preferowane, real-time):
   eFitness pushuje event → `POST /api/pos/efitness/webhook` → verify signature → upsert
2. **Polling fallback** (co 15 min):
   Sync delta od `partners.last_pos_sync_at` — gdy webhook się zgubił
3. **Reconciliation** (raz na dobę, w nocy):
   Full sync całego partnera. Compare snapshot eFitness vs Hakuna → diff → fix dryft

**Wszystkie trzy używają tego samego mappera**. Różnią się tylko źródłem eventów.

### 4.3 Acceptance criteria — Faza 2

#### Task 2.1: API client

**AC:**
- [ ] `app/lib/pos/efitness/client.ts`: HTTP client z fetch
- [ ] Auth handling: token refresh przy 401, retry raz po refresh
- [ ] Rate limiting: respektuje `Retry-After` header, exponential backoff (1s → 2s → 4s → 8s, max 5 retries)
- [ ] Timeout: 30s per request
- [ ] Loguje każdy request do `pos_sync_logs` z `correlation_id`
- [ ] **NIGDY** nie loguje credentials w plain text

#### Task 2.2: Auth

**AC:**
- [ ] `app/lib/pos/efitness/auth.ts`: `getAccessToken(partnerId): Promise<string>`
- [ ] Credentials zaszyfrowane w `partners.pos_credentials_encrypted` (AES-256-GCM, klucz w env)
- [ ] Cache tokena w pamięci procesu (TTL = exp - 60s buffer)
- [ ] **STOP-point**: jeśli auth nie jest OAuth2 ani API key, zatrzymaj się

#### Task 2.3: Mappers

**AC:**
- [ ] `app/lib/pos/efitness/mappers.ts`: pure functions
- [ ] `mapEFitnessSessionToSession(efSession): Session` — z fixture'a
- [ ] **Każdy mapper ma fixture w `__tests__/fixtures/api-responses/`** — minimum 5 wariantów per resource (happy, missing optional, edge timezone, cancelled, unusual)
- [ ] 100% line coverage
- [ ] Brak `any` w sygnaturach — pełne typy eFitness API jako osobny `efitness-types.ts`

#### Task 2.4: Webhook handler

**AC:**
- [ ] `app/api/pos/efitness/webhook/route.ts` (Next.js App Router)
- [ ] Signature verification przed parsowaniem payload
- [ ] Idempotency: `event_id` w `pos_sync_logs`, duplikat → 200 bez przetwarzania
- [ ] Wszystkie błędy → log do Sentry, response 200 (żeby eFitness nie retry'ował w nieskończoność, chyba że to 5xx error)
- [ ] Test fixtures: minimum 6 webhook payloads (booking_created, booking_cancelled, session_updated, session_cancelled, capacity_changed, unknown_event)

#### Task 2.5: Polling sync

**AC:**
- [ ] `app/lib/pos/efitness/sync.ts`: `syncDelta(partnerId, since: Date): Promise<SyncResult>`
- [ ] Fetch wszystkich zmienionych sessions/bookings od `since`
- [ ] Aktualizuje `partners.last_pos_sync_at` na koniec
- [ ] Cron: Vercel Cron `every 15 min` lub Supabase pg_cron
- [ ] **STOP-point**: zdecyduj cron strategy razem z worker model z Task 1.8

#### Task 2.6: Reconciliation

**AC:**
- [ ] `fullReconciliation(partnerId): Promise<ReconciliationResult>`
- [ ] Pobiera **wszystkie** future sessions z eFitness + Hakuna
- [ ] Diff: `{ created: [], updated: [], deleted: [], conflicts: [] }`
- [ ] Konflikt = ten sam `external_id` ale różne `starts_at` lub `capacity` → log + manual review
- [ ] Deleted w eFitness ale nie w Hakuna → soft delete (status: cancelled), nigdy hard delete
- [ ] Cron: raz dziennie 03:00 Europe/Warsaw
- [ ] Raport e-mailem do partnera (Resend) jeśli > 5 zmian

#### Task 2.7: Booking write operations

**AC:**
- [ ] `createBooking(input): Promise<BookingResult>` — Hakuna user kupuje slot → eFitness booking
- [ ] Idempotency key = Hakuna booking ID (Hakuna jest źródłem prawdy o intencji)
- [ ] Race condition: jeśli eFitness odpowiada "no spots" mimo że nasz cache pokazuje wolne → odśwież cache, zwróć błąd userowi
- [ ] Rollback Stripe payment jeśli eFitness booking się nie powiedzie (Stripe Connect refund)
- [ ] **STOP-point**: ten task wymaga decyzji o payment flow timing — booking-first czy payment-first?

#### Task 2.8: Observability

**AC:**
- [ ] Każdy sync ma `correlation_id` w logach
- [ ] Sentry breadcrumbs dla każdego eFitness API call
- [ ] Partner dashboard widget: "ostatni sync", "lag webhook → DB", "error rate 24h"
- [ ] Alert (Sentry → Slack): error rate > 5% w 1h window

#### Task 2.9: End-to-end staging tests

**AC:**
- [ ] Test partner account utworzony w eFitness sandbox
- [ ] Scenariusz 1: utwórz klasę w eFitness panelu → sync → widoczna w Hakuna
- [ ] Scenariusz 2: rezerwuj przez Hakuna → widoczne w eFitness panelu w 30s
- [ ] Scenariusz 3: anuluj w eFitness → webhook → status `cancelled` w Hakuna w 30s
- [ ] Scenariusz 4: zabij webhook handler na 1h → polling powinien dogonić
- [ ] Scenariusz 5: ręcznie utwórz konflikt (zmień session w eFitness DB poza API) → reconciliation wykrywa

---

## 5. Strategia testowania (wspólna dla obu faz)

### Trzy warstwy

#### Layer 1 — Unit testy mapperów (tanie, must-have)

**Fixture-driven**: każdy mapper bierze realny snapshot odpowiedzi (anonimizowany) i mapuje na kanoniczny typ.

```typescript
// app/lib/pos/efitness/__tests__/mappers.test.ts
import schedule from './fixtures/api-responses/session-happy.json';

test('maps eFitness session to canonical Session', () => {
  const result = mapEFitnessSessionToSession(schedule);
  expect(result.startsAt.toISOString()).toBe('2026-05-15T16:00:00.000Z');
  expect(result.priceMinor).toBe(5000);
  expect(result.currency).toBe('PLN');
});
```

Jeśli eFitness zmieni format → fixture przestaje pasować → test pęka → wiemy zanim partner.

#### Layer 2 — Integration testy z mock serverem (średni koszt)

**MSW (Mock Service Worker)** dla eFitness API:

```typescript
test('syncs all sessions across paginated pages', async () => {
  mockEFitness.get('/sessions').reply(200, page1);  // ma next_page_token
  mockEFitness.get('/sessions?cursor=abc').reply(200, page2);

  await adapter.syncDelta({ partnerId, since: yesterday });

  const stored = await testSupabase.from('sessions').select();
  expect(stored.length).toBe(150);
});

test('handles 429 with backoff', async () => {
  mockEFitness.get('/sessions')
    .reply(429, '', { 'retry-after': '1' })
    .reply(200, page1);

  const result = await adapter.syncDelta({ partnerId, since: yesterday });
  expect(result.successful).toBe(true);
});
```

#### Layer 3 — Staging E2E (drogi, must-have przed prod)

eFitness sandbox + lokalna instancja Hakuny + test partner. Real network, real timing, real edge cases.

### Test fixtures — wymagania

#### Faza 1 (CSV)

```
app/lib/pos/csv/__tests__/fixtures/
├── valid/
│   ├── sessions-utf8.csv           (10 wierszy, happy)
│   ├── sessions-win1250.csv        (z polskimi znakami)
│   ├── sessions-large.csv          (1000 wierszy, perf test)
│   ├── sessions-mixed-dates.csv    (ISO + DD.MM.YYYY)
│   ├── classes.csv
│   ├── instructors.csv
│   └── pricing.csv
└── invalid/
    ├── malformed-row.csv           (broken quotes)
    ├── missing-fk.csv              (session ref do nieistniejącej klasy)
    ├── duplicate-keys.csv          (dwa wiersze z tym samym external_id)
    ├── bad-timezone.csv            (DST gap: 2026-03-29 02:30)
    ├── wrong-encoding.csv          (UTF-16 zamiast UTF-8)
    └── missing-required.csv        (brak external_id)
```

#### Faza 2 (eFitness)

```
app/lib/pos/efitness/__tests__/fixtures/
├── api-responses/
│   ├── session-happy.json
│   ├── session-cancelled.json
│   ├── session-missing-instructor.json
│   ├── session-edge-timezone.json
│   ├── session-recurring.json
│   ├── classes-paginated-page1.json
│   ├── classes-paginated-page2.json
│   ├── booking-created.json
│   └── booking-conflict.json
└── webhook-payloads/
    ├── booking-created.json
    ├── booking-cancelled.json
    ├── session-updated.json
    ├── session-cancelled.json
    ├── capacity-changed.json
    └── unknown-event.json
```

**Wszystkie fixtures muszą być anonimizowane** (faked names, faked emails, faked IDs) — nawet jeśli pochodzą z prawdziwego sandboxa.

### Coverage targets

- Mappers: **100% line, 100% branch** (to single point of failure, nie ma kompromisu)
- Parser/validator: **90%+**
- Adapter integration: **80%+**
- API client (Faza 2): **90%+ unit**, plus pełen happy path E2E

---

## 6. Kolejność implementacji (week-by-week)

### Tygodnie 1–2: Fundament
1. Migracje DB (Task 1.1)
2. `POSAdapter` interface + canonical types (Task 1.2)

### Tygodnie 3–4: CSV adapter
3. Encoding + parser (Tasks 1.3, 1.4)
4. Mappers + validator (Tasks 1.5, 1.6)
5. Adapter + background worker (Tasks 1.7, 1.8) — **STOP-point worker model**

### Tydzień 5: CSV UI + tests
6. Partner dashboard upload UI (Task 1.9)
7. Test suite (Task 1.10)

### Tydzień 6: eFitness research (BLOCKING)
8. Wojtek kontaktuje eFitness, zdobywa docs, sandbox, test account
9. Pre-implementation checklist (sekcja 4.1) — **wszystkie pytania odpowiedziane**

### Tygodnie 7–8: eFitness read-only
10. Refaktor `POSAdapter` (sekcja 1, wersja Faza 2)
11. API client + auth (Tasks 2.1, 2.2) — **STOP-point auth model**
12. Mappers + fixtures (Task 2.3)
13. Polling sync (Task 2.5)

### Tydzień 9: eFitness webhooks
14. Webhook handler (Task 2.4)
15. Reconciliation (Task 2.6)

### Tydzień 10: eFitness write
16. Booking operations (Task 2.7) — **STOP-point payment timing**
17. Observability (Task 2.8)

### Tydzień 11: Staging E2E
18. End-to-end scenarios (Task 2.9)
19. Production readiness review

---

## 7. Definicje "done" dla całej fazy

### Faza 1 done =
- Partner może wgrać 4 typy CSV przez dashboard
- Błędy są pokazane per-row z czytelnym komunikatem PL
- Sessions z CSV są widoczne na publicznej stronie partnera
- Re-upload tego samego pliku = no-op (idempotency)
- 90%+ test coverage na adapter logic
- RLS przetestowane: drugi partner nie widzi cudzych import jobs

### Faza 2 done =
- eFitness partner może podłączyć konto przez OAuth flow
- Sessions z eFitness są w Hakuna w < 30s od zmiany w eFitness (webhook) lub < 15min (polling)
- Hakuna user może kupić slot — booking pojawia się w eFitness panelu w < 30s
- Anulowanie z którejkolwiek strony propaguje się
- Reconciliation raz dziennie wykrywa i naprawia dryft
- Staging E2E przeszedł 5 scenariuszy z sekcji 4.3 (Task 2.9)

---

## 8. Co NIE jest w scope tego planu

- Reservio, Perfect Gym, SimplyBook (Faza 3)
- WodGuru, GymManager, Fitnet — brak API, używają CSV adaptera (Faza 1 wystarczy)
- Mindbody — strategicznie unikamy (własny marketplace = konkurencja)
- Multi-location chain handling (brand → locations) — to osobny temat data modelingu
- Stripe Connect commission flow dla bookings (osobny plan, ale Task 2.7 musi się z nim zazębić)
- Migracja istniejących danych z `app/lib/mockData.ts` — osobny seeding script

---

**Koniec planu. Claude Code: zaczynaj od Task 1.1. Przy każdym STOP-point — zatrzymaj się i zapytaj.**
