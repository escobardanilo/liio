# SON

SON (System Operations Navigator) is an AI operational assistant for industrial operators, technicians and supervisors. It helps teams understand technical concepts, investigate issues, review observations and recognize when an authorized human role must take over.

## Operational model

The assistant uses three focused behaviors:

- **EXPLAIN** — explains equipment, alarms and technical concepts without presenting generic knowledge as a site-specific procedure.
- **GUIDE** — guides a safe investigation one observational step at a time.
- **VERIFY** — reviews supplied observations without certifying safety, compliance or readiness.

Every generated response passes through an independent operational evaluator. A rejected response may be regenerated once, evaluated again and replaced with a deterministic safe fallback if it still fails.

## Guardrails

SON combines server-side generation, Zod-validated structured evaluation, deterministic checks, bounded regeneration, output sanitation and safe fallbacks. It does not operate equipment, authorize physical work, bypass safety controls, invent procedures or claim access to documents that were not retrieved.

## Stack

- Next.js
- React
- TypeScript
- Groq using `openai/gpt-oss-120b`
- Zod
- CSS
- Vercel deployment target

AI requests and evaluator activity run server-side. `GROQ_API_KEY` is not exposed to the browser.

## Run locally

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
GROQ_API_KEY=your_groq_api_key
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current scope

The Operational Assistant is connected to the server-side AI flow. Operations, Knowledge, Equipment, Activity, issue reporting and Supervisor surfaces use explicit demonstration/local data. No live machinery, document retrieval, RAG pipeline, user account or production ticketing system is connected.
