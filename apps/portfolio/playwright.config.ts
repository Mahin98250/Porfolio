import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // The homepage runs a procedural Three.js cave. Limit concurrent browser
  // contexts on hosted runners so animation work does not starve click/scroll tests.
  ...(process.env.CI ? { workers: 2 } : {}),
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    // CI host OS accessibility defaults must not silently switch the entire
    // chapter-scroll layout into the non-scrolling reduced-motion fallback.
    // Individual accessibility tests explicitly emulate "reduce" as needed.
    reducedMotion: "no-preference",
  },
  webServer: {
    command: "node scripts/static-server.mjs",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
