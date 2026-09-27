import { expect, test, type Page } from "@playwright/test";

async function completeQuiz(page: Page) {
  await page.goto("/quiz");
  await expect(page.getByText("Your answers stay on your device.")).toBeVisible();
  await page.getByRole("button", { name: /Start the quiz/ }).click();

  await page.getByRole("radio", { name: "Grade 12" }).check();
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByRole("spinbutton", { name: /Average/ }).fill("82");
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByRole("checkbox", { name: /ENG4C/ }).check();
  await page.getByRole("button", { name: "Next" }).click();

  // Everything else: pick the 4th option (or the last) on each screen.
  for (let i = 0; i < 60; i++) {
    const radios = page.getByRole("radio");
    const n = await radios.count();
    if (n > 0) await radios.nth(Math.min(3, n - 1)).check();
    const finish = page.getByRole("button", { name: "See my results" });
    if (await finish.isVisible()) {
      await finish.click();
      return;
    }
    await page.getByRole("button", { name: "Next" }).click();
  }
  throw new Error("Quiz did not finish");
}

test("quiz → results; answers never leave the browser", async ({ page, baseURL }) => {
  const requests: { url: string; method: string; body: string }[] = [];
  page.on("request", (r) =>
    requests.push({ url: r.url(), method: r.method(), body: r.postData() ?? "" }),
  );

  await completeQuiz(page);
  await expect(page).toHaveURL(/\/quiz\/results#a=/);
  await expect(page.getByRole("heading", { name: "Your top matches" })).toBeVisible();
  await expect(page.getByText(/match$/).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why this matches" }).first()).toBeVisible();

  const token = new URL(page.url()).hash.replace("#a=", "");
  expect(token.length).toBeGreaterThan(20);
  const origin = new URL(baseURL!).origin;
  for (const r of requests) {
    // Nothing is sent anywhere else, nothing is posted, and no answer data appears in any request.
    expect(new URL(r.url).origin, r.url).toBe(origin);
    expect(r.method, r.url).toBe("GET");
    expect(r.url).not.toContain(token.slice(0, 16));
    expect(r.url).not.toContain("ENG4C");
    expect(r.body).toBe("");
  }
});

test("results are shareable via URL and print a counsellor summary", async ({ page, context }) => {
  await completeQuiz(page);
  await expect(page.getByRole("heading", { name: "Your top matches" })).toBeVisible();
  const url = page.url();

  // Open the shared link in a fresh page with no saved state.
  const other = await context.newPage();
  await other.addInitScript(() => window.localStorage.clear());
  await other.goto(url);
  await expect(other.getByRole("heading", { name: "Your top matches" })).toBeVisible();

  // Print view: counsellor summary appears, buttons disappear.
  await other.emulateMedia({ media: "print" });
  await expect(other.getByRole("heading", { name: /Student summary/ })).toBeVisible();
  await expect(other.getByRole("button", { name: /Copy share link/ })).toBeHidden();
  await expect(other.getByText("ENG4C (English)")).toBeVisible();
});

test("results page without answers asks you to take the quiz", async ({ page }) => {
  await page.goto("/quiz/results");
  await expect(page.getByRole("link", { name: "Take the quiz" })).toBeVisible();
});

test("quiz progress resumes on this device", async ({ page }) => {
  await page.goto("/quiz");
  await page.getByRole("button", { name: /Start the quiz/ }).click();
  await page.getByRole("radio", { name: "Grade 11" }).check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.reload();
  await page.getByRole("button", { name: /Resume/ }).click();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("radio", { name: "Grade 11" })).toBeChecked();
});
