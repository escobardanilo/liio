# Liio

Liio is an age-aware AI learning tutor designed to guide students through schoolwork without simply returning the final answer.

## Why Liio

AI tutors can easily become answer machines. Liio is designed to help students continue reasoning, understand where they are stuck, and take the next useful step instead of outsourcing the work.

## Learning model

The Homework session uses three pedagogical behaviors:

- **EXPLAIN** — explains a concept directly, with language and depth adapted to the student's age.
- **GUIDE** — helps the student work through an exercise one step at a time without revealing the protected final answer.
- **CHECK** — reviews the student's proposed answer or reasoning without replacing it with a completed solution.

Messages such as “I don't understand,” “make it easier,” “give me a hint,” or “speak Portuguese” modify the current learning interaction. They do not start a separate generic chatbot conversation.

## How the Homework flow works

```text
Student
  ↓
Learning Session
  ↓
EXPLAIN / GUIDE / CHECK
              ↓
        Safety evaluation
              ↓
      Child-safe response
```

GUIDE responses pass through an independent evaluator and deterministic constraints. A rejected response may be regenerated once, evaluated again, and replaced with a safe fallback if it still fails.

CHECK uses a separate evaluation policy suited to reviewing student work. It prevents the tutor from revealing or directly confirming the protected final answer while still identifying where reasoning needs revision.

Evaluator results and internal feedback are never sent to the child interface.

## Guardrails

Liio combines:

- independent model-based evaluation;
- Zod validation for structured evaluator output;
- deterministic checks for question count, response length, age-related cognitive load, and repeated teaching strategies after explicit confusion;
- bounded regeneration with no unlimited retry loop;
- deterministic safe fallbacks;
- child-facing output normalization to prevent raw Markdown or LaTeX artifacts.

The model generates. Software decides what is allowed to reach the child.

## Stack

- Next.js
- React
- TypeScript
- Groq using `openai/gpt-oss-120b`
- Zod
- CSS
- Vercel deployment target

AI requests and evaluator activity run server-side. `GROQ_API_KEY` is not exposed to the browser. Age policies currently cover ages 6–15.

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

This repository is the current portfolio/demo version of Liio.

- Homework is the implemented AI learning mode.
- Parent controls and related product surfaces use demo or local state where applicable.
- Production user accounts and a persistent database are not required in this version.
- The product remains under development.

## Project status

Liio is in active development. This repository represents the first functional version of the learning architecture and Homework tutor.
