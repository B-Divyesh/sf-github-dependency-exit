import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('the primary action opens a populated sandbox @claim:sample-demo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
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
  await page.goto('/demo');
  await page.getByRole('button', { name: 'field-console' }).click();
  await page.getByLabel('Show checklist area').selectOption('Actions');
  await expect(page.getByText('mosswood-labs/field-console', { exact: true }).first()).toBeVisible();
  expect(offsite).toEqual([]);
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
  await page.goto('/demo');
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
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo$/);
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
