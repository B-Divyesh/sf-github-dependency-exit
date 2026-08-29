import { writeFile } from 'node:fs/promises';

const site = 'https://github-dependency-exit.sociobot.in';
const requiredHeaders = {
  'content-security-policy': ["default-src 'self'", "connect-src 'self' https://api.sociobot.in", "frame-ancestors 'none'"],
  'strict-transport-security': ['includeSubDomains'],
  'x-content-type-options': ['nosniff'],
  'referrer-policy': ['strict-origin-when-cross-origin'],
  'permissions-policy': ['camera=()', 'microphone=()', 'geolocation=()'],
};

async function probe(path) {
  const response = await fetch(`${site}${path}`, { redirect: 'manual', cache: 'no-store' });
  return { path, status: response.status, headers: Object.fromEntries(response.headers) };
}

const home = await probe('/');
const asset = await probe('/assets/index-CGImsVZO.css');
const download = await probe('/downloads/github-exit-linux-x86_64');
const missing = await probe('/repair-4-response-policy-missing');
for (const [name, fragments] of Object.entries(requiredHeaders)) {
  for (const fragment of fragments) {
    if (!home.headers[name]?.includes(fragment)) throw new Error(`home ${name} is missing ${fragment}`);
  }
}
if (home.status !== 200 || home.headers['cache-control'] !== 'public, must-revalidate, max-age=30') throw new Error('HTML response policy failed');
if (asset.status !== 200 || !asset.headers['cache-control']?.includes('max-age=31536000') || !asset.headers['cache-control']?.includes('immutable')) throw new Error('hashed asset response policy failed');
if (download.status !== 200 || download.headers['content-disposition'] !== 'attachment' || !download.headers['cache-control']?.includes('max-age=86400')) throw new Error('binary response policy failed');
if (missing.status !== 404) throw new Error('missing route response policy failed');

const checkoutResponse = await fetch('https://api.sociobot.in/api/v1/products/github-dependency-exit/checkout', { redirect: 'manual' });
const checkout = { status: checkoutResponse.status, locationHost: new URL(checkoutResponse.headers.get('location')).host };
if (checkout.status !== 303 || checkout.locationHost !== 'checkout.dodopayments.com') throw new Error(`checkout policy failed: ${JSON.stringify(checkout)}`);

const attempts = [];
for (let index = 1; index <= 35; index += 1) {
  const response = await fetch(`https://api.sociobot.in/api/v1/products/github-dependency-exit/verify?license=repair-4-invalid-${index}`, { cache: 'no-store' });
  attempts.push({ index, status: response.status, retryAfter: response.headers.get('retry-after'), rateLimitAfter: response.headers.get('x-ratelimit-after') });
  if (response.status === 429) break;
  if (response.status !== 200) throw new Error(`unexpected license response ${response.status}`);
}
const limited = attempts.at(-1);
if (limited?.status !== 429 || !limited.retryAfter) throw new Error(`license rate policy failed: ${JSON.stringify(attempts)}`);
const retrySeconds = Number.parseInt(limited.retryAfter, 10);
await new Promise(resolve => setTimeout(resolve, (Number.isFinite(retrySeconds) ? retrySeconds : 4) * 1000 + 1000));
const recoveryResponse = await fetch('https://api.sociobot.in/api/v1/products/github-dependency-exit/verify?license=repair-4-invalid-recovery', { cache: 'no-store' });
const recovered = { status: recoveryResponse.status };
if (recovered.status !== 200) throw new Error(`license rate recovery failed: ${JSON.stringify(recovered)}`);

const report = { home, asset, download, missing, checkout, licenseRateLimit: { successful: attempts.filter(item => item.status === 200).length, limited, recovered } };
await writeFile('.factory/evidence/repair-4/live-response-policy.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ home: home.status, assetCache: asset.headers['cache-control'], download: { status: download.status, disposition: download.headers['content-disposition'] }, missing: missing.status, checkout, licenseRateLimit: report.licenseRateLimit }));
