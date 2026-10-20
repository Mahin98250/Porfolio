import { expect, test } from "@playwright/test";

test("home opens in the cave and reveals the selected work at the end of the story", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("STEP INTO");
  await expect(page.getByText("AN INTERACTIVE FILM / 001")).toBeVisible();
  await expect(page.locator(".cinematic-story-track")).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.getByRole("link", { name: /EXPLORE THE WORK/i })).toHaveAttribute("href", "/projects");
  await expect(page.getByRole("link", { name: /FOLLOW THE JOURNEY/i })).toHaveAttribute("href", "/journey");
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

test("project detail panels reveal instead of remaining hidden below the hero", async ({ page }) => {
  await page.goto("/projects/opticode-studio");

  const ideaPanel = page.locator(".project-story-main");
  await ideaPanel.scrollIntoViewIfNeeded();
  await expect(ideaPanel).toHaveClass(/is-visible/);
  await expect(ideaPanel.getByRole("heading", { level: 2 })).toContainText("Moving information through light");

  const learningPanel = page.locator(".project-learning-card");
  await learningPanel.scrollIntoViewIfNeeded();
  await expect(learningPanel).toHaveClass(/is-visible/);
  await expect(learningPanel.getByRole("heading", { level: 3 })).toContainText("Skills grow one iteration at a time");

  const closingPanel = page.locator(".project-bottom-panel");
  await closingPanel.scrollIntoViewIfNeeded();
  await expect(closingPanel).toHaveClass(/is-visible/);
});

test("project archive renders six responsive cards with valid project actions", async ({ page }) => {
  await page.goto("/projects");
  const cards = page.locator(".all-project-card");
  await expect(cards).toHaveCount(6);
  await expect(cards.nth(0).getByRole("heading", { level: 3 })).toContainText("OptiCode Studio");
  await expect(cards.nth(0).getByRole("link", { name: /Project overview/i })).toHaveAttribute(
    "href",
    new RegExp("opticode-studio/?$"),
  );
  await expect(cards.nth(0).getByRole("link", { name: /Source/i })).toHaveAttribute(
    "href",
    "https://github.com/Mahin98250/OptiCode-Studio",
  );
  await expect(cards.nth(5).getByRole("link", { name: /Browse repositories/i })).toHaveAttribute(
    "href",
    "https://github.com/Mahin98250?tab=repositories",
  );
});

test("project detail keeps Projects navigation marked as current", async ({ page }) => {
  await page.goto("/projects/opticode-studio");
  await expect(page.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute("aria-current", "page");
});

test("mobile navigation exposes its state and closes after route selection", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const openButton = page.getByRole("button", { name: "Open navigation" });
  await expect(openButton).toHaveAttribute("aria-controls", "main-navigation");
  await openButton.click();

  const closeButton = page.getByRole("button", { name: "Close navigation" });
  await expect(closeButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#main-navigation")).toBeVisible();
  await page.locator("#main-navigation").getByRole("link", { name: "Projects", exact: true }).click();

  await expect(page).toHaveURL(new RegExp("/projects/?$"));
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
});

test("3D world provides a still cave scene when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".cinema-cave-fallback")).toBeVisible();
  await expect(page.locator(".cinematic-story-stage canvas")).toHaveCount(0);
});

test("mobile cinematic journey advances through chapters without stacked content sections", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const track = page.locator(".cinematic-story-track");
  await expect(track).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("STEP INTO");
  await expect(page.locator(".cinema-progress-track")).toBeVisible();

  await page.evaluate(() => {
    const story = document.querySelector<HTMLElement>(".cinematic-story-track");
    if (!story) return;
    window.scrollTo(0, (story.offsetHeight - window.innerHeight) * 0.34);
  });
  await expect(track).toHaveAttribute("data-chapter", "approach");
  await expect(page.getByRole("heading", { level: 2 })).toContainText("CURIOSITY");
});

test("project worlds appear at their scene on the cinematic timeline", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/");

  const track = page.locator(".cinematic-story-track");
  await page.evaluate(() => {
    const story = document.querySelector<HTMLElement>(".cinematic-story-track");
    if (!story) return;
    window.scrollTo(0, (story.offsetHeight - window.innerHeight) * 0.55);
  });
  await expect(track).toHaveAttribute("data-chapter", "opticode");
  await expect(page.getByRole("heading", { level: 2 })).toContainText("OPTICODE");
  await expect(page.getByRole("link", { name: /ENTER PROJECT/i }).first()).toHaveAttribute(
    "href",
    "https://github.com/Mahin98250/OptiCode-Studio",
  );
});

test("cinematic ending exposes journey, project, and contact actions", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const story = document.querySelector<HTMLElement>(".cinematic-story-track");
    if (!story) return;
    window.scrollTo(0, (story.offsetHeight - window.innerHeight) * 0.94);
  });
  await expect(page.getByRole("heading", { level: 2 })).toContainText("BUILD WHAT’S");
  await expect(page.getByRole("link", { name: /EXPLORE THE WORK/i })).toHaveAttribute("href", "/projects");
  await expect(page.getByRole("link", { name: /FOLLOW THE JOURNEY/i })).toHaveAttribute("href", "/journey");
  await expect(page.getByRole("link", { name: /GET IN TOUCH/i })).toHaveAttribute("href", "/contact");
});

test("cinematic homepage keeps a single persistent stage and story chapters", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".cinematic-story-track")).toHaveCount(1);
  await expect(page.locator(".cinematic-story-stage")).toHaveCount(1);
  await expect(page.locator("[data-story-scene]")).toHaveCount(9);
  await expect(page.locator(".cinema-progress-track span")).toBeVisible();
});
