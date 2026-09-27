# Verification agent tasks & Sheet contract

This is the setup guide for the live data pipeline (BUILD_PLAN.md §12). A scheduled agent
(Gemini Spark, or any replacement) checks official websites and writes proposed changes to a
Google Sheet. You approve rows in the Sheet. A weekly GitHub Action turns approved rows into a
pull request. **Nothing is ever published without you merging a PR.**

```
Agent ──writes──▶ Google Sheet ──(you approve rows)──▶ GitHub Action ──opens──▶ PR ──(you merge)──▶ site redeploys
```

The Sheet is the contract. Any agent that follows this layout can replace Spark with no site changes.

---

## 1. One-time setup

1. **Create the Sheet** with the six tabs below, with the header row spelled exactly as shown.
2. **Create a Google Cloud service account** with the Google Sheets API enabled, and download its
   JSON key.
3. **Share the Sheet** with the service account's email as **Viewer**. The sync script only reads.
4. **Add GitHub secrets** (Settings → Secrets and variables → Actions):
   - `GOOGLE_SERVICE_ACCOUNT_JSON`: the whole JSON key file contents
   - `SHEET_ID`: the long ID in the Sheet URL (`/spreadsheets/d/<SHEET_ID>/edit`)
5. **Allow Actions to open PRs** (Settings → Actions → General → Workflow permissions → "Allow
   GitHub Actions to create and approve pull requests"). Leave auto-merge off.
6. **Test it:** Actions → "Data sync" → Run workflow → tick _Dry run_. The job summary shows the PR
   body it would open. Locally, `npm run sync:dry-run` does the same against
   `tests/fixtures/staging-sample.csv`.

Never commit the key file or put it in the Sheet.

---

## 2. Sheet layout

### `staging`: proposed changes (the only tab the sync reads)

| Column            | What goes in it                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `recordType`      | `program`, `profession`, `institution`, or `regulator`                                                                      |
| `recordId`        | The record's `id` from the data, e.g. `humber-practical-nursing`                                                            |
| `fieldPath`       | Dot path into the record, e.g. `application.programCode.value`, `labourMarket.wageOntario.median`, `academic.prerequisites` |
| `oldValue`        | The **current** value, copied exactly from `/data-export.json`, as JSON. Leave blank if it is `null`.                       |
| `newValue`        | The value the official page shows, as JSON (see "Value format" below)                                                       |
| `sourceUrl`       | The exact official `https://` page where you found the new value                                                            |
| `evidenceNote`    | A short quote or description of where on the page the value appears                                                         |
| `detectedAt`      | Date found, `YYYY-MM-DD`                                                                                                    |
| `agentConfidence` | `0`–`1`                                                                                                                     |
| `status`          | `pending` (agent default), `approved`, or `rejected`. **Only you change this.**                                             |
| `reviewedBy`      | Your name or initials (required for approved rows)                                                                          |
| `reviewedAt`      | Date you reviewed, `YYYY-MM-DD`                                                                                             |

**Value format:** numbers as `82`, text as `"MHF4U"` (with quotes) or plain `MHF4U`, lists and objects
as JSON, e.g. `[{"kind":"required","courses":["ENG4U"]},{"kind":"anyOf","courses":["MHF4U","MCV4U"]}]`.
A blank cell means `null`.

**How the sync treats rows:**

- Only `approved` rows are used. Pending and rejected rows are skipped.
- A row is **rejected** (and listed in the PR) if its `sourceUrl` is missing, isn't `https`, or isn't
  on an allowed official domain (`scripts/allowed-domains.ts`), if the record or field doesn't exist,
  or if `oldValue` no longer matches the data (someone changed it since).
- `id`, `slug`, and `provenance` can't be changed through the Sheet.
- Changes to `eligibility.*`, `academic.prerequisites`, or `published` are labelled **high-risk** on the PR.
- When a value is set, its `sourceUrl` is set too, and the field is removed from
  `provenance.needsVerification`. Record-level `lastVerified` / `verifiedBy` are left for you to
  update when you've checked the whole record.
- After merging rows, the full validation (eligibility gate included) runs. If it fails, nothing is
  written and the job fails.

### `programs`: what to check for each program (you maintain this)

`programId | institution | programName | officialProgramUrl | portalListingUrl | lastChecked`

### `professions`: what to check for each regulator (you maintain this)

`professionId | regulator | entryToPracticeUrl | examUrl | registrationUrl | annualReportUrl | lastChecked`

### `candidates`: possible new programs (never auto-published)

`detectedAt | institution | programName | credential | portal | programUrl | professionGuess | directEntryFromHighSchool | directEntryEvidenceUrl | singleCredentialToPractice | singleCredentialEvidenceUrl | requiresFurtherEducation | furtherEducationEvidenceUrl | notes | status | reviewedBy`

### `labour_market`: quarterly snapshot

`professionId | nocCode | nocSourceUrl | wageLow | wageMedian | wageHigh | wageYear | wageSourceUrl | outlookOntario | outlookPeriod | outlookSourceUrl | workerCount | workerCountAsOf | workerCountBasis | workerCountSourceUrl | checkedAt`

### `log`: one row per agent run

`runAt | task | recordsChecked | changesFound | errors | notes`

---

## 3. Agent tasks (copy into Spark)

Every task starts with these **rules**. Paste them at the top of each task.

> **Rules for every task**
>
> 1. Use only official sources: the school's own program page, OUAC (ouac.on.ca),
>    ontariocolleges.ca, the Ontario regulatory college's website, Government of Canada Job Bank,
>    CIHI, and Statistics Canada. Never use forums, Reddit, news, blogs, or aggregator sites.
> 2. Never guess. If a value isn't clearly stated on an official page, don't write a row for it.
> 3. Never edit the `programs`, `professions`, or `candidates` records other than adding rows. Never
>    change a `status` cell.
> 4. Write one `staging` row per changed field. Copy `oldValue` exactly from
>    `<SITE_URL>/data-export.json`. Put the exact page URL in `sourceUrl` and a short quote in
>    `evidenceNote`. Set `status` to `pending`.
> 5. Admission averages must be tied to a cycle. Write `admissionAverage.low`, `.high`, `.cycle`
>    (e.g. `"2026 entry"`), `.type` (`minimum`, `competitive`, or `historical_range`) as separate rows.
> 6. Crawl politely: respect robots.txt and site terms, visit each page at most once per run, and
>    don't submit forms or log in.
> 7. Add one row to `log` when you finish, even if you found nothing.

### Weekly: program verification

> For each row in the `programs` tab, open `officialProgramUrl` and `portalListingUrl`. Compare them
> with that program's current values in `<SITE_URL>/data-export.json`:
>
> - `application.programCode.value`, `application.equalConsiderationDate`, `application.intakes`
> - `academic.prerequisites` (Ontario course codes; "any one of" groups use `kind: "anyOf"`)
> - `academic.admissionAverage` (low, high, type, cycle)
> - `academic.supplementary` (CASPer, interview, etc.)
> - `nonAcademic` (police checks, immunizations, CPR, etc.)
> - `durationYears`, `credential`, `credentialName`, `coop`
> - `costs.tuitionDomesticPerYear.value`
>
> For every difference, or every `null` you can now fill from an official page, add a `staging`
> row following the rules. Update `lastChecked` in your notes in the `log` row, not in the
> `programs` tab.

### Monthly: regulator check

> For each row in the `professions` tab, open the regulator's entry-to-practice, exam, and
> registration pages. Compare with the profession's `licensing` values in the export: exam names,
> who administers them, eligibility requirements, format, timing, fees
> (`licensing.exams.<n>.feeCAD.value`), whether a jurisprudence exam is required, registration
> steps, certificate class, and annual fee. Write each difference to `staging`.

### Quarterly: labour market check

> For each profession, look up its NOC 2021 code on Job Bank. Record Ontario hourly wages
> (low / median / high, with the data year) and the 3-year employment outlook for Ontario and, if
> shown, each Ontario economic region. Get the number of registered members in Ontario from the
> regulator's latest annual report, or from CIHI. Write everything to `labour_market`, then add
> `staging` rows for `labourMarket.nocCode.value`, `labourMarket.wageOntario.*`,
> `labourMarket.outlook.*`, and `labourMarket.workerCount.*`.
>
> Outlook values must be one of: `very_good`, `good`, `moderate`, `limited`, `very_limited`,
> `undetermined`.

### Monthly: program discovery

> Search ontariocolleges.ca, OUAC, and school websites for Ontario programs that could lead to one
> of these regulated careers, or programs that are new, renamed, or closed: medical radiation
> technology, sonography, medical laboratory technology, respiratory therapy, midwifery, dental
> hygiene, kinesiology, massage therapy, pharmacy technician, practical nursing, opticianry,
> denturism, paramedic.
>
> For each one, answer all three eligibility checks with an official evidence URL:
>
> 1. **directEntryFromHighSchool**: can Ontario high school students apply with no prior
>    college or university?
> 2. **singleCredentialToPractice**: does this one credential meet the regulator's education
>    requirement?
> 3. **requiresFurtherEducation**: is any other degree or diploma needed to practise?
>
> Write each program to `candidates` with `status` = `pending`. Do not add anything to `staging`
> for new programs. The owner adds new programs to the site by hand.

---

## 4. Reviewing

1. In the Sheet, read each `pending` row, open its `sourceUrl`, and confirm the value.
2. Set `status` to `approved` or `rejected`, and fill `reviewedBy` and `reviewedAt`.
3. On Monday the Action opens a PR. Check anything labelled **high-risk** extra carefully:
   eligibility and prerequisite changes decide who sees what.
4. Merge the PR. The site redeploys.
5. When you've checked a whole record, set its `provenance.lastVerified` to today and
   `verifiedBy` to `"human"` in the JSON (in the same PR or a follow-up).

The "Data sync" workflow also runs a **freshness report** every week (see its job summary): records
not verified in 90 days and fields still waiting for verification.
