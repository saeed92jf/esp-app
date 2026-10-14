import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const isWatch = args.includes('--watch');
const isSchedule = args.includes('--schedule');
const isQuick = args.includes('--quick');

// Interval in minutes for scheduled runs (default: 60 minutes)
const intervalArg = args.find((a) => a.startsWith('--interval='));
const intervalMinutes = intervalArg ? parseInt(intervalArg.split('=')[1], 10) : 60;

function printHeader(title: string) {
  const line = '═'.repeat(60);
  console.log('\n\x1b[36m%s\x1b[0m', line);
  console.log('\x1b[1m\x1b[36m  🚀 %s\x1b[0m', title);
  console.log('\x1b[36m%s\x1b[0m\n', line);
}

function runPlaywrightTests(): boolean {
  printHeader(`Running Full UI, Links & Capabilities Test Suite [${new Date().toLocaleTimeString()}]`);
  try {
    execSync('npx playwright test', {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, FORCE_COLOR: '1' },
    });
    console.log('\n\x1b[32m✔ All UI tests, links, and capabilities passed successfully!\x1b[0m\n');
    return true;
  } catch {
    console.error('\n\x1b[31m✖ Some UI or link tests failed. Check report above.\x1b[0m\n');
    return false;
  }
}

async function runQuickCrawl(): Promise<boolean> {
  printHeader(`Running Quick HTTP & Link Crawler [${new Date().toLocaleTimeString()}]`);
  const { getTestMatrix, extractNavigationLinks } = await import('../tests/helpers/route-discovery');

  const matrix = getTestMatrix(['fa', 'en']);
  const navItems = extractNavigationLinks();

  console.log(`Discovered ${matrix.length} localized routes and ${navItems.length} navigation items.\n`);

  const port = process.env.PORT || '4000';
  const baseUrl = `http://localhost:${port}`;
  let passed = 0;
  let failed = 0;

  for (const item of matrix) {
    const url = `${baseUrl}${item.fullUrl}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (res.status < 400) {
        console.log(`\x1b[32m✔ [${res.status}]\x1b[0m ${item.fullUrl}`);
        passed++;
      } else {
        console.log(`\x1b[31m✖ [${res.status}]\x1b[0m ${item.fullUrl}`);
        failed++;
      }
    } catch (err: any) {
      console.log(`\x1b[31m✖ [ERROR]\x1b[0m ${item.fullUrl} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\nResults: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m\n`);
  return failed === 0;
}

async function main() {
  if (isQuick) {
    await runQuickCrawl();
    return;
  }

  if (isWatch) {
    printHeader('Starting UI Test Suite in Watch Mode (Trigger on File Changes)');
    console.log('Watching src/ directory for changes...\n');

    let debounceTimer: NodeJS.Timeout | null = null;
    fs.watch(path.join(process.cwd(), 'src'), { recursive: true }, (event, filename) => {
      if (!filename || filename.includes('.next') || filename.includes('node_modules')) return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log(`\n\x1b[33m⚡ File change detected:\x1b[0m ${filename}`);
        runPlaywrightTests();
      }, 1500);
    });

    // Run initial test
    runPlaywrightTests();
    return;
  }

  if (isSchedule) {
    printHeader(`Scheduled UI Test Daemon (Every ${intervalMinutes} minutes)`);
    console.log(`Next execution will run automatically in ${intervalMinutes} minutes.\n`);

    // Run immediately on start
    runPlaywrightTests();

    // Schedule recurring runs
    setInterval(() => {
      runPlaywrightTests();
    }, intervalMinutes * 60 * 1000);
    return;
  }

  // Default single run
  const ok = runPlaywrightTests();
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal scheduler error:', err);
  process.exit(1);
});
