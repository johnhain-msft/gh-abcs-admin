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
 *   unless    optional RegExp; a match is ignored when the clause around it (its sentence, table cell or
 *             semicolon-separated part; see clauseAround) matches this
 *   since     'YYYY-MM-DD' the claim went stale (claim rules). A match is then also ignored when the clause is a
 *             question, when its table row is a timeline entry (first cell is a date), when the clause dates it
 *             (until/before any date, or since/from/on/in a date on or after `since`), or when a history word is
 *             attached to it ("was", "no longer", "previously 250", "replaced GPT-4.1 as", "limit raised to 500").
 *             See isCorrective.
 */

// Building blocks for the claim patterns, so every window stays inside one clause.
// S: one character of the same clause: not a newline, semicolon, table pipe or sentence-ending dot. A dot followed by
//    anything but whitespace or a closing mark (GitHub.com, 1.122, e.g.,) doesn't end the clause.
const S = String.raw`(?:[^.\n;|]|\.(?=[^\s*_"'’”)\]]))`;
// T: the same, but able to cross table cells, for "| key | value |" rows.
const T = String.raw`(?:[^.\n;]|\.(?=[^\s*_"'’”)\]]))`;
// NEG: the next word isn't negated ("not", "n't", "never", "no longer"), allowing bold markers in between.
const NEG = String.raw`(?<!\bnot\s+(?:\*\*)?)(?<!n['’]t\s+(?:\*\*)?)(?<!\bnever\s+(?:\*\*)?)(?<!\bno\s+longer\s+(?:\*\*)?)`;
// A window character that can't step onto one of `words` (or "n't").
const notAcross = (words, base = S) => String.raw`(?:(?!\b(?:${words})\b|n['’]t\b)${base})`;
const claim = (source, flags = 'gi') => new RegExp(source, flags);

const CC_LIMIT = String.raw`(?<![$\d,.])(?:100|250|500)(?![\d,]|\.\d)`;
const GPT_OLD = String.raw`GPT-4(?:o|\.1)\b(?!-)`;
const MODEL_W = notAcross(String.raw`not|no|never|instead|replac\w*|rather|than|except|unlike|from|post|posts|blog|changelog|announcement`);
const MIN_2048 = String.raw`(?:(?:\b(?:at\s+least|minimum(?:\s+(?:of|size|length|key\s+size))?(?:\s+is)?|min\.?|(?:no\s+)?(?:shorter|smaller|less|fewer)\s+than|under|below)|>=|≥)\s*:?\s*(?:\*\*)?2048\b|\b2048(?:[- ]bits?)?(?:\*\*)?\s+(?:minimum|min\b|or\s+(?:more|larger|longer|greater|higher|stronger|above))|\baccepts?\s+(?:\*\*)?2048(?:[- ]bits?)?\b)`;
const CLI_AHEAD = String.raw`(?=${S}*\bCLI\b|[^\n]*(?:\n[ \t]*[-*][^\n]*)*?\n[ \t]*[-*][^\n]*\bCLI\b)`;
const CQ_W = notAcross('not|except|excluding|without|separate|separately|standalone');

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
  // Each rule catches the likely phrasings of one claim, not every possible one: windows stay inside one clause (S, T),
  // negated forms are skipped (NEG, notAcross), and dated, historical or corrective wording is left to the shared
  // filter that `since` turns on. `unless` holds only true statements that look like the claim.
  {
    id: 'copilot-unconfigured-means-disabled',
    since: '2026-08-26',
    pattern: claim(
      String.raw`(?:\bun|\bnot\s+|n['’]t\s+)configured\b(?:\*\*)?${notAcross('not|distinct|different|separate|rather|instead|unlike|than|versus|vs|turn|turns|turning|set|sets|setting|switch|toggle|follow|follows|following|inherit|inherits|inheriting|enabled|decide')}{0,60}?\b(?:disabled|disables|off|blocks|blocked)\b` +
      String.raw`|\|\s*(?:\*\*)?Unconfigured(?:\*\*)?\s*\|\s*(?:\*\*)?(?:treated\s+as\s+)?(?:disabled|off)\b` +
      String.raw`|treated\s+as\s+disabled\s+until\s+(?:it\s+is\s+|it['’]s\s+|explicitly\s+)?configured`),
    // Previews stay opt-in, and the Default policy for new features can be set to Disabled
    unless: /\bpreview\b|\bDefault\s+policy\s+for\s+new\s+features\b[^.;|]{0,40}\bDisabled\b/i,
    message: 'Unconfigured Copilot policies are not simply "disabled": unconfigured models follow the default model policy (on by default, enforced 2026-08-26 to 2026-09-01), and from 2026-10-22 unconfigured eligible features follow the "Default policy for new features", which ships Enabled',
    severity: 'error'
  },
  {
    id: 'copilot-mcp-disabled-by-default',
    since: '2026-10-22',
    pattern: claim(
      String.raw`\bMCP\b${S}{0,80}?${NEG}\b(?:disabled|off|blocked)\s+by\s+default\b` +
      String.raw`|\b(?:disabled|off)\s+by\s+default\b${S}{0,40}?\bMCP\b` +
      String.raw`|\bby\s+default\b${S}{0,40}?\bMCP\b${S}{0,40}?${NEG}\b(?:disabled|off|blocked)\b` +
      String.raw`|\bMCP\b${S}{0,80}?${NEG}\b(?:disabled|off|blocked)\s+(?:unless|until)\s+(?:an?\s+|the\s+|your\s+)?(?:enterprise\s+|organi[sz]ation\s+|org\s+)?(?:admin|administrator|owner)` +
      String.raw`|\bMCP\b${S}{0,60}?(?:\b(?:is|are)\s+not|\b(?:is|are)n['’]t)\s+(?:\*\*)?enabled(?:\*\*)?\s+by\s+default\b` +
      String.raw`|\bMCP\b${S}{0,40}?\b(?:is|are)\s+(?:an?\s+)?opt-in\b` +
      String.raw`|\bMCP\b${S}{0,60}?${NEG}\bdefaults?\s+to\s+(?:\*\*)?(?:disabled|off)\b` +
      String.raw`|\b(?:admins?|administrators?|owners?)\s+(?:must|need\s+to|have\s+to)\s+(?:explicitly\s+)?(?:enable|turn\s+on|opt\s+in\s+to)\b${S}{0,40}?\bMCP\b` +
      String.raw`|\bby\s+default\b${S}{0,30}?(?:can['’]t|cannot|can\s+not)\s+(?:use|access|call|connect\s+to)\b${S}{0,20}?\bMCP\b` +
      String.raw`|\b(?:ships?|comes?)\s+with\s+MCP\b${S}{0,20}?\b(?:turned\s+off|disabled|off)\b` +
      String.raw`|(?:can['’]t|cannot|can\s+not)\s+use\s+(?:\w+\s+)?MCP\b${S}{0,30}?\buntil\s+(?:an?\s+|the\s+|your\s+)?(?:enterprise\s+|organi[sz]ation\s+|org\s+)?(?:admin|administrator|owner)` +
      String.raw`|\bMCP\b[^|\n]{0,40}\|\s*(?:\*\*)?(?:disabled|off)\b(?:\*\*)?[^|\n]{0,15}\bdefault\b`),
    // Telling an admin how to keep MCP off is a correct instruction, not the claim
    unless: /\bto\s+keep\b|\bmust\s+stay\b|\bset(?:s|ting)?\b[^.;|]{0,80}\bto\s+(?:\*\*)?Disabled\b/i,
    message: 'From 2026-10-22 an Unconfigured "MCP servers in Copilot" policy follows the "Default policy for new features" (Enabled by default) — give the date, not a flat "disabled by default"',
    severity: 'error'
  },
  {
    id: 'copilot-premium-requests-billing',
    since: '2026-06-01',
    pattern: claim(
      String.raw`(?<![A-Za-z])premium(?:\s+model)?[\s_-]+requests?\b|\bPRUs?\b|\brequests?\s+(?:to|for)\s+premium\s+models?\b` +
      String.raw`|\b\d+(?:\.\d+)?\s*[x×]\s+(?:premium\s+)?request\s+multipliers?\b|\$0\.04\s+(?:per|a|an|\/)\s*(?:premium\s+)?request\b`),
    // Annual Pro/Pro+ plans keep request-based billing ("these subscribers" refers back to them); historical reports
    // and the legacy endpoints still list premium requests
    unless: /\b[Aa]nnual\b.*\bPro\b|\bPro\+?\s.*\b[Aa]nnual\b|\b(?:[Tt]hese|[Tt]hose)\s+(?:subscribers|plans|subscriptions)\b|\b[Hh]istorical\s+(?:usage\s+)?(?:reports?|data|usage|records?|billing)\b|\bstill\s+documented\b/,
    message: 'Copilot Business and Enterprise are billed in GitHub AI Credits since 2026-06-01; mention premium requests only as history or for annual Pro/Pro+ plans',
    severity: 'error'
  },
  {
    id: 'ghas-budgets-alert-only',
    since: '2026-05-28',
    pattern: claim(
      String.raw`GHAS\s+budgets?(?:\s+alerts?)?\s+are\s+(?:\*\*)?(?:alert-only|notification-only)` +
      String.raw`|(?:GHAS|Advanced\s+Security|license-based)\b${S}{0,60}?(?:can['’]t|cannot|can\s+not|won['’]t)\s+be\s+(?:capped|limited|stopped|blocked)\b` +
      String.raw`|only\s+alert-only\s+budgets\s+apply|only\s+budget\s+type\s+available\s+for\s+GHAS` +
      String.raw`|stop-usage\x60?(?:\s+budgets)?\s+(?:does|do)\s+(?:\*\*)?not(?:\*\*)?\s+(?:work\s+for|apply\s+to)\s+license-based` +
      String.raw`|Alert-only\s+for\s+GHAS|licen[cs]es\s+are\s+alert-only|stop\s+usage\s+at\s+limit['’]?\s+doesn['’]t\s+apply` +
      String.raw`|metered\s+products\s+only\s*[—–-]+\s*not\s+GHAS` +
      String.raw`|(?:(?:GHAS|Advanced\s+Security)\s+budgets?|budgets?\s+(?:on|for)\s+(?:GHAS|(?:GitHub\s+)?Advanced\s+Security))\s+(?:can\s+|will\s+)?(?:only|just)\s+(?:triggers?|sends?|notif(?:y|ies)|alerts?|emails?|warns?)\b` +
      String.raw`|(?:GHAS|Advanced\s+Security)\s+budgets?\b${S}{0,40}?\b(?:don['’]t|do\s+not|can(?:no|['’])t|cannot|never)\s+(?:enforce|set|apply|have)\s+(?:an?\s+)?(?:hard|spending|usage)\s+(?:limits?|caps?)\b` +
      String.raw`|(?:GHAS|Advanced\s+Security)\s+budgets?\b${S}{0,60}?\b(?:don['’]t|do\s+not|can(?:no|['’])t|cannot|won['’]t|will\s+not)\s+(?:block|stop|cap|limit)\s+(?:new\s+)?(?:usage|spend(?:ing)?|licen[cs]es?)\b` +
      String.raw`|\b(?:can(?:no|['’])t|cannot)\s+cap\s+(?:GHAS|Advanced\s+Security)\b` +
      String.raw`|\bbudgets?\s+for\s+(?:GHAS|Advanced\s+Security)\s+(?:are|is)\s+(?:only\s+)?(?:\*\*)?(?:alert|notification)[- ]only` +
      String.raw`|stop-usage\x60?(?:\s+budgets?)?\s+(?:don['’]t|doesn['’]t|do\s+not|does\s+not)\s+(?:work|apply)\s+(?:for|to)\s+(?:GHAS|Advanced\s+Security|license-based)` +
      String.raw`|\bno\s+(?:hard|stop[- ]usage|spending)\s+limits?\s+(?:for|on)\s+(?:GHAS|(?:GitHub\s+)?Advanced\s+Security)\b` +
      String.raw`|(?:GHAS|Advanced\s+Security)\s+budgets?\s+(?:have|has)\s+no\s+(?:hard|stop)` +
      String.raw`|(?:can['’]t|cannot|can\s+not)\s+set\s+an?\s+(?:hard|spending|usage)\s+limits?\s+(?:on|for)\s+(?:GHAS|(?:GitHub\s+)?Advanced\s+Security)\b` +
      String.raw`|\bbudgets?\s+(?:can['’]t|cannot|can\s+not|don['’]t|do\s+not|won['’]t|will\s+not)\s+(?:block|stop|cap|limit)\s+(?:GHAS|(?:GitHub\s+)?Advanced\s+Security)\s+(?:usage|spend(?:ing)?|licen[cs]es?)\b`),
    // True per the docs: a hard limit blocks new enablement only; repositories with GHAS stay billed
    unless: /\balready\s+(?:enabled|active)\b|\b(?:enabled|existing)\s+repositor(?:y|ies)\b|\bstill\s+billed\b|\bwithout\s+(?:the|that|this|a)\s+(?:limit|stop|hard)\b|\beven\s+with\b|\bexactly\b/i,
    message: 'Since 2026-05-28 GHAS budgets can be hard limits in license count that block enabling GHAS on additional repositories; they are no longer alert-only',
    severity: 'error'
  },
  {
    id: 'cost-center-limit',
    since: '2026-06-26',
    pattern: claim(
      String.raw`(?:\bup\s+to|\bmaximum(?:\s+of)?:?|\bmax(?:imum)?\s*:|\blimit(?:ed)?\s+(?:of|to|is)|\bat\s+most|\bexceeding\s+the)\s*(?:\*\*)?\s*${CC_LIMIT}\s*(?:\*\*)?\s*cost[\s-]+centers?\b` +
      String.raw`|\bcost[\s-]+centers?\b(?:\s+per\s+enterprise)?(?:\*\*)?\s*[:|]\s*(?:\*\*)?\s*(?:up\s+to\s+|max(?:imum)?(?:\s+of)?\s+)?(?:\*\*)?${CC_LIMIT}\b(?!\s*(?:users?|resources?|members?|repositor|seats?|people))` +
      String.raw`|\b${CC_LIMIT}\/25K\b` +
      String.raw`|\b(?:supports?|allows?|can\s+(?:create|have|add|define))\s+(?:up\s+to\s+)?(?:\*\*)?${CC_LIMIT}\s*(?:\*\*)?\s*cost[\s-]+centers?\b` +
      String.raw`|${CC_LIMIT}\s*(?:\*\*)?\s+cost[\s-]+centers?\s+per\s+enterprise\b` +
      String.raw`|\bcost[\s-]+centers?\s+(?:limit|maximum|max)\b${S}{0,15}?(?<!\bfrom\s)${CC_LIMIT}\b` +
      String.raw`|\b(?:cap|limit|maximum|max)\s+(?:on|for)\s+(?:the\s+(?:number\s+of\s+)?)?cost[\s-]+centers?\s+(?:is|=|:)\s*(?:\*\*)?${CC_LIMIT}\b` +
      String.raw`|\blimit\s+of\s+(?:\*\*)?${CC_LIMIT}(?:\*\*)?\s+(?:on|for)\s+(?:the\s+(?:number\s+of\s+)?)?cost[\s-]+centers?\b`),
    message: 'An enterprise can have up to 1,000 cost centers (since 2026-06-26)',
    severity: 'error'
  },
  {
    id: 'copilot-default-model-gpt-4o',
    since: '2026-05-17',
    pattern: claim(
      String.raw`\b(?:default|base|fallback)\b${MODEL_W}{0,25}?\bmodel\b(?:\*\*)?\s*(?:\|\s*)?${MODEL_W}{0,30}?\b${GPT_OLD}` +
      String.raw`|\b${GPT_OLD}${MODEL_W}{0,30}?\b(?:is|as|remains)\s+(?:the\s+)?(?:\w+\s+)?(?:base|default|fallback)(?:\s+model)?\b` +
      String.raw`|\buses?\s+(?:\*\*)?${GPT_OLD}(?:\*\*)?\s+by\s+default\b` +
      String.raw`|\bdefaults?\s+to\s+(?:\*\*)?${GPT_OLD}` +
      String.raw`|\b(?:when|if)\s+no\s+(?:other\s+)?model\s+is\s+(?:selected|chosen|approved|enabled|available)\b${S}{0,30}?\b(?:uses?|falls?\s+back\s+to|defaults?\s+to)\s+(?:\*\*)?${GPT_OLD}`),
    message: 'GPT-5.3-Codex is the base model for Copilot Business and Enterprise since 2026-05-17 (long-term support model, designated 2026-03-18)',
    severity: 'error'
  },
  {
    id: 'ssh-rsa-2048-minimum',
    since: '2026-10-14',
    // 2048 stated as the minimum or as accepted for new keys; existing 2048-bit keys keep working
    pattern: claim(
      String.raw`\bRSA\b${S}{0,60}?${MIN_2048}` +
      String.raw`|${MIN_2048}${S}{0,40}?\bRSA\b` +
      String.raw`|\b(?:minimum|smallest|shortest|lowest)\b${S}{0,25}?\bRSA\b${S}{0,30}?\b2048\b` +
      String.raw`|\brequires?\s+RSA\s+keys?\s+(?:to\s+(?:be|have)\s+)?(?:\*\*)?2048(?:[- ]bits?)?\b` +
      String.raw`|\bssh-keygen\b[^\n]{0,40}?-b\s+2048\b`),
    // Not SSH keys
    unless: /\bGPG\b|\bPGP\b|\bSAML\b|\bcertificates?\b|\bTLS\b|\bS\/MIME\b/i,
    message: 'New RSA SSH keys must be at least 3072 bits from 2026-10-14; the ssh-rsa (SHA-1) signature type is removed on 2027-01-13',
    severity: 'error'
  },
  {
    id: 'checks-retained-400-days',
    since: '2026-10-01',
    pattern: claim(
      String.raw`\b(?:checks?(?:\s+(?:runs?|suites?|results?|data))?|CI\s+results|workflow\s+runs?|run\s+history|(?:commit\s+)?statuses)\b${S}{0,50}?\b400\+?\s*(?:\*\*)?\s*days?\b` +
      String.raw`|\b400[- ]day\b${S}{0,40}?\b(?:checks?|check\s+runs?|workflow\s+runs?|statuses|CI\s+results)\b` +
      String.raw`|\b400\s*\+\s*10\s+days`),
    // The retention setting itself still goes up to 400 days for private repositories
    unless: /\bup\s+to\s+400\b|\b1\s*[–-]\s*400\b|\bfollows?\s+(?:the\s+)?(?:Actions\s+)?retention\s+setting\b|\bgoverned\s+by\b/i,
    message: 'From 2026-10-01 checks, workflow runs and statuses follow the Actions retention setting (90 days by default), not 400 days',
    severity: 'error'
  },
  {
    id: 'content-exclusions-not-in-cli',
    since: '2026-09-02',
    pattern: claim(
      String.raw`(?:exclusions?|they)\s+(?:do(?:es)?\s+not|don['’]t|doesn['’]t|are\s+not|aren['’]t|is\s+not|isn['’]t)\s+(?:currently\s+|yet\s+)?(?:apply|applied|enforced|supported|respected|honou?red|available|effective)\b${CLI_AHEAD}` +
      String.raw`|\bexclusions?\b${S}{0,20}?\b(?:have|has)\s+no\s+(?:effect|impact)\b(?=${S}*\bCLI\b)` +
      String.raw`|\bCLI\b${S}{0,40}?\b(?:ignores?|bypass(?:es)?|(?:does\s+not|doesn['’]t|do\s+not|don['’]t)\s+(?:respect|honou?r|apply|support|enforce))\b${S}{0,20}?\bexclusions?\b` +
      String.raw`|\bexcluded\s+(?:files?|content|paths?|repositor(?:y|ies))\b${S}{0,30}?\b(?:visible|available|accessible|readable)\s+(?:to|in)\s+(?:the\s+)?(?:Copilot\s+)?CLI\b` +
      String.raw`|\bexclusions?\b${S}{0,20}?\bonly\s+(?:work|apply)\b(?=${S}*\bnot\s+(?:in\s+|for\s+|to\s+|with\s+)?(?:the\s+)?(?:Copilot\s+)?CLI\b)` +
      String.raw`|\b(?:don['’]t|do\s+not|never)\s+rely\s+on\s+(?:content\s+)?exclusions?\b${S}{0,25}?\bCLI\b` +
      String.raw`|\bexclusions?\b${S}{0,15}?\b(?:are|is)\s+(?:ignored|skipped|bypassed)\s+(?:by|in)\s+(?:the\s+)?(?:Copilot\s+)?CLI\b` +
      String.raw`|\bCLI\b${S}{0,20}?\b(?:isn['’]t|is\s+not|aren['’]t|are\s+not)\s+(?:covered|protected)\s+by\s+(?:content\s+)?exclusions?\b` +
      String.raw`|\bgap\s+with\s+(?:Copilot\s+)?CLI\b`),
    message: 'Content exclusions are generally available in Copilot CLI and the Copilot app since 2026-09-02',
    severity: 'error'
  },
  {
    id: 'github-apps-no-enterprise-access',
    since: '2026-08-07',
    pattern: claim(
      String.raw`(?:cannot|can['’]t|can\s+not)\s+(?:yet\s+)?(?:be\s+given\s+permissions\s+against|access|interact\s+with)\s+the\s+enterprise(?:-level\s+API)?\s+object` +
      String.raw`|but\s+not\s+the\s+enterprise\s+object` +
      String.raw`|\|\s*OAuth\s+App\s*\|\s*(?:Requires\s+enterprise\s+object\s+access|Needs\s+enterprise-level\s+API\s+access)` +
      String.raw`|\bApps?\b${S}{0,60}?\b(?:cannot|can['’]t|can\s+not|do\s+not|don['’]t|does\s+not|doesn['’]t)\s+(?:yet\s+)?(?:have\s+access\s+to|access|interact\s+with|be\s+installed\s+(?:on|at|in)|be\s+given\s+permissions\s+(?:against|on))\s+(?:the\s+|an?\s+)?enterprise\b(?:[\s-]+(?:object|account|level))?` +
      String.raw`|\bApps?\b${S}{0,30}?\b(?:are|is)\s+(?:only\s+)?(?:limited|restricted|scoped)\s+to\s+(?:the\s+)?(?:organi[sz]ations?|orgs?|repositor(?:y|ies)|repos?)\b(?!${S}{0,40}?\benterprise)` +
      String.raw`|\bonly\s+(?:OAuth\s+apps?|PATs?|personal\s+access\s+tokens?|classic\s+(?:PATs?|tokens?))\b${S}{0,40}?\b(?:can|may)\s+(?:call|access|use|reach)\s+(?:the\s+)?enterprise\b` +
      String.raw`|\b(?:can['’]t|cannot|can\s+not)\s+install\s+(?:an?\s+|the\s+)?(?:GitHub\s+)?Apps?\s+on\s+(?:the\s+|an?\s+|your\s+)?enterprise\b` +
      String.raw`|\benterprise(?:[- ]level)?\s+(?:APIs?|endpoints?)\b${S}{0,20}?\b(?:aren['’]t|are\s+not|isn['’]t|is\s+not)\s+(?:available|accessible)\s+(?:to|for)\s+(?:GitHub\s+)?Apps?\b` +
      String.raw`|\bApps?\b${S}{0,20}?\b(?:don['’]t|do\s+not|can['’]t|cannot)\s+work\s+(?:at|on)\s+the\s+enterprise(?:\s+level)?\b` +
      String.raw`|\bApps?\b${S}{0,20}?\bcan\s+only\s+be\s+installed\s+on\s+(?:organi[sz]ations?|orgs?|repositor(?:y|ies)|user\s+accounts?|personal\s+accounts?)\b`),
    // True per the docs: apps owned outside the enterprise, apps installed on an organization, some enterprise APIs,
    // and apps limited to the owning enterprise's organizations stay out of reach
    unless: /\bowned\s+(?:by\s+(?:an?\s+)?(?:account|organi[sz]ation|user)\s+)?outside\b|\boutside\s+(?:of\s+)?(?:your|the|their|its)\s+(?:own\s+)?enterprise\b|\b(?:they|it)\s+(?:don['’]t|doesn['’]t|do\s+not|does\s+not)\s+belong\s+to\b|\bApps?\s+installed\s+on\s+(?:an?\s+|the\s+)?organi[sz]ation\b|\b(?:some|certain|several|not\s+all)\s+(?:of\s+the\s+)?enterprise\b|\b(?:some|certain|several|many|most|not\s+all)\s+(?:GitHub\s+)?apps?\b|\bevery\s+enterprise\s+API\b|\bunless\s+(?:it['’]s|it\s+is|they['’]re|they\s+are)\s+installed\s+on\s+(?:the\s+|an?\s+)?enterprise\b|\bowning\s+enterprise\b|\bsame\s+enterprise\b/i,
    message: 'GitHub Apps, including third-party apps, can be installed on the enterprise account with enterprise permissions (by 2026-08-07; enterprise billing permission 2026-08-26)',
    severity: 'error'
  },
  {
    id: 'oauth-tokens-until-revoked',
    since: '2026-08-14',
    pattern: claim(
      String.raw`long-lived[^|\n]{0,50}?\(?until\s+(?:the\s+user\s+)?revoke` +
      String.raw`|\bOAuth\b${S}{0,60}?\b(?:never\s+expire|(?:do\s+not|don['’]t|does\s+not|doesn['’]t)\s+expire|(?:have|has)\s+no\s+expir(?:y|ation)|(?:do\s+not|don['’]t|does\s+not|doesn['’]t)\s+have\s+an?\s+expir(?:y|ation)` +
      String.raw`|(?:valid|active|permanent|lasts?|lives?|works?|good)\s+until\s+(?:the\s+user\s+|someone\s+|an?\s+(?:admin|administrator|user|owner)\s+|you\s+)?revok` +
      String.raw`|(?:valid|active|permanent|lasts?|lives?|works?|good)\s+until\s+(?:it|they)(?:['’](?:s|re)|\s+(?:is|are|gets?|get))\s+revoked)`),
    unless: /expiring\s+(?:access\s+)?tokens|refresh\s+tokens?|opts?\s+in\s+to|8-hour|eight\s+hours|6-month|six\s+months/i,
    message: 'OAuth apps can opt in to 8-hour access tokens with 6-month refresh tokens, on by default for new apps (2026-08-14); "long-lived until revoked" needs that caveat',
    severity: 'error'
  },
  {
    id: 'security-tab-renamed',
    since: '2026-04-02',
    // Case-sensitive: the UI label is "Security"; "Authentication security" is a different page
    pattern: claim(
      String.raw`(?<!Settings\**\s*(?:→|>)\s*)\*\*Security\*\*\s+(?:[Tt]ab\b|(?:→|>)\s+\*\*(?!Code\s+security\b|Advanced\s+Security\b)[A-Z])` +
      String.raw`|(?<!(?:[Aa]dvanced|[Cc]ode|[Aa]uthentication)\s)\b[Ss]ecurity\s+(?:[Tt]ab|[Pp]age)\b` +
      String.raw`|(?<!Settings\**\s*(?:→|>)\s*\**)(?<!(?:Advanced|Code)\s)\bSecurity\s*(?:→|>)\s*\**(?:Secret\s+scanning|Code\s+scanning|Dependabot(?:\s+alerts)?|Overview|Security\s+overview|Advisories|Campaigns|Findings|Assessments)\b` +
      String.raw`|\b(?:[Ss]elect|[Cc]lick|[Oo]pen|[Cc]hoose)\s+(?:the\s+)?\**Security\**\s+(?:in|on|from)\s+(?:the\s+)?(?:[\w’']+\s+){0,2}?(?:navigation|nav)\b` +
      String.raw`|\b[Uu]nder\s+\**Security\**,?\s+(?:open|select|click|choose|go\s+to)\s+\**(?:Secret\s+scanning|Code\s+scanning|Dependabot(?:\s+alerts)?|Advisories|Overview|Security\s+overview|Campaigns)\b`,
      'g'),
    // GHES keeps the Security tab; a clause about GHES alone is not about github.com
    unless: /\brenamed\b|^(?=.*\b(?:GHES|GitHub\s+Enterprise\s+Server)\b)(?!.*\b(?:GitHub\.com|GHE\.com|GHEC|Enterprise\s+Cloud)\b)/i,
    message: 'The Security tab is the "Security & quality" tab on github.com since 2026-04-02 (repo sidebar: Findings, Security policy)',
    severity: 'error'
  },
  {
    id: 'copilot-no-retention-absolute',
    since: '2026-06-09',
    pattern: claim(
      String.raw`\bno\s+(?:code|data|prompt)\s+retention\b` +
      String.raw`|\b(?:code|prompts?|suggestions?)\s+(?:is|are)\s+(?:not|never)\s+(?:retained|stored|kept|saved|logged)\b` +
      String.raw`|\b(?:code|prompts?|suggestions?)\s+(?:isn['’]t|aren['’]t)\s+(?:retained|stored|kept|saved|logged)\b` +
      String.raw`|\b(?:do(?:es)?\s+not|don['’]t|doesn['’]t|never|won['’]t|will\s+not)\s+(?:retains?|stores?|keeps?|saves?|logs?)\s+(?:any\s+(?:of\s+)?)?(?:your\s+)?(?:code|prompts?|suggestions?)\b` +
      String.raw`|\b(?:prompts|suggestions|code\s+snippets)\b${S}{0,40}?\b(?:discarded|deleted)\s+(?:immediately|as\s+soon\s+as|once|right\s+after|after(?!\s+\d))` +
      String.raw`|\b(?:discards?|deletes?|drops?)\s+(?:all\s+)?(?:\w+\s+)?(?:prompts|suggestions|code)\s+(?:right\s+away|immediately|at\s+once|instantly)\b`),
    // Scoped statements are true: IDE code completions, a named model provider, zero data retention, exceptions
    unless: /\bcode\s+completions?\b|\b(?:Anthropic|OpenAI|Google|Fireworks(?:\s+AI)?|xAI|model\s+providers?|hosting\s+(?:partners?|providers?))\b|\bzero\s+data\s+retention\b|\b(?:other\s+than|except(?:\s+for)?|apart\s+from|aside\s+from|excluding)\b/i,
    message: 'Absolute "no retention" claims need caveats (vision attachments ~24 h, agent session data export, Claude Fable 5/5.1 data retention, unified chat retained for the life of the account)',
    severity: 'error'
  },
  {
    id: 'code-quality-in-ghas-policy',
    since: '2026-07-20',
    pattern: claim(
      String.raw`GHAS\s+features\s+\((?:(?!\b(?:not|except|excluding)\b)[^)\n])*Code\s+Quality` +
      String.raw`|(?:Advanced\s+Security|GHAS)\b${CQ_W}{0,60}?\b(?:includes?|including|components?|comes?\s+with|bundles?|covers?)\b${CQ_W}{0,60}?Code\s+Quality` +
      String.raw`|\bCode\s+Quality\b${S}{0,30}?${NEG}\b(?:part\s+of|included\s+(?:in|with)|bundled\s+(?:in|with)|an?\s+(?:component|feature|part)\s+of)\s+(?:the\s+)?(?:GitHub\s+)?(?:Advanced\s+Security|GHAS|Code\s+Security)\b` +
      String.raw`|\bCode\s+Quality\s+is\s+an?\s+(?:GHAS|(?:GitHub\s+)?Advanced\s+Security)\s+(?:feature|component|capability|product)\b` +
      String.raw`|\bCode\s+Quality\s+(?:ships|comes)\s+with\s+(?:GitHub\s+)?(?:Advanced\s+Security|GHAS)\b` +
      String.raw`|\bwith\s+(?:GHAS|(?:GitHub\s+)?Advanced\s+Security)\b${CQ_W}{0,30}?\b(?:get|gets|receive|receives)\b${CQ_W}{0,20}?\bCode\s+Quality\b` +
      String.raw`|(?<!\b(?:not|outside|separate\s+from|apart\s+from)\b[^.;|\n]{0,15})(?:Advanced\s+Security|GHAS)(?:\*\*)?\s*[:=]\s*(?:\*\*)?${CQ_W}{0,80}?\bCode\s+Quality\b`),
    message: 'GitHub Code Quality is a standalone paid product (GA 2026-07-20, $10 per active committer per month), not a GHAS component',
    severity: 'error'
  },
  {
    id: 'support-portal-url',
    since: '2026-09-08',
    pattern: /support\.github\.com/gi,
    // support.github.com stays valid for accounts that haven't moved yet
    unless: /help\.github\.com|\bhaven['’]t\s+(?:yet\s+)?moved\b|\bnot\s+(?:yet\s+)?(?:been\s+)?moved\b|\byet\s+to\s+(?:be\s+)?move(?:d)?\b|\buntil\s+(?:your|the|an?|their|its)\s+account\s+(?:moves|is\s+moved|has\s+moved)\b|\bhave\s+access\s+yet\b|\buntil\s+access\b|\b(?:continues?|keeps?)\s+(?:to\s+)?work(?:ing)?\b/i,
    message: 'The support portal moved to help.github.com (rolling out from 2026-09-08; support.github.com works until an account moves)',
    severity: 'error'
  },

  // ── Found during P1 integration: GitHub Spark presented as a current plan feature ──
  {
    id: 'github-spark-retired',
    since: '2026-08-04',
    pattern: claim(
      String.raw`\bGitHub\s+Spark\b(?!\s+AI\s+credits?)` +
      String.raw`|\bSpark\s*\((?:public\s+)?preview\)` +
      String.raw`|\b(?:includes?|including|adds?|offers?|gets?|comes?\s+with)\s+(?:GitHub\s+)?Spark\b(?!\s+AI\s+credits?)` +
      String.raw`|(?<!Apache\s)\bSpark\s+(?:is|are)\s+(?:included|available|part)\b` +
      String.raw`|\|\s*(?:\*\*)?(?:GitHub\s+)?Spark(?:\*\*)?\s*\|\s*(?:✓|✅|Yes\b|Included\b)`),
    unless: /\bretir(?:ed|es|ing|ement)\b|\bdeprecat(?:ed|es|ing|ion)\b|\bdiscontinu(?:ed|es|ing|ation)\b|\bremov(?:ed|al)\b|\bshut(?:s|ting)?\s+down\b|\bshutdown\b|\bsunset\b|\bended\b|\bstopped\b/i,
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

// ── Clause scoping ──
const CLAUSE_STOPS = '\n;|';
const CLOSING_MARKS = '*_"\'’”)]';

/** True when text[i] ends a sentence: . ! or ? followed (after any closing marks) by whitespace or the end. */
function isSentenceEnd(text, i) {
  const ch = text[i];
  if (ch !== '.' && ch !== '!' && ch !== '?') return false;
  let j = i + 1;
  while (j < text.length && CLOSING_MARKS.includes(text[j])) j++;
  if (j < text.length && !/\s/.test(text[j])) return false;
  return !(ch === '.' && /(?:^|\W)(?:e\.g|i\.e|etc|vs|approx|incl|cf)\.$/i.test(text.slice(Math.max(0, i - 7), i + 1)));
}

/**
 * The clause around text[start, end): bounded by a newline, a semicolon, a table pipe or a sentence end. A match that
 * spans a pipe keeps both cells. Returns { start, end, question } where question means the clause ends with "?".
 */
function clauseAround(text, start, end) {
  let s = start;
  while (s > 0 && !CLAUSE_STOPS.includes(text[s - 1]) && !isSentenceEnd(text, s - 1)) s--;
  while (s < start && CLOSING_MARKS.includes(text[s])) s++;
  let e = end;
  while (e < text.length && !CLAUSE_STOPS.includes(text[e]) && !isSentenceEnd(text, e)) e++;
  const question = text[e] === '?';
  if (e < text.length && isSentenceEnd(text, e)) e++;
  return { start: s, end: e, question };
}

// ── The shared corrective filter for claim rules (rules with `since`) ──
const MONTH = String.raw`Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?`;
const DATE = String.raw`\d{4}-\d{2}-\d{2}|(?:${MONTH})\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\d{1,2}\s+(?:${MONTH})\s+\d{4}|(?:${MONTH})\s+\d{4}`;
const NEW_STATE_WORDS = String.raw`since|from|starting(?:\s+(?:on|from|in))?|as\s+of|effective(?:\s+(?:on|from))?|after|beginning(?:\s+(?:on|in))?|on\s+or\s+after|on|in`;
const OLD_STATE_WORDS = String.raw`until|till|before|prior\s+to|through|up\s+until|ahead\s+of`;
const DATED = new RegExp(String.raw`\b(${NEW_STATE_WORDS}|${OLD_STATE_WORDS})\s+(?:the\s+)?(?:\*\*)?(${DATE})\b`, 'gi');
const OLD_STATE = new RegExp(String.raw`^(?:${OLD_STATE_WORDS})$`, 'i');
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** 'YYYY-MM-DD' for an ISO, "Month D, YYYY", "D Month YYYY" or "Month YYYY" date (a month alone means its 1st). */
function isoDate(text) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const two = n => String(n).padStart(2, '0');
  const month = name => two(MONTHS.indexOf(name.slice(0, 3).toLowerCase()) + 1);
  let m = /^([A-Za-z]+)\.? (\d{1,2})(?:st|nd|rd|th)?,? (\d{4})$/.exec(t);
  if (m) return `${m[3]}-${month(m[1])}-${two(m[2])}`;
  m = /^(\d{1,2}) ([A-Za-z]+) (\d{4})$/.exec(t);
  if (m) return `${m[3]}-${month(m[2])}-${two(m[1])}`;
  m = /^([A-Za-z]+) (\d{4})$/.exec(t);
  return m ? `${m[2]}-${month(m[1])}-01` : null;
}

// Past tense, a transition or a change verb inside the match: "GPT-4o was the default model", "MCP servers are no
// longer off", "cost center limit raised to 500".
const HISTORY_IN_MATCH = /(?<!\bas\s+(?:if|though)\s+(?:it|they|this|that)\s+)\b(?:was|were)\b|\bno\s+longer\b|\bused\s+to\b|\bpreviously\b|\bformerly\b|\bhad\s+been\b|\b(?:raised|increased|doubled|lowered|reduced|changed|replaced|retired|renamed|removed|ended)\b/i;
// In the three words before the match: "previously 250 cost centers", "replaced GPT-4.1 as the base model", "moved
// from premium requests", or an assumption being described rather than made ("rely on 'Unconfigured' behaving as off").
const HISTORY_BEFORE = /\b(?:previously|formerly|originally|historically|used\s+to|no\s+longer|legacy|old|replac(?:ed|es|ing)|superseded|renamed|retired|removed|raised|increased|doubled|instead\s+of|rel(?:y|ies|ied|ying)\s+on|assum(?:e|es|ed|ing)|expect(?:s|ed|ing)?)\b|\bup\s+from\b|\b(?:moved|switched|migrated|changed|transitioned)\s+(?:away\s+)?from\b/i;
// Right after the match: "GitHub Spark was created", "premium requests no longer apply".
const HISTORY_AFTER = /^\W*(?:was|were)\b|^(?:\W*\w+){0,3}?\W*(?:no\s+longer|(?:has|have)\s+been\s+(?:replaced|retired|removed|renamed|superseded|discontinued|deprecated)|(?:is|are)\s+being\s+(?:retired|replaced|removed|deprecated))\b/i;
const NO_MORE = /\bany\s?more\b/i;
// A table row whose first cell is a date ("| 2026-06-10 | Up to 500 cost centers |") is a timeline entry: history.
const TIMELINE_ROW = new RegExp(String.raw`^\s*\|\s*(?:\*\*)?(?:${DATE})(?:\*\*)?\s*\|`, 'i');

function lineAround(text, index) {
  const start = text.lastIndexOf('\n', index - 1) + 1;
  const end = text.indexOf('\n', index);
  return text.slice(start, end === -1 ? text.length : end);
}

/**
 * True when the clause dates or corrects the claim matched at clause[matchStart, matchEnd): "until"/"before" any
 * date, "since"/"from" a date on or after `since`, "anymore", or a history word attached to the match. A history word
 * elsewhere in the clause doesn't count ("Up to 250 cost centers per enterprise (previously 100)" is still stale).
 */
function isCorrective(since, clause, matchStart, matchEnd) {
  for (const m of clause.matchAll(DATED)) {
    if (OLD_STATE.test(m[1].replace(/\s+/g, ' '))) return true;
    const date = isoDate(m[2]);
    if (date && date >= since) return true;
  }
  if (HISTORY_IN_MATCH.test(clause.slice(matchStart, matchEnd))) return true;
  const before = clause.slice(0, matchStart).split(/\s+/).filter(Boolean).slice(-3).join(' ');
  if (HISTORY_BEFORE.test(before)) return true;
  if (HISTORY_AFTER.test(clause.slice(matchEnd))) return true;
  return NO_MORE.test(clause);
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
      const at = clauseAround(text, m.index, m.index + match.length);
      const clause = text.slice(at.start, at.end);
      if (rule.unless && rule.unless.test(clause)) continue;
      if (rule.since) {
        if (at.question || TIMELINE_ROW.test(lineAround(text, m.index))) continue;
        const offset = m.index - at.start;
        if (isCorrective(rule.since, clause, offset, offset + match.length)) continue;
      }

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
  clauseAround,
  isCorrective,
  scanContent,
  findFreshnessFiles
};

if (require.main === module) {
  main().catch(err => {
    console.error('Freshness validation failed:', err);
    process.exit(1);
  });
}
