/**
 * validate-freshness.js
 *
 * Flags known deprecated patterns, URLs, and references in the workshop content
 * (Markdown under docs/ and labs/, README.md, and the HTML slide decks under docs/).
 * Checks for:
 * - Deprecated GitHub features (e.g., legacy branch protection when rulesets exist)
 * - Outdated action versions (e.g., actions/github-script@v6)
 * - Known-stale URLs
 * - Deprecated terminology
 *
 * Rules with severity 'error' fail the run; 'warn' rules only report.
 * Every rule must have fixtures in tests/unit/freshness-rules.test.js.
 */

const {
  findValidationFiles,
  findMarkdownFiles,
  readFile,
  toPosixPath,
  Reporter
} = require('./utils');

/**
 * Rule shape:
 *   id        unique kebab-case id (used by the unit tests)
 *   pattern   global RegExp, matched against the whole file (HTML is reduced to text first)
 *   message   what is stale and what is true now
 *   severity  'warn' | 'error'
 *   files     optional RegExp; the rule only applies to matching forward-slash paths
 *   unless    optional RegExp; a match is ignored when its line matches this
 */
const DEPRECATED_PATTERNS = [
  {
    id: 'github-script-version',
    pattern: /actions\/github-script@v[1-6]\b/g,
    message: 'Outdated actions/github-script version (current is v7+)',
    severity: 'warn'
  },
  {
    id: 'checkout-version',
    pattern: /actions\/checkout@v[1-3]\b/g,
    message: 'Outdated actions/checkout version (current is v4+)',
    severity: 'warn'
  },
  {
    id: 'setup-node-version',
    pattern: /actions\/setup-node@v[1-3]\b/g,
    message: 'Outdated actions/setup-node version (current is v4+)',
    severity: 'warn'
  },
  {
    id: 'features-security-url',
    pattern: /github\.com\/features\/security/g,
    message: 'GitHub Advanced Security is now split into Secret Protection and Code Security (April 2025)',
    severity: 'warn'
  },
  {
    id: 'docs-en-github-url',
    pattern: /docs\.github\.com\/en\/github\//g,
    message: 'Outdated docs.github.com URL pattern (old /en/github/ path)',
    severity: 'warn'
  },
  {
    id: 'ghas-single-sku',
    pattern: /\bGitHub Advanced Security\b(?!.*(?:now|formerly|legacy|previously|was|Secret Protection|Code Security))/g,
    message: 'GHAS is now split into GitHub Secret Protection and GitHub Code Security (April 2025) — verify context',
    severity: 'warn'
  },
  {
    id: 'save-state-command',
    pattern: /\bsave-state\b|set-output.*>>.*GITHUB_OUTPUT/g,
    message: 'Deprecated Actions command (set-output/save-state) — use $GITHUB_OUTPUT/$GITHUB_STATE',
    severity: 'warn'
  },
  {
    id: 'set-output-command',
    pattern: /::set-output\s+name=/g,
    message: 'Deprecated Actions ::set-output command — use $GITHUB_OUTPUT',
    severity: 'warn'
  },
  {
    id: 'node-runtime-version',
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

const HTML_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rarr: '→', larr: '←', mdash: '—', ndash: '–', hellip: '…',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', times: '×', middot: '·', bull: '•'
};

function blankKeepingNewlines(text) {
  return text.replace(/[^\n]/g, '');
}

/**
 * Reduce HTML to its visible text so a tag can't split a stale phrase. Newlines are kept,
 * so line numbers still point into the original file.
 */
function htmlToText(html) {
  return html
    .replace(/<(style|script)\b[\s\S]*?<\/\1\s*>/gi, blankKeepingNewlines)
    .replace(/<!--[\s\S]*?-->/g, blankKeepingNewlines)
    .replace(/<[^>]*>/g, tag => ' ' + blankKeepingNewlines(tag))
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name) => {
      if (name[0] === '#') {
        const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
        return String.fromCodePoint(code);
      }
      return HTML_ENTITIES[name.toLowerCase()] ?? entity;
    });
}

function lineAt(text, index) {
  const start = text.lastIndexOf('\n', index - 1) + 1;
  const end = text.indexOf('\n', index);
  return text.slice(start, end === -1 ? text.length : end);
}

/**
 * Scan one file's content against every rule.
 * Pure: no I/O. Returns [{ id, file, line, match, message, severity }].
 */
function scanContent(relPath, content) {
  const file = toPosixPath(relPath);
  const text = file.endsWith('.html') ? htmlToText(content) : content;
  const suppressions = CONTEXTUAL_SUPPRESSIONS[file] || [];
  const findings = [];

  for (const rule of DEPRECATED_PATTERNS) {
    if (rule.files && !rule.files.test(file)) continue;

    for (const m of text.matchAll(rule.pattern)) {
      const match = m[0];
      if (suppressions.some(s => match.includes(s))) continue;
      if (rule.unless && rule.unless.test(lineAt(text, m.index))) continue;

      findings.push({
        id: rule.id,
        file,
        line: text.slice(0, m.index).split('\n').length,
        match,
        message: rule.message,
        severity: rule.severity
      });
    }
  }

  return findings;
}

async function findFreshnessFiles() {
  const markdown = await findValidationFiles({ includeReadme: true });
  const html = await findMarkdownFiles('docs/**/*.html');
  return [...markdown, ...html];
}

async function main() {
  const reporter = new Reporter('Content Freshness Validation');
  const allFiles = await findFreshnessFiles();

  let totalFlags = 0;

  for (const relPath of allFiles) {
    try {
      const findings = scanContent(relPath, readFile(relPath));

      for (const f of findings) {
        totalFlags++;
        const where = `${f.file}:${f.line}`;
        if (f.severity === 'error') {
          reporter.fail(where, `${f.message} — found: "${f.match}"`);
        } else {
          reporter.warn(where, `${f.message} — found: "${f.match}"`);
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

module.exports = {
  DEPRECATED_PATTERNS,
  CONTEXTUAL_SUPPRESSIONS,
  htmlToText,
  scanContent,
  findFreshnessFiles
};

if (require.main === module) {
  main().catch(err => {
    console.error('Freshness validation failed:', err);
    process.exit(1);
  });
}
