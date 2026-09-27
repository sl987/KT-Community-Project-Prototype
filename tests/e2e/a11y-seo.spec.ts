import { readFileSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const programSlugs = (
  JSON.parse(readFileSync(join(__dirname, "../../data/programs.json"), "utf8")) as {
    slug: string;
  }[]
).map((p) => p.slug);

const PAGES = [
  "/",
  "/?courses=ENG4C&region=Eastern",
  `/programs/${programSlugs[0]}`,
  "/professions/registered-practical-nurse",
  "/quiz",
  "/compare?ids=humber-practical-nursing,fanshawe-respiratory-therapy",
  "/guide",
  "/team",
  "/about",
];

test.describe("accessibility (axe, WCAG 2.2 AA)", () => {
  // axe on a full page can be slow on CI machines.
  test.describe.configure({ timeout: 120_000 });
  for (const scheme of ["light", "dark"] as const) {
    for (const path of PAGES) {
      test(`${path} [${scheme}]`, async ({ page }, info) => {
        test.skip(
          info.project.name !== "desktop" && scheme === "dark",
          "dark mode checked on desktop",
        );
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          results.violations.map(
            (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`,
          ),
        ).toEqual([]);
      });
    }
  }
});

test("sitemap lists all static routes and program pages", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const path of ["/quiz", "/compare", "/guide", "/team", "/about"]) {
    expect(xml).toContain(`${path}</loc>`);
  }
  for (const slug of programSlugs) expect(xml).toContain(`/programs/${slug}</loc>`);
  expect(xml).not.toContain("/quiz/results");
});

test("every program has an OG image", async ({ request, page }) => {
  for (const slug of programSlugs) {
    const res = await request.get(`/programs/${slug}/opengraph-image`);
    expect(res.status(), slug).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  }
  await page.goto(`/programs/${programSlugs[0]}`);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /opengraph-image/,
  );
});

test("robots.txt points to the sitemap", async ({ request }) => {
  const txt = await (await request.get("/robots.txt")).text();
  expect(txt).toMatch(/Sitemap: .*\/sitemap\.xml/);
});
