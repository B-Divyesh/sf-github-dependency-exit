import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('the primary action opens a populated sandbox @claim:sample-demo', async ({ page }) => {
  await page.goto('/');
  const sample = page.getByRole('link', { name: 'Try it with sample data' });
  await expect(sample).toHaveAttribute('href', '/?demo=1');
  await sample.click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Review the sample exit inventory' })).toBeVisible();
  await expect(page.getByText('mosswood-labs/trail-api', { exact: true }).first()).toBeVisible();
});

test('the CLI demo writes JSON and Markdown without setup @claim:cli-demo @claim:local-reports', async () => {
  const output = await mkdtemp(join(tmpdir(), 'github-exit-claim-'));
  const result = await run('cargo', ['run', '--quiet', '--', 'demo', '--output', output]);
  expect(result.code).toBe(0);
  expect(result.stderr).toContain('Report written to');
  const json = JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8'));
  const markdown = await readFile(join(output, 'migration-checklist.md'), 'utf8');
  expect(json.summary.repositories).toBe(3);
  expect(markdown).toContain('## Migration checklist');
  expect(markdown).toContain('unknown');
});

test('the browser demo sends no data off site @claim:demo-privacy', async ({ page }) => {
  const offsite: string[] = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') offsite.push(url.origin);
  });
  await page.goto('/?demo=1');
  await page.getByRole('button', { name: 'field-console' }).click();
  await page.getByLabel('Show checklist area').selectOption('Actions');
  await expect(page.getByText('mosswood-labs/field-console', { exact: true }).first()).toBeVisible();
  expect(offsite).toEqual([]);
  expect(await page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
  }))).toEqual({ local: [], session: [] });
});

test('demo state is isolated, resettable, and can be left without copying data', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:github-dependency-exit', 'real-license-sentinel');
    localStorage.setItem('sb_license_verdict:github-dependency-exit', '{"valid":true,"checkedAt":1}');
  });
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: 'field-console' }).click();
  await expect(page.getByRole('heading', { name: 'mosswood-labs/field-console' })).toBeFocused();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('button', { name: 'trail-api' })).toHaveClass(/active/);
  await expect(page.getByRole('heading', { name: 'Review the sample exit inventory' })).toBeFocused();
  expect(await page.evaluate(() => ({
    license: localStorage.getItem('sb_license:github-dependency-exit'),
    verdict: localStorage.getItem('sb_license_verdict:github-dependency-exit'),
  }))).toEqual({ license: 'real-license-sentinel', verdict: '{"valid":true,"checkedAt":1}' });
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/#install$/);
  await expect(page.locator('#install')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Run the demo before adding a token' })).toBeInViewport();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toHaveCount(0);
});

test('live inventory requests are read-only @claim:read-only-api @claim:public-no-token @claim:no-migration', async () => {
  const methods: string[] = [];
  const server = createServer((request, response) => {
    methods.push(request.method ?? '');
    response.setHeader('content-type', 'application/json');
    response.setHeader('x-ratelimit-remaining', '4999');
    response.setHeader('x-ratelimit-limit', '5000');
    response.setHeader('x-ratelimit-reset', '1893456000');
    const url = request.url ?? '';
    if (url === '/repos/sample/repo') {
      response.end(JSON.stringify({name:'repo',full_name:'sample/repo',visibility:'private',archived:false,default_branch:'main',has_issues:true,html_url:'https://example.test/sample/repo'}));
    } else if (url.includes('/actions/workflows')) {
      response.end('{"workflows":[]}');
    } else if (url.includes('/branches/main/protection')) {
      response.statusCode = 404; response.end('{"message":"Branch not protected"}');
    } else {
      response.end('[]');
    }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('mock server did not start');
  const output = await mkdtemp(join(tmpdir(), 'github-exit-api-'));
  const result = await run('target/debug/github-exit', ['scan', '--repo', 'sample/repo', '--api-base', `http://127.0.0.1:${address.port}`, '--output', output]);
  server.close();
  expect(result.code).toBe(0);
  expect(methods.length).toBeGreaterThan(5);
  expect(new Set(methods)).toEqual(new Set(['GET']));
  const report = JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8'));
  expect(report.repositories).toHaveLength(1);
});

test('sample JSON downloads with the report counts @claim:json-export', async ({ page }) => {
  await page.goto('/?demo=1');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download sample JSON' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const data = JSON.parse(await readFile(path!, 'utf8'));
  expect(download.suggestedFilename()).toBe('github-exit-sample-inventory.json');
  expect(data.summary.repositories).toBe(3);
  expect(data.checklist.length).toBeGreaterThan(5);
});

test('the paid tier has one price, keeps repository scans free, and starts checkout @claim:paid-scope', async ({ page, request }) => {
  await page.goto('/#price');
  await expect(page.getByText('$39', { exact: true })).toBeVisible();
  await expect(page.getByText('The free command scans one repository.')).toBeVisible();
  const checkout = page.getByRole('link', { name: 'Buy the team scan license' });
  await expect(checkout).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/github-dependency-exit/checkout');
  const response = await request.get('https://api.sociobot.in/api/v1/products/github-dependency-exit/checkout', { maxRedirects: 0 });
  expect(response.status()).toBe(303);
  expect(response.headers().location).toMatch(/^https:\/\/checkout\.dodopayments\.com\/session\//);
});

test('the service worker activates the current shell and refreshes navigations', async ({ request }) => {
  const response = await request.get('/sw.js');
  expect(response.status()).toBe(200);
  const worker = await response.text();
  expect(worker).toContain("const CACHE = 'github-exit-shell-2026-08-28-polish-1'");
  expect(worker).toContain('self.skipWaiting()');
  expect(worker).toContain('self.clients.claim()');
  expect(worker).toContain("event.request.mode === 'navigate'");
  expect(worker).toContain('event.respondWith(fetch(event.request)');
});

test('the sample report reloads offline after the first visit', async ({ page, context }) => {
  await page.goto('/?demo=1');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Review the sample exit inventory' })).toBeVisible();
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});

const routeMetadata = [
  ['/', 'GitHub Exit Inventory — map migration dependencies', 'Map Actions, webhooks, packages, rules, releases, and app signals before moving GitHub repositories.', 'https://github-dependency-exit.sociobot.in/'],
  ['/?demo=1', 'Demo — GitHub Exit Inventory', 'Explore a bundled three-repository dependency inventory and migration checklist without an account or token.', 'https://github-dependency-exit.sociobot.in/?demo=1'],
  ['/demo', 'Demo — GitHub Exit Inventory', 'Explore a bundled three-repository dependency inventory and migration checklist without an account or token.', 'https://github-dependency-exit.sociobot.in/?demo=1'],
  ['/privacy', 'Privacy — GitHub Exit Inventory', 'How GitHub Exit Inventory handles demo, license, and report data.', 'https://github-dependency-exit.sociobot.in/privacy'],
  ['/terms', 'Terms — GitHub Exit Inventory', 'Terms for free repository scans and the one-time GitHub Exit Inventory team license.', 'https://github-dependency-exit.sociobot.in/terms'],
] as const;

for (const [path, title, description, canonical] of routeMetadata) {
  test(`route ${path} sets complete route-specific metadata`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', description);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', description);
  });
}

test('landing preview names migration dependencies without design metaphors', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'See migration dependencies beyond Git history' })).toBeVisible();
  await expect(page.getByText('A repository model showing connected migration dependencies.')).toBeVisible();
  await expect(page.getByText(/exit surface|accumulated load/i)).toHaveCount(0);
});

test('Back and Forward focus the heading for the restored route', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.getByRole('heading', { name: 'Review the sample exit inventory' })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Map what breaks before leaving GitHub' })).toBeFocused();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Review the sample exit inventory' })).toBeFocused();
});

test('the static 404 has complete metadata and the standard site shell', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — GitHub Exit Inventory');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'The requested GitHub Exit Inventory page was not found. Return to the inventory start.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://github-dependency-exit.sociobot.in/404');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#d8d3c7');
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  await expect(page.locator('meta[name="twitter:title"]')).toHaveCount(1);
  await expect(page.locator('meta[name="twitter:description"]')).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Primary' })).toContainText('Demo');
  await expect(page.getByRole('navigation', { name: 'Footer' })).toContainText('Privacy');
  await expect(page.getByRole('navigation', { name: 'Footer' })).toContainText('Terms');
  await expect(page.getByRole('link', { name: /Built by Param Factory/ })).toBeVisible();
  await expect(page.getByText('v0.1.0 · build 2026.08')).toBeVisible();
});

test('the deployment configuration returns the static error document with HTTP 404', async () => {
  const config = JSON.parse(await readFile('site/public/staticwebapp.config.json', 'utf8'));
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
});

for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-route']) {
  test(`route ${route} has its structure and no serious accessibility errors`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/GitHub Exit Inventory|Page not found/);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}

test('the 390 px layout does not scroll sideways and keyboard reaches the demo', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const homeAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(homeAxe.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\?demo=1$/);
  const demoOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(demoOverflow).toBeLessThanOrEqual(1);
  const undersized = await page.locator('a, button, input, select').evaluateAll(nodes => nodes.filter(node => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && (rect.width < 44 || rect.height < 44);
  }).map(node => (node.textContent || '').trim()));
  expect(undersized).toEqual([]);
});

function run(command: string, args: string[]): Promise<{code: number|null; stdout: string; stderr: string}> {
  return new Promise(resolve => {
    const child = spawn(command, args, { cwd: process.cwd(), env: process.env });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', chunk => stdout += chunk);
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('close', code => resolve({code, stdout, stderr}));
  });
}
