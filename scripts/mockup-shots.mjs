import puppeteer from 'puppeteer-core';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const here = '/private/tmp/claude-501/-Users-giorgitsurtsumia-Desktop-Claude/58a9dbef-c69e-436d-ba43-0f4547489813/scratchpad/mockups';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  headless: 'shell',
  userDataDir: mkdtempSync(join(tmpdir(), 'amanati-mock-')),
  args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'],
  defaultViewport: { width: 900, height: 1400, deviceScaleFactor: 2.5 },
});
const page = await browser.newPage();
await page.goto(pathToFileURL(join(here, 'luxe.html')).href, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 300));
for (const id of ['a', 'b']) {
  const el = await page.$(`#${id}`);
  await el.screenshot({ path: join(here, `${id}.png`) });
}
await browser.close();
console.log('renders written');
