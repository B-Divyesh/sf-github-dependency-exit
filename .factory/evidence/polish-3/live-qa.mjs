import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://github-dependency-exit.sociobot.in';
const browser = await chromium.launch();
const report = {
  checkedAt: new Date().toISOString(),
  routes: [],
  firstScreen: {},
  demo: {},
  historyFocus: {},
  paidCopy: {},
  offline: {},
  links: [],
};

const expectedRoutes = [
  ['/', 'GitHub Exit Inventory — map migration dependencies', 'Map Actions, webhooks, packages, rules, releases, and app signals before moving GitHub repositories.', `${base}/`, 200],
  ['/?demo=1', 'Demo — GitHub Exit Inventory', 'Explore a bundled three-repository dependency inventory and migration checklist without an account or token.', `${base}/?demo=1`, 200],
  ['/demo', 'Demo — GitHub Exit Inventory', 'Explore a bundled three-repository dependency inventory and migration checklist without an account or token.', `${base}/?demo=1`, 200],
  ['/privacy', 'Privacy — GitHub Exit Inventory', 'How GitHub Exit Inventory handles demo, license, and report data.', `${base}/privacy`, 200],
  ['/terms', 'Terms — GitHub Exit Inventory', 'Terms for free repository scans and the one-time GitHub Exit Inventory team license.', `${base}/terms`, 200],
  ['/missing-polish-3-route', 'Page not found — GitHub Exit Inventory', 'The requested GitHub Exit Inventory page was not found. Return to the inventory start.', `${base}/404`, 404],
];

for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
  for (const [path, title, description, canonical, status] of expectedRoutes) {
    const context = await browser.newContext({ viewport });
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
      lang: document.documentElement.lang,
      h1: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      missingAlt: [...document.querySelectorAll('img')].filter(image => !image.hasAttribute('alt')).length,
      undersizedTargets: [...document.querySelectorAll('a,button,input,select')].filter(node => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && (rect.width < 44 || rect.height < 44);
      }).map(node => (node.textContent || node.getAttribute('aria-label') || node.tagName).trim()),
    }));
    const unexpectedErrors = status === 404 ? errors.filter(error => !error.includes('server responded with a status of 404')) : errors;
    if (response?.status() !== status || state.title !== title || state.description !== description || state.canonical !== canonical || state.ogTitle !== title || state.ogDescription !== description || state.twitterDescription !== description || state.lang !== 'en' || state.h1 !== 1 || state.main !== 1 || state.overflow > 1 || state.missingAlt || state.undersizedTargets.length || unexpectedErrors.length || axe.violations.length) {
      throw new Error(`route check failed for ${viewport.name} ${path}: ${JSON.stringify({ status: response?.status(), state, errors, axe: axe.violations })}`);
    }
    report.routes.push({ viewport: viewport.name, path, status: response.status(), ...state, consoleErrors: unexpectedErrors, axeViolations: axe.violations.length });
    await context.close();
  }
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const requestOrigins = new Set();
  page.on('request', request => requestOrigins.add(new URL(request.url()).origin));
  await page.goto(base, { waitUntil: 'networkidle' });
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  const actionBox = await action.boundingBox();
  const eyebrow = await page.locator('.hero .eyebrow').textContent();
  const oldWordingCount = await page.getByText(/exit survey/i).count();
  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await action.focus();
  const focusOutline = await action.evaluate(node => ({ width: getComputedStyle(node).outlineWidth, color: getComputedStyle(node).outlineColor }));
  await page.keyboard.press('Enter');
  const demoUrl = page.url();
  const banner = await page.getByText('Demo — sample data, nothing is saved').isVisible();
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
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.waitForFunction(() => document.activeElement?.id === 'install');
  const startForRealUrl = page.url();
  const startForRealFocus = await page.evaluate(() => document.activeElement?.id);
  const bannerAfterExit = await page.getByText('Demo — sample data, nothing is saved').count();
  if (!actionBox || actionBox.y + actionBox.height > 844 || eyebrow !== 'GITHUB DEPENDENCY INVENTORY / READ-ONLY CLI' || oldWordingCount || firstFocus !== 'Skip to main content' || focusOutline.width !== '3px' || !demoUrl.endsWith('/?demo=1') || !banner || resetFocus !== 'Review the sample exit inventory' || storage.local.length || storage.session.length || backFocus !== 'Map what breaks before leaving GitHub' || forwardFocus !== 'Review the sample exit inventory' || !startForRealUrl.endsWith('/#install') || startForRealFocus !== 'install' || bannerAfterExit || [...requestOrigins].some(origin => origin !== base)) {
    throw new Error(`first-screen/demo flow failed: ${JSON.stringify({ actionBox, eyebrow, oldWordingCount, firstFocus, focusOutline, demoUrl, banner, resetFocus, storage, backFocus, forwardFocus, startForRealUrl, startForRealFocus, bannerAfterExit, requestOrigins: [...requestOrigins] })}`);
  }
  report.firstScreen = { actionBox, eyebrow, oldWordingCount, firstFocus, focusOutline };
  report.demo = { demoUrl, banner, resetFocus, storage, startForRealUrl, startForRealFocus, bannerAfterExit, requestOrigins: [...requestOrigins] };
  report.historyFocus = { backFocus, forwardFocus };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    localStorage.setItem('sb_license:github-dependency-exit', 'real-license-sentinel');
    localStorage.setItem('sb_license_verdict:github-dependency-exit', '{"valid":true,"checkedAt":1}');
  });
  const page = await context.newPage();
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const sentinel = await page.evaluate(() => ({
    license: localStorage.getItem('sb_license:github-dependency-exit'),
    verdict: localStorage.getItem('sb_license_verdict:github-dependency-exit'),
  }));
  if (sentinel.license !== 'real-license-sentinel' || sentinel.verdict !== '{"valid":true,"checkedAt":1}') throw new Error('demo changed real license storage');
  report.demo.storageIsolation = sentinel;
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/#price`, { waitUntil: 'networkidle' });
  const activeOutcome = await page.getByText('An active license adds owner-wide scans and one combined report.').isVisible();
  const checkoutCopy = await page.getByText('Checkout is hosted by Dodo.').isVisible();
  const refundCopy = await page.getByText('A refund makes the license inactive.').isVisible();
  const checkoutHref = await page.getByRole('link', { name: 'Buy the team scan license' }).getAttribute('href');
  const checkoutResponse = await context.request.get(checkoutHref, { maxRedirects: 0 });
  const checkoutLocation = checkoutResponse.headers().location;
  await page.goto(`${base}/terms`, { waitUntil: 'networkidle' });
  const termsRefundCopy = await page.getByText('A refund makes the paid license inactive.').isVisible();
  if (!activeOutcome || !checkoutCopy || !refundCopy || checkoutResponse.status() !== 303 || !checkoutLocation?.startsWith('https://checkout.dodopayments.com/session/') || !termsRefundCopy) {
    throw new Error(`paid copy/checkout failed: ${JSON.stringify({ activeOutcome, checkoutCopy, refundCopy, checkoutStatus: checkoutResponse.status(), checkoutLocation, termsRefundCopy })}`);
  }
  report.paidCopy = { activeOutcome, checkoutCopy, refundCopy, checkoutStatus: checkoutResponse.status(), checkoutLocation, termsRefundCopy };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const cacheNames = await page.evaluate(() => caches.keys());
  await context.setOffline(true);
  const response = await page.reload({ waitUntil: 'domcontentloaded' });
  const heading = await page.getByRole('heading', { name: 'Review the sample exit inventory' }).isVisible();
  const banner = await page.getByText('Demo — sample data, nothing is saved').isVisible();
  await context.setOffline(false);
  const worker = await (await context.request.get(`${base}/sw.js`)).text();
  if (response?.status() !== 200 || !heading || !banner || !worker.includes("github-exit-shell-2026-08-29-polish-3") || !worker.includes('skipWaiting()') || !worker.includes('clients.claim()')) throw new Error('offline/update check failed');
  report.offline = { status: response.status(), heading, banner, cacheNames, cacheVersion: 'github-exit-shell-2026-08-29-polish-3' };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
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
await writeFile('.factory/evidence/polish-3/live-qa.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ routes: report.routes.length, firstScreen: report.firstScreen, demo: report.demo, historyFocus: report.historyFocus, paidCopy: report.paidCopy, offline: report.offline, links: report.links.length }, null, 2));
