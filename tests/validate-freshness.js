/**
 * validate-freshness.js
 *
 * Flags known deprecated patterns, URLs, and references in markdown files.
 * Checks for:
 * - Deprecated GitHub features (e.g., legacy branch protection when rulesets exist)
 * - Outdated action versions (e.g., actions/github-script@v6)
 * - Known-stale URLs
 * - Deprecated terminology
 */

const {
  findValidationFiles,
  readFile,
  Reporter
} = require('./utils');

const reporter = new Reporter('Content Freshness Validation');

// Patterns to flag with explanations
const DEPRECATED_PATTERNS = [
  {
    pattern: /actions\/github-script@v[1-6]\b/g,
    message: 'Outdated actions/github-script version (current is v7+)',
    severity: 'warn'
  },
  {
    pattern: /actions\/checkout@v[1-3]\b/g,
    message: 'Outdated actions/checkout version (current is v4+)',
    severity: 'warn'
  },
  {
    pattern: /actions\/setup-node@v[1-3]\b/g,
    message: 'Outdated actions/setup-node version (current is v4+)',
    severity: 'warn'
  },
  {
    pattern: /github\.com\/features\/security/g,
    message: 'GitHub Advanced Security is now split into Secret Protection and Code Security (April 2025)',
    severity: 'warn'
  },
  {
    pattern: /docs\.github\.com\/en\/github\//g,
    message: 'Outdated docs.github.com URL pattern (old /en/github/ path)',
    severity: 'warn'
  },
  {
    pattern: /\bGitHub Advanced Security\b(?!.*(?:now|formerly|legacy|previously|was|Secret Protection|Code Security))/g,
    message: 'GHAS is now split into GitHub Secret Protection and GitHub Code Security (April 2025) — verify context',
    severity: 'warn'
  },
  {
    pattern: /\bsave-state\b|set-output.*>>.*GITHUB_OUTPUT/g,
    message: 'Deprecated Actions command (set-output/save-state) — use $GITHUB_OUTPUT/$GITHUB_STATE',
    severity: 'warn'
  },
  {
    pattern: /::set-output\s+name=/g,
    message: 'Deprecated Actions ::set-output command — use $GITHUB_OUTPUT',
    severity: 'warn'
  },
  {
    pattern: /\bnode12\b|\bnode16\b/gi,
    message: 'Outdated Node.js runtime reference — Actions now use node20+',
    severity: 'warn'
  }
];

// Files where deprecated patterns appear in educational/security-example context
// and should be suppressed (not false positives — intentionally demonstrating the pattern)
const CONTEXTUAL_SUPPRESSIONS = {
  'docs/17-github-actions-security-echo-command-injection.md': [
    '::set-output'  // Security education: demonstrates command injection attack vector
  ]
};

async function main() {
  const allFiles = await findValidationFiles({ includeReadme: true });

  let totalFlags = 0;

  for (const relPath of allFiles) {
    try {
      const content = readFile(relPath);
      const suppressions = CONTEXTUAL_SUPPRESSIONS[relPath] || [];

      for (const check of DEPRECATED_PATTERNS) {
        const matches = content.match(check.pattern);
        if (matches) {
          for (const match of matches) {
            // Skip if this match is suppressed for this file
            if (suppressions.some(s => match.includes(s))) continue;

            totalFlags++;
            if (check.severity === 'error') {
              reporter.fail(relPath, `${check.message} — found: "${match}"`);
            } else {
              reporter.warn(relPath, `${check.message} — found: "${match}"`);
            }
          }
        }
      }

      reporter.pass(`${relPath}: freshness checked`);
    } catch (err) {
      reporter.fail(relPath, `Error reading: ${err.message}`);
    }
  }

  console.log(`  📊 Total freshness flags: ${totalFlags}`);
  const success = reporter.report();
  process.exit(success ? 0 : 1);
}

main().catch(err => {
  console.error('Freshness validation failed:', err);
  process.exit(1);
});
