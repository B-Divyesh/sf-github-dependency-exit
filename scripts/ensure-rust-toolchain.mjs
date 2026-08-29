import { spawnSync } from 'node:child_process';

const toolchain = '1.85.0';
const listed = spawnSync('rustup', ['toolchain', 'list'], { encoding: 'utf8' });

if (listed.error) {
  console.error('Rustup is required to provision the Rust 1.85.0 minimum supported toolchain. Install rustup, then rerun npm test.');
  process.exit(1);
}

if (!listed.stdout.split(/\r?\n/).some(line => line.startsWith(`${toolchain}-`) || line === toolchain)) {
  console.log(`Installing Rust ${toolchain} for the minimum-version claim…`);
  const install = spawnSync('rustup', ['toolchain', 'install', toolchain, '--profile', 'minimal'], { stdio: 'inherit' });
  if (install.status !== 0) {
    console.error(`Could not install Rust ${toolchain}. Check network access, then run: rustup toolchain install ${toolchain} --profile minimal`);
    process.exit(install.status ?? 1);
  }
}
