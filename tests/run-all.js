/**
 * run-all.js
 *
 * Master test runner for gh-abcs-admin workshop validation.
 * Runs all validation suites in sequence and reports aggregate results.
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Test suites in execution order (fast checks first, slow checks last)
const SUITES = [
  { name: 'Markdown Lint', cmd: 'npm run test:lint --silent', required: true },
  { name: 'Front Matter', cmd: 'npm run test:frontmatter --silent', required: true },
  { name: 'Structure', cmd: 'npm run test:structure --silent', required: true },
  { name: 'Code Blocks', cmd: 'npm run test:codeblocks --silent', required: true },
  { name: 'Mermaid Diagrams', cmd: 'npm run test:mermaid --silent', required: true },
  { name: 'Content Freshness', cmd: 'npm run test:freshness --silent', required: true },
  { name: 'Spelling', cmd: 'npm run test:spell --silent', required: true },
  { name: 'VBD Coverage Map', cmd: 'npm run test:vbd-coverage --silent', required: true },
  { name: 'Lab Completeness', cmd: 'npm run test:lab-completeness --silent', required: true },
  // Link checking is slow (network calls) — run last, can be skipped with --skip-links
  { name: 'Link Validation', cmd: 'npm run test:links --silent', required: false }
];

const skipLinks = process.argv.includes('--skip-links');
const failFast = process.argv.includes('--fail-fast');

function runSuite(suite) {
  const startTime = Date.now();
  try {
    const output = execSync(suite.cmd, {
      cwd: ROOT,
      encoding: 'utf-8',
      timeout: 300000, // 5 min timeout
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(output);
    return { name: suite.name, status: 'pass', duration };
  } catch (err) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const output = (err.stdout || '') + (err.stderr || '');
    console.log(output);
    return { name: suite.name, status: 'fail', duration, output };
  }
}

function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  gh-abcs-admin — Workshop Validation Suite              ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const results = [];
  let hasFailure = false;

  for (const suite of SUITES) {
    if (skipLinks && suite.name === 'Link Validation') {
      console.log(`⏭️  Skipping ${suite.name} (--skip-links)\n`);
      results.push({ name: suite.name, status: 'skipped', duration: '0' });
      continue;
    }

    console.log(`▶️  Running: ${suite.name}...`);
    const result = runSuite(suite);
    results.push(result);

    if (result.status === 'fail') {
      hasFailure = true;
      if (failFast) {
        console.log('\n💥 --fail-fast: stopping after first failure\n');
        break;
      }
    }
  }

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  Summary                                                ║');
  console.log('╠══════════════════════════════════════════════════════════╣');

  for (const r of results) {
    const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️';
    const dur = r.duration ? ` (${r.duration}s)` : '';
    console.log(`║  ${icon} ${r.name.padEnd(25)}${r.status.padEnd(10)}${dur.padStart(10)} ║`);
  }

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const total = results.length - skipped;

  console.log('╠══════════════════════════════════════════════════════════╣');
  const overallIcon = failed === 0 ? '✅' : '❌';
  console.log(`║  ${overallIcon} ${passed}/${total} suites passed${skipped > 0 ? ` (${skipped} skipped)` : ''}`.padEnd(59) + '║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  process.exit(failed > 0 ? 1 : 0);
}

main();
