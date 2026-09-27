# Ontario Healthcare Pathways — Build Plan

> **For Claude (the builder):** Read this entire file before writing code. Build one phase at a time, in order. At the end of each phase, stop, summarize what was built, list any open questions, and wait for approval before starting the next phase. Follow the **Data Integrity Rules** (Section 2) at all times — they override everything else in this file.

---

## 0. Product Summary

A web app that helps Ontario Grade 11–12 students find **regulated healthcare careers they can enter straight from high school with a single program** — no master's, PhD, med school, or second degree — and then work right after graduating and passing licensing.

It has three jobs:

1. **Discover.** Browse and filter eligible programs.
2. **Understand.** Each program page shows the full path from Grade 12 to working professional: requirements, costs, exams, registration, pay, and demand.
3. **Recommend.** A short survey (marks, courses, interests, work style) produces ranked, explained matches.

The audience is 16–18 year olds, plus the parents and guidance counsellors helping them.

---

## 1. The Eligibility Gate (Non-Negotiable)

A **program** is shown only if all three checks are true:

| # | Check | Meaning |
|---|---|---|
| 1 | `directEntryFromHighSchool` | Ontario secondary school applicants can apply through OUAC (101) or OCAS with no prior post-secondary required. |
| 2 | `singleCredentialToPractice` | Completing this one credential meets the regulator's education requirement for registration. |
| 3 | `!requiresFurtherEducation` | No graduate, professional, or additional degree/diploma is needed to practise. |

Licensing exams, jurisprudence exams, and college registration are **allowed**. They are not further education, but they must always be shown in the timeline.

**Eligibility is evaluated per program, not per profession.** One profession can have both eligible and ineligible programs; for example, a school's version may require prior university. Show only the eligible ones.

**Always excluded:** MD, RN-only degree tracks the owner has scoped out, PT, OT, SLP, audiology, dietetics, pharmacist, optometry, dentistry, chiropractic, and any program requiring prior post-secondary. Also excluded are unregulated roles such as PSW, medical office assistant, and dental assistant.

The gate is enforced in code (`isEligible()`) at build time **and** re-checked in the recommendation engine. Ineligible records must never render, even if they exist in the data file.

---

## 2. Data Integrity Rules (Read Twice)

This site guides minors making real course and application decisions. Wrong data causes real harm.

1. **Never invent data.** Do not fill program codes, cut-off averages, salaries, worker counts, exam names, fees, or prerequisites from memory.
2. **Every factual field carries provenance:** a `sourceUrl`, and on the record, `lastVerified` (ISO date) plus `verifiedBy` (`"human" | "agent"`).
3. **When you cannot verify a value, leave it out.** Set the field to `null`, add it to the record's `needsVerification: string[]` list, and render it in the UI as "Not yet verified — check the official program page."
4. **Official sources only.** Use institution program pages, OUAC, ontariocolleges.ca, regulatory college websites, Government of Canada Job Bank, CIHI, and Statistics Canada. Never use forums, Reddit, or aggregator blogs.
5. **Averages are ranges tied to a cycle.** Example: `{ "low": 80, "high": 85, "cycle": "2025 entry", "type": "competitive" }`. Never present a single number as a guaranteed cut-off.
6. **Seed data is a placeholder until the owner verifies it.** In Phase 0, create records with structure filled in and uncertain values set to `null`. Mark them `verifiedBy: "agent"` or leave them unverified. The owner will verify before launch.

---

## 3. Candidate Professions (Starting List — Verify Every Row)

These are starting points to research. They are **not confirmed facts.** Exam names are examples to verify against each regulator's current entry-to-practice page.

| Profession | Regulator (Ontario) | Typical credential | Likely licensing exam (verify) |
|---|---|---|---|
| Medical Radiation Technologist (radiography, nuclear medicine, radiation therapy, MRI) | CMRITO | Adv. diploma / collaborative BSc | CAMRT certification exam |
| Diagnostic Medical Sonographer | CMRITO | Adv. diploma (check whether direct-entry) | Sonography Canada exam |
| Medical Laboratory Technologist | CMLTO | Adv. diploma / BHSc | CSMLS certification exam |
| Respiratory Therapist | CRTO | Adv. diploma / degree | CBRC exam |
| Midwife | CMO | 4-yr BHSc | Canadian Midwifery Registration Exam |
| Dental Hygienist | CDHO | Diploma | NDHCB exam |
| Registered Kinesiologist | CKO | 4-yr degree | CKO entry-to-practice exam |
| Registered Massage Therapist | CMTO | Diploma | CMTO certification exam |
| Pharmacy Technician | OCP | Diploma | PEBC qualifying exam + OCP jurisprudence |
| Registered Practical Nurse | CNO | Diploma | REx-PN + jurisprudence |
| Optician | COO | Diploma | Verify |
| Denturist | CDO | Adv. diploma | Verify |
| Paramedic (optional, flag as non-RHPA) | Ministry / base hospital certification | Diploma | A-EMCA exam (verify) |

Target for launch: **8–12 professions** with **2–4 eligible programs each**, covering multiple regions.

---

## 4. Tech Stack

- **Framework:** Next.js (App Router) with TypeScript in strict mode
- **UI:** Tailwind CSS and shadcn/ui, with lucide-react icons
- **State and URLs:** `nuqs` for filter and survey-result URL params
- **Validation:** Zod schemas mirror all TypeScript types; build fails on invalid data
- **Charts:** Recharts, for salary ranges and demand indicators
- **Testing:** Vitest (unit tests for the gate, scoring, and prereq matcher) and Playwright (key flows)
- **Hosting:** Vercel, with every program page statically generated
- **Analytics:** Vercel Analytics or Plausible only. No cookies, no PII.
- **No backend database and no user accounts.** Data lives in versioned JSON in the repo.

### Folder structure

```
/app
  page.tsx                      # Discovery hub
  programs/[slug]/page.tsx      # Program detail (SSG)
  professions/[slug]/page.tsx   # Profession overview → lists its eligible programs
  quiz/page.tsx                 # Recommendation survey
  quiz/results/page.tsx         # Ranked results (reads URL state)
  compare/page.tsx              # Side-by-side compare (2–3)
  team/page.tsx                 # Interdisciplinary team explorer (Phase 5)
  guide/page.tsx                # Application timeline + readiness guide
  about/page.tsx                # Methodology, sources, eligibility rules, disclaimer
/components
  program/ (ProgramCard, PathwayTimeline, RequirementsChecklist, SalaryPanel, DemandPanel, ScopeTabs, NonAcademicChecklist)
  filters/ (FilterBar, CourseMatcher, facets)
  quiz/ (QuizStepper, question components, ResultCard, WhyThisMatch)
  common/ (VerifiedBadge, UnverifiedField, SourceLink, Disclaimer)
/data
  professions.json
  programs.json
  institutions.json
  regulators.json
  courses.json                  # Ontario Grade 12 course codes + names (no Grade 11, no French)
  quiz.json                     # Survey questions + weights
/lib
  schema.ts                     # Zod schemas + inferred types
  eligibility.ts                # isEligible()
  prereqs.ts                    # course matching + gap analysis
  recommend.ts                  # scoring engine
  format.ts
/scripts
  validate-data.ts              # runs in CI + prebuild
  sync-from-sheet.ts            # Phase 4 pipeline
/tests
```

---

## 5. Data Model

Write this in `lib/schema.ts` as Zod schemas, and infer the TypeScript types from them.

```ts
type Region = "GTA" | "Central" | "Eastern" | "Southwestern" | "Northern";
type Portal = "OUAC" | "OCAS";
type Credential = "diploma" | "advanced_diploma" | "degree" | "collaborative_degree";
type ContactLevel = "high" | "moderate" | "technical";
type Domain =
  | "diagnostic_imaging" | "lab_pathology" | "therapeutics_rehab"
  | "maternal_newborn" | "cardiopulmonary_critical" | "oral_health"
  | "pharmacy" | "nursing" | "emergency" | "vision";

interface Sourced<T> { value: T | null; sourceUrl: string | null; }

interface Provenance {
  lastVerified: string | null;        // ISO date
  verifiedBy: "human" | "agent" | null;
  needsVerification: string[];        // field paths still unverified
}

interface RegulatoryBody {
  id: string;                         // "cmrito"
  name: string;
  acronym: string;
  url: string;
  underRHPA: boolean;
}

interface Profession {
  id: string;
  slug: string;
  title: string;
  regulatorId: string;
  protectedTitles: string[];          // e.g. "Registered Kinesiologist", "R.Kin."
  domain: Domain;
  contactLevel: ContactLevel;
  summary: string;                    // 1–2 sentences, plain language
  scopeOfPractice: {
    description: string;              // plain-language; link to official scope
    controlledActs?: string[];        // only if stated by regulator/legislation
    sourceUrl: string | null;
  };
  typicalDuties: string[];
  workSettings: ("hospital" | "outpatient_clinic" | "community" | "private_practice" | "long_term_care" | "lab" | "pre_hospital")[];
  dayInTheLife?: string;
  teamConnections: { professionId: string; how: string }[];
  riasec: ("R" | "I" | "A" | "S" | "E" | "C")[];   // top 2–3 Holland codes
  workStyle: WorkStyleProfile;        // used by recommender
  licensing: LicensingPath;
  labourMarket: LabourMarket;
}

interface LicensingPath {
  exams: {
    name: string;
    administeredBy: string;
    eligibilityPrereqs: string[];     // e.g. "Graduate of accredited program", "Clinical hours complete"
    format?: string;                  // e.g. "computer-based MCQ"
    typicalTiming?: string;           // e.g. "within 6 months of graduation"
    feeCAD?: Sourced<number>;
    sourceUrl: string | null;
  }[];
  jurisprudenceExam?: { required: boolean; sourceUrl: string | null };
  registration: {
    steps: string[];                  // e.g. "Submit application", "Pay fee", "Proof of liability insurance"
    classOfCertificate?: string;      // e.g. "General", "Temporary"
    annualFeeCAD?: Sourced<number>;
    sourceUrl: string | null;
  };
}

interface LabourMarket {
  nocCode: Sourced<string>;           // NOC 2021
  wageOntario: {                      // Job Bank Ontario wages, hourly
    low: number | null; median: number | null; high: number | null;
    year: string | null; sourceUrl: string | null;
  };
  annualSalaryEstimate?: { median: number | null; basis: string };  // e.g. "median hourly × 1950 hrs"
  workerCount: {                      // regulator annual report or CIHI
    value: number | null; asOf: string | null; basis: string | null;  // "registered members in Ontario"
    sourceUrl: string | null;
  };
  outlook: {                          // Job Bank 3-year outlook for Ontario / region
    rating: "very_good" | "good" | "moderate" | "limited" | "very_limited" | "undetermined" | null;
    period: string | null;
    byRegion?: Partial<Record<Region, LabourMarket["outlook"]["rating"]>>;
    sourceUrl: string | null;
  };
}

interface WorkStyleProfile {
  bloodAndBodyFluids: 0 | 1 | 2;      // 0 none, 1 some, 2 frequent
  needles: 0 | 1 | 2;
  physicalDemand: 0 | 1 | 2;
  shiftWork: 0 | 1 | 2;
  acuteEmergency: 0 | 1 | 2;
  techEquipment: 0 | 1 | 2;
  patientInteraction: 0 | 1 | 2;
  independence: 0 | 1 | 2;            // works autonomously vs within tight team protocols
}

interface Institution {
  id: string;
  name: string;
  type: "university" | "college";
  campus: string;
  city: string;
  region: Region;
  url: string;
}

interface Prerequisite {
  // Single required course, or "any one of" group
  kind: "required" | "anyOf";
  courses: string[];                  // Ontario codes, e.g. ["SCH4U"], ["MHF4U","MCV4U"]
  minMark?: number | null;            // if program sets a minimum in that course
  note?: string;
}

interface ProgramStep {
  order: number;
  phase: "high_school" | "application" | "program" | "placement" | "exam" | "registration" | "work";
  title: string;                      // "Complete Grade 12 prerequisites"
  description: string;
  durationLabel?: string;             // "Sept–June Grade 12", "Year 3", "~4–8 weeks"
  prereqsForStep?: string[];          // what must be done before this step
  sourceUrl?: string | null;
}

interface NonAcademicRequirement {
  type:
    | "vulnerable_sector_check" | "immunizations" | "tb_test" | "n95_fit_test"
    | "cpr_bls" | "first_aid" | "whmis" | "mask_fit" | "health_form"
    | "medical_exam" | "uniform_equipment" | "drivers_licence" | "other";
  label: string;
  details?: string;                   // e.g. specific vaccines listed by the school
  timing?: string;                    // e.g. "Before first clinical placement (Year 1 winter)"
  estimatedCostCAD?: number | null;
  sourceUrl: string | null;
}

interface Program {
  id: string;
  slug: string;
  professionId: string;
  institutionIds: string[];           // >1 for collaborative programs
  name: string;                       // official program name
  credential: Credential;
  credentialName: string;             // "Bachelor of Health Sciences (Midwifery)"
  durationYears: number;
  coop: boolean;
  accredited: { byBody: string | null; sourceUrl: string | null };

  application: {
    portal: Portal;
    programCode: Sourced<string>;     // OUAC or OCAS code
    equalConsiderationDate?: string | null;
    intakes: ("fall" | "winter" | "spring")[];
  };

  academic: {
    prerequisites: Prerequisite[];
    admissionAverage: {
      low: number | null; high: number | null;
      type: "minimum" | "competitive" | "historical_range";
      cycle: string | null; sourceUrl: string | null;
    };
    supplementary: {
      type: "casper" | "kira" | "personal_statement" | "interview" | "questionnaire" | "admission_test" | "info_session" | "other";
      label: string; required: boolean; sourceUrl: string | null;
    }[];
    otherNotes?: string[];            // e.g. "Selection may be by lottery if oversubscribed"
    programRequirements: string[];    // e.g. "Minimum GPA to progress", "Must pass clinical competencies"
  };

  nonAcademic: NonAcademicRequirement[];
  clinicalPlacements: { description: string; totalHours?: number | null; sourceUrl: string | null };

  costs?: {
    tuitionDomesticPerYear: Sourced<number>;
    extraFeesNote?: string;
  };

  timeline: ProgramStep[];            // full Grade 12 → working professional path

  eligibility: {
    directEntryFromHighSchool: boolean;
    singleCredentialToPractice: boolean;
    requiresFurtherEducation: boolean;
    rationale: string;                // one line explaining why it passes
    sourceUrl: string | null;
  };

  provenance: Provenance;
}
```

### `lib/eligibility.ts`

```ts
export const isEligible = (p: Program) =>
  p.eligibility.directEntryFromHighSchool &&
  p.eligibility.singleCredentialToPractice &&
  !p.eligibility.requiresFurtherEducation;
```

### `scripts/validate-data.ts` (runs as `prebuild` and in CI)

- Parse all JSON through Zod. Fail the build on any error.
- Every `Program.professionId`, `institutionIds`, and `Profession.regulatorId` must resolve.
- Every course code must exist in `courses.json`.
- Every `timeline` must include, in order, at least one step each for `high_school`, `application`, `program`, `exam` (if the profession has exams), `registration`, and `work`.
- Print a report of all `needsVerification` fields and all records with `lastVerified` older than 90 days. Warn only; don't fail.
- Fail the build if any record marked as shown fails `isEligible()`.

---

## 6. Program Detail Page — Required Sections

Route: `/programs/[slug]`, statically generated. Sections in order:

1. **Header.** Program name, institution(s), credential, duration, portal and program code, region, plus a `VerifiedBadge` showing the last-verified date.
2. **Quick facts strip.** Median wage, outlook rating, Ontario worker count, program length, and competitive average range. Each fact is tappable to show its source.
3. **Job and scope of practice.** Use tabs:
   - *What they do:* summary and typical duties.
   - *Scope of practice:* plain-language description, controlled acts (if applicable), and a link to the regulator.
   - *Where they work:* work settings.
   - *Team:* how they work with other professions, linking to the team explorer.
   - *Day in the life:* a callout.
4. **Step-by-step pathway timeline (`PathwayTimeline`).** A vertical stepper from Grade 11 to working professional. It must include:
   - High school prerequisites (Grade 12)
   - Application: portal, code, deadlines, supplementary pieces
   - Each program year, with placements marked
   - Non-academic requirements, placed at the point they're due
   - Licensing exam(s), with each exam's own eligibility prerequisites, format, timing, and fee
   - Jurisprudence exam, if applicable
   - Registration with the regulatory college: steps and fees
   - Start working

   Each step shows a duration label and "what you need before this step."
5. **Academic requirements.**
   - An interactive high school prerequisites checklist. If the user has quiz results or selected courses in the URL, show ✅ or ❌ per course.
   - The admission average range, with its cycle and type.
   - Supplementary requirements.
   - Program progression requirements, such as minimum grades to continue.
6. **Non-academic requirements.** A checklist grouped as Before you start / Before placement / Ongoing. Covers the vulnerable sector check, immunizations, TB test, N95 fit test, CPR/BLS, first aid, and so on, each with timing and estimated cost when known.
7. **Pay and demand (`SalaryPanel`, `DemandPanel`).** Show the Ontario hourly low/median/high wages, the annual estimate with its basis stated, the worker count with its date and basis, and the Job Bank outlook overall and by region. Always show the data year and a source link.
8. **Other schools offering this profession.** Cards for the other eligible programs.
9. **Sources and disclaimer.** List every source URL used on the page. Add: "Always confirm requirements on the official program page before applying."

Any `null` field renders `UnverifiedField` ("Not yet verified — check official page" plus a link). Never hide the section.

---

## 7. Discovery Hub (Landing Page)

1. **Hero.** One-line value proposition, plus buttons for "Take the 5-minute quiz" and "Browse all programs."
2. **Quick matcher.** Pick your Grade 12 courses to instantly see how many programs you qualify for.
3. **Filter bar (URL-persisted via `nuqs`):**
   - Courses taken or planned (multi-select of Ontario Grade 12 codes; Grade 11 students pick the Grade 12 courses they plan to take)
   - Domain
   - Patient contact level
   - Credential and duration
   - Region
   - Portal (OUAC or OCAS)
   - Co-op available
   - Program type: university (including collaborative/joint university–college degrees) or college
   - Outlook rating (good or better)
   - Median wage range
4. **Program grid.** Cards show profession, school, credential, years, median wage, outlook, and a prereq match indicator (e.g., "You have 4/5 prereqs").
5. **Compare drawer.** Select 2–3 programs to compare side by side on length, average, prereqs, wage, outlook, exams, and non-academic requirements.
6. **"I'm missing a course" helper.** If a user lacks a prerequisite, show which programs are still available and general ways to get the course (summer school, night school, e-learning, upgrading). Keep this generic; no specific providers unless sourced.

---

## 8. Recommendation Survey

Route: `/quiz`. A stepper of about 5 minutes with a progress bar. One question per screen on mobile.

### Privacy (mandatory)

- No names, emails, schools, or identifiers are collected.
- Answers stay in the browser: React state, then encoded into the results URL, with optional `localStorage` to resume. There is no server storage.
- Show this on the first screen: "Your answers stay on your device."

### Sections

**A. Academics**
- Current grade (11 or 12).
- Current or expected average (%) for top 6 Grade 12 U/M courses. Allow "Not sure yet." Grade 11 students enter the Grade 12 average they expect.
- Courses taken or planned: a multi-select of Grade 12 U/M/C codes from `courses.json`, grouped by subject. Grade 11 students predict their Grade 12 courses.
- Optional marks in key subjects (Biology, Chemistry, Physics, Math, English).

**B. Interests (RIASEC)**
- 12–18 short "Would you enjoy…?" items on a 5-point scale, mapped to Holland codes.
- Use original wording, or public-domain O*NET Interest Profiler item style. Don't copy copyrighted instruments.

**C. Work style and comfort**
- Comfort with blood and bodily fluids, needles, physical work, shift work and weekends, fast-paced emergencies, and technology or equipment.
- Preference for lots of patient interaction vs behind-the-scenes work.
- Preference for working independently vs within a tight team.

**D. Practical preferences**
- Program length: 2–3 years vs 4 years vs no preference.
- College vs university vs no preference.
- Regions willing to study in (multi-select).
- Program type: university programs (collaborative/joint university–college degrees count as university), college programs, or both. This is a hard filter.
- Importance of salary and of job demand (1–5 each).

### Scoring engine (`lib/recommend.ts`)

The engine is deterministic and explainable. No LLM runs at runtime.

1. **Hard filter.** Keep only programs where `isEligible()` is true. Also drop programs in regions the student excluded, if they selected any.
2. **Prerequisite status** (per program):
   - `met`: has or plans all prerequisites.
   - `fixable`: missing 1–2 prerequisites while still in Grade 11, or missing 1 while in Grade 12.
   - `blocked`: missing more than that. Show these separately under "Possible with extra courses," never mixed into top matches.
3. **Academic fit**, comparing the student's average to `admissionAverage`:
   - `likely`: at or above the high end
   - `possible`: within the range
   - `reach`: below the low end, by up to 5 points
   - `unlikely`: more than 5 below
   - `unknown`: average missing or range is `null`

   Never state or imply guaranteed admission.
4. **Interest fit (0–1).** Cosine similarity between the student's RIASEC vector and the profession's code weights.
5. **Work-style fit (0–1).** 1 minus the normalized distance between the student's comfort answers and the profession's `WorkStyleProfile`. Heavily penalize hard mismatches, such as "very uncomfortable with blood" against `bloodAndBodyFluids: 2`.
6. **Preference fit (0–1).** Length and the salary and demand weightings. Results are ranked but never shown with a percentage or score, so they suggest options rather than tell students what to pick.
7. **Final score:**
   ```
   score = 0.35·interest + 0.30·workStyle + 0.20·preferences + 0.15·academicFitScore
   ```
   Store the weights in `quiz.json` so they're tunable. The academic fit score maps as: likely 1, possible 0.75, reach 0.4, unknown 0.5, unlikely 0.15.
8. **Output.** The top 5 professions, each with its best-matching eligible programs.

### Results page (`/quiz/results`)

- **Ranked cards.** Each shows match %, profession, 1–3 program options, and badges for prereq status and academic fit.
- **"Why this matches" panel.** 2–4 generated bullets, such as "Strong Investigative + Realistic interests," "You're comfortable with needles," or "You have all 5 prerequisites."
- **"Watch-outs."** For example: "Missing SPH4U," "Competitive average is above your current average," or "Involves shift work."
- **"Possible with extra courses."** A separate section for programs with blocked prerequisites.
- **Buttons.** Compare these, retake, share link (URL-encoded answers), and print a summary for a counsellor.
- **Disclaimer.** "This is a starting point, not advice. Talk to your guidance counsellor and check official program pages."

---

## 9. Application and Readiness Guide (`/guide`)

- **Grade 11 → Grade 12 timeline.** Course selection, summer options, OUAC/OCAS opening and equal consideration dates, mid-term mark submission, and offer periods. Every date must be sourced and tied to a cycle year; use `null` and "check portal" if unverified.
- **Supplementary components explained.** What CASPer, Kira-style video assessments, personal statements, and interviews are, with tips. Programs link here when they require one.
- **Placement readiness.** What vulnerable sector checks, immunization records, N95 fit testing, and CPR/BLS are; when students usually need them; and how long they take.
- **Costs overview.** Tuition, application fees, and exam and registration fees as a checklist. Link to OSAP generally; don't compute aid.

---

## 10. Interdisciplinary Team Explorer (`/team`)

- An interactive diagram of professions around a patient, built from `teamConnections`.
- 2–3 scripted patient journeys:
  - *Car accident trauma:* Paramedic → MRT (CT) → MLT (bloodwork) → RT (ventilation) → RPN (recovery) → Kinesiologist (rehab).
  - *Pregnancy and birth:* Midwife → Sonographer → MLT → RT (newborn support, if needed).
  - *Dental and oral health:* Dental Hygienist → Denturist.
- Each step highlights the profession and links to its page.
- Journeys are illustrative, not clinical guidance. Say so on the page.

---

## 11. UX, Accessibility, Content Style

- **Mobile-first.** Most students will use phones.
- **Accessibility.** WCAG 2.2 AA: full keyboard support, visible focus, sufficient contrast, reduced-motion support, and accessible charts (with table fallbacks).
- **Reading level.** About Grade 9–10 plain language. Define jargon inline (e.g., "Controlled act = a task only certain licensed professionals can legally do").
- **Tone.** Encouraging and honest. Never promise admission or jobs.
- **Light and dark themes.**
- **Every page footer** includes "Last data update" and a link to `/about` (methodology, sources, eligibility rules, disclaimer, how to report an error).
- **"Report an error" link on every program page.** A `mailto:` or form link; configure the target via env var.

---

## 12. Live Data Pipeline (Gemini Spark → Sheet → PR)

Build this in its own phase, after the site works with static data.

### Architecture

```
Gemini Spark (scheduled agent)
   └─ writes to → Google Sheet (the "contract")
                    tabs: programs | professions | staging | candidates | labour_market | log
GitHub Action (scheduled, e.g. weekly)
   └─ scripts/sync-from-sheet.ts
        1. Read APPROVED rows from `staging` via Google Sheets API (service account)
        2. Merge into /data/*.json
        3. Run validate-data.ts (Zod + eligibility gate)
        4. Open a PR with a human-readable diff summary
Owner reviews + merges → Vercel redeploys
```

### Sheet columns (`staging` tab)

`recordType | recordId | fieldPath | oldValue | newValue | sourceUrl | evidenceNote | detectedAt | agentConfidence | status (pending/approved/rejected) | reviewedBy | reviewedAt`

### Spark tasks (the owner configures these in Spark)

- **Weekly verification.** For each program row, visit its official program page and its OUAC or ontariocolleges.ca listing. Compare prerequisites, program code, averages, supplementary requirements, and non-academic requirements. Write any differences to `staging` with source URL and evidence. Never edit the `programs` tab directly.
- **Monthly regulator check.** For each regulator, check entry-to-practice, exam, and registration pages for changes to exams, fees, or requirements.
- **Quarterly labour market check.** Pull Ontario wages and outlook by NOC from Job Bank, and worker counts from regulator annual reports or CIHI. Write to `labour_market` and `staging`.
- **Monthly discovery.** Search for new, renamed, or closed programs that might pass the eligibility gate. Write them to `candidates` with the three gate checks answered, each with evidence. Nothing gets auto-published.

### Guardrails

- The pipeline never auto-merges. Every change goes through a PR.
- The sync script rejects any row without a `sourceUrl` from an allow-listed official domain. Keep the list in `scripts/allowed-domains.ts`.
- Any change to eligibility fields or prerequisites is labelled `high-risk` in the PR.
- The agent is swappable. The Sheet schema is the contract, so a Gemini or Claude API script on GitHub Actions can replace Spark without site changes.
- Crawl politely: low frequency, respect robots.txt and site terms, official pages only.

### Secrets

- `GOOGLE_SERVICE_ACCOUNT_JSON` and `SHEET_ID` go in GitHub Actions secrets. Never commit them.
- Share the Sheet with the service account as Viewer. Add Editor only if the script writes back status.

---

## 13. Build Phases and Acceptance Criteria

Stop after each phase for owner review.

### Phase 0 — Foundation
- Scaffold Next.js, TypeScript, Tailwind, shadcn/ui, ESLint/Prettier, Vitest, and Playwright.
- Implement `lib/schema.ts`, `eligibility.ts`, and `validate-data.ts` (wired to `prebuild`).
- Create `courses.json` covering Ontario Grade 12 codes relevant to health programs, including ENG4U, SBI4U, SCH4U, SPH4U, MHF4U, MCV4U, MDM4U, and relevant M/C courses.
- Create seed data: 2 professions × 2 programs, with structure complete and unverified values `null`.
- **Done when:**
  - `npm run build` passes.
  - Validation reports its `needsVerification` list.
  - Unit tests cover `isEligible()`, including a deliberately ineligible fixture that is excluded.

### Phase 1 — Core site
- Build the discovery hub, filters (URL-persisted), program grid, program detail page (all Section 6 sections), profession pages, `/about`, and all shared components (`VerifiedBadge`, `UnverifiedField`, `SourceLink`).
- **Done when:**
  - All program pages statically generate.
  - Filters survive refresh and sharing.
  - Null fields render as unverified, never blank.
  - Lighthouse accessibility score is at least 95.
  - Playwright covers browse → filter → open program.

### Phase 2 — Recommendation survey
- Build `/quiz`, `/quiz/results`, `recommend.ts`, and `quiz.json`.
- **Done when:**
  - Scoring is fully unit tested, including hard-mismatch penalties, blocked-prereq separation, and never recommending ineligible programs.
  - Results are shareable via URL.
  - No answers leave the browser. Verify with a network check in Playwright.
  - The print view works.

### Phase 3 — Compare, guide, readiness
- Build the compare drawer and page, `/guide`, the missing-course helper, and the counsellor print summary.
- **Done when:**
  - Comparing 2–3 programs works on mobile.
  - All guide dates are sourced or marked unverified.

### Phase 4 — Live data pipeline
- Build `sync-from-sheet.ts`, the GitHub Action workflow, the allowed-domains list, PR diff formatting, and a stale-data report.
- Write `docs/SPARK_TASKS.md` with copy-paste task instructions for Spark and the exact Sheet column layout.
- **Done when:**
  - A dry run against a test Sheet opens a correct PR.
  - Rows without official sources are rejected.
  - High-risk changes are labelled.

### Phase 5 — Team explorer and polish
- Build `/team` with 2–3 journeys, dark mode QA, OG images per program, sitemap, and robots.
- **Done when:**
  - The team explorer is keyboard accessible.
  - Every program has an OG image.
  - The sitemap lists all static routes.

### Phase 6 — Data completion (owner-led, Claude-assisted)
- Research and fill 8–12 professions and their eligible programs from official sources, following Section 2.
- The owner verifies each record, then flips `verifiedBy` to `"human"`.
- **Done when:** there are zero `needsVerification` items on launch-listed programs.

---

## 14. Out of Scope

- User accounts, logins, or saved profiles on a server
- Any program that fails the eligibility gate, including graduate or professional pathways, even as "related" suggestions
- Personalized admissions predictions presented as probabilities
- Financial aid calculations
- Runtime LLM calls in the student-facing app

---

## 15. Definition of Launch-Ready

- [ ] All shown programs pass `isEligible()` and are human-verified within the last 90 days.
- [ ] Every program page has all Section 6 sections, with sources.
- [ ] The quiz returns explained, eligible-only results with no data leaving the device.
- [ ] Accessibility is at AA, and mobile QA is done on iOS Safari and Android Chrome.
- [ ] The disclaimer and methodology page are live.
- [ ] The pipeline runs weekly and opens reviewable PRs.
- [ ] At least one guidance counsellor and 3–5 students have tested it, and their feedback is addressed.
