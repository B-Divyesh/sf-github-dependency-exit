import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
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
let limited = false;
const server = createServer((request, response) => {
  const url = request.url ?? '';
  requests.push(url);
  response.setHeader('content-type', 'application/json');
  response.setHeader('x-ratelimit-limit', '60');
  response.setHeader('x-ratelimit-reset', '1893456000');
  if (url === '/repos/limited/repo') {
    response.setHeader('x-ratelimit-remaining', '1');
    response.end(JSON.stringify({ name: 'repo', full_name: 'limited/repo', visibility: 'public', archived: false, default_branch: 'main', has_issues: true, html_url: 'https://example.test/limited/repo' }));
  } else {
    limited = true;
    response.setHeader('x-ratelimit-remaining', '0');
    response.statusCode = 403;
    response.end('{"message":"API rate limit exceeded"}');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const output = await mkdtemp(join(tmpdir(), 'github-exit-rate-limit-'));
const result = await run(['scan', '--repo', 'limited/repo', '--api-base', `http://127.0.0.1:${address.port}`, '--output', output]);
server.close();
console.log(JSON.stringify({
  exit: result.code,
  rateLimitWasReached: limited,
  requestsAfterRepositoryLookup: requests.slice(1).length,
  requests,
  stdout: result.stdout,
  stderr: result.stderr,
}, null, 2));
