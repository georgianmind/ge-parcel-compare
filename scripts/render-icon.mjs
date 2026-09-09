// Renders scripts/icon.svg to transparent PNGs at 16/48/128 via headless Brave.
import puppeteer from 'puppeteer-core';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const svg = readFileSync('scripts/icon.svg', 'utf8');

const browser = await puppeteer.launch({
  executablePath: BRAVE,
  headless: 'shell',
  userDataDir: mkdtempSync(join(tmpdir(), 'gpc-icon-')),
  args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();

for (const size of [16, 48, 128]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(
    `<style>*{margin:0;padding:0}body{background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  await page.screenshot({ path: `public/icons/icon${size}.png`, omitBackground: true });
}
await browser.close();
console.log('icons rendered');
