import { describe, expect, it } from "vitest";
import { answersFromHash, decodeAnswers, encodeAnswers, resultsPath } from "@/lib/quiz-encoding";
import { stripPrivateUrl } from "@/lib/privacy";
import { answers } from "../fixtures/summaries";

describe("quiz answer encoding", () => {
  const a = answers({
    average: 84.5,
    courses: ["ENG4U", "SBI4U"],
    interests: { s1: 5, r2: 1 },
    workStyle: { needles: 2 },
    regions: ["GTA", "Eastern"],
    marks: { chemistry: 78 },
  });

  it("round-trips through the URL fragment", () => {
    expect(decodeAnswers(encodeAnswers(a))).toEqual(a);
    expect(answersFromHash(`#a=${encodeAnswers(a)}`)).toEqual(a);
  });

  it("puts answers only in the fragment, never the query string", () => {
    const path = resultsPath(a);
    expect(path.startsWith("/quiz/results#a=")).toBe(true);
    expect(path).not.toContain("?");
  });

  it("uses URL-safe characters", () => {
    expect(encodeAnswers(a)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("strips answers from URLs before analytics sees them", () => {
    const href = `https://site.ca${resultsPath(a)}`;
    expect(stripPrivateUrl(href)).toBe("https://site.ca/quiz/results");
    expect(stripPrivateUrl("https://site.ca/quiz/results?a=x")).toBe(
      "https://site.ca/quiz/results",
    );
    expect(stripPrivateUrl("https://site.ca/?region=GTA#programs")).toBe(
      "https://site.ca/?region=GTA",
    );
  });

  it("rejects garbage and tampered answers", () => {
    expect(decodeAnswers("not-base64!!")).toBeNull();
    expect(answersFromHash("")).toBeNull();
    const tampered = btoa(JSON.stringify({ ...a, average: 250 })).replace(/=+$/, "");
    expect(decodeAnswers(tampered)).toBeNull();
  });
});
