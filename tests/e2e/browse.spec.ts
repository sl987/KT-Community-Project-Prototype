import { expect, test } from "@playwright/test";

test("browse → filter → open program; filters survive refresh", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const cards = page.getByRole("article");
  await expect(cards).toHaveCount(7);

  // Program type: every current program is a college program.
  await page.getByRole("checkbox", { name: /^University/ }).check();
  await expect(cards).toHaveCount(0);
  await page.getByRole("checkbox", { name: /^University/ }).uncheck();
  await expect(cards).toHaveCount(7);

  // Quick matcher: pick a course.
  await page.getByText(/Choose courses/).click();
  await page.getByRole("checkbox", { name: /ENG4C/ }).check();
  await expect(page).toHaveURL(/courses=ENG4C/);

  // Filter by region.
  await page.getByRole("checkbox", { name: "Eastern Ontario" }).check();
  await expect(page).toHaveURL(/region=Eastern/);
  await expect(cards).toHaveCount(2);

  // Survives refresh (and therefore sharing).
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "Eastern Ontario" })).toBeChecked();
  await expect(cards).toHaveCount(2);

  // Open a program.
  await cards.first().getByRole("heading").getByRole("link").click();
  await expect(page).toHaveURL(/\/programs\/algonquin-.*courses=ENG4C/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("program page has every required section and shows unverified fields", async ({ page }) => {
  await page.goto("/programs/humber-practical-nursing");
  for (const name of [
    /What a Registered Practical Nurse does/,
    "Your path, step by step",
    "Academic requirements",
    "Non-academic requirements",
    "Pay and demand",
    /Other schools for/,
    "Sources",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
  }
  // Null fields render as unverified, never blank.
  expect(await page.getByText(/Not yet verified/).count()).toBeGreaterThan(5);
  // Quick facts reveal their source when tapped.
  await page.getByText("Median wage", { exact: true }).first().click();
  await expect(page.getByText("No source recorded yet.").first()).toBeVisible();
  // Scope tabs switch.
  await page.getByRole("tab", { name: "Where they work" }).click();
  await expect(page.getByText("Long-term care")).toBeVisible();
  await expect(
    page.getByText("Always confirm requirements on the official program page"),
  ).toBeVisible();
});

test("compare selection from the hub", async ({ page }) => {
  await page.goto("/");
  const compareBoxes = page.getByRole("checkbox", { name: "Compare" });
  await compareBoxes.nth(0).check();
  await compareBoxes.nth(1).check();
  await page.getByRole("link", { name: "Compare 2" }).click();
  await expect(page).toHaveURL(/\/compare\?ids=/);
  await expect(page.getByRole("region", { name: "Program comparison table" })).toBeVisible();
});
