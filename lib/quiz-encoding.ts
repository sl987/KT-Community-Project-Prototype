/**
 * Quiz answers <-> URL. Answers are stored in the URL *fragment* (`#a=...`),
 * which browsers never send to a server, so shared results links keep the
 * "your answers stay on your device" promise (§8 Privacy).
 */
import { QuizAnswersSchema, type QuizAnswers } from "./schema";

const toBase64Url = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (s: string) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

export const encodeAnswers = (a: QuizAnswers) => toBase64Url(JSON.stringify(a));

/** Returns null for anything malformed or tampered with. */
export function decodeAnswers(encoded: string): QuizAnswers | null {
  try {
    const r = QuizAnswersSchema.safeParse(JSON.parse(fromBase64Url(encoded)));
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

/** Reads answers from a location hash like "#a=xyz". */
export const answersFromHash = (hash: string) => {
  const encoded = new URLSearchParams(hash.replace(/^#/, "")).get("a");
  return encoded ? decodeAnswers(encoded) : null;
};

export const resultsPath = (a: QuizAnswers) => `/quiz/results#a=${encodeAnswers(a)}`;

export const QUIZ_STORAGE_KEY = "ohp.quiz.v1";

export const DEFAULT_ANSWERS: QuizAnswers = {
  v: 1,
  grade: null,
  average: null,
  averageIsGrade11: false,
  courses: [],
  marks: {},
  interests: {},
  workStyle: {},
  length: "any",
  institutionType: "any",
  regions: [],
  french: false,
  salaryImportance: 3,
  demandImportance: 3,
};
