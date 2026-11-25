import { describe, expect, it } from "vitest";
import { summarizeClicks } from "@/lib/click-stats";
import { MAX_FIELD_LENGTH, parsePayload } from "@/lib/tracking";

const SID = "123e4567-e89b-42d3-a456-426614174000";

describe("parsePayload", () => {
  it("accepts the three events and keeps only safe fields", () => {
    const row = parsePayload({
      event: "linkedin_click",
      target: "https://www.linkedin.com/in/someone/",
      profession: "sonographer",
      page: "/quiz/results?a=1#answers",
      session_id: SID,
      ip: "1.2.3.4",
      userAgent: "x",
    });
    expect(row).toEqual({
      event: "linkedin_click",
      target: "https://www.linkedin.com/in/someone/",
      profession: "sonographer",
      program: null,
      page: "/quiz/results",
      session_id: SID,
    });
  });

  it("rejects unknown events and non-objects", () => {
    expect(parsePayload({ event: "page_view" })).toBeNull();
    expect(parsePayload(null)).toBeNull();
    expect(parsePayload("linkedin_click")).toBeNull();
  });

  it("trims strings to 300 characters", () => {
    const row = parsePayload({ event: "program_click", program: "x".repeat(1000) });
    expect(row?.program).toHaveLength(MAX_FIELD_LENGTH);
  });

  it("drops non-http targets and non-UUID session ids", () => {
    const row = parsePayload({
      event: "guide_open",
      target: "javascript:alert(1)",
      session_id: "not-a-uuid",
    });
    expect(row?.target).toBeNull();
    expect(row?.session_id).toBeNull();
  });
});

describe("summarizeClicks", () => {
  it("counts clicks, unique sessions, top programs and daily totals", () => {
    const s = summarizeClicks([
      {
        event: "program_click",
        profession: "paramedic",
        program: "A",
        session_id: "s1",
        created_at: "2026-11-18T15:00:00Z",
      },
      {
        event: "program_click",
        profession: "paramedic",
        program: "A",
        session_id: "s1",
        created_at: "2026-11-18T16:00:00Z",
      },
      {
        event: "program_click",
        profession: "paramedic",
        program: "B",
        session_id: "s2",
        created_at: "2026-11-19T15:00:00Z",
      },
      {
        event: "linkedin_click",
        profession: "sonographer",
        program: null,
        session_id: "s2",
        created_at: "2026-11-17T15:00:00Z",
      },
    ]);
    expect(s.total).toEqual({ clicks: 4, sessions: 2 });
    expect(s.startedAt).toBe("2026-11-17T15:00:00Z");
    expect(s.topPrograms[0]).toEqual({
      program: "A",
      profession: "paramedic",
      clicks: 2,
      sessions: 1,
    });
    expect(s.byEventProfession.find((r) => r.event === "program_click")).toMatchObject({
      clicks: 3,
      sessions: 2,
    });
    expect(s.daily.map((d) => d.date)).toEqual(["2026-11-19", "2026-11-18", "2026-11-17"]);
    expect(s.daily[1].byEvent.program_click).toBe(2);
  });
});
