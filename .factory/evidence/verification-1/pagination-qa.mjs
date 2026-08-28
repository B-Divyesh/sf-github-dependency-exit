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

const requests = [];
const firstPage = Array.from({ length: 100 }, (_, index) => ({
  name: `workflow-${index + 1}`,
  path: `.github/workflows/workflow-${index + 1}.yml`,
  state: 'active',
  html_url: `https://example.test/actions/${index + 1}`,
}));
const server = createServer((request, response) => {
  const url = request.url ?? '';
  requests.push(url);
  response.setHeader('content-type', 'application/json');
  response.setHeader('x-ratelimit-remaining', '4999');
  response.setHeader('x-ratelimit-limit', '5000');
  response.setHeader('x-ratelimit-reset', '1893456000');
  if (url === '/repos/boundary/repo') {
    response.end(JSON.stringify({ name: 'repo', full_name: 'boundary/repo', visibility: 'public', archived: false, default_branch: 'main', has_issues: true, html_url: 'https://example.test/boundary/repo' }));
  } else if (url.includes('/actions/workflows')) {
    if (url.includes('page=2')) response.end(JSON.stringify({ workflows: [{ name: 'workflow-101', path: '.github/workflows/workflow-101.yml', state: 'active', html_url: 'https://example.test/actions/101' }] }));
    else {
      response.setHeader('link', `<http://127.0.0.1/unused?page=2>; rel="next"`);
      response.end(JSON.stringify({ total_count: 101, workflows: firstPage }));
    }
  } else if (url.includes('/contents/')) {
    response.end(JSON.stringify({ content: Buffer.from('name: boundary').toString('base64') }));
  } else if (url.includes('/branches/main/protection') || url.startsWith('/orgs/boundary/packages')) {
    response.statusCode = 404; response.end('{"message":"Not Found"}');
  } else response.end('[]');
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const output = await mkdtemp(join(tmpdir(), 'github-exit-pagination-'));
const result = await run(['scan', '--repo', 'boundary/repo', '--api-base', `http://127.0.0.1:${address.port}`, '--output', output]);
server.close();
const report = JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8'));
console.log(JSON.stringify({
  exit: result.code,
  apiReportedWorkflowCount: 101,
  observedWorkflowCount: report.summary.workflows,
  requestedWorkflowPage2: requests.some((url) => url.includes('/actions/workflows') && url.includes('page=2')),
  workflowRequests: requests.filter((url) => url.includes('/actions/workflows')),
}, null, 2));
