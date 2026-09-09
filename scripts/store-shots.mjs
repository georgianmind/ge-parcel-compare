// Generates 1280x800 Chrome Web Store screenshots from the demo harnesses.
import puppeteer from 'puppeteer-core';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const base = process.env.DEMO_BASE ?? 'http://localhost:5199';

const browser = await puppeteer.launch({
  executablePath: BRAVE,
  headless: 'shell',
  userDataDir: mkdtempSync(join(tmpdir(), 'gpc-shots-')),
  args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'],
  defaultViewport: { width: 1280, height: 800 },
});

const page = await browser.newPage();

// 1. Overlay on the fake product page (expanded via stubbed storage).
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
await page.goto(`${base}/`, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: 'store/screenshots/1-overlay.png' });

// 2. Popup — settings.
await page.goto(`${base}/popup/`, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: 'store/screenshots/2-popup-settings.png' });

// 3. Popup — address book tab.
const tabs = await page.$$('.tabs button');
if (tabs[1]) await tabs[1].click();
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: 'store/screenshots/3-popup-addresses.png' });

await browser.close();
console.log('screenshots written');
