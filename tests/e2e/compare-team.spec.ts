import { expect, test } from "@playwright/test";

test("compare 3 programs, remove one, add one", async ({ page }) => {
  await page.goto(
    "/compare?ids=humber-practical-nursing,algonquin-practical-nursing,fanshawe-respiratory-therapy",
  );
  const table = page.getByRole("region", { name: "Program comparison table" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveCount(4);
  for (const row of [
    "Length",
    "Admission average",
    "Prerequisites",
    "Median wage",
    "Job outlook",
    "Licensing exams",
    "Non-academic requirements",
  ]) {
    await expect(table.getByRole("rowheader", { name: row })).toBeVisible();
  }
  await table.getByRole("button", { name: /Remove Practical Nursing at Humber/ }).click();
  await expect(table.getByRole("columnheader")).toHaveCount(3);
  await expect(page).not.toHaveURL(/humber/);
  await page.getByLabel("Add a program").selectOption({ index: 1 });
  await expect(table.getByRole("columnheader")).toHaveCount(4);
});

for (const path of [
  "/",
  "/programs/humber-practical-nursing",
  "/professions/respiratory-therapist",
  "/compare?ids=humber-practical-nursing,algonquin-practical-nursing,fanshawe-respiratory-therapy",
  "/quiz",
  "/guide",
  "/team",
  "/about",
]) {
  test(`no horizontal page scroll: ${path}`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("team explorer is keyboard accessible", async ({ page }) => {
  await page.goto("/team");
  const journey = page.getByRole("button", { name: /Car accident trauma/ });
  await journey.focus();
  await page.keyboard.press("Enter");
  await expect(journey).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Step 1 of 6: Paramedic")).toBeVisible();

  await page.getByRole("button", { name: /^Next/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Step 2 of 6/)).toBeVisible();

  // Jump straight to a featured profession's step with the keyboard.
  const rn = page.getByRole("button", { name: /5\. Registered Nurse/ });
  await rn.focus();
  await page.keyboard.press("Space");
  await expect(rn).toHaveAttribute("aria-current", "step");
  await expect(
    page.getByRole("link", { name: "Explore the Registered Nurse career" }),
  ).toBeVisible();

  // Featured professions are focusable links on the diagram.
  const node = page.getByRole("link", { name: "Registered Nurse (featured: career page)" });
  await node.focus();
  await expect(node).toBeFocused();
});
