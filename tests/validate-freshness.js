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
  },

  // ── P0: claims the Apr–Oct 2026 GitHub Changelog contradicts (corrections rows 1–14) ──
  {
    id: 'copilot-unconfigured-means-disabled',
    pattern: /\bunconfigured\b[^.\n]{0,60}?(?:treated\s+as|defaults?\s+to|=|means)\s*(?:\*\*)?\s*disabled|treated\s+as\s+disabled\s+until\s+configured/gi,
    unless: /2026-10-22|Default policy for new features/i,
    message: 'Unconfigured Copilot policies are not simply "disabled": unconfigured models follow the default model policy (on by default, enforced 2026-08-26 to 2026-09-01), and from 2026-10-22 unconfigured eligible features follow the "Default policy for new features", which ships Enabled',
    severity: 'error'
  },
  {
    id: 'copilot-mcp-disabled-by-default',
    pattern: /\bMCP\b[^.\n]{0,80}?disabled\s+by\s+default|disabled\s+by\s+default[^.\n]{0,40}?\bMCP\b/gi,
    unless: /2026-10-22|Default policy for new features/i,
    message: 'From 2026-10-22 an Unconfigured "MCP servers in Copilot" policy follows the "Default policy for new features" (Enabled by default) — give the date, not a flat "disabled by default"',
    severity: 'error'
  },
  {
    id: 'copilot-premium-requests-billing',
    pattern: /premium[\s_-]+requests?\b|\bPRUs?\b/gi,
    unless: /\b(?:before|until|prior\s+to)\s+(?:2026-06-01|June\s+1,\s+2026)|\bannual\b|\bformerly\b|\bpreviously\b|\bhistor/i,
    message: 'Copilot Business and Enterprise are billed in GitHub AI Credits since 2026-06-01; mention premium requests only as history or for annual Pro/Pro+ plans',
    severity: 'error'
  },
  {
    id: 'ghas-budgets-alert-only',
    pattern: /GHAS\s+budgets?(?:\s+alerts?)?\s+are\s+(?:\*\*)?(?:alert-only|notification-only)|(?:GHAS|license-based)[^.\n]{0,60}?cannot\s+be\s+capped|only\s+alert-only\s+budgets\s+apply|only\s+budget\s+type\s+available\s+for\s+GHAS|stop-usage`?(?:\s+budgets)?\s+(?:does|do)\s+(?:\*\*)?not(?:\*\*)?\s+(?:work\s+for|apply\s+to)\s+license-based|Alert-only\s+for\s+GHAS|licen[cs]es\s+are\s+alert-only|stop\s+usage\s+at\s+limit['’]?\s+doesn['’]t\s+apply|metered\s+products\s+only\s*[—–-]+\s*not\s+GHAS/gi,
    message: 'Since 2026-05-28 GHAS budgets can be hard limits in license count that block enabling GHAS on additional repositories; they are no longer alert-only',
    severity: 'error'
  },
  {
    id: 'cost-center-limit',
    pattern: /(?:up\s+to|maximum(?:\s+of)?|limit\s+of|exceeding\s+the)\s*(?:\*\*)?\s*(?:100|250|500)\s*(?:\*\*)?\s*cost\s+centers?|cost\s+centers?\s+per\s+enterprise\s*\|\s*(?:100|250|500)\b|\b(?:100|250|500)\/25K\b/gi,
    message: 'An enterprise can have up to 1,000 cost centers (since 2026-06-26)',
    severity: 'error'
  },
  {
    id: 'copilot-default-model-gpt-4o',
    pattern: /default\s+model[^\n]{0,40}?\bGPT-4o\b|\bGPT-4o\b[^\n]{0,40}?default\s+model/gi,
    message: 'GPT-5.3-Codex is the base model for Copilot Business and Enterprise since 2026-05-17 (long-term support model, designated 2026-03-18)',
    severity: 'error'
  },
  {
    id: 'ssh-rsa-2048-minimum',
    pattern: /\bRSA\b[^\n]{0,30}?\b2048[- ]bit\s+minimum|\b2048[- ]bit\s+minimum[^\n]{0,30}?\bRSA\b/gi,
    message: 'New RSA SSH keys must be at least 3072 bits from 2026-10-14; the ssh-rsa (SHA-1) signature type is removed on 2027-01-13',
    severity: 'error'
  },
  {
    id: 'checks-retained-400-days',
    pattern: /\bchecks?\b[^.\n]{0,40}?\b400\+?\s*(?:\*\*)?\s*days|\b400\s*\+\s*10\s+days/gi,
    unless: /\b(?:before|until|prior\s+to)\s+2026-10-01|\bpreviously\b|\bformerly\b/i,
    message: 'From 2026-10-01 checks, workflow runs and statuses follow the Actions retention setting (90 days by default), not 400 days',
    severity: 'error'
  },
  {
    id: 'content-exclusions-not-in-cli',
    pattern: /(?:exclusions?|they)\s+do\s+not\s+(?:currently\s+)?apply\s+to(?=[^\n]*\bCLI\b|[^\n]*(?:\n[ \t]*[-*][^\n]*)*?\n[ \t]*[-*][^\n]*\bCLI\b)|\bgap\s+with\s+(?:Copilot\s+)?CLI\b/gi,
    message: 'Content exclusions are generally available in Copilot CLI and the Copilot app since 2026-09-02',
    severity: 'error'
  },
  {
    id: 'github-apps-no-enterprise-access',
    pattern: /cannot\s+(?:yet\s+)?(?:be\s+given\s+permissions\s+against|access|interact\s+with)\s+the\s+enterprise(?:-level\s+API)?\s+object|but\s+not\s+the\s+enterprise\s+object|\|\s*OAuth\s+App\s*\|\s*(?:Requires\s+enterprise\s+object\s+access|Needs\s+enterprise-level\s+API\s+access)/gi,
    message: 'GitHub Apps, including third-party apps, can be installed on the enterprise account with enterprise permissions (by 2026-08-07; enterprise billing permission 2026-08-26)',
    severity: 'error'
  },
  {
    id: 'oauth-tokens-until-revoked',
    pattern: /long-lived[^|\n]{0,50}?\(?until\s+(?:the\s+user\s+)?revoke/gi,
    unless: /expiring\s+(?:access\s+)?tokens|refresh\s+tokens?|opts?\s+in\s+to|8-hour|eight\s+hours|6-month|six\s+months/i,
    message: 'OAuth apps can opt in to 8-hour access tokens with 6-month refresh tokens, on by default for new apps (2026-08-14); "long-lived until revoked" needs that caveat',
    severity: 'error'
  },
  {
    id: 'security-tab-renamed',
    pattern: /\*\*Security\*\*\s+(?:tab\b|→\s+\*\*(?:Secret\s+scanning|Code\s+scanning|Dependabot|Overview|Security\s+overview)\b)|\bSecurity\s+tab\b/gi,
    unless: /Enterprise\s+Server|\bGHES\b|\brenamed\b|\bformerly\b|before\s+2026-04-02/i,
    message: 'The Security tab is the "Security & quality" tab on github.com since 2026-04-02 (repo sidebar: Findings, Security policy)',
    severity: 'error'
  },
  {
    id: 'copilot-no-retention-absolute',
    pattern: /\bno\s+code\s+retention\b|\bcode\s+is\s+not\s+retained\b|\bdo(?:es)?\s+not\s+retain\s+prompts/gi,
    message: 'Absolute "no retention" claims need caveats (vision attachments ~24 h, agent session data export, Claude Fable 5/5.1 data retention, unified chat retained for the life of the account)',
    severity: 'error'
  },
  {
    id: 'code-quality-in-ghas-policy',
    pattern: /GHAS\s+features\s+\([^)\n]*Code\s+Quality|(?:Advanced\s+Security|GHAS)\b[^.\n|]{0,60}?\b(?:includes?|including|components?)\b[^.\n|]{0,60}?Code\s+Quality/gi,
    message: 'GitHub Code Quality is a standalone paid product (GA 2026-07-20, $10 per active committer per month), not a GHAS component',
    severity: 'error'
  },
  {
    id: 'support-portal-url',
    pattern: /support\.github\.com/gi,
    unless: /help\.github\.com/i,
    message: 'The support portal moved to help.github.com (rolling out from 2026-09-08; support.github.com works until an account moves)',
    severity: 'error'
  },
  {
    id: 'github-spark-retired',
    pattern: /\bGitHub\s+Spark\b|\bSpark\s*\((?:public\s+)?preview\)/gi,
    unless: /retir|deprecat|no\s+longer|stopped|ended|shut|2026-08-04|2026-08-31/i,
    message: 'GitHub Spark on github.com stopped accepting new users on 2026-08-04 and access ended on 2026-08-31; don\'t present it as a current plan feature',
    severity: 'error'
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
 * Reduce HTML to its visible text so a tag can't split a stale phrase. Speaker notes held in
 * data-notes attributes are kept. Newlines are kept, so line numbers still point into the
 * original file (notes text lands on the line where its tag starts).
 */
function htmlToText(html) {
  return html
    .replace(/<(style|script)\b[\s\S]*?<\/\1\s*>/gi, blankKeepingNewlines)
    .replace(/<!--[\s\S]*?-->/g, blankKeepingNewlines)
    .replace(/<[^>]*>/g, tag => {
      const notes = [...tag.matchAll(/\bdata-notes\s*=\s*"([^"]*)"/gi)].map(m => m[1].replace(/\n/g, ' '));
      return ' ' + notes.join(' ') + (notes.length ? ' ' : '') + blankKeepingNewlines(tag);
    })
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
