import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://github-dependency-exit.sociobot.in';
const results = { routes: [], keyboard: {}, privacy: {}, offline: {}, update: {} };
const browser = await chromium.launch();

for (const viewport of [{ name: 'desktop', width: 1366, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  for (const route of ['/', '/demo', '/privacy', '/terms', '/repair-4-missing']) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(String(error)));
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const state = await page.evaluate(() => ({
      title: document.title,
      lang: document.documentElement.lang,
      h1: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      undersized: [...document.querySelectorAll('a, button, input, select')].filter(node => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && (rect.width < 44 || rect.height < 44);
      }).map(node => (node.textContent || node.getAttribute('aria-label') || '').trim()),
    }));
    const seriousCriticalAxe = axe.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''));
    const expectedStatus = route === '/repair-4-missing' ? 404 : 200;
    const unexpectedErrors = route === '/repair-4-missing'
      ? errors.filter(message => !message.includes('server responded with a status of 404'))
      : errors;
    if (response?.status() !== expectedStatus || state.lang !== 'en' || state.h1 !== 1 || state.main !== 1 || state.overflow > 1 || unexpectedErrors.length || seriousCriticalAxe.length || (viewport.name === 'mobile' && state.undersized.length)) {
      throw new Error(`live route failed: ${viewport.name} ${route} ${JSON.stringify({ status: response?.status(), state, unexpectedErrors, seriousCriticalAxe })}`);
    }
    results.routes.push({ viewport: viewport.name, route, status: response.status(), ...state, errors: unexpectedErrors, seriousCriticalAxe: seriousCriticalAxe.length });
    await context.close();
  }
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  const focusStyle = await page.getByRole('link', { name: 'Try it with sample data' }).evaluate(node => ({ outlineWidth: getComputedStyle(node).outlineWidth, outlineColor: getComputedStyle(node).outlineColor }));
  const animationDuration = await page.locator('.survey-steps').evaluate(node => getComputedStyle(node, '::before').animationDuration);
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'field-console' }).focus();
  await page.keyboard.press('Space');
  const selectedRepo = await page.locator('#repo-detail h2').textContent();
  await page.getByLabel('Show checklist area').focus();
  await page.keyboard.press('ArrowDown');
  const filterValue = await page.getByLabel('Show checklist area').inputValue();
  const visibleRows = await page.locator('.check-row').filter({ visible: true }).count();
  const hiddenRows = await page.locator('.check-row[hidden]').count();
  const hiddenDisplay = await page.locator('.check-row[hidden]').first().evaluate(node => getComputedStyle(node).display);
  if (firstFocus !== 'Skip to main content' || focusStyle.outlineWidth !== '3px' || selectedRepo !== 'mosswood-labs/field-console' || filterValue !== 'Actions' || visibleRows !== 2 || hiddenRows !== 6 || hiddenDisplay !== 'none' || Number.parseFloat(animationDuration) > 0.001) {
    throw new Error(`keyboard, filter, focus, or reduced-motion flow failed: ${JSON.stringify({ firstFocus, focusStyle, selectedRepo, filterValue, visibleRows, hiddenRows, hiddenDisplay, animationDuration })}`);
  }
  results.keyboard = { firstFocus, focusStyle, selectedRepo, filterValue, visibleRows, hiddenRows, hiddenDisplay, reducedMotionAnimationDuration: animationDuration };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await context.newPage();
  const offsite = [];
  page.on('request', request => { if (new URL(request.url()).origin !== base) offsite.push(request.url()); });
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'field-console' }).click();
  await page.getByLabel('Show checklist area').selectOption('Actions');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download sample JSON' }).click();
  await download;
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  if (offsite.length || storage.local.length || storage.session.length) throw new Error(`demo privacy failed: ${JSON.stringify({ offsite, storage })}`);
  results.privacy = { offsite, storage };

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  const cacheNames = await page.evaluate(() => caches.keys());
  await context.setOffline(true);
  const offlineResponse = await page.reload({ waitUntil: 'domcontentloaded' });
  const offlineHeading = await page.getByRole('heading', { name: 'Review the sample exit inventory' }).textContent();
  await context.setOffline(false);
  if (offlineResponse?.status() !== 200 || !offlineHeading) throw new Error('offline reload failed');
  results.offline = { status: offlineResponse.status(), heading: offlineHeading, cacheNames };
  const workerSource = await (await context.request.get(`${base}/sw.js`)).text();
  results.update = {
    cacheVersion: workerSource.match(/CACHE\s*=\s*'([^']+)'/)?.[1] ?? null,
    skipWaiting: workerSource.includes('skipWaiting()'),
    clientsClaim: workerSource.includes('clients.claim()'),
    removesOldCaches: workerSource.includes('keys.filter(key => key !== CACHE)'),
    networkFirstNavigation: workerSource.includes("request.mode === 'navigate'") && workerSource.includes('fetch(event.request)'),
  };
  if (results.update.cacheVersion !== 'github-exit-shell-2026-08-29-repair-4' || !results.update.skipWaiting || !results.update.clientsClaim || !results.update.removesOldCaches || !results.update.networkFirstNavigation) throw new Error(`service-worker update policy failed: ${JSON.stringify(results.update)}`);
  await context.close();
}

await browser.close();
await writeFile('.factory/evidence/repair-4/live-qa.json', `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify({ routes: results.routes.length, keyboard: results.keyboard, privacy: results.privacy, offline: results.offline, update: results.update }));
