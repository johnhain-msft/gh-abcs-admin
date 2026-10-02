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
  // Each rule targets the claim, not one sentence: negations include contractions, numbers are bound to their
  // noun, and `unless` filters are word-bounded so they can't fire inside an unrelated word.
  {
    id: 'copilot-unconfigured-means-disabled',
    pattern: /\bunconfigured\b[^.\n]{0,80}?\b(?:treated\s+as|defaults?\s+to|equivalent\s+to|same\s+as|as\s+if\s+(?:it\s+)?(?:were|was)|means|is|are)\s*(?:\*\*)?\s*(?:disabled|off)\b|\bunconfigured\b(?:\*\*)?\s*=\s*(?:\*\*)?\s*(?:disabled|off)\b|treated\s+as\s+disabled\s+until\s+configured/gi,
    unless: /\b(?:until|before|prior\s+to)\s+2026-10-22\b|\bnot\s+(?:simply|the\s+same\s+as|equivalent\s+to)\b|\bisn['’]t\s+(?:simply|the\s+same|equivalent)\b/i,
    message: 'Unconfigured Copilot policies are not simply "disabled": unconfigured models follow the default model policy (on by default, enforced 2026-08-26 to 2026-09-01), and from 2026-10-22 unconfigured eligible features follow the "Default policy for new features", which ships Enabled',
    severity: 'error'
  },
  {
    id: 'copilot-mcp-disabled-by-default',
    pattern: /\bMCP\b[^.\n]{0,80}?\b(?:disabled|off|blocked)\s+by\s+default\b|\b(?:disabled|off)\s+by\s+default\b[^.\n]{0,40}?\bMCP\b|\bby\s+default\b[^.\n]{0,40}?\bMCP\b[^.\n]{0,40}?\b(?:disabled|off|blocked)\b|\bMCP\b[^.\n]{0,80}?\b(?:disabled|off)\s+(?:unless|until)\s+(?:an?\s+)?(?:admin|administrator|owner)/gi,
    unless: /\b(?:until|before|prior\s+to)\s+2026-10-22\b/i,
    message: 'From 2026-10-22 an Unconfigured "MCP servers in Copilot" policy follows the "Default policy for new features" (Enabled by default) — give the date, not a flat "disabled by default"',
    severity: 'error'
  },
  {
    id: 'copilot-premium-requests-billing',
    pattern: /premium[\s_-]+requests?\b|\bPRUs?\b/gi,
    unless: /\b(?:before|until|prior\s+to)\s+(?:2026-06-01|June\s+1,\s+2026)\b|\bannual\s+(?:Copilot\s+)?Pro\b|\bformerly\b|\bpreviously\b|\blegacy\b/i,
    message: 'Copilot Business and Enterprise are billed in GitHub AI Credits since 2026-06-01; mention premium requests only as history or for annual Pro/Pro+ plans',
    severity: 'error'
  },
  {
    id: 'ghas-budgets-alert-only',
    pattern: /GHAS\s+budgets?(?:\s+alerts?)?\s+are\s+(?:\*\*)?(?:alert-only|notification-only)|(?:GHAS|license-based)[^.\n]{0,60}?cannot\s+be\s+capped|only\s+alert-only\s+budgets\s+apply|only\s+budget\s+type\s+available\s+for\s+GHAS|stop-usage`?(?:\s+budgets)?\s+(?:does|do)\s+(?:\*\*)?not(?:\*\*)?\s+(?:work\s+for|apply\s+to)\s+license-based|Alert-only\s+for\s+GHAS|licen[cs]es\s+are\s+alert-only|stop\s+usage\s+at\s+limit['’]?\s+doesn['’]t\s+apply|metered\s+products\s+only\s*[—–-]+\s*not\s+GHAS|(?:GHAS|Advanced\s+Security)\s+budgets?\s+only\s+(?:send|notify|alert)|(?:GHAS|Advanced\s+Security)\s+budgets?\b[^.\n]{0,60}?\b(?:don['’]t|do\s+not|can(?:no|['’])t|cannot)\s+(?:block|stop|cap|limit)\s+(?:new\s+)?(?:usage|spend(?:ing)?|licen[cs]es?)\b|\b(?:can(?:no|['’])t|cannot)\s+cap\s+(?:GHAS|Advanced\s+Security)\b|\bbudgets?\s+for\s+(?:GHAS|Advanced\s+Security)\s+(?:are|is)\s+(?:only\s+)?(?:\*\*)?(?:alert|notification)[- ]only|stop-usage`?(?:\s+budgets?)?\s+(?:don['’]t|doesn['’]t|do\s+not|does\s+not)\s+(?:work|apply)\s+(?:for|to)\s+(?:GHAS|Advanced\s+Security|license-based)/gi,
    message: 'Since 2026-05-28 GHAS budgets can be hard limits in license count that block enabling GHAS on additional repositories; they are no longer alert-only',
    severity: 'error'
  },
  {
    id: 'cost-center-limit',
    pattern: /(?:up\s+to|maximum(?:\s+of)?|limit\s+of|exceeding\s+the)\s*(?:\*\*)?\s*(?:100|250|500)\s*(?:\*\*)?\s*cost\s+centers?|cost\s+centers?\s+per\s+enterprise\s*\|\s*(?:100|250|500)\b|\b(?:100|250|500)\/25K\b|(?<![$\d,.])\b(?:100|250|500)\s*(?:\*\*)?\s+cost[\s-]+centers?\b|\bcost[\s-]+centers?\s+(?:limit|maximum|max)\b[^.\n]{0,15}?(?<![$\d,.])\b(?:100|250|500)\b/gi,
    unless: /\bup\s+from\s+(?:100|250|500)\b|\bpreviously\b|\bformerly\b|\bbefore\s+2026-06-26\b/i,
    message: 'An enterprise can have up to 1,000 cost centers (since 2026-06-26)',
    severity: 'error'
  },
  {
    id: 'copilot-default-model-gpt-4o',
    pattern: /\bdefault\b[^.\n]{0,25}?\bmodel\b[^.\n]{0,30}?\bGPT-4(?:o|\.1)\b|\bGPT-4(?:o|\.1)\b[^.\n]{0,30}?\b(?:base|default)\s+model\b|\bGPT-4(?:o|\.1)\b\s+as\s+(?:the\s+)?(?:base|default)\b|\bbase\s+model\b[^.\n]{0,20}?\b(?:is|was)\s+GPT-4(?:o|\.1)\b/gi,
    unless: /\breplac(?:ed|es|ing)\b|\b(?:before|until)\s+2026-05-17\b|\bpreviously\b|\bformerly\b/i,
    message: 'GPT-5.3-Codex is the base model for Copilot Business and Enterprise since 2026-05-17 (long-term support model, designated 2026-03-18)',
    severity: 'error'
  },
  {
    id: 'ssh-rsa-2048-minimum',
    pattern: /\bRSA\b[^.\n]{0,60}?\b2048\b|\b2048\b[^.\n]{0,40}?\bRSA\b/gi,
    unless: /\b3072\b|\b(?:before|until|prior\s+to)\s+2026-10-14\b|\bpreviously\b|\bformerly\b|\bGPG\b/i,
    message: 'New RSA SSH keys must be at least 3072 bits from 2026-10-14; the ssh-rsa (SHA-1) signature type is removed on 2027-01-13',
    severity: 'error'
  },
  {
    id: 'checks-retained-400-days',
    pattern: /\b(?:checks?|check\s+(?:runs?|suites?|results?)|workflow\s+runs?|(?:commit\s+)?statuses)\b[^.\n]{0,50}?\b400\+?\s*(?:\*\*)?\s*days|\b400[- ]day\b[^.\n]{0,40}?\b(?:checks?|check\s+runs?|workflow\s+runs?|statuses)\b|\b400\s*\+\s*10\s+days/gi,
    unless: /\b(?:before|until|prior\s+to)\s+2026-10-01\b|\bpreviously\b|\bformerly\b|\b1\s*[–-]\s*400\s+days\b/i,
    message: 'From 2026-10-01 checks, workflow runs and statuses follow the Actions retention setting (90 days by default), not 400 days',
    severity: 'error'
  },
  {
    id: 'content-exclusions-not-in-cli',
    pattern: /(?:exclusions?|they)\s+(?:do(?:es)?\s+not|don['’]t|doesn['’]t|are\s+not|aren['’]t|is\s+not|isn['’]t)\s+(?:currently\s+|yet\s+)?(?:apply|applied|enforced|supported|respected|honou?red)\b(?=[^.\n]*\bCLI\b|[^\n]*(?:\n[ \t]*[-*][^\n]*)*?\n[ \t]*[-*][^\n]*\bCLI\b)|\bCLI\b[^.\n]{0,40}?\b(?:ignores?|bypass(?:es)?|(?:does\s+not|doesn['’]t|do\s+not|don['’]t)\s+(?:respect|honou?r|apply|support|enforce))\b[^.\n]{0,20}?\bexclusions?\b|\bgap\s+with\s+(?:Copilot\s+)?CLI\b/gi,
    message: 'Content exclusions are generally available in Copilot CLI and the Copilot app since 2026-09-02',
    severity: 'error'
  },
  {
    id: 'github-apps-no-enterprise-access',
    pattern: /(?:cannot|can['’]t|can\s+not)\s+(?:yet\s+)?(?:be\s+given\s+permissions\s+against|access|interact\s+with)\s+the\s+enterprise(?:-level\s+API)?\s+object|but\s+not\s+the\s+enterprise\s+object|\|\s*OAuth\s+App\s*\|\s*(?:Requires\s+enterprise\s+object\s+access|Needs\s+enterprise-level\s+API\s+access)|\bApps?\b[^.\n]{0,60}?\b(?:cannot|can['’]t|can\s+not|do\s+not|don['’]t|does\s+not|doesn['’]t)\s+(?:yet\s+)?(?:have\s+access\s+to|access|interact\s+with|be\s+installed\s+on|be\s+given\s+permissions\s+(?:against|on))\s+(?:the\s+|an?\s+)?enterprise\b(?:\s+(?:object|account|level))?/gi,
    message: 'GitHub Apps, including third-party apps, can be installed on the enterprise account with enterprise permissions (by 2026-08-07; enterprise billing permission 2026-08-26)',
    severity: 'error'
  },
  {
    id: 'oauth-tokens-until-revoked',
    pattern: /long-lived[^|\n]{0,50}?\(?until\s+(?:the\s+user\s+)?revoke|\bOAuth\b[^.\n]{0,60}?\b(?:never\s+expire|(?:do\s+not|don['’]t|does\s+not|doesn['’]t)\s+expire|(?:valid|lasts?|lives?)\s+until\s+(?:the\s+user\s+)?revok)/gi,
    unless: /expiring\s+(?:access\s+)?tokens|refresh\s+tokens?|opts?\s+in\s+to|8-hour|eight\s+hours|6-month|six\s+months/i,
    message: 'OAuth apps can opt in to 8-hour access tokens with 6-month refresh tokens, on by default for new apps (2026-08-14); "long-lived until revoked" needs that caveat',
    severity: 'error'
  },
  {
    id: 'security-tab-renamed',
    pattern: /\*\*Security\*\*\s+(?:tab\b|(?:→|>)\s+\*\*(?:Secret\s+scanning|Code\s+scanning|Dependabot|Overview|Security\s+overview)\b)|(?<!(?:Advanced|Code)\s)\bSecurity\s+(?:tab|page)\b|(?<!Settings\**\s*(?:→|>)\s*\**)(?<!(?:Advanced|Code)\s)\bSecurity\s*(?:→|>)\s*(?:Secret\s+scanning|Code\s+scanning|Dependabot\s+alerts|Overview|Security\s+overview)\b/gi,
    unless: /\brenamed\b|\bformerly\b|\bbefore\s+2026-04-02\b|(?<!\band\s)\b(?:GitHub\s+Enterprise\s+Server|GHES)\b(?!\s*(?:and|,)\s)/i,
    message: 'The Security tab is the "Security & quality" tab on github.com since 2026-04-02 (repo sidebar: Findings, Security policy)',
    severity: 'error'
  },
  {
    id: 'copilot-no-retention-absolute',
    pattern: /\bno\s+(?:code|data|prompt)\s+retention\b|\bcode\s+is\s+not\s+retained\b|\b(?:do(?:es)?\s+not|don['’]t|doesn['’]t|never)\s+(?:retains?|stores?|keeps?)\s+(?:your\s+)?(?:code|prompts|suggestions)\b|\b(?:prompts|suggestions|code\s+snippets)\b[^.\n]{0,40}?\b(?:discarded|deleted)\s+(?:immediately|as\s+soon\s+as|after)\b/gi,
    unless: /\bcode\s+completions?\b/i,
    message: 'Absolute "no retention" claims need caveats (vision attachments ~24 h, agent session data export, Claude Fable 5/5.1 data retention, unified chat retained for the life of the account)',
    severity: 'error'
  },
  {
    id: 'code-quality-in-ghas-policy',
    pattern: /GHAS\s+features\s+\([^)\n]*Code\s+Quality|(?:Advanced\s+Security|GHAS)\b[^.\n|]{0,60}?\b(?:includes?|including|components?)\b[^.\n|]{0,60}?Code\s+Quality|\bCode\s+Quality\b[^.\n|]{0,30}?(?<!\bnot\s)(?<!n['’]t\s)\b(?:part\s+of|included\s+(?:in|with)|bundled\s+(?:in|with)|a\s+(?:component|feature)\s+of)\s+(?:GitHub\s+)?(?:Advanced\s+Security|GHAS|Code\s+Security)\b/gi,
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
    pattern: /\bGitHub\s+Spark\b|\bSpark\s*\((?:public\s+)?preview\)|\b(?:includes?|adds?|offers?|gets?)\s+(?:GitHub\s+)?Spark\b/gi,
    unless: /\bretir(?:ed|es|ing|ement)\b|\bdeprecat(?:ed|es|ing|ion)\b|\bno\s+longer\b|\bstopped\b|\bended\b|\bshut\b|\b2026-08-0?4\b|\b2026-08-31\b/i,
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
