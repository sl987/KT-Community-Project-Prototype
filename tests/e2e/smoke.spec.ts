import { expect, test } from "@playwright/test";

test("home page lists only eligible seed programs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ontario Healthcare Pathways");
  await expect(
    page.getByRole("list", { name: "Eligible programs" }).getByRole("listitem"),
  ).toHaveCount(4);
});
