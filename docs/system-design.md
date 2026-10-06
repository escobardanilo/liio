# liio — System Design

## 1. Product boundary

liio has two trust zones:

1. **Parents Area** — family administration, child profiles, time limits, devices and visibility.
2. **Child experience** — a paired device/session that can access only the selected child profile and learning surfaces.

The prototype keeps external identity providers optional. Family ownership is represented by a high-entropy local owner secret. A short pairing code is only a temporary bridge between a family and a child device.

## 2. High-level architecture

```text
Browser / PWA
  ├─ Parents Area
  └─ Child experience
       │
       ├─ Supabase RPC/Data API
       │    ├─ families
       │    ├─ children
       │    ├─ pairing_codes
       │    ├─ device_sessions
       │    ├─ time_limits
       │    ├─ preferences
       │    ├─ learning_sessions
       │    └─ activity_events
       │
       └─ Next.js BFF
            └─ /api/ai/homework
                 ├─ learning policy
                 ├─ evaluator
                 ├─ deterministic constraints
                 ├─ prompt version
                 └─ Groq
```

## 3. Domain model

### Family
The aggregate root for the parent side. A family owns child profiles, preferences and pairing codes.

### Parent
For the current prototype the parent identity is a local profile plus an owner secret. Real OAuth can later replace this without changing the family/child/pairing model.

### Child
Stores the minimum data required by the product: display name and age. liio does not need a full birth date for the current learning policy.

### Pairing code
A random, one-time, short-lived code. It references a family on the server. It never contains the child list or family secret.

### Device session
Created only after a valid pairing code is redeemed and a child profile is selected. The browser stores the opaque device token locally.

### Learning session
A server-side record for a child/device learning interaction. It stores metadata, not hidden evaluator reasoning.

### Activity event
A minimal event stream used to build Parents Area activity summaries.

## 4. Pairing flow

```text
Parent browser
  │
  ├─ create pairing code
  │      family_id + owner_secret
  │
  ▼
Supabase
  │
  └─ code → family_id, expires_at, redeemed_at
                │
                ▼
Child browser enters code
                │
                ├─ validate code
                └─ return allowed child profiles
                          │
                          ▼
                    child selected
                          │
                          ├─ consume code
                          └─ create device session token
```

This makes pairing work across different browsers and different physical devices. No child profile lookup depends on the parent's browser localStorage.

## 5. Security model

- Parent owner secrets are generated with Web Crypto and stored only in the parent's browser.
- Supabase stores only SHA-256 hashes of owner secrets and device tokens.
- Pairing codes expire after 10 minutes and are one-time use.
- RPC functions are `SECURITY DEFINER` and explicitly validate secrets/tokens.
- Tables are not directly writable by anonymous clients.
- Child devices can access only the child linked to their device token.
- Service-role credentials are not required by the browser prototype.
- Hidden evaluator feedback and model chain-of-thought are never persisted or returned to the child.

## 6. Application layers

```text
app/                    presentation/routes
app/components/         reusable UI
lib/domain/             domain types and invariants
lib/data/               Supabase/local persistence adapters
lib/services/           family, pairing, learning, activity use-cases
lib/ai/                 AI orchestration and policy
supabase/migrations/    database contract
docs/                   architecture decisions
```

UI components must not own storage rules. They call services. Services select Supabase when available and keep a local prototype fallback where appropriate.

## 7. Internationalization

The selected language is a product preference and one of `pt | en | es | de`.

- UI strings come from one translation catalog.
- The language preference persists in the browser and, when a family exists, can also be persisted to Supabase.
- AI requests carry the selected language explicitly.
- The Homework route adds a hard language instruction to the system prompt.

## 8. Design system

The interface uses a single token layer for:

- color
- typography
- spacing
- radius
- elevation
- controls
- focus rings
- motion

Shared patterns: page header, section label, card, empty state, modal, primary/secondary/danger actions and rows.

## 9. AI request lifecycle

```text
Child input
  ↓
Request validation + rate limit
  ↓
Learning session context
  ↓
EXPLAIN / GUIDE / CHECK
  ↓
Model generation
  ↓
Independent evaluator
  ↓
Deterministic constraints
  ↓
Child-safe normalized output
  ↓
Activity metadata
```

Every request carries a prompt/policy version so behavior can be traced after changes.

## 10. Observability

Store only operational metadata needed for the prototype:

- timestamp
- child/session identifiers
- learning behavior
- response latency
- success/failure
- prompt version
- approximate token usage when available

Do not store evaluator chain-of-thought.

## 11. Current prototype fallback

If Supabase RPCs are not available yet, local parent/profile functionality remains usable. Cross-device pairing requires the Supabase migration to be applied.
