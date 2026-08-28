import './style.css';
import demoData from '../../examples/demo/inventory.json';
import type { Inventory, Checklist } from './types';

const PRODUCT = 'GitHub Exit Inventory';
const LICENSE_KEY = 'sb_license:github-dependency-exit';
const VERDICT_KEY = 'sb_license_verdict:github-dependency-exit';
const BILLING = 'https://api.sociobot.in/api/v1/products/github-dependency-exit';
const inventory = demoData as Inventory;
const app = document.querySelector<HTMLDivElement>('#app')!;
const routeStatus = document.querySelector<HTMLDivElement>('#route-status')!;

const routes: Record<string, { title: string; render: () => string }> = {
  '/': { title: 'GitHub Exit Inventory — map migration dependencies', render: home },
  '/demo': { title: 'Demo — GitHub Exit Inventory', render: demo },
  '/privacy': { title: 'Privacy — GitHub Exit Inventory', render: privacy },
  '/terms': { title: 'Terms — GitHub Exit Inventory', render: terms },
  '/404': { title: 'Page not found — GitHub Exit Inventory', render: notFound },
};

function shell(content: string, demoMode = false): string {
  return `${demoMode ? demoBanner() : ''}
  <header class="site-header">
    <a class="wordmark" href="/" data-link aria-label="GitHub Exit Inventory home"><span class="wordmark-mark" aria-hidden="true">G/E</span><span>${PRODUCT}</span></a>
    <nav aria-label="Primary"><a href="/demo" data-link>Demo</a><a href="/#install">Install</a><a href="/#price">Price</a><a href="/privacy" data-link>Privacy</a></nav>
  </header>
  ${content}
  <footer>
    <p><strong>${PRODUCT}</strong><br><span>Map GitHub dependencies before a move.</span></p>
    <nav aria-label="Footer"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://hello-factory.sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav>
    <p class="build">v0.1.0 · build 2026.08</p>
  </footer>`;
}

function home(): string {
  return shell(`<main id="main">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow">EXIT SURVEY / READ-ONLY CLI</p>
        <h1 id="hero-title">Map what breaks before leaving GitHub</h1>
        <p class="lede">For small software teams planning a fallback, this CLI finds repository dependencies and builds a checked migration list.</p>
        <div class="hero-actions"><a class="button primary" href="/demo" data-link>Try it with sample data</a><span>Opens a browser report. No account or token.</span></div>
        <ul class="facts" aria-label="Product facts"><li>Read-only GitHub requests</li><li>Reports stay in your output folder</li><li>$39 once; one-repository scans stay free</li></ul>
      </div>
      <figure class="hero-art"><picture><source media="(max-width: 700px)" srcset="/assets/exit-cutaway-mobile.webp"><img src="/assets/exit-cutaway.webp" width="1536" height="1024" fetchpriority="high" alt="A concrete repository model with moss tracing dependency paths through its joints."></picture><figcaption>Repository structure, seen as accumulated load.</figcaption></figure>
    </section>

    <section class="live-preview" aria-labelledby="preview-title">
      <div class="section-label"><span>01</span><p>THE PRODUCT</p></div>
      <div class="preview-copy"><h2 id="preview-title">See the exit surface, not just the git history</h2><p>Every checked area keeps its source. Missing access becomes an unknown task instead of a silent blank.</p></div>
      ${summaryStrip()}
      <div class="terminal" role="region" tabindex="0" aria-label="Terminal recording of the bundled demo">
        <div class="terminal-bar"><span>github-exit / demo</span><span aria-hidden="true">● ● ●</span></div>
        <pre tabindex="0" aria-label="Bundled demo terminal output"><code><span class="prompt">$</span> github-exit demo
Demo — sample data, nothing was uploaded.
Scanned 3 repositories.
3 checks need manual review.
Report written to /tmp/github-exit-demo-…</code></pre>
        <p>Recorded from the real bundled demo command.</p>
      </div>
      <a class="text-link" href="/demo" data-link>Open the full sample report →</a>
    </section>

    <section class="how" aria-labelledby="how-title">
      <div class="section-label"><span>02</span><p>HOW IT WORKS</p></div>
      <h2 id="how-title">Go from API evidence to a dry-run list</h2>
      <ol class="survey-steps">
        <li><span>1</span><div><h3>Scan read-only metadata</h3><p>Use one repository for free. Add a fine-grained token when private metadata needs it.</p></div></li>
        <li><span>2</span><div><h3>Check every unknown</h3><p>The report labels blocked endpoints and OAuth grant review as manual work.</p></div></li>
        <li><span>3</span><div><h3>Test the target forge</h3><p>Use the Markdown checklist during a dry run. Keep JSON for scripts and review tools.</p></div></li>
      </ol>
    </section>

    <section class="boundaries" aria-labelledby="boundaries-title">
      <div class="section-label"><span>03</span><p>BOUNDARIES</p></div>
      <div><h2 id="boundaries-title">It maps the move; it does not perform it</h2><p>The CLI does not clone code, move issues, rewrite workflows, or promise forge compatibility.</p><p>It sends GitHub API requests from your machine. Reports stay in the output folder you choose.</p></div>
      <aside><h3>Minimum access</h3><p>Public repositories work without a token. Private scans need read access for the metadata you want checked.</p></aside>
    </section>

    <section class="install" id="install" aria-labelledby="install-title">
      <div class="section-label"><span>04</span><p>INSTALL</p></div>
      <div><h2 id="install-title">Run the demo before adding a token</h2><div class="command-row"><code>github-exit demo</code><button type="button" data-copy="github-exit demo">Copy command</button></div><p>Build from source with Rust 1.85 or later, or download the Linux binary from this build.</p><div class="install-actions"><a class="button secondary" href="/downloads/github-exit-linux-x86_64" download>Download Linux binary</a><a class="text-link" href="https://github.com/B-Divyesh/sf-github-dependency-exit" rel="external">Read the source <span class="sr-only">(external site)</span> →</a></div></div>
    </section>

    <section class="price" id="price" aria-labelledby="price-title">
      <div class="price-stamp"><span>$39</span><small>ONE TIME</small></div>
      <div><p class="eyebrow">TEAM SCAN LICENSE</p><h2 id="price-title">Scan every repository under one owner</h2><p>The free command scans one repository. The license adds owner-wide scans and one combined report.</p><a class="button primary" href="${BILLING}/checkout">Buy the team scan license</a><p class="fine">Sociobot/Dodo is the merchant of record. Refunds revoke the license.</p></div>
      <form id="license-form" class="license-form"><label for="license">Have a license? Paste it here</label><div><input id="license" name="license" autocomplete="off" spellcheck="false"><button type="submit">Verify license</button></div><p id="license-status" class="status" role="status">No license saved in this browser.</p></form>
    </section>
  </main>`);
}

function demo(): string {
  const rows = inventory.checklist.map(checklistRow).join('');
  return shell(`<main id="main" class="demo-main">
    <section class="demo-head"><div><p class="eyebrow">SAMPLE / MOSSWOOD LABS</p><h1 tabindex="-1">Review the sample exit inventory</h1><p>This browser report uses the same data as <code>github-exit demo</code>.</p></div><div class="risk-block"><strong>${inventory.summary.risk_points}</strong><span>review points</span><small>Ranking only, not a time estimate</small></div></section>
    ${summaryStrip()}
    <section class="demo-controls" aria-label="Report controls"><label for="area-filter">Show checklist area</label><select id="area-filter"><option value="all">All areas</option>${[...new Set(inventory.checklist.map(i => i.area))].map(area => `<option>${escapeHtml(area)}</option>`).join('')}</select><button id="download-json" type="button">Download sample JSON</button></section>
    <section class="inventory-layout">
      <aside class="repo-list" aria-labelledby="repo-title"><h2 id="repo-title">Repositories</h2>${inventory.repositories.map((repo, index) => `<button type="button" class="repo-button${index === 0 ? ' active' : ''}" data-repo="${escapeHtml(repo.full_name)}"><span>${escapeHtml(repo.name)}</span><small>${repo.workflows.length} workflows · ${repo.webhooks.length} hooks</small></button>`).join('')}</aside>
      <div class="repo-detail" id="repo-detail">${repositoryDetail(inventory.repositories[0].full_name)}</div>
    </section>
    <section class="checklist" aria-labelledby="checklist-title"><div><p class="eyebrow">DRY-RUN LIST</p><h2 id="checklist-title">Migration checks</h2></div><div id="checklist-rows">${rows}</div><p id="empty-checklist" class="empty-state" hidden>No checks use this area. Choose another area.</p></section>
  </main>`, true);
}

function summaryStrip(): string {
  const items: Array<[string, number]> = [['repositories', inventory.summary.repositories], ['workflows', inventory.summary.workflows], ['action refs', inventory.summary.action_dependencies], ['webhooks', inventory.summary.webhooks], ['packages', inventory.summary.packages], ['unknown', inventory.summary.unknown_checks]];
  return `<dl class="summary-strip">${items.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
}

function repositoryDetail(fullName: string): string {
  const repo = inventory.repositories.find(item => item.full_name === fullName)!;
  return `<div class="detail-head"><div><p class="eyebrow">${escapeHtml(repo.visibility)} / ${repo.issues_enabled ? 'ISSUES ON' : 'ISSUES OFF'}</p><h2 tabindex="-1">${escapeHtml(repo.full_name)}</h2></div><span class="branch">branch: ${escapeHtml(repo.default_branch)}</span></div>
  <dl class="repo-counts"><div><dt>Releases</dt><dd>${repo.releases.length}</dd></div><div><dt>Rules</dt><dd>${repo.branch_rules.length}</dd></div><div><dt>Action refs</dt><dd>${repo.action_dependencies.length}</dd></div><div><dt>App signals</dt><dd>${repo.app_oauth_references.length}</dd></div></dl>
  <h3>Evidence</h3><ul class="evidence-list">${repo.evidence.map(item => `<li><span class="badge ${item.status}">${item.status === 'verified' ? '✓ verified' : '? unknown'}</span><div><strong>${escapeHtml(item.area)}</strong><p>${escapeHtml(item.note)}</p><code>${escapeHtml(item.source)}</code></div></li>`).join('')}</ul>`;
}

function checklistRow(item: Checklist): string {
  return `<article class="check-row" data-area="${escapeHtml(item.area)}"><span class="badge ${item.status}">${item.status === 'verified' ? '✓ verified' : '? unknown'}</span><div><p class="row-meta">${escapeHtml(item.repository)} / ${escapeHtml(item.area)}</p><h3>${escapeHtml(item.finding)}</h3><p><strong>Next:</strong> ${escapeHtml(item.next_step)}</p><p class="candidate"><strong>Candidate:</strong> ${escapeHtml(item.alternative)} <span class="badge ${item.alternative_status}">${item.alternative_status}</span></p><small>${escapeHtml(item.alternative_evidence)}</small></div></article>`;
}

function demoBanner(): string { return `<div class="demo-banner"><strong>Demo — sample data, nothing is saved</strong><div><button type="button" id="reset-demo">Reset demo</button><a href="/#install">Start for real</a></div></div>`; }

function privacy(): string { return legalPage('Your repository data stays with you', 'Privacy', [
  ['What the CLI reads', 'The CLI requests repository metadata from GitHub. It writes reports only to the folder you choose.'],
  ['What this site stores', 'The demo stores nothing. If you paste a license, this browser stores the token and its last verification result.'],
  ['Who receives data', 'GitHub receives API requests from the CLI. Sociobot receives a license token when you verify a purchase. Repository metadata is not sent to Sociobot.'],
  ['How to remove data', 'Delete the report folder to remove CLI output. Clear this site’s storage to remove a saved license.']
]); }
function terms(): string { return legalPage('Use the inventory as a planning aid', 'Terms', [
  ['License', 'The software is provided under the MIT License. A paid license enables owner-wide scans for one purchaser.'],
  ['No compatibility promise', 'Alternative tools are candidates, not guarantees. Test each workflow and integration before a move.'],
  ['Payments and refunds', 'Sociobot/Dodo is the merchant of record. A refund revokes the paid license.'],
  ['Your responsibility', 'Use a token you are allowed to use. Review report files before sharing them.']
]); }
function legalPage(h1: string, label: string, sections: string[][]): string { return shell(`<main id="main" class="legal"><p class="eyebrow">${label.toUpperCase()} / UPDATED 2026-08-28</p><h1 tabindex="-1">${h1}</h1><p class="lede">Plain terms for a local command-line inventory.</p>${sections.map(([title, text]) => `<section><h2>${title}</h2><p>${text}</p></section>`).join('')}</main>`); }
function notFound(): string { return shell(`<main id="main" class="not-found"><p class="coordinates">404 / PATH ENDS HERE</p><h1 tabindex="-1">This route is not in the inventory</h1><p>The page may have moved, or the address may be wrong.</p><a class="button primary" href="/" data-link>Return to the start</a></main>`); }

function render(fromPopState = false): void {
  const route = routes[location.pathname] ?? routes['/404'];
  document.title = route.title;
  updateMeta(route.title);
  app.innerHTML = route.render();
  bindNavigation(); bindCommon();
  if (location.pathname === '/demo') bindDemo();
  if (location.pathname === '/') { bindLicense(); handleLicenseReturn(); }
  const h1 = document.querySelector<HTMLHeadingElement>('h1');
  routeStatus.textContent = h1?.textContent ?? route.title;
  if (fromPopState) h1?.focus();
}

function bindNavigation(): void { document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach(link => link.addEventListener('click', event => { const url = new URL(link.href); if (url.origin !== location.origin) return; event.preventDefault(); history.pushState({}, '', url.pathname + url.hash); render(true); window.scrollTo({top: 0, behavior: 'instant'}); })); }
function bindCommon(): void { document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(button => button.addEventListener('click', async () => { await navigator.clipboard.writeText(button.dataset.copy ?? ''); button.textContent = 'Copied'; setTimeout(() => button.textContent = 'Copy command', 1400); })); }
function bindDemo(): void {
  document.querySelector('#reset-demo')?.addEventListener('click', () => { render(); document.querySelector<HTMLHeadingElement>('h1')?.focus(); routeStatus.textContent = 'Demo reset'; });
  document.querySelectorAll<HTMLButtonElement>('[data-repo]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-repo]').forEach(item => item.classList.remove('active')); button.classList.add('active'); document.querySelector('#repo-detail')!.innerHTML = repositoryDetail(button.dataset.repo!); document.querySelector<HTMLHeadingElement>('#repo-detail h2')?.focus(); }));
  document.querySelector<HTMLSelectElement>('#area-filter')?.addEventListener('change', event => { const value = (event.target as HTMLSelectElement).value; let visible = 0; document.querySelectorAll<HTMLElement>('.check-row').forEach(row => { const show = value === 'all' || row.dataset.area === value; row.hidden = !show; if (show) visible++; }); document.querySelector<HTMLElement>('#empty-checklist')!.hidden = visible > 0; });
  document.querySelector('#download-json')?.addEventListener('click', () => { const url = URL.createObjectURL(new Blob([JSON.stringify(inventory, null, 2)], {type: 'application/json'})); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'github-exit-sample-inventory.json'; anchor.click(); URL.revokeObjectURL(url); });
}

function bindLicense(): void { document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const token = new FormData(form).get('license')?.toString().trim(); if (!token) return setLicenseStatus('Paste a license token first.', false); localStorage.setItem(LICENSE_KEY, token); verifyLicense(token, true); }); const token = localStorage.getItem(LICENSE_KEY); if (token) verifyLicense(token, false); }
function handleLicenseReturn(): void { const url = new URL(location.href); const token = url.searchParams.get('license'); if (!token) return; localStorage.setItem(LICENSE_KEY, token); url.searchParams.delete('license'); history.replaceState({}, '', url.pathname + url.search + url.hash); verifyLicense(token, true); }
async function verifyLicense(token: string, force: boolean): Promise<void> { const cached = readVerdict(); if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) { setLicenseStatus(cached.valid ? 'Team scans are active on this browser.' : 'The saved license is no longer active.', cached.valid); return; } setLicenseStatus('Checking the license…', false); try { const response = await fetch(`${BILLING}/verify?license=${encodeURIComponent(token)}`); const verdict = await response.json() as {valid: boolean; reason?: string}; localStorage.setItem(VERDICT_KEY, JSON.stringify({valid: verdict.valid, checkedAt: Date.now()})); setLicenseStatus(verdict.valid ? 'Team scans are active on this browser.' : `The license is not active (${verdict.reason ?? 'invalid'}).`, verdict.valid); } catch { if (cached?.valid) setLicenseStatus('Team scans remain active from the last check. Verification is offline.', true); else setLicenseStatus('The license could not be checked. Check your connection, then try again.', false); } }
function readVerdict(): {valid: boolean; checkedAt: number} | null { try { return JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null'); } catch { return null; } }
function setLicenseStatus(message: string, valid: boolean): void { const status = document.querySelector('#license-status'); if (status) { status.textContent = message; status.classList.toggle('valid', valid); } }
function updateMeta(title: string): void { document.querySelector('meta[property="og:title"]')?.setAttribute('content', title); const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]'); if (canonical) canonical.href = `https://github-dependency-exit.sociobot.in${location.pathname}`; }
function escapeHtml(value: string): string { return value.replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]!)); }

window.addEventListener('popstate', () => render(true));
render();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => {});
