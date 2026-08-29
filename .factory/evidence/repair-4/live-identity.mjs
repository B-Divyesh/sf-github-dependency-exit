import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = 'dist/site';
const base = 'https://github-dependency-exit.sociobot.in';

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(entries.map(entry => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]));
  return paths.flat();
}

const results = [];
for (const file of await files(root)) {
  const path = relative(root, file).replaceAll('\\', '/');
  if (path === 'staticwebapp.config.json') continue;
  const route = path === 'index.html' ? '/' : `/${path}`;
  const response = await fetch(`${base}${route}?identity=848dcbe`, { cache: 'no-store' });
  const local = await readFile(file);
  const remote = Buffer.from(await response.arrayBuffer());
  const localSha256 = createHash('sha256').update(local).digest('hex');
  const remoteSha256 = createHash('sha256').update(remote).digest('hex');
  const match = localSha256 === remoteSha256;
  results.push({ path, status: response.status, bytes: local.length, localSha256, remoteSha256, match });
  if (!match || (response.status !== 200 && path !== '404.html')) throw new Error(`live identity mismatch: ${path}`);
}

await writeFile('.factory/evidence/repair-4/live-identity.json', `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify({ files: results.length, matched: results.filter(item => item.match).length, binary: results.find(item => item.path.endsWith('github-exit-linux-x86_64'))?.localSha256 }));
