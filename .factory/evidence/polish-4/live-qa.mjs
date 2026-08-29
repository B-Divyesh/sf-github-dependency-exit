import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const origin = 'https://github-dependency-exit.sociobot.in';
const evidence = resolve('.factory/evidence/polish-4');
const failures = [];
const checks = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function auditRoute(browser, route, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto(`${origin}${route.path}`, { waitUntil: 'networkidle', timeout: 60_000 });
  const data = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    lang: document.documentElement.lang,
    h1: document.querySelectorAll('h1').length,
    main: document.querySelectorAll('main').length,
    heading: document.querySelector('h1')?.textContent?.trim(),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    missingAlt: [...document.querySelectorAll('img')].filter(image => !image.hasAttribute('alt')).length,
    undersized: [...document.querySelectorAll('a, button, input, select')].filter(node => {
      const style = getComputedStyle(node);
      const bounds = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && (bounds.width < 44 || bounds.height < 44);
    }).length,
  }));
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const axeViolations = axe.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? '')).map(item => item.id);
  const imageName = `${route.name}-${viewport.width}.png`;
  await page.screenshot({ path: resolve(evidence, imageName), fullPage: true });
  checks.push({ kind: 'route', path: route.path, viewport, ...data, consoleErrors, axeViolations, screenshot: imageName });
  check(data.title === route.title, `${route.path} title`);
  check(data.description === route.description, `${route.path} description`);
  check(data.canonical === route.canonical, `${route.path} canonical`);
  check(data.lang === 'en' && data.h1 === 1 && data.main === 1, `${route.path} semantics`);
  check(data.heading === route.heading, `${route.path} h1`);
  check(data.overflow <= 1 && data.missingAlt === 0 && data.undersized === 0, `${route.path} mobile/layout`);
  check((route.name === 'not-found' || consoleErrors.length === 0) && axeViolations.length === 0, `${route.path} console/axe`);
  await context.close();
}

async function auditDemo(browser) {
  const entryContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const entryPage = await entryContext.newPage();
  const entryRequests = [];
  entryPage.on('request', request => entryRequests.push(new URL(request.url()).origin));
  await entryPage.goto(`${origin}/`, { waitUntil: 'networkidle' });
  await entryPage.getByRole('link', { name: 'Try it with sample data' }).click();
  const entry = await entryPage.evaluate(() => ({
    url: location.href,
    banner: document.body.innerText.includes('Demo — sample data, nothing is saved'),
    heading: document.querySelector('h1')?.textContent?.trim(),
  }));
  checks.push({ kind: 'demo-entry', entry, requestOrigins: [...new Set(entryRequests)].sort() });
  check(entry.url.endsWith('/?demo=1') && entry.banner && entry.heading === 'Review the sample exit inventory', 'one-click demo entry');
  check([...new Set(entryRequests)].every(item => item === origin), 'one-click demo first-party requests');
  await entryContext.close();

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    localStorage.setItem('sb_license:github-dependency-exit', 'real-license-sentinel');
    localStorage.setItem('sb_license_verdict:github-dependency-exit', '{"valid":true,"checkedAt":1}');
  });
  const page = await context.newPage();
  const requests = [];
  page.on('request', request => requests.push(new URL(request.url()).origin));
  await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'field-console' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const reset = await page.evaluate(() => ({
    url: location.href,
    banner: document.body.innerText.includes('Demo — sample data, nothing is saved'),
    h1Focused: document.activeElement?.textContent?.trim() === 'Review the sample exit inventory',
    license: localStorage.getItem('sb_license:github-dependency-exit'),
    verdict: localStorage.getItem('sb_license_verdict:github-dependency-exit'),
  }));
  await page.screenshot({ path: resolve(evidence, 'demo-flow-mobile.png'), fullPage: true });
  checks.push({ kind: 'demo-flow', reset, requestOrigins: [...new Set(requests)].sort(), screenshot: 'demo-flow-mobile.png' });
  check(reset.url.endsWith('/?demo=1') && reset.banner && reset.h1Focused, 'direct demo and reset');
  check(reset.license === 'real-license-sentinel' && reset.verdict === '{"valid":true,"checkedAt":1}', 'demo isolation');
  check([...new Set(requests)].every(item => item === origin), 'direct demo first-party requests');
  await page.getByRole('link', { name: 'Start for real' }).click();
  const leftDemo = await page.evaluate(() => ({ url: location.href, focused: document.activeElement?.id, banner: document.body.innerText.includes('Demo — sample data, nothing is saved') }));
  checks.push({ kind: 'leave-demo', ...leftDemo });
  check(leftDemo.url.endsWith('/#install') && leftDemo.focused === 'install' && !leftDemo.banner, 'leave demo');
  await context.close();
}

async function auditOffline(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  let offline;
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    offline = await page.evaluate(() => ({
      heading: document.querySelector('h1')?.textContent?.trim(),
      banner: document.body.innerText.includes('Demo — sample data, nothing is saved'),
    }));
  } finally {
    await context.setOffline(false);
  }
  checks.push({ kind: 'offline-demo', ...offline });
  check(offline.heading === 'Review the sample exit inventory' && offline.banner, 'offline demo');
  await context.close();
}

async function auditLicense(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];
  await page.route('https://api.sociobot.in/**', async route => {
    requests.push(route.request().url());
    await route.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto(`${origin}/#price`, { waitUntil: 'networkidle' });
  await page.getByLabel('Have a license? Paste it here').fill('live-fixture-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await page.getByRole('status').waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('#license-status')?.textContent?.includes('Team scans are active'));
  await page.getByRole('button', { name: 'Remove saved license' }).click();
  const storage = await page.evaluate(() => ({
    license: localStorage.getItem('sb_license:github-dependency-exit'),
    verdict: localStorage.getItem('sb_license_verdict:github-dependency-exit'),
    status: document.querySelector('#license-status')?.textContent?.trim(),
  }));
  checks.push({ kind: 'license-storage', requests, storage });
  check(requests.length === 1 && requests[0].endsWith('verify?license=live-fixture-license'), 'license verification request');
  check(storage.license === null && storage.verdict === null && storage.status === 'No license saved in this browser.', 'license removal');
  await context.close();
}

async function auditHistory(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.goBack();
  await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Map what breaks before leaving GitHub');
  const homeFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.goForward();
  await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Review the sample exit inventory');
  const demoFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  checks.push({ kind: 'history-focus', homeFocus, demoFocus });
  check(homeFocus === 'Map what breaks before leaving GitHub' && demoFocus === 'Review the sample exit inventory', 'back and forward focus');
  await context.close();
}

await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();
const routes = [
  { name: 'home', path: '/', title: 'GitHub Exit Inventory — map migration dependencies', description: 'Map Actions, webhooks, packages, rules, releases, and app signals before moving GitHub repositories.', canonical: `${origin}/`, heading: 'Map what breaks before leaving GitHub' },
  { name: 'demo', path: '/?demo=1', title: 'Demo — GitHub Exit Inventory', description: 'Explore a bundled three-repository dependency inventory and migration checklist without an account or token.', canonical: `${origin}/?demo=1`, heading: 'Review the sample exit inventory' },
  { name: 'privacy', path: '/privacy', title: 'Privacy — GitHub Exit Inventory', description: 'How GitHub Exit Inventory handles demo, license, and report data.', canonical: `${origin}/privacy`, heading: 'Your repository data stays with you' },
  { name: 'terms', path: '/terms', title: 'Terms — GitHub Exit Inventory', description: 'Terms for free repository scans and the one-time GitHub Exit Inventory team license.', canonical: `${origin}/terms`, heading: 'Use the inventory as a planning aid' },
  { name: 'not-found', path: '/missing-polish-4-route', title: 'Page not found — GitHub Exit Inventory', description: 'The requested GitHub Exit Inventory page was not found. Return to the inventory start.', canonical: `${origin}/404`, heading: 'This route is not in the inventory' },
];
for (const route of routes) await auditRoute(browser, route, { width: 390, height: 844 });
await auditDemo(browser);
await auditOffline(browser);
await auditLicense(browser);
await auditHistory(browser);
await browser.close();
await writeFile(resolve(evidence, 'live-qa.json'), JSON.stringify({ origin, checks, failures }, null, 2));
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
