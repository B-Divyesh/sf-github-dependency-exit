import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://github-dependency-exit.sociobot.in';
const browser = await chromium.launch();
const report = { checkedAt: new Date().toISOString(), routes: {}, flow: {}, offline: {}, links: [] };
const expected = [
  ['/', 'GitHub Exit Inventory — map migration dependencies', 'Map Actions, webhooks, packages, rules, releases, and app signals before moving GitHub repositories.', `${base}/`, 200],
  ['/?demo=1', 'Demo — GitHub Exit Inventory', 'Explore a bundled three-repository dependency inventory and migration checklist without an account or token.', `${base}/?demo=1`, 200],
  ['/demo', 'Demo — GitHub Exit Inventory', 'Explore a bundled three-repository dependency inventory and migration checklist without an account or token.', `${base}/?demo=1`, 200],
  ['/privacy', 'Privacy — GitHub Exit Inventory', 'How GitHub Exit Inventory handles demo, license, and report data.', `${base}/privacy`, 200],
  ['/terms', 'Terms — GitHub Exit Inventory', 'Terms for free repository scans and the one-time GitHub Exit Inventory team license.', `${base}/terms`, 200],
  ['/missing-polish-route', 'Page not found — GitHub Exit Inventory', 'The requested GitHub Exit Inventory page was not found. Return to the inventory start.', `${base}/404`, 404],
];

for (const [path, title, description, canonical, status] of expected) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const state = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
    ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
    twitterDescription: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content'),
    h1: document.querySelectorAll('h1').length,
    main: Boolean(document.querySelector('main')),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    missingAlt: [...document.querySelectorAll('img')].filter(image => !image.hasAttribute('alt')).length,
    undersizedTargets: [...document.querySelectorAll('a,button,input,select')].filter(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && (rect.width < 44 || rect.height < 44);
    }).map(node => (node.textContent || node.getAttribute('aria-label') || node.tagName).trim()),
  }));
  const unexpectedErrors = status === 404 ? errors.filter(error => !error.includes('server responded with a status of 404')) : errors;
  if (response?.status() !== status || state.title !== title || state.description !== description || state.canonical !== canonical || state.ogTitle !== title || state.ogDescription !== description || state.twitterDescription !== description || state.h1 !== 1 || !state.main || state.overflow > 1 || state.missingAlt || state.undersizedTargets.length || unexpectedErrors.length || axe.violations.length) {
    throw new Error(`route check failed for ${path}: ${JSON.stringify({ status: response?.status(), state, errors, axe: axe.violations })}`);
  }
  report.routes[path] = { status: response.status(), ...state, consoleErrors: unexpectedErrors, expected404ResourceMessage: status === 404 && errors.length > 0, axeViolations: axe.violations.length };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const origins = new Set();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  await page.goto(base, { waitUntil: 'networkidle' });
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  const actionBox = await action.boundingBox();
  await action.click();
  await page.getByRole('button', { name: 'field-console' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const resetFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  await page.goBack();
  await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
  const backFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.goForward();
  await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
  const forwardFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  const wording = await page.evaluate(() => document.body.innerText.includes('exit surface') || document.body.innerText.includes('accumulated load'));
  if (!actionBox || actionBox.y + actionBox.height > 844 || resetFocus !== 'Review the sample exit inventory' || backFocus !== 'Map what breaks before leaving GitHub' || forwardFocus !== 'Review the sample exit inventory' || storage.local.length || storage.session.length || [...origins].some(origin => origin !== base) || wording) {
    throw new Error(`flow check failed: ${JSON.stringify({ actionBox, resetFocus, backFocus, forwardFocus, storage, origins: [...origins], wording })}`);
  }
  report.flow = { actionBox, resetFocus, backFocus, forwardFocus, storage, requestOrigins: [...origins], forbiddenWordingFound: wording };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  const response = await page.reload({ waitUntil: 'domcontentloaded' });
  const heading = await page.getByRole('heading', { name: 'Review the sample exit inventory' }).isVisible();
  const banner = await page.getByText('Demo — sample data, nothing is saved').isVisible();
  if (!response || response.status() !== 200 || !heading || !banner) throw new Error('offline demo reload failed');
  report.offline = { status: response.status(), heading, banner, serviceWorkerControlled: true };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base);
  const links = await page.locator('a[href]').evaluateAll(nodes => [...new Set(nodes.map(node => node.href))]);
  for (const link of links) {
    const response = await context.request.get(link, { maxRedirects: 0 });
    const allowed = response.status() === 200 || (link.includes('/checkout') && response.status() === 303);
    if (!allowed) throw new Error(`link failed: ${response.status()} ${link}`);
    report.links.push({ status: response.status(), url: link });
  }
  await context.close();
}

await browser.close();
await writeFile('.factory/evidence/polish-1/live-qa.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
