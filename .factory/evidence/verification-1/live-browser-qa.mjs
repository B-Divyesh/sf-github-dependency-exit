import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://github-dependency-exit.sociobot.in';
const routes = ['/', '/demo', '/privacy', '/terms', '/missing-route'];
const viewports = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }];
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  for (const route of routes) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    const requests = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(String(error)));
    page.on('requestfailed', (request) => failedRequests.push(`${request.url()} ${request.failure()?.errorText}`));
    page.on('request', (request) => requests.push(request.url()));
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const structure = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      title: document.title,
      mains: document.querySelectorAll('main').length,
      h1s: [...document.querySelectorAll('h1')].map((node) => node.textContent?.trim()),
      headings: [...document.querySelectorAll('h1,h2,h3')].map((node) => ({ level: Number(node.tagName.slice(1)), text: node.textContent?.trim() })),
      canonical: document.querySelector('link[rel=canonical]')?.href,
      description: document.querySelector('meta[name=description]')?.content,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      reducedAnimation: getComputedStyle(document.querySelector('.survey-steps') ?? document.body, '::before').animationDuration,
      targetsBelow44: [...document.querySelectorAll('a,button,input,select')].filter((node) => {
        const rect = node.getBoundingClientRect(); const style = getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      }).map((node) => { const rect = node.getBoundingClientRect(); return { tag: node.tagName.toLowerCase(), text: node.textContent?.trim() || node.getAttribute('aria-label') || node.id, width: Math.round(rect.width), height: Math.round(rect.height) }; }),
    }));
    results.push({
      viewport: viewport.name, route, status: response?.status(), structure,
      axeSeriousCritical: axe.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')).map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })),
      consoleErrors, pageErrors, failedRequests,
      offsiteRequests: [...new Set(requests.filter((url) => new URL(url).origin !== base).map((url) => new URL(url).origin))],
    });
    await context.close();
  }
}

const context = await browser.newContext({ viewport: viewports[1], reducedMotion: 'reduce' });
const page = await context.newPage();
await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
const firstFocus = await page.evaluate(() => {
  const node = document.activeElement;
  const style = getComputedStyle(node);
  return { text: node?.textContent?.trim(), outline: `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}`, boxShadow: style.boxShadow };
});
await page.getByRole('link', { name: 'Try it with sample data' }).focus();
await page.keyboard.press('Enter');
await page.waitForURL('**/demo');
await page.getByRole('button', { name: 'field-console' }).focus();
await page.keyboard.press('Space');
const repoAfterSpace = await page.locator('#repo-detail h2').textContent();
await page.getByLabel('Show checklist area').focus();
await page.keyboard.press('ArrowDown');
const filterAfterArrow = await page.getByLabel('Show checklist area').inputValue();
await page.getByRole('button', { name: 'Reset demo' }).focus();
await page.keyboard.press('Enter');
const filterAfterReset = await page.getByLabel('Show checklist area').inputValue();
const bannerPosition = await page.locator('.demo-banner').evaluate((node) => getComputedStyle(node).position);
await page.goto(`${base}/#price`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Verify license' }).click();
const emptyLicenseMessage = await page.locator('#license-status').textContent();
const keyboard = { firstFocus, repoAfterSpace, filterAfterArrow, filterAfterReset, bannerPosition, emptyLicenseMessage };
await context.close();
await browser.close();

const output = { results, keyboard };
await writeFile('.factory/evidence/verification-1/live-browser-qa.json', JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));
