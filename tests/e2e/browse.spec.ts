import { expect, test } from "@playwright/test";

test("programs tab lists partner professions with their institutions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const name of [
    "Radiation Therapist",
    "Sonographer",
    "Paramedic",
    "Registered Nurse",
    "MRI Technologist",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
  }
  await expect(page.getByText("Practical Nursing")).toHaveCount(0);

  // Jump to a profession, then open its career page from the heading.
  await page
    .getByRole("navigation", { name: "Professions" })
    .getByRole("link", { name: /MRI/ })
    .click();
  await expect(page).toHaveURL(/#mri-technologist/);
  const mri = page.locator("#mri-technologist");
  await expect(mri.getByRole("heading", { level: 3, name: /Michener/ })).toBeVisible();
  await mri.getByRole("heading", { level: 2 }).getByRole("link").click();
  await expect(page).toHaveURL(/\/careers\/mri-technologist/);
  await expect(page.getByRole("heading", { level: 1, name: "MRI Technologist" })).toBeVisible();
  await expect(page.getByText("Pay in Ontario")).toBeVisible();
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
