import { expect, test, type Page } from "@playwright/test";

const auth = {
  email: process.env.E2E_EMAIL ?? "demo.admin@aipoweredhealthcare.local",
  password: process.env.E2E_PASSWORD ?? "DemoPass#2026",
};

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(auth.email);
  await page.getByLabel("Password").fill(auth.password);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL(/dashboard/);
  await expect(page.getByRole("heading", { name: "Operations Dashboard" })).toBeVisible();
}

test.describe("Coordinator flows", () => {
  test("can create a patient and review patient detail", async ({ page }) => {
    const suffix = Date.now().toString().slice(-6);
    const patientName = `Playwright Patient ${suffix}`;

    await login(page);
    await page.goto("/patients");

    await page.getByRole("button", { name: "Add Patient" }).click();
    await page.getByLabel("First Name").fill("Playwright");
    await page.getByLabel("Last Name").fill(`Patient ${suffix}`);
    await page.getByLabel("Phone").fill(`555-01${suffix.slice(-4)}`);
    await page.getByLabel("Care Status").selectOption("active");
    await page.getByRole("button", { name: "Save Patient Record" }).click();

    await expect(page.getByRole("link", { name: patientName })).toBeVisible();
    await page.getByRole("link", { name: patientName }).click();

    await expect(page.getByRole("heading", { name: patientName })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Care Timeline" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Derived Care Team" })).toBeVisible();
  });

  test("can document a visit and open visit detail", async ({ page }) => {
    const suffix = Date.now().toString().slice(-6);
    const patientName = `Visit Patient ${suffix}`;

    await login(page);
    await page.goto("/patients");
    await page.getByRole("button", { name: "Add Patient" }).click();
    await page.getByLabel("First Name").fill("Visit");
    await page.getByLabel("Last Name").fill(`Patient ${suffix}`);
    await page.getByRole("button", { name: "Save Patient Record" }).click();
    await expect(page.getByRole("link", { name: patientName })).toBeVisible();

    await page.goto("/visits");
    await page.getByLabel("Patient").selectOption({ label: patientName });
    await page.getByLabel("Care Note").fill("Automated visit note for timeline coverage.");
    await page.getByPlaceholder("SBP").fill("120");
    await page.getByPlaceholder("DBP").fill("80");
    await page.getByRole("button", { name: "Create Visit" }).click();

    const patientLink = page.getByRole("link", { name: patientName }).first();
    await expect(patientLink).toBeVisible();
    const visitLink = page.locator('a[href^="/visits/"]').first();
    await expect(visitLink).toBeVisible();
    await visitLink.click();

    await expect(page.getByRole("heading", { name: "Visit Detail" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Clinical Notes" })).toBeVisible();
    await expect(page.getByText("Automated visit note for timeline coverage.")).toBeVisible();
  });

  test("can create a schedule and inspect staff detail", async ({ page }) => {
    const suffix = Date.now().toString().slice(-6);
    const patientName = `Schedule Patient ${suffix}`;

    await login(page);
    await page.goto("/patients");
    await page.getByRole("button", { name: "Add Patient" }).click();
    await page.getByLabel("First Name").fill("Schedule");
    await page.getByLabel("Last Name").fill(`Patient ${suffix}`);
    await page.getByRole("button", { name: "Save Patient Record" }).click();
    await expect(page.getByRole("link", { name: patientName })).toBeVisible();

    await page.goto("/schedule");
    await page.getByLabel("Patient").selectOption({ label: patientName });
    const start = new Date(Date.now() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const format = (value: Date) => value.toISOString().slice(0, 16);
    await page.getByLabel("Starts At").fill(format(start));
    await page.getByLabel("Ends At").fill(format(end));
    await page.getByRole("button", { name: "Create Appointment" }).click();

    await expect(page.getByText(patientName).first()).toBeVisible();

    await page.goto("/staff");
    const staffLink = page.locator('a[href^="/staff/"]').first();
    await expect(staffLink).toBeVisible();
    await staffLink.click();

    await expect(page).toHaveURL(/\/staff\/[0-9a-f-]+$/);
    await expect(page.getByText("Upcoming Appointments")).toBeVisible();
  });
});
