import { expect, test, type Page } from "@playwright/test";

async function scrubStory(page: Page, progress: number) {
  await expect(page.locator("html")).toHaveAttribute("data-project-worlds-ready", "true", { timeout: 15000 });
  await expect(page.locator("html")).toHaveAttribute("data-cinematic-story-ready", "true", { timeout: 15000 });
  await expect(page.locator(".cinematic-story-scroll")).toBeVisible({ timeout: 15000 });
  await page.evaluate((targetProgress) => {
    const scroller = document.querySelector<HTMLElement>(".cinematic-story-scroll");
    const track = document.querySelector<HTMLElement>(".cinematic-story-track");
    if (!scroller || !track) throw new Error("Cinematic scroll surface was not mounted");
    const maxScroll = Math.max(1, track.offsetHeight - scroller.clientHeight);
    // Set scrollTop directly and dispatch a scroll event so the RAF-backed
    // scene controller synchronizes before assertions/clicks race ahead.
    scroller.scrollTop = maxScroll * targetProgress;
    scroller.dispatchEvent(new Event("scroll"));
  }, progress);
}


test("home opens in the cave and reveals the selected work at the end of the story", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("STEP INTO", { timeout: 15000 });
  await expect(page.getByText("AN INTERACTIVE FILM / 001")).toBeVisible();
  await expect(page.locator(".cinematic-story-track")).toBeVisible();

  await scrubStory(page, 0.99);
  await expect(page.getByRole("link", { name: /EXPLORE THE WORK/i })).toHaveAttribute("href", /\/projects\/?$/);
  await expect(page.getByRole("link", { name: /FOLLOW THE JOURNEY/i })).toHaveAttribute("href", /\/journey\/?$/);
});


test("branch choice fully replaces the underlying chapter copy", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await scrubStory(page, 0.46);

  const branch = page.locator(".cinema-branch-choice");
  await expect(branch).toHaveAttribute("aria-hidden", "false");
  await expect(branch).toHaveCSS("pointer-events", "auto");
  await expect(branch).toHaveCSS("opacity", "1");

  for (const selector of [".cinema-copy-approach", ".cinema-copy-code"]) {
    const panel = page.locator(selector);
    await expect(panel).toHaveAttribute("aria-hidden", "true");
    await expect(panel).toHaveCSS("opacity", "0");
  }
});

test("left and right passage choices confirm selection and advance toward the chosen route", async ({ page }) => {
  for (const option of [
    { name: /TAKE THE LEFT PASSAGE/i, selected: "LEFT" },
    { name: /TAKE THE RIGHT PASSAGE/i, selected: "RIGHT" },
  ]) {
    await page.goto("/");
    await scrubStory(page, 0.46);
    await expect(page.locator(".cinematic-story-track")).toHaveAttribute("data-chapter", "code");
    const initialScroll = await page.locator(".cinematic-story-scroll").evaluate((element) => (element as HTMLElement).scrollTop);

    // Verify the panel is active and can receive input. Its opacity is
    // intentionally transitioned, so sampling a single rendered opacity can
    // be flaky while the CSS fade is still in flight.
    const branchPanel = page.locator(".cinema-branch-choice");
    await expect(branchPanel).toHaveAttribute("aria-hidden", "false");
    await expect(branchPanel).toHaveCSS("pointer-events", "auto");
    await page.getByRole("button", { name: option.name }).click();
    await expect(page.locator(".cinema-branch-confirm")).toContainText(option.selected);
    await expect.poll(
      () => page.locator(".cinematic-story-scroll").evaluate((element) => (element as HTMLElement).scrollTop),
      { timeout: 6000 },
    ).toBeGreaterThan(initialScroll + 30);
  }
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
    await expect(page).toHaveURL(new RegExp(route.label.toLowerCase() === "about" ? "/about/?$" : "/" + route.label.toLowerCase() + "/?$"), { timeout: 15000 });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(route.heading, { timeout: 15000 });
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

  await expect(page.locator("html")).toHaveAttribute("data-cinematic-story-ready", "true", { timeout: 15000 });
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

test("reduced motion keeps the cave still while chapters remain reachable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".cinema-cave-fallback")).toBeVisible();
  await expect(page.locator(".cinematic-story-stage canvas")).toHaveCount(0);
  await scrubStory(page, 0.34);
  await expect(page.locator(".cinematic-story-track")).toHaveAttribute("data-chapter", "approach");
});

test("mobile cinematic journey advances through chapters without stacked content sections", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const track = page.locator(".cinematic-story-track");
  await expect(track).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("STEP INTO");
  await expect(page.locator(".cinema-progress-track")).toBeVisible();

  await scrubStory(page, 0.34);
  await expect(track).toHaveAttribute("data-chapter", "approach");
  await expect(page.getByRole("heading", { level: 2 })).toContainText("CURIOSITY");
});

test("each cinematic project reveal enters its matching world", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/");

  const track = page.locator(".cinematic-story-track");
  const projects = [
    { progress: 0.55, chapter: "opticode", heading: "OPTICODE", world: /OPTICODE STUDIO/i, repository: "https://github.com/Mahin98250/OptiCode-Studio" },
    { progress: 0.63, chapter: "learning", heading: "LEARNER", world: /LEARNER’S GUIDE/i, repository: "https://github.com/Mahin98250/Final-Learner-s-Guide" },
    { progress: 0.70, chapter: "marketplace", heading: "DUDHWALA", world: /DUDHWALA/i, repository: "https://github.com/Mahin98250/Dudh-Wallah" },
  ];

  for (const project of projects) {
    await scrubStory(page, project.progress);
    await expect(track).toHaveAttribute("data-chapter", project.chapter);
    await expect(page.getByRole("heading", { level: 2 })).toContainText(project.heading);

    const enterWorld = page.getByRole("button", { name: /ENTER WORLD/i }).first();
    await expect(enterWorld).toBeVisible();
    await expect(page.getByRole("link", { name: /REPOSITORY/i }).first()).toHaveAttribute("href", project.repository);
    await enterWorld.click();

    const dialog = page.getByRole("dialog", { name: project.world });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: /RETURN TO THE CAVE/i })).toBeVisible();
    await dialog.getByRole("button", { name: /RETURN TO THE CAVE/i }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 2500 });
  }
});

test("project world can be exited with Escape and respects reduced motion styling", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-project-worlds-ready", "true", { timeout: 15000 });
  await expect(page.locator("html")).toHaveAttribute("data-cinematic-story-ready", "true", { timeout: 15000 });
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("portfolio:enter-world", { detail: { id: "optical" } })));
  const world = page.getByRole("dialog", { name: /OPTICODE STUDIO/i });
  await expect(world).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(world).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("portfolio:enter-world", { detail: { id: "learning" } })));
  await expect(page.getByRole("dialog", { name: /LEARNER’S GUIDE/i })).toBeVisible();
});
 
test("cinematic ending exposes journey, project, and contact actions", async ({ page }) => {
  await page.goto("/");
  await scrubStory(page, 0.99);
  const track = page.locator(".cinematic-story-track");
  await expect(track).toHaveAttribute("data-chapter", "ending");
  const ending = page.locator(".cinema-copy-ending");
  await expect(ending).toHaveAttribute("aria-hidden", "false");
  await expect(ending.getByRole("heading", { level: 2 })).toContainText("BUILD WHAT’S");
  await expect(ending.getByRole("link", { name: /EXPLORE THE WORK/i })).toHaveAttribute("href", /\/projects\/?$/);
  await expect(ending.getByRole("link", { name: /FOLLOW THE JOURNEY/i })).toHaveAttribute("href", /\/journey\/?$/);
  await expect(ending.getByRole("link", { name: /GET IN TOUCH/i })).toHaveAttribute("href", /\/contact\/?$/);
});

test("cinematic homepage keeps a single persistent stage and story chapters", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".cinematic-story-scroll")).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".cinematic-story-track")).toHaveCount(1);
  await expect(page.locator(".cinematic-story-stage")).toHaveCount(1);
  await expect(page.locator("[data-story-scene]")).toHaveCount(9);
  await expect(page.locator(".cinema-progress-track")).toBeVisible();
});

test("DudhWala world exposes its dairy scene and scrollable project story", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-project-worlds-ready", "true", { timeout: 15000 });
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("portfolio:enter-world", { detail: { id: "milk" } })));

  const world = page.getByRole("dialog", { name: /DUDHWALA/i });
  await expect(world).toBeVisible();
  await expect(world.locator(".pw-three-scene canvas")).toBeAttached();
  await expect(world.getByRole("link", { name: /EXPLORE THE PROJECT/i })).toHaveAttribute(
    "href",
    "https://github.com/Mahin98250/Dudh-Wallah",
  );

  const story = world.locator(".pw-explore-scroll");
  await expect(story).toHaveAttribute("aria-label", "Explore DUDHWALA project details");
  await expect(story.getByRole("heading", { level: 3, name: "From farm to front door." })).toBeAttached();
  await expect(story.getByRole("heading", { level: 4, name: "Discover local sellers" })).toBeAttached();
  await expect(story.getByRole("heading", { level: 4, name: "Build a daily routine" })).toBeAttached();
  await expect(story.getByRole("heading", { level: 4, name: "Connect the community" })).toBeAttached();

  await story.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event("scroll", { bubbles: true }));
  });
  await expect(story.getByRole("link", { name: /OPEN SOURCE REPOSITORY/i })).toHaveAttribute(
    "href",
    "https://github.com/Mahin98250/Dudh-Wallah",
  );
  await world.getByRole("button", { name: /RETURN TO THE CAVE/i }).click();
  await expect(world).toHaveCount(0, { timeout: 2500 });
});

