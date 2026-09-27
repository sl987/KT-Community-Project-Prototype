/**
 * Zod schemas for all data in /data. TypeScript types are inferred from these,
 * so the schemas are the single source of truth (BUILD_PLAN.md §5).
 *
 * Nullable fields follow Data Integrity Rule 3: when a value cannot be verified
 * it is `null` and its path is listed in the record's `provenance.needsVerification`.
 */
import { z } from "zod";

// ---------- Primitives ----------

export const RegionSchema = z.enum(["GTA", "Central", "Eastern", "Southwestern", "Northern"]);
export const PortalSchema = z.enum(["OUAC", "OCAS"]);
export const CredentialSchema = z.enum([
  "diploma",
  "advanced_diploma",
  "degree",
  "collaborative_degree",
]);
export const ContactLevelSchema = z.enum(["high", "moderate", "technical"]);
export const DomainSchema = z.enum([
  "diagnostic_imaging",
  "lab_pathology",
  "therapeutics_rehab",
  "maternal_newborn",
  "cardiopulmonary_critical",
  "oral_health",
  "pharmacy",
  "nursing",
  "emergency",
  "vision",
]);
export const RiasecSchema = z.enum(["R", "I", "A", "S", "E", "C"]);

const IsoDate = z.iso.date();
const Url = z.url({ protocol: /^https?$/ });
const NullableUrl = Url.nullable();
const Id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "ids/slugs must be kebab-case");

/** A single factual value with its source. */
export const sourced = <T extends z.ZodType>(value: T) =>
  z.object({ value: value.nullable(), sourceUrl: NullableUrl });

export const ProvenanceSchema = z.object({
  lastVerified: IsoDate.nullable(),
  verifiedBy: z.enum(["human", "agent"]).nullable(),
  /** Dot-separated field paths still unverified, e.g. "labourMarket.wageOntario". */
  needsVerification: z.array(z.string().min(1)),
});

// ---------- Regulators & institutions ----------

export const RegulatoryBodySchema = z.object({
  id: Id,
  name: z.string().min(1),
  acronym: z.string().min(1),
  url: Url,
  underRHPA: z.boolean(),
  provenance: ProvenanceSchema,
});

export const InstitutionSchema = z.object({
  id: Id,
  name: z.string().min(1),
  type: z.enum(["university", "college"]),
  campus: z.string().min(1),
  city: z.string().min(1),
  region: RegionSchema,
  url: Url,
  language: z.array(z.enum(["en", "fr"])).min(1),
  provenance: ProvenanceSchema,
});

// ---------- Courses ----------

export const CourseCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}[1-4][A-Z]$/, "Ontario course codes look like SCH4U");

export const CourseSchema = z.object({
  code: CourseCodeSchema,
  name: z.string().min(1),
  grade: z.union([z.literal(11), z.literal(12)]),
  /** U university, M university/college, C college, E workplace, O open. */
  pathway: z.enum(["U", "M", "C", "E", "O"]),
  subject: z.string().min(1),
});

export const CoursesFileSchema = z.object({
  sourceUrl: NullableUrl,
  provenance: ProvenanceSchema,
  courses: z.array(CourseSchema).min(1),
});

// ---------- Profession ----------

const Level = z.union([z.literal(0), z.literal(1), z.literal(2)]);

export const WorkStyleProfileSchema = z.object({
  bloodAndBodyFluids: Level,
  needles: Level,
  physicalDemand: Level,
  shiftWork: Level,
  acuteEmergency: Level,
  techEquipment: Level,
  patientInteraction: Level,
  independence: Level,
});

export const LicensingPathSchema = z.object({
  exams: z.array(
    z.object({
      name: z.string().min(1),
      administeredBy: z.string().min(1),
      eligibilityPrereqs: z.array(z.string()),
      format: z.string().optional(),
      typicalTiming: z.string().optional(),
      feeCAD: sourced(z.number().nonnegative()).optional(),
      sourceUrl: NullableUrl,
    }),
  ),
  jurisprudenceExam: z.object({ required: z.boolean(), sourceUrl: NullableUrl }).optional(),
  registration: z.object({
    steps: z.array(z.string().min(1)),
    classOfCertificate: z.string().optional(),
    annualFeeCAD: sourced(z.number().nonnegative()).optional(),
    sourceUrl: NullableUrl,
  }),
});

export const OutlookRatingSchema = z.enum([
  "very_good",
  "good",
  "moderate",
  "limited",
  "very_limited",
  "undetermined",
]);

export const LabourMarketSchema = z.object({
  nocCode: sourced(z.string().regex(/^\d{5}$/, "NOC 2021 codes are 5 digits")),
  wageOntario: z.object({
    low: z.number().positive().nullable(),
    median: z.number().positive().nullable(),
    high: z.number().positive().nullable(),
    year: z.string().nullable(),
    sourceUrl: NullableUrl,
  }),
  annualSalaryEstimate: z
    .object({ median: z.number().positive().nullable(), basis: z.string().min(1) })
    .optional(),
  workerCount: z.object({
    value: z.number().int().nonnegative().nullable(),
    asOf: z.string().nullable(),
    basis: z.string().nullable(),
    sourceUrl: NullableUrl,
  }),
  outlook: z.object({
    rating: OutlookRatingSchema.nullable(),
    period: z.string().nullable(),
    byRegion: z.partialRecord(RegionSchema, OutlookRatingSchema.nullable()).optional(),
    sourceUrl: NullableUrl,
  }),
});

export const WorkSettingSchema = z.enum([
  "hospital",
  "outpatient_clinic",
  "community",
  "private_practice",
  "long_term_care",
  "lab",
  "pre_hospital",
]);

export const ProfessionSchema = z.object({
  id: Id,
  slug: Id,
  title: z.string().min(1),
  regulatorId: Id,
  protectedTitles: z.array(z.string().min(1)),
  domain: DomainSchema,
  contactLevel: ContactLevelSchema,
  summary: z.string().min(1),
  scopeOfPractice: z.object({
    description: z.string().min(1),
    controlledActs: z.array(z.string().min(1)).optional(),
    sourceUrl: NullableUrl,
  }),
  typicalDuties: z.array(z.string().min(1)),
  workSettings: z.array(WorkSettingSchema),
  dayInTheLife: z.string().optional(),
  teamConnections: z.array(z.object({ professionId: Id, how: z.string().min(1) })),
  riasec: z.array(RiasecSchema).min(1).max(3),
  workStyle: WorkStyleProfileSchema,
  licensing: LicensingPathSchema,
  labourMarket: LabourMarketSchema,
  provenance: ProvenanceSchema,
});

// ---------- Program ----------

export const PrerequisiteSchema = z
  .object({
    kind: z.enum(["required", "anyOf"]),
    courses: z.array(CourseCodeSchema).min(1),
    minMark: z.number().min(0).max(100).nullable().optional(),
    note: z.string().optional(),
  })
  .refine((p) => p.kind !== "required" || p.courses.length === 1, {
    message: '"required" prerequisites list exactly one course; use "anyOf" for groups',
  });

export const StepPhaseSchema = z.enum([
  "high_school",
  "application",
  "program",
  "placement",
  "exam",
  "registration",
  "work",
]);

export const ProgramStepSchema = z.object({
  order: z.number().int().nonnegative(),
  phase: StepPhaseSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  durationLabel: z.string().optional(),
  prereqsForStep: z.array(z.string().min(1)).optional(),
  sourceUrl: NullableUrl.optional(),
});

export const NonAcademicRequirementSchema = z.object({
  type: z.enum([
    "vulnerable_sector_check",
    "immunizations",
    "tb_test",
    "n95_fit_test",
    "cpr_bls",
    "first_aid",
    "whmis",
    "mask_fit",
    "health_form",
    "medical_exam",
    "uniform_equipment",
    "drivers_licence",
    "other",
  ]),
  label: z.string().min(1),
  details: z.string().optional(),
  timing: z.string().optional(),
  estimatedCostCAD: z.number().nonnegative().nullable().optional(),
  sourceUrl: NullableUrl,
});

export const ProgramSchema = z.object({
  id: Id,
  slug: Id,
  professionId: Id,
  institutionIds: z.array(Id).min(1),
  name: z.string().min(1),
  credential: CredentialSchema,
  credentialName: z.string().min(1),
  durationYears: z.number().positive().max(6),
  coop: z.boolean(),
  accredited: z.object({ byBody: z.string().nullable(), sourceUrl: NullableUrl }),

  application: z.object({
    portal: PortalSchema,
    programCode: sourced(z.string().min(1)),
    equalConsiderationDate: IsoDate.nullable().optional(),
    intakes: z.array(z.enum(["fall", "winter", "spring"])).min(1),
  }),

  academic: z.object({
    prerequisites: z.array(PrerequisiteSchema),
    admissionAverage: z
      .object({
        low: z.number().min(0).max(100).nullable(),
        high: z.number().min(0).max(100).nullable(),
        type: z.enum(["minimum", "competitive", "historical_range"]),
        cycle: z.string().nullable(),
        sourceUrl: NullableUrl,
      })
      // Rule 5: an average is only meaningful when tied to a cycle and a source.
      .refine(
        (a) => (a.low === null && a.high === null) || (a.cycle !== null && a.sourceUrl !== null),
        {
          message: "admissionAverage values require a cycle and sourceUrl",
        },
      )
      .refine((a) => a.low === null || a.high === null || a.low <= a.high, {
        message: "admissionAverage.low must be <= high",
      }),
    supplementary: z.array(
      z.object({
        type: z.enum([
          "casper",
          "kira",
          "personal_statement",
          "interview",
          "questionnaire",
          "admission_test",
          "info_session",
          "other",
        ]),
        label: z.string().min(1),
        required: z.boolean(),
        sourceUrl: NullableUrl,
      }),
    ),
    otherNotes: z.array(z.string().min(1)).optional(),
    programRequirements: z.array(z.string().min(1)),
  }),

  nonAcademic: z.array(NonAcademicRequirementSchema),
  clinicalPlacements: z.object({
    description: z.string().min(1),
    totalHours: z.number().int().positive().nullable().optional(),
    sourceUrl: NullableUrl,
  }),

  costs: z
    .object({
      tuitionDomesticPerYear: sourced(z.number().nonnegative()),
      extraFeesNote: z.string().optional(),
    })
    .optional(),

  timeline: z.array(ProgramStepSchema).min(1),

  eligibility: z.object({
    directEntryFromHighSchool: z.boolean(),
    singleCredentialToPractice: z.boolean(),
    requiresFurtherEducation: z.boolean(),
    rationale: z.string().min(1),
    sourceUrl: NullableUrl,
  }),

  /**
   * Owner's switch for whether this record should be listed on the site.
   * Even when true, a record that fails isEligible() never renders, and
   * validate-data fails the build (BUILD_PLAN.md §1, §5).
   */
  published: z.boolean(),

  provenance: ProvenanceSchema,
});

// ---------- Files ----------

export const RegulatorsFileSchema = z.array(RegulatoryBodySchema);
export const InstitutionsFileSchema = z.array(InstitutionSchema);
export const ProfessionsFileSchema = z.array(ProfessionSchema);
export const ProgramsFileSchema = z.array(ProgramSchema);

// ---------- Inferred types ----------

export type Region = z.infer<typeof RegionSchema>;
export type Portal = z.infer<typeof PortalSchema>;
export type Credential = z.infer<typeof CredentialSchema>;
export type ContactLevel = z.infer<typeof ContactLevelSchema>;
export type Domain = z.infer<typeof DomainSchema>;
export type Riasec = z.infer<typeof RiasecSchema>;
export type Provenance = z.infer<typeof ProvenanceSchema>;
export type RegulatoryBody = z.infer<typeof RegulatoryBodySchema>;
export type Institution = z.infer<typeof InstitutionSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type CoursesFile = z.infer<typeof CoursesFileSchema>;
export type WorkStyleProfile = z.infer<typeof WorkStyleProfileSchema>;
export type LicensingPath = z.infer<typeof LicensingPathSchema>;
export type OutlookRating = z.infer<typeof OutlookRatingSchema>;
export type LabourMarket = z.infer<typeof LabourMarketSchema>;
export type WorkSetting = z.infer<typeof WorkSettingSchema>;
export type Profession = z.infer<typeof ProfessionSchema>;
export type Prerequisite = z.infer<typeof PrerequisiteSchema>;
export type StepPhase = z.infer<typeof StepPhaseSchema>;
export type ProgramStep = z.infer<typeof ProgramStepSchema>;
export type NonAcademicRequirement = z.infer<typeof NonAcademicRequirementSchema>;
export type Program = z.infer<typeof ProgramSchema>;
