import { expect, test } from "@playwright/test";

test("home route presents programmer identity and selected work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Curiosity");
  await expect(page.getByText("STUDENT PROGRAMMER", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore selected work/i })).toHaveAttribute("href", "/projects");
});

test("primary navigation reaches every top-level page", async ({ page }) => {
  await page.goto("/");
  for (const route of [
    { label: "About", heading: "Early in the journey." },
    { label: "Projects", heading: "Experiments." },
    { label: "Skills", heading: "Fundamentals first." },
    { label: "Journey", heading: "The goal isn’t a title." },
    { label: "Contact", heading: "Let’s make" },
  ]) {
    await page.getByRole("link", { name: route.label, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(route.heading);
  }
});

test("project detail routes work on direct navigation", async ({ page }) => {
  await page.goto("/projects/opticode-studio");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("OptiCode Studio");
  await expect(page.getByRole("link", { name: /Inspect source/i })).toHaveAttribute(
    "href",
    "https://github.com/Mahin98250/OptiCode-Studio",
  );
});

test("unknown project slugs return a not-found page", async ({ page }) => {
  const response = await page.goto("/projects/not-a-real-project");
  expect(response?.status()).toBe(404);
});
