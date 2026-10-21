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
    // Exercise the low-motion path in CI. The cave should stay scrollable without
    // mounting a costly WebGL scene; a separate real-device check covers full 3D.
    reducedMotion: "reduce",
  },
  webServer: {
    command: "node scripts/static-server.mjs",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
