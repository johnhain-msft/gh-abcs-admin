/**
 * validate-links.js
 *
 * Batch wrapper around markdown-link-check for all markdown files.
 * Uses link-check-config.json for configuration.
 * Runs checks in parallel (limited concurrency) and reports results.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const {
  findValidationFiles,
  rootPath,
  Reporter
} = require('./utils');

const reporter = new Reporter('Link Validation');

const CONFIG_PATH = rootPath('link-check-config.json');
const MAX_CONCURRENCY = 4;

async function checkFile(relPath) {
  const absPath = rootPath(relPath);
  const configArg = fs.existsSync(CONFIG_PATH) ? `--config "${CONFIG_PATH}"` : '';

  try {
    execSync(
      `npx markdown-link-check "${absPath}" ${configArg} --quiet`,
      {
        cwd: rootPath(),
        timeout: 60000,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      }
    );
    reporter.pass(`${relPath}: all links valid`);
  } catch (err) {
    const output = (err.stdout || '') + (err.stderr || '');
    // Parse output for specific failures
    const failLines = output.split('\n').filter(l => l.includes('[✖]') || l.includes('[x]'));
    if (failLines.length > 0) {
      for (const line of failLines) {
        reporter.fail(relPath, line.trim());
      }
    } else {
      // Timeout or other error
      reporter.warn(relPath, `Link check issue: ${output.substring(0, 200)}`);
    }
  }
}

async function main() {
  // Check if markdown-link-check is available
  try {
    execSync('npx markdown-link-check --version', {
      cwd: rootPath(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch {
    reporter.fail('(global)', 'markdown-link-check not available — run npm install');
    reporter.report();
    process.exit(1);
  }

  const allFiles = await findValidationFiles({ includeReadme: true });

  console.log(`  Checking links in ${allFiles.length} files (this may take a minute)...`);

  // Process files in batches
  for (let i = 0; i < allFiles.length; i += MAX_CONCURRENCY) {
    const batch = allFiles.slice(i, i + MAX_CONCURRENCY);
    await Promise.all(batch.map(f => checkFile(f)));
  }

  const success = reporter.report();
  process.exit(success ? 0 : 1);
}

main().catch(err => {
  console.error('Link validation failed:', err);
  process.exit(1);
});
