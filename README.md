# liio

liio is an age-aware AI learning companion for children and teens. It guides schoolwork step by step while keeping the final reasoning under the child's control.

## Product zones

liio has two product zones:

- **Child experience** — paired device, child profile selection, Homework and game surfaces.
- **Parents Area** — family profile, children, activity, time limits, devices and pairing codes.

The UI supports PT, EN, ES and DE.

## Learning model

Homework uses three pedagogical behaviors:

- **EXPLAIN** — explain a concept directly at an age-appropriate level.
- **GUIDE** — guide the child through a task without revealing the protected final answer.
- **CHECK** — review the child's reasoning without replacing it with a completed solution.

The response pipeline is:

```text
Child
  ↓
Request validation + rate limit
  ↓
Learning interaction classification
  ↓
EXPLAIN / GUIDE / CHECK
  ↓
Model generation
  ↓
Independent evaluator
  ↓
Deterministic constraints
  ↓
Child-safe normalized response
```

## Family and device architecture

The parent side uses a family aggregate. For the current prototype, external OAuth is optional; the local parent profile owns a high-entropy family secret.

Cross-device pairing is server-backed when the Supabase migrations are applied:

```text
Parents Area
  ↓
Generate one-time family code
  ↓
pairing_codes
  ↓
Child device enters code
  ↓
Allowed child profiles
  ↓
Child selected
  ↓
Opaque device session token
  ↓
Homework
```

The short pairing code does not contain child data or the parent secret.

## Persistence

The repository includes Supabase migrations for:

- families
- children
- preferences
- pairing codes
- device sessions
- time limits
- learning sessions
- activity events

The browser services use Supabase when the project variables and migrations are available. A local prototype fallback remains available for development/demo continuity.

## Observability

Homework requests include:

- prompt version
- learning behavior
- response latency
- success/failure
- selected language
- learning session linkage when a paired device exists

Hidden evaluator reasoning is never persisted or returned to the child.

## Design system

The design system is defined in:

- `app/design-tokens.css`
- `app/globals.css`
- `app/components/ui.tsx`
- `docs/design-system.md`

Translations are centralized in:

- `lib/i18n/catalog.ts`

## Architecture

See:

- `docs/system-design.md`
- `docs/design-system.md`

Application layering:

```text
app/                    routes and presentation
app/components/         reusable UI
lib/domain/             domain types and invariants
lib/data/               Supabase adapters
lib/services/           family, pairing, settings and activity use-cases
lib/ai/                 AI policy, evaluation and orchestration
lib/security/           secrets and request controls
supabase/migrations/    database contract
docs/                   architecture documentation
```

## Stack

- Next.js 16
- React 19
- TypeScript
- Supabase / PostgreSQL
- Groq
- Zod
- CSS
- Vercel

## Environment variables

```env
GROQ_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Never expose a Supabase service-role key to the browser.

## Supabase migration order

Apply the migrations in filename order:

1. `supabase/migrations/20261006_liio_foundation.sql`
2. `supabase/migrations/20261006_learning_observability.sql`
3. `supabase/migrations/20261006_parent_controls.sql`
4. `supabase/migrations/20261006_security_hardening.sql`
5. `supabase/migrations/20261006_data_lifecycle.sql`

## Current status

This repository is the functional liio prototype.

Implemented:

- multilingual entry flow;
- persistent parent prototype session;
- child profile management;
- cross-device pairing architecture;
- device sessions;
- Homework AI;
- age-aware learning policies;
- independent evaluation;
- deterministic fallbacks;
- rate limiting;
- prompt versioning;
- parent activity architecture;
- time and permission settings;
- centralized translation catalog;
- shared design tokens and UI primitives.

Real Google/Apple/email authentication remains intentionally deferred for the prototype.
