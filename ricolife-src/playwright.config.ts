import { defineConfig, devices } from '@playwright/test';

// WebGL ohne GPU: SwiftShader. Lokal liegt Chromium unter /opt/pw-browsers (PW_CHROMIUM überschreibt).
const launchOptions = {
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
};

// Hinter einem Firmen-/Sandbox-Proxy (HTTPS_PROXY) braucht Chromium ihn ausdrücklich, sonst erreicht der Mehrspieler-Test Firebase nicht.
const px = process.env.HTTPS_PROXY ? new URL(process.env.HTTPS_PROXY) : null;
const proxy = px ? { server: `${px.protocol}//${px.host}`, bypass: 'localhost,127.0.0.1', ...(px.username ? { username: decodeURIComponent(px.username), password: decodeURIComponent(px.password) } : {}) } : undefined;

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4174', trace: 'retain-on-failure', launchOptions: { ...launchOptions, ...(proxy ? { proxy } : {}) } },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } } },
    { name: 'mobile-portrait', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-landscape', use: { ...devices['Pixel 7 landscape'] } },
  ],
  webServer: {
    command: 'npm run build:easygames && node e2e/serve.mjs .. 4174',
    url: 'http://localhost:4174/ricolife/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
