import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function run(args) {
  return new Promise((resolve) => {
    const child = spawn('target/release/github-exit', args, { cwd: process.cwd() });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => stdout += chunk);
    child.stderr.on('data', (chunk) => stderr += chunk);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

const requests = [];
const workflow = [
  'name: CI',
  'jobs:',
  '  test:',
  '    runs-on: ubuntu-latest',
  '    steps:',
  '      - uses: actions/checkout@v4',
  '      - uses: docker/login-action@0123456789abcdef0123456789abcdef01234567',
].join('\n');

const server = createServer((request, response) => {
  requests.push({ method: request.method, url: request.url });
  response.setHeader('content-type', 'application/json');
  response.setHeader('x-ratelimit-remaining', '4999');
  response.setHeader('x-ratelimit-limit', '5000');
  response.setHeader('x-ratelimit-reset', '1893456000');
  const url = request.url ?? '';
  if (url === '/repos/sample/repo') {
    response.end(JSON.stringify({
      name: 'repo', full_name: 'sample/repo', visibility: 'public', archived: false,
      default_branch: 'main', has_issues: true, html_url: 'https://example.test/sample/repo',
    }));
  } else if (url.includes('/actions/workflows')) {
    response.end(JSON.stringify({ workflows: [{
      name: 'CI', path: '.github/workflows/ci.yml', state: 'active', html_url: 'https://example.test/actions',
    }] }));
  } else if (url.includes('/contents/')) {
    response.end(JSON.stringify({ content: Buffer.from(workflow).toString('base64') }));
  } else if (url.includes('/branches/main/protection')) {
    response.statusCode = 404;
    response.end('{"message":"Branch not protected"}');
  } else if (url.startsWith('/orgs/sample/packages')) {
    response.statusCode = 404;
    response.end('{"message":"Not Found"}');
  } else {
    response.end('[]');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const output = await mkdtemp(join(tmpdir(), 'github-exit-independent-'));
const scan = await run([
  'scan', '--repo', 'sample/repo', '--api-base', `http://127.0.0.1:${address.port}`, '--output', output,
]);
server.close();
const inventory = JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8'));

const demoJson = await run(['demo', '--json', '--output', join(output, 'demo')]);
let demoStdoutIsJson = true;
try { JSON.parse(demoJson.stdout); } catch { demoStdoutIsJson = false; }

const invalidCases = {};
for (const [name, args] of Object.entries({
  missingTarget: ['scan'],
  malformedRepo: ['scan', '--repo', 'https://github.com/sample/repo'],
  missingLicense: ['scan', '--owner', 'sample'],
  unwritableOutput: ['demo', '--output', '/proc/github-exit-qa'],
})) {
  invalidCases[name] = await run(args);
}

console.log(JSON.stringify({
  scanExit: scan.code,
  requestMethods: [...new Set(requests.map((item) => item.method))],
  requestUrls: requests.map((item) => item.url),
  expectedTypicalActionReferences: 2,
  observedActionReferences: inventory.summary.action_dependencies,
  observedActions: inventory.repositories[0].action_dependencies,
  demoJsonExit: demoJson.code,
  demoStdoutIsJson,
  demoStdoutTail: demoJson.stdout.trim().split('\n').slice(-2),
  invalidCases,
}, null, 2));
