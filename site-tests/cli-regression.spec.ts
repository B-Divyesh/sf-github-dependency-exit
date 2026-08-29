import { test, expect } from '@playwright/test';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type Result = { code: number | null; stdout: string; stderr: string };

test('ordinary YAML step actions are inventoried and the token stays out of reports @claim:workflow-step-syntax @claim:token-not-reported', async () => {
  const workflow = [
    'name: CI', 'jobs:', '  test:', '    steps:',
    '      - uses: actions/checkout@v4',
    '      - uses: docker/login-action@0123456789abcdef0123456789abcdef01234567',
  ].join('\n');
  const fixture = await startFixture((request, response) => {
    const path = request.url ?? '';
    if (path === '/repos/sample/repo') return json(response, repository('sample/repo'));
    if (path.includes('/actions/workflows')) return json(response, { workflows: [workflowRecord()] });
    if (path.includes('/contents/')) return json(response, { content: Buffer.from(workflow).toString('base64') });
    if (path.includes('/branches/main/protection')) return json(response, { message: 'Not Found' }, 404);
    if (path.includes('/packages')) return json(response, [], 200);
    return json(response, []);
  });
  try {
    const output = await tempOutput();
    const secret = 'unit-test-token-must-not-appear';
    const result = await run(['scan', '--repo', 'sample/repo', '--token', secret, '--api-base', fixture.base, '--output', output]);
    expect(result.code).toBe(0);
    const reportText = await readFile(join(output, 'inventory.json'), 'utf8');
    const inventory = JSON.parse(reportText);
    expect(inventory.summary.action_dependencies).toBe(2);
    expect(inventory.repositories[0].action_dependencies.map((item: { uses: string }) => item.uses)).toEqual([
      'actions/checkout@v4',
      'docker/login-action@0123456789abcdef0123456789abcdef01234567',
    ]);
    expect(reportText).not.toContain(secret);
  } finally { await fixture.close(); }
});

test('unreadable metadata creates unknown actions, branch, and package checklist work @claim:unknown-access', async () => {
  const fixture = await startFixture((request, response) => {
    const path = request.url ?? '';
    if (path === '/repos/private/repo') return json(response, repository('private/repo'));
    if (path.includes('/actions/workflows')) return json(response, { workflows: [workflowRecord()] });
    if (path.includes('/contents/') || path.includes('/packages')) return json(response, { message: 'Resource not accessible' }, 403);
    if (path.includes('/branches/main/protection')) return json(response, { message: 'Not Found' }, 404);
    return json(response, []);
  });
  try {
    const output = await tempOutput();
    const result = await run(['scan', '--repo', 'private/repo', '--api-base', fixture.base, '--output', output]);
    expect(result.code).toBe(0);
    const inventory = JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8'));
    const checks = inventory.checklist as Array<{ area: string; status: string }>;
    expect(checks.find(item => item.area === 'Actions')?.status).toBe('unknown');
    expect(checks.find(item => item.area === 'Branch rules')?.status).toBe('unknown');
    expect(checks.filter(item => item.area === 'Packages').some(item => item.status === 'unknown')).toBe(true);
  } finally { await fixture.close(); }
});

test('every list endpoint follows the page boundary @claim:paginated-inventory', async () => {
  const workflows = Array.from({ length: 100 }, (_, index) => ({ ...workflowRecord(), name: `workflow-${index + 1}`, path: `.github/workflows/${index + 1}.yml` }));
  const requested: string[] = [];
  const fixture = await startFixture((request, response) => {
    const path = request.url ?? '';
    requested.push(path);
    if (path === '/repos/boundary/repo') return json(response, repository('boundary/repo'));
    if (path.includes('/actions/workflows')) return json(response, path.includes('page=2') ? { workflows: [{ ...workflowRecord(), name: 'workflow-101', path: '.github/workflows/101.yml' }] } : { workflows });
    if (path.includes('/contents/')) return json(response, { content: Buffer.from('name: CI').toString('base64') });
    if (path.includes('/branches/main/protection')) return json(response, { message: 'Not Found' }, 404);
    return json(response, []);
  });
  try {
    const output = await tempOutput();
    const result = await run(['scan', '--repo', 'boundary/repo', '--api-base', fixture.base, '--output', output]);
    expect(result.code).toBe(0);
    const inventory = JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8'));
    expect(inventory.summary.workflows).toBe(101);
    expect(requested.some(path => path.includes('/actions/workflows') && path.includes('page=2'))).toBe(true);
  } finally { await fixture.close(); }
});

test('a GitHub rate-limit response stops further requests and fails safely @claim:rate-limit-stop', async () => {
  const requested: string[] = [];
  const fixture = await startFixture((request, response) => {
    const path = request.url ?? '';
    requested.push(path);
    if (path === '/repos/limited/repo') return json(response, repository('limited/repo'), 200, 1);
    return json(response, { message: 'API rate limit exceeded' }, 403, 0);
  });
  try {
    const output = await tempOutput();
    const result = await run(['scan', '--repo', 'limited/repo', '--api-base', fixture.base, '--output', output]);
    expect(result.code).toBe(2);
    expect(result.stderr).toContain('GitHub rate limit reached');
    expect(requested).toHaveLength(2);
  } finally { await fixture.close(); }
});

test('a GitHub Enterprise Server 3.14 API works through --api-base @claim:ghes-api-base', async () => {
  const requested: string[] = [];
  const fixture = await startFixture((request, response) => {
    const path = request.url ?? '';
    requested.push(path);
    response.setHeader('x-github-enterprise-version', '3.14.17');
    if (path === '/api/v3/repos/enterprise/repo') return json(response, repository('enterprise/repo'));
    if (path.includes('/actions/workflows')) return json(response, { workflows: [] });
    if (path.includes('/branches/main/protection')) return json(response, { message: 'Not Found' }, 404);
    return json(response, []);
  });
  try {
    const output = await tempOutput();
    const result = await run(['scan', '--repo', 'enterprise/repo', '--api-base', `${fixture.base}/api/v3`, '--output', output]);
    expect(result.code).toBe(0);
    expect(requested.length).toBeGreaterThan(5);
    expect(requested.every(path => path.startsWith('/api/v3/'))).toBe(true);
    const inventory = JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8'));
    expect(inventory.source).toBe(`${fixture.base}/api/v3`);
    expect(inventory.repositories[0].full_name).toBe('enterprise/repo');
  } finally { await fixture.close(); }
});

test('JSON mode reserves stdout for one parseable inventory @claim:script-json', async () => {
  const output = await tempOutput();
  const result = await run(['demo', '--json', '--output', output]);
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout).summary.repositories).toBe(3);
  expect(result.stdout).not.toContain('Report written to');
  expect(result.stderr).toContain('Report written to');
});

test('every checked area keeps a source for results, empty lists, and errors @claim:sourced-evidence', async () => {
  const workflow = workflowRecord();
  const fixture = await startFixture((request, response) => {
    const path = request.url ?? '';
    if (path === '/repos/source/repo') return json(response, repository('source/repo'));
    if (path.includes('/actions/workflows')) return json(response, { workflows: [workflow] });
    if (path.includes('/contents/')) return json(response, { message: 'Resource not accessible' }, 403);
    if (path.includes('/releases')) return json(response, { message: 'Resource not accessible' }, 403);
    if (path.includes('/branches/main/protection')) return json(response, { required_status_checks: {} });
    if (path.includes('/packages') && path.includes('package_type=npm')) return json(response, { message: 'Resource not accessible' }, 403);
    return json(response, []);
  });
  try {
    const output = await tempOutput();
    const result = await run(['scan', '--repo', 'source/repo', '--api-base', fixture.base, '--output', output]);
    expect(result.code).toBe(0);
    const inventory = JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8'));
    const evidence = inventory.repositories[0].evidence as Array<{ area: string; status: string; source: string; note: string }>;
    const areas = new Set(evidence.map(item => item.area));
    for (const area of ['workflow content', 'actions', 'webhooks', 'releases', 'branch protection', 'rulesets', 'branch rules', 'issue autolinks', 'GitHub Apps and OAuth', 'packages']) {
      expect(areas, `missing evidence for ${area}`).toContain(area);
    }
    expect(evidence.every(item => item.source.trim().length > 0)).toBe(true);
    expect(evidence.find(item => item.area === 'webhooks')).toMatchObject({ status: 'verified', note: '0 webhooks found' });
    expect(evidence.find(item => item.area === 'workflow content')).toMatchObject({ status: 'unknown' });
    expect(evidence.find(item => item.area === 'releases')).toMatchObject({ status: 'unknown' });
    expect(evidence.find(item => item.area === 'packages' && item.note.includes('npm'))).toMatchObject({ status: 'unknown' });
  } finally { await fixture.close(); }
});

test('verified alternatives have documentation while unsupported candidates stay unknown @claim:documented-alternatives', async () => {
  const fixture = await startFixture((request, response) => {
    const path = request.url ?? '';
    if (path === '/repos/alternatives/repo') return json(response, repository('alternatives/repo'));
    if (path.includes('/actions/workflows')) return json(response, { workflows: [] });
    if (path.includes('/branches/main/protection')) return json(response, { required_status_checks: {} });
    return json(response, []);
  });
  try {
    const output = await tempOutput();
    const result = await run(['scan', '--repo', 'alternatives/repo', '--api-base', fixture.base, '--output', output]);
    expect(result.code).toBe(0);
    const inventory = JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8'));
    const checks = inventory.checklist as Array<{ area: string; alternative_status: string; alternative_evidence: string }>;
    const verified = checks.filter(item => item.alternative_status === 'verified');
    expect(verified.length).toBeGreaterThan(0);
    expect(verified.every(item => /^https:\/\//.test(item.alternative_evidence))).toBe(true);
    expect(checks.find(item => item.area === 'Actions')).toMatchObject({
      alternative_status: 'verified',
      alternative_evidence: 'https://forgejo.org/docs/latest/user/actions/',
    });
    expect(checks.find(item => item.area === 'Webhooks')).toMatchObject({
      alternative_status: 'unknown',
      alternative_evidence: 'Confirm payload and signature support with each receiver.',
    });
  } finally { await fixture.close(); }
});

test('repository metadata goes only to GitHub and Sociobot receives only the license @claim:sociobot-metadata-privacy', async () => {
  const githubRequests: Array<{ method: string; url: string }> = [];
  const billingRequests: Array<{ method: string; url: string; body: string }> = [];
  const github = await startFixture((request, response) => {
    const path = request.url ?? '';
    githubRequests.push({ method: request.method ?? '', url: path });
    if (path.startsWith('/orgs/privacy-owner/repos?')) return json(response, [repository('privacy-owner/secret-repo')]);
    if (path.includes('/actions/workflows')) return json(response, { workflows: [] });
    if (path.includes('/branches/main/protection')) return json(response, { required_status_checks: {} });
    return json(response, []);
  });
  const billing = await startFixture((request, response) => {
    let body = '';
    request.on('data', chunk => body += chunk);
    request.on('end', () => {
      billingRequests.push({ method: request.method ?? '', url: request.url ?? '', body });
      json(response, { valid: true, reason: 'ok' });
    });
  });
  try {
    const output = await tempOutput();
    const result = await run(
      ['scan', '--owner', 'privacy-owner', '--license', 'sb_test_capture', '--api-base', github.base, '--output', output],
      { GITHUB_EXIT_CLAIM_BILLING_BASE: `${billing.base}/api/v1` },
    );
    expect(result.code).toBe(0);
    expect(githubRequests.length).toBeGreaterThan(5);
    expect(new Set(githubRequests.map(item => item.method))).toEqual(new Set(['GET']));
    expect(githubRequests.some(item => item.url.includes('privacy-owner/secret-repo'))).toBe(true);
    expect(billingRequests).toHaveLength(1);
    const captured = billingRequests[0];
    const billingUrl = new URL(captured.url, billing.base);
    expect(captured.method).toBe('GET');
    expect(captured.body).toBe('');
    expect([...billingUrl.searchParams.keys()]).toEqual(['license']);
    expect(billingUrl.searchParams.get('license')).toBe('sb_test_capture');
    expect(captured.url).not.toContain('privacy-owner');
    expect(captured.url).not.toContain('secret-repo');
  } finally {
    await Promise.all([github.close(), billing.close()]);
  }
});

test('an active license writes one owner-wide report containing every repository @claim:paid-owner-scan', async ({ page }) => {
  await page.goto('/#price');
  await expect(page.getByText('An active license adds owner-wide scans and one combined report.')).toBeVisible();
  expect(await readFile('README.md', 'utf8')).toContain('An active $39 one-time license adds owner-wide scans and one combined report.');
  const billingRequests: string[] = [];
  const github = await startFixture((request, response) => {
    const path = request.url ?? '';
    if (path.startsWith('/orgs/moss-team/repos?')) {
      return json(response, [repository('moss-team/trail-api'), repository('moss-team/field-console')]);
    }
    if (path.includes('/actions/workflows')) return json(response, { workflows: [] });
    if (path.includes('/branches/main/protection')) return json(response, { required_status_checks: {} });
    return json(response, []);
  });
  const billing = await startFixture((request, response) => {
    billingRequests.push(request.url ?? '');
    json(response, { valid: true, reason: 'ok' });
  });
  try {
    const output = await tempOutput();
    const result = await run(
      ['scan', '--owner', 'moss-team', '--license', 'sb_test_active', '--api-base', github.base, '--output', output],
      { GITHUB_EXIT_CLAIM_BILLING_BASE: `${billing.base}/api/v1` },
    );
    expect(result.code).toBe(0);
    expect(billingRequests).toEqual(['/api/v1/products/github-dependency-exit/verify?license=sb_test_active']);
    const inventory = JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8'));
    expect(inventory.scope).toBe('moss-team');
    expect(inventory.summary.repositories).toBe(2);
    expect(inventory.repositories.map((item: { full_name: string }) => item.full_name)).toEqual([
      'moss-team/trail-api',
      'moss-team/field-console',
    ]);
    const checklist = await readFile(join(output, 'migration-checklist.md'), 'utf8');
    expect(checklist).toContain('# GitHub exit inventory: moss-team');
    expect(checklist).toContain('### moss-team/trail-api');
    expect(checklist).toContain('### moss-team/field-console');
    expect(result.stderr).toContain('Scanned 2 repositories.');
  } finally {
    await Promise.all([github.close(), billing.close()]);
  }
});

test('a refunded license stops an owner-wide scan with recovery guidance @claim:refund-revokes-license', async ({ page }) => {
  await page.goto('/terms');
  await expect(page.getByText('A refund makes the paid license inactive.')).toBeVisible();
  expect(await readFile('README.md', 'utf8')).toContain('A refund makes the license inactive.');
  const githubRequests: string[] = [];
  const github = await startFixture((request, response) => {
    githubRequests.push(request.url ?? '');
    json(response, []);
  });
  const billing = await startFixture((_request, response) => {
    json(response, { valid: false, reason: 'refunded' });
  });
  try {
    const output = await tempOutput();
    const result = await run(
      ['scan', '--owner', 'moss-team', '--license', 'sb_test_refunded', '--api-base', github.base, '--output', output],
      { GITHUB_EXIT_CLAIM_BILLING_BASE: `${billing.base}/api/v1` },
    );
    expect(result.code).toBe(2);
    expect(result.stderr).toContain('The license is not active (refunded).');
    expect(result.stderr).toContain('Paste an active license or use --repo.');
    expect(githubRequests).toEqual([]);
  } finally {
    await Promise.all([github.close(), billing.close()]);
  }
});

test('the CLI demo writes both reports without any network request @claim:cli-demo-no-network', async () => {
  const attemptedRequests: string[] = [];
  const denyProxy = await startFixture((request, response) => {
    attemptedRequests.push(`${request.method ?? ''} ${request.url ?? ''}`);
    json(response, { message: 'network denied by claim sandbox' }, 502);
  });
  try {
    const output = await tempOutput();
    const proxyEnvironment = {
      HTTP_PROXY: denyProxy.base,
      HTTPS_PROXY: denyProxy.base,
      ALL_PROXY: denyProxy.base,
      NO_PROXY: '',
      http_proxy: denyProxy.base,
      https_proxy: denyProxy.base,
      all_proxy: denyProxy.base,
      no_proxy: '',
    };
    const result = await run(['demo', '--output', output], proxyEnvironment);
    expect(result.code).toBe(0);
    expect(attemptedRequests).toEqual([]);
    expect(JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8')).summary.repositories).toBe(3);
    expect(await readFile(join(output, 'migration-checklist.md'), 'utf8')).toContain('## Migration checklist');
  } finally { await denyProxy.close(); }
});

function repository(fullName: string) {
  const [owner, name] = fullName.split('/');
  return { name, full_name: fullName, visibility: 'private', archived: false, default_branch: 'main', has_issues: true, html_url: `https://example.test/${owner}/${name}` };
}

function workflowRecord() { return { name: 'CI', path: '.github/workflows/ci.yml', state: 'active', html_url: 'https://example.test/actions' }; }

function json(response: ServerResponse, body: unknown, status = 200, remaining = 4999): void {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json');
  response.setHeader('x-ratelimit-remaining', String(remaining));
  response.setHeader('x-ratelimit-limit', '5000');
  response.setHeader('x-ratelimit-reset', '1893456000');
  response.end(JSON.stringify(body));
}

async function startFixture(handler: (request: IncomingMessage, response: ServerResponse) => void): Promise<{ base: string; close: () => Promise<void> }> {
  const server = createServer(handler);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('fixture server did not start');
  return { base: `http://127.0.0.1:${address.port}`, close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())) };
}

async function tempOutput(): Promise<string> { return mkdtemp(join(tmpdir(), 'github-exit-regression-')); }

function run(args: string[], environment: Record<string, string> = {}): Promise<Result> {
  return new Promise(resolve => {
    const child = spawn('target/debug/github-exit', args, { cwd: process.cwd(), env: { ...process.env, ...environment } });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', chunk => stdout += chunk);
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
}
