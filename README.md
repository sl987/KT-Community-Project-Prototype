# Ontario Healthcare Pathways

Helps Ontario Grade 11–12 students find regulated healthcare careers they can enter straight
from high school with a single program. See [BUILD_PLAN.md](BUILD_PLAN.md) for the full spec.

## Commands

| Command                                                 | What it does                                                                                       |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm run dev`                                           | Start the dev server                                                                               |
| `npm run validate`                                      | Validate `/data` (Zod, references, timelines, eligibility gate) and report unverified/stale fields |
| `npm run build`                                         | Runs `validate` first (`prebuild`), then builds. Fails on any data error                           |
| `npm test`                                              | Unit tests (Vitest)                                                                                |
| `npm run test:e2e`                                      | End-to-end tests (Playwright; builds and serves on port 3100)                                      |
| `npm run lint` / `npm run typecheck` / `npm run format` | Code quality                                                                                       |

## Data rules (summary)

- All data lives in `/data/*.json` and is validated by `lib/schema.ts`.
- Never invent values. Unverified values are `null` and listed in the record's
  `provenance.needsVerification`.
- A program only renders if `published` is true **and** it passes `isEligible()`
  (`lib/eligibility.ts`). App code must read programs through `lib/data.ts`, never the JSON directly.
- All current seed data is agent-entered placeholder content awaiting owner verification.
