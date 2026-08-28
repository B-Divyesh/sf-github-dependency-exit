import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function run(args) {
  return new Promise((resolve) => {
    const child = spawn('target/release/github-exit', args, { cwd: process.cwd() });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', (chunk) => stdout += chunk);
    child.stderr.on('data', (chunk) => stderr += chunk);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

const server = createServer((request, response) => {
  const url = request.url ?? '';
  response.setHeader('content-type', 'application/json');
  response.setHeader('x-ratelimit-remaining', '4999');
  response.setHeader('x-ratelimit-limit', '5000');
  response.setHeader('x-ratelimit-reset', '1893456000');
  if (url === '/repos/private/repo') {
    response.end(JSON.stringify({ name: 'repo', full_name: 'private/repo', visibility: 'private', archived: false, default_branch: 'main', has_issues: true, html_url: 'https://example.test/private/repo' }));
  } else if (url.includes('/actions/workflows')) {
    response.end(JSON.stringify({ workflows: [{ name: 'CI', path: '.github/workflows/ci.yml', state: 'active', html_url: 'https://example.test/actions' }] }));
  } else if (url.includes('/contents/')) {
    response.statusCode = 403; response.end('{"message":"Resource not accessible by personal access token"}');
  } else if (url.includes('/branches/main/protection')) {
    response.statusCode = 404; response.end('{"message":"Not Found"}');
  } else if (url.includes('/packages')) {
    response.statusCode = 403; response.end('{"message":"Resource not accessible by personal access token"}');
  } else response.end('[]');
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const output = await mkdtemp(join(tmpdir(), 'github-exit-access-'));
const result = await run(['scan', '--repo', 'private/repo', '--api-base', `http://127.0.0.1:${address.port}`, '--output', output]);
server.close();
const report = JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8'));
console.log(JSON.stringify({
  exit: result.code,
  evidence: report.repositories[0].evidence,
  actionsChecklist: report.checklist.find((item) => item.area === 'Actions'),
  branchChecklist: report.checklist.find((item) => item.area === 'Branch rules'),
  packageChecklistItems: report.checklist.filter((item) => item.area === 'Packages'),
  unknownChecks: report.summary.unknown_checks,
}, null, 2));
