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

test('JSON mode reserves stdout for one parseable inventory @claim:script-json', async () => {
  const output = await tempOutput();
  const result = await run(['demo', '--json', '--output', output]);
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout).summary.repositories).toBe(3);
  expect(result.stdout).not.toContain('Report written to');
  expect(result.stderr).toContain('Report written to');
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

function run(args: string[]): Promise<Result> {
  return new Promise(resolve => {
    const child = spawn('target/debug/github-exit', args, { cwd: process.cwd(), env: process.env });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', chunk => stdout += chunk);
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
}
