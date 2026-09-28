# Ontario Healthcare Pathways

Helps Ontario Grade 11–12 students find regulated healthcare careers they can enter straight
from high school with a single English-language Ontario program. Prerequisites are tracked as
Grade 12 courses only; Grade 11 students plan theirs. See [BUILD_PLAN.md](BUILD_PLAN.md) for the full spec.

> **All current data is placeholder content awaiting verification.** Every unverified value is
> `null` and shows as "Not yet verified" on the site. See "Before launch" below.

## Commands

| Command                                 | What it does                                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run dev`                           | Start the dev server                                                                                 |
| `npm run validate`                      | Validate `/data` (schemas, references, timelines, eligibility gate) and list unverified/stale fields |
| `npm run build`                         | Runs `validate` first (`prebuild`), then builds. Fails on any data error                             |
| `npm test`                              | Unit tests (Vitest)                                                                                  |
| `npm run test:e2e`                      | End-to-end + accessibility tests (Playwright; builds and serves on port 3100)                        |
| `npm run sync:dry-run`                  | Try the data pipeline against `tests/fixtures/staging-sample.csv` (writes only `sync-output/`)       |
| `npm run sync`                          | Merge approved Sheet rows into `/data` (needs `GOOGLE_SERVICE_ACCOUNT_JSON`, `SHEET_ID`)             |
| `npm run report:stale`                  | Markdown report of unverified fields and records not verified in 90 days                             |
| `npm run lint` / `typecheck` / `format` | Code quality                                                                                         |

## Pages

| Route                    | What it is                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `/`                      | Discovery hub: quick course matcher, URL-persisted filters, program grid, compare drawer, missing-course helper |
| `/programs/[slug]`       | Program detail: all 9 sections from §6, statically generated, with OG image                                     |
| `/professions/[slug]`    | Profession overview and its eligible programs                                                                   |
| `/quiz`, `/quiz/results` | Recommendation survey; answers live only in the browser and the URL `#fragment`                                 |
| `/compare?ids=a,b,c`     | Side-by-side comparison of 2–3 programs                                                                         |
| `/guide`                 | Application timeline, supplementary requirements, placement readiness, costs                                    |
| `/team`                  | Interdisciplinary team diagram and patient journeys                                                             |
| `/about`                 | Eligibility rules, sources, methodology, privacy, disclaimer, error reporting                                   |
| `/data-export.json`      | Static snapshot of published data for the verification agent                                                    |

## Data rules

- All data lives in `/data/*.json`, validated by `lib/schema.ts` (Zod) on every build.
- Never invent values. Unverified values are `null` and listed in the record's
  `provenance.needsVerification`.
- A program renders only if `published` is true **and** it passes `isEligible()`
  (`lib/eligibility.ts`). App code reads programs through `lib/data.ts`, never the JSON directly.
  The recommender re-checks the gate.
- Quiz weights and questions live in `data/quiz.json`; guide content in `data/guide.json`; team
  journeys in `data/journeys.json`.

## Live data pipeline

See [docs/SPARK_TASKS.md](docs/SPARK_TASKS.md) for the Sheet layout, agent task instructions, and
one-time setup. The weekly `Data sync` workflow (`.github/workflows/data-sync.yml`) opens a PR from
approved Sheet rows. It never merges, and it labels eligibility/prerequisite changes `high-risk`.
Allowed source domains are in `scripts/allowed-domains.ts`.

## Configuration

Copy `.env.example`. `NEXT_PUBLIC_SITE_URL` (sitemap/OG URLs) and `NEXT_PUBLIC_REPORT_ERROR_URL`
(a `mailto:` or form URL for "Report an error") should be set on Vercel.

## Deploying to Vercel

1. Import the GitHub repo at vercel.com/new. The Next.js preset needs no overrides: build command
   `npm run build` (runs `npm run validate` first, so invalid data fails the deploy), Node 24.
2. Under Settings → Environment Variables (Production), set `NEXT_PUBLIC_SITE_URL` to the custom
   domain and optionally `NEXT_PUBLIC_REPORT_ERROR_URL`. Without `NEXT_PUBLIC_SITE_URL`, the
   site uses Vercel's production domain.
3. Enable Web Analytics in the project dashboard (the app uses `@vercel/analytics`).
4. Preview deployments serve a `Disallow: /` robots.txt, so only production is indexed.
5. The Sheet pipeline secrets (`GOOGLE_SERVICE_ACCOUNT_JSON`, `SHEET_ID`) belong in GitHub
   Actions, not Vercel.

## Before launch (BUILD_PLAN.md §13 Phase 6, §15)

1. Research and fill 8–12 professions and their eligible programs from official sources only.
2. Verify each record, then set `provenance.verifiedBy` to `"human"` and `lastVerified` to the date.
3. `npm run validate` should list zero `needsVerification` items for launch-listed programs.
4. Replace the editorial estimates flagged in each profession (`riasec`, `workStyle`).
5. Set `data/guide.json` dates for the current application cycle, with sources.
6. Test with a guidance counsellor and 3–5 students; QA on iOS Safari and Android Chrome.
