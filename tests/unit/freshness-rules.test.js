/**
 * Unit tests for tests/validate-freshness.js.
 *
 * FIXTURES is the contract for every rule in DEPRECATED_PATTERNS: each rule id must have at
 * least one positive fixture (stale text the rule must flag) and one negative fixture
 * (corrected text, or a known false-positive trap, that the rule must not flag).
 * A fixture is a string, or { file, text } when the rule or a suppression depends on the path.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const freshness = require('../validate-freshness');

const { DEPRECATED_PATTERNS, CONTEXTUAL_SUPPRESSIONS, scanContent } = freshness;

const DEFAULT_FILE = 'docs/99-fixture.md';

const FIXTURES = {
  // ── Characterization of the rules that existed before the 2026-10 refresh (all 'warn') ──
  'github-script-version': {
    severity: 'warn',
    positive: ['      - uses: actions/github-script@v6'],
    negative: ['      - uses: actions/github-script@v7']
  },
  'checkout-version': {
    severity: 'warn',
    positive: ['      - uses: actions/checkout@v3'],
    negative: ['      - uses: actions/checkout@v4']
  },
  'setup-node-version': {
    severity: 'warn',
    positive: ['      - uses: actions/setup-node@v2'],
    negative: ['      - uses: actions/setup-node@v4']
  },
  'features-security-url': {
    severity: 'warn',
    positive: ['See https://github.com/features/security for details.'],
    negative: ['See https://github.com/security/advanced-security for details.']
  },
  'docs-en-github-url': {
    severity: 'warn',
    positive: ['https://docs.github.com/en/github/authenticating-to-github'],
    negative: ['https://docs.github.com/en/enterprise-cloud@latest/authentication']
  },
  'ghas-single-sku': {
    severity: 'warn',
    positive: ['Enable GitHub Advanced Security for every repository.'],
    negative: ['GitHub Advanced Security is now split into GitHub Secret Protection and GitHub Code Security.']
  },
  'save-state-command': {
    severity: 'warn',
    positive: ['echo "::save-state name=pid::123"'],
    negative: ['echo "pid=123" >> "$GITHUB_STATE"']
  },
  'set-output-command': {
    severity: 'warn',
    positive: ['echo "::set-output name=result::ok"'],
    negative: [
      'echo "result=ok" >> "$GITHUB_OUTPUT"',
      // Suppressed: docs/17 demonstrates the injection vector on purpose, on any path separator
      { file: 'docs/17-github-actions-security-echo-command-injection.md', text: 'echo "::set-output name=x::y"' },
      { file: 'docs\\17-github-actions-security-echo-command-injection.md', text: 'echo "::set-output name=x::y"' }
    ]
  },
  'node-runtime-version': {
    severity: 'warn',
    positive: ['  using: node16'],
    negative: ['  using: node20']
  },

  // ── P0: stale claims from the Apr–Oct 2026 changelog review (all 'error') ──
  // Positives are verbatim stale lines from the workshop at 787ebb6.
  'copilot-unconfigured-means-disabled': {
    severity: 'error',
    positive: [
      '- **Unconfigured**: Initial placeholder state (treated as disabled until configured)',
      '4. If the enterprise policy is set to **Unconfigured**, affected org policies default to **Disabled** — this prevents accidental over-permissiveness.',
      { file: 'docs/slides-fixture.html', text: '<aside class="notes">Each policy has 3 states at org level: Enabled, Disabled, Unconfigured. Unconfigured = disabled until explicitly set.</aside>' }
    ],
    negative: [
      'From 2026-10-22, eligible generally available features left **Unconfigured** follow the **Default policy for new features**, which ships **Enabled**.',
      'Until 2026-10-22, an Unconfigured feature policy is treated as disabled.',
      // Trap: a real setting label for enterprise-assigned users, not the Unconfigured state
      '- **Disable by default**: Features default to disabled unless explicitly enabled'
    ]
  },
  'copilot-mcp-disabled-by-default': {
    severity: 'error',
    positive: [
      '- **Enterprise policy:** "MCP servers in Copilot" toggle (AI Controls → MCP) — disabled by default for Business/Enterprise',
      '- **Disabled by default** — admins must explicitly enable MCP'
    ],
    negative: [
      'Until 2026-10-22 the **MCP servers in Copilot** policy is disabled by default; from 2026-10-22 an Unconfigured MCP policy follows the Default policy for new features.',
      // Trap: other features that really are off by default
      'Enterprise owners must explicitly enable IP address disclosure — it\'s off by default.',
      'The Claude Fable 5.1 policy is off by default.'
    ]
  },
  'copilot-premium-requests-billing': {
    severity: 'error',
    positive: [
      'It uses GitHub Actions minutes and Copilot premium requests from monthly allowances.',
      '- Speaker Notes: Copilot premium requests allocate to the cost center of the user\'s organization.',
      '# Create a budget for Copilot premium requests at the enterprise level',
      { file: 'docs/slides-fixture.html', text: '<li>Set <strong>budget alerts</strong> on premium request spend</li>' },
      'Overage is billed per PRU.'
    ],
    negative: [
      'Copilot Business and Enterprise are billed in **GitHub AI Credits** from 2026-06-01; included usage is pooled.',
      // Traps: history and the annual Pro/Pro+ exception are legitimate
      'Before 2026-06-01, usage beyond the monthly allowance was billed as premium requests.',
      'Annual Copilot Pro and Pro+ subscribers keep premium requests until their plan expires.',
      'Business = Standard + premium models'
    ]
  },
  'ghas-budgets-alert-only': {
    severity: 'error',
    positive: [
      '> **Critical distinction**: GHAS budget alerts are **notification-only** — they send email alerts at default thresholds of 75%, 90%, and 100% of the configured budget but **do not block usage**.',
      'Unlike metered products (Actions, Codespaces, Packages), GHAS licensing cannot be capped by a platform-enforced spending limit.',
      'GHAS is a license-based product, so **only alert-only budgets apply** — `stop-usage` budgets do not work for license-based products like GHAS:',
      '| **Alert-only** | Notifications sent; scanning continues | ✅ The only budget type available for GHAS |',
      '| Assuming budget alerts will cap GHAS spend | They won\'t — GHAS budgets are alert-only. Cost control requires manual governance |',
      { file: 'docs/slides-fixture.html', text: '<aside class="notes">GHAS and Copilot seat licenses are alert-only — stop-usage does not apply to license-based products.</aside>' },
      { file: 'docs/slides-fixture.html', text: '<li><strong>⚠️ Alert-only for GHAS</strong> — stop-usage budgets do <em>not</em> apply to license-based products</li>' },
      '"One thing to be aware of: GHAS is license-based, not metered, so \'stop usage at limit\' doesn\'t apply the same way it does for Actions minutes or Packages storage. Budget alerts are your main control lever."',
      { file: 'docs/slides-fixture.html', text: '<tr><td>Stop-usage</td><td>Block further usage at threshold <em>(metered products only — not GHAS)</em></td></tr>' }
    ],
    negative: [
      'Since 2026-05-28, GHAS budgets can be **hard limits** in license count: once reached, GHAS can\'t be enabled on additional repositories.',
      // Trap: the generic description of the alert-only budget type is still correct
      '| **Alert-only** | Sends notifications when thresholds are reached; usage continues |'
    ]
  },
  'cost-center-limit': {
    severity: 'error',
    positive: [
      '| Maximum cost centers per enterprise | 250 |',
      '| Exceeding the 250 cost center limit | Cannot model fine-grained hierarchy |',
      '- Speaker Notes: Cost centers group resources for billing allocation. Up to 100 cost centers per enterprise.',
      { file: 'docs/slides-fixture.html', text: '<strong>Key limits:</strong> Up to <strong>250 cost centers</strong> per enterprise, each supporting up to <strong>25,000 resources</strong>.' },
      { file: 'docs/slides-fixture.html', text: '<aside class="notes">The 250/25K limits are generous — most enterprises use 10–50 cost centers.</aside>' }
    ],
    negative: [
      '| Maximum cost centers per enterprise | 1,000 (since 2026-06-26) |',
      'Up to **1,000 cost centers** per enterprise, each supporting up to 25,000 resources.',
      'The 1,000/25K limits are generous — most enterprises use 10–50 cost centers.'
    ]
  },
  'copilot-default-model-gpt-4o': {
    severity: 'error',
    positive: [
      '| Default model | **GPT-4o** or latest stable | Use stable, well-tested models |'
    ],
    negative: [
      '| Base model | **GPT-5.3-Codex** (long-term support model, designated 2026-03-18) | Used when no other model is approved |',
      // Trap: a model list is not a default-model recommendation
      '| **Multi-Model Support** | Choose from GPT-4o, Claude Sonnet, Claude Haiku, Gemini |'
    ]
  },
  'ssh-rsa-2048-minimum': {
    severity: 'error',
    positive: ['- **RSA:** 2048-bit minimum, 4096-bit recommended'],
    negative: [
      '- **RSA:** new keys added from 2026-10-14 must be at least 3072 bits; prefer Ed25519',
      '- **RSA:** 4096-bit recommended'
    ]
  },
  'checks-retained-400-days': {
    severity: 'error',
    positive: [
      '- GitHub retains checks data for **400 days**',
      '- After 400 + 10 days (archival period), data is permanently deleted'
    ],
    negative: [
      '- From 2026-10-01, checks, workflow runs and statuses follow the Actions retention setting (90 days by default)',
      'Before 2026-10-01, checks were kept for 400+ days regardless of the retention setting.',
      // Trap: the retention-setting range for private repositories is still 1–400 days
      '| **Private** | 1 – 400 days | 90 days |'
    ]
  },
  'content-exclusions-not-in-cli': {
    severity: 'error',
    positive: [
      // Multi-line: the exclusion list spans several bullet lines
      '**Important Limitations**: Content exclusions do not currently apply to:\n- GitHub Copilot CLI\n- Copilot coding agent\n- Agent mode in Copilot Chat',
      { file: 'docs/slides-fixture.html', text: '<div class="callout warning">⚠️ Exclusions do <strong>NOT</strong> apply to: Copilot CLI, coding agent, or agent mode.</div>' },
      { file: 'docs/slides-fixture.html', text: '<aside class="notes">The gap with CLI/agent mode/coding agent is a critical security consideration.</aside>' },
      'Second — and this is critical — **content exclusions do NOT apply to Copilot CLI, the coding agent, agent mode, or Edit mode**.',
      '"Remember what I said earlier: these exclusions take up to 30 minutes to propagate to IDE clients, and they do NOT apply to Copilot CLI, the coding agent, or agent mode."'
    ],
    negative: [
      'Since 2026-09-02, content exclusions apply in Copilot CLI and the Copilot app.',
      // A remaining limitation that does not name the CLI is not this claim
      'Content exclusions do not apply to:\n- Agent mode in Copilot Chat\n\nCopilot CLI respects exclusions since 2026-09-02.'
    ]
  },
  'github-apps-no-enterprise-access': {
    severity: 'error',
    positive: [
      '| **Enterprise-Level Access** | Cannot yet access the enterprise object itself | Can access enterprise-level resources |',
      'GitHub Apps cannot yet be given permissions against the enterprise object itself.',
      'GitHub Apps can access enterprise-owned organization and repository resources, but not the enterprise object directly.',
      '| **Enterprise API access** | Cannot yet access the enterprise-level API object directly | Required for enterprise-level API access |',
      '- The primary remaining use case is **enterprise-level API access**. GitHub Apps currently cannot interact with the enterprise object itself.',
      '| Enterprise billing management | OAuth App | Requires enterprise object access |'
    ],
    negative: [
      'Since 2026-08-07, GitHub Apps, including third-party apps, can be installed on the enterprise account with enterprise permissions.',
      '| Enterprise billing management | GitHub App | Install on the enterprise with the enterprise billing permission (since 2026-08-26) |'
    ]
  },
  'oauth-tokens-until-revoked': {
    severity: 'error',
    positive: [
      '| **Authentication** | Installation access tokens (1-hour expiry) + user access tokens | Long-lived OAuth tokens (until revoked) |',
      '   | **Token lifetime** | Short-lived installation tokens (1-hour expiry), automatically rotated | Long-lived tokens valid until the user revokes them |'
    ],
    negative: [
      '| **Authentication** | Installation access tokens (1-hour expiry) | Long-lived until revoked, unless the app opts in to expiring tokens (8-hour access token, 6-month refresh token) |',
      '- OAuth Apps with long-lived tokens represent a larger blast radius if a token is compromised.'
    ]
  },
  'security-tab-renamed': {
    severity: 'error',
    positive: [
      '10. If you bypassed the push, navigate to the **Security** tab → **Secret scanning** in your repository',
      '   - If you bypassed a secret, confirm the resulting alert is visible under **Security** → **Secret scanning**',
      '   - Navigate to your **Organization** → **Security** tab → **Security overview**',
      '1. Click "Report a vulnerability" in Security tab',
      '        SecurityTab["Security Tab<br/>(Code Scanning Alerts)"]',
      '> Navigate to: **Organization → Security tab → Overview**, show Risk, Coverage, and Campaigns tabs',
      { file: 'docs/slides-fixture.html', text: '<li>Enable CodeQL default setup → review findings in Security tab</li>' }
    ],
    negative: [
      '10. If you bypassed the push, open the **Security & quality** tab → **Findings** → **Secret scanning**',
      // Traps: Settings-sidebar paths are a different page (labs/lab07 L32 and L193)
      '2. Go to **Settings** → **Advanced Security** (under the "Security" section of the left sidebar)',
      '   - Navigate to **Settings** → **Security** → **Code security** → **Dependabot rules**',
      'On GitHub Enterprise Server the tab is still the Security tab.',
      // History: explaining the rename is legitimate
      '> **Note:** On github.com the repository, organization and enterprise **Security** tab was renamed **Security & quality** on 2026-04-02.'
    ]
  },
  'copilot-no-retention-absolute': {
    severity: 'error',
    positive: [
      '| **Data Privacy** | No code retention | No code retention |',
      '| Prompt and suggestion collection | **Blocked** | Maintains data privacy; code is not retained |',
      '- Copilot Business and Enterprise do not retain prompts or suggestions',
      { file: 'docs/slides-fixture.html', text: '<div class="callout info">Both Business &amp; Enterprise include: no code retention, IP indemnification</div>' }
    ],
    negative: [
      '| **Data Privacy** | Not used for model training; limited retention (see [Data retention](#data-retention)) | Same |',
      'Regulatory requirements for code retention'
    ]
  },
  'code-quality-in-ghas-policy': {
    severity: 'error',
    positive: [
      '| Enterprise | **GitHub Advanced Security** | Controls availability of GHAS features (GitHub Secret Protection, GitHub Code Security, GitHub Code Quality) | **Enable for all organizations** |'
    ],
    negative: [
      '| Enterprise | **GitHub Advanced Security** | Controls availability of GitHub Secret Protection and GitHub Code Security | **Enable for all organizations** |',
      'GitHub Code Quality is a separate paid product (GA 2026-07-20, $10 per active committer per month).',
      // Trap: Autofix's relationship to Code Quality is a different claim
      'Copilot Autofix is integral to GitHub Code Quality and cannot be disabled for that feature'
    ]
  },
  'support-portal-url': {
    severity: 'error',
    positive: [
      '| GitHub Support | `https://support.github.com/` |',
      '- [GitHub Support: EMU Troubleshooting](https://support.github.com/)',
      'Submit a request via the [GitHub Support portal](https://support.github.com) with:'
    ],
    negative: [
      '| GitHub Support | `https://help.github.com/` (support.github.com works until your account moves) |',
      'Submit a request via the [GitHub support portal](https://help.github.com) with:'
    ]
  },

  // ── Found during P1 integration: GitHub Spark presented as a current plan feature ──
  'github-spark-retired': {
    severity: 'error',
    positive: [
      '| **GitHub Spark (public preview)** | — | ✓ |',
      '"Enterprise gets you the bigger pool and GitHub Spark, which is in preview; policy enforcement and audit logs come with both."',
      { file: 'docs/slides-fixture.html', text: '<td>3,900 AI Credits/user, pooled; Spark (preview)</td>' }
    ],
    negative: [
      'GitHub Spark on github.com stopped accepting new users on 2026-08-04, and access ended on 2026-08-31.',
      // The billing SKU name is not a feature claim
      '| `spark_ai_credits` | Spark AI Credits |'
    ]
  }
};

// Rewordings of each stale claim (judge review, 2026-10-02): a rule must catch the claim, not just the
// original sentence. Merged into FIXTURES so each rule is tested against both.
const REWORDINGS = {
  'copilot-unconfigured-means-disabled': {
    positive: [
      'Unconfigured policies are treated as disabled.',
      'If a policy is left unconfigured, it is disabled.',
      'An unconfigured policy means the feature is off.',
      'Unconfigured = off until an admin sets it.',
      'Policies that are unconfigured default to disabled for every organization.'
    ],
    negative: [
      'Before 2026-10-22, an unconfigured feature policy was treated as disabled.',
      'Leaving a policy unconfigured is not the same as disabling it.'
    ]
  },
  'copilot-mcp-disabled-by-default': {
    positive: [
      'The MCP servers policy is off by default.',
      'MCP is disabled by default for Copilot Business.',
      'By default, MCP servers are disabled.'
    ],
    negative: [
      'From 2026-10-22, an Unconfigured MCP servers policy follows the Default policy for new features.'
    ]
  },
  'copilot-premium-requests-billing': {
    positive: [
      'Review premium request usage history in the billing UI.',
      'Annual premium request totals are shown on the usage page.',
      'Copilot code review consumes premium requests.'
    ],
    negative: [
      'Request-based billing (legacy), for annual Copilot Pro and Pro+ plans: https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/github-copilot-premium-requests',
      'Budgets that existed for premium requests before 2026-06-01 were converted to AI Credit budgets automatically.'
    ]
  },
  'ghas-budgets-alert-only': {
    positive: [
      'GHAS budgets only send alerts; they cannot block usage.',
      'You cannot cap GHAS spend with a budget.',
      'Budgets for Advanced Security are notification-only.',
      "Stop-usage budgets don't work for GHAS."
    ],
    negative: [
      'Since 2026-05-28, an Advanced Security SKU-level budget can block enabling GHAS on more repositories.',
      'Budgets without that option only notify, with email alerts at 75%, 90% and 100% of the budget.'
    ]
  },
  'cost-center-limit': {
    positive: [
      'An enterprise supports 250 cost centers.',
      'You can create 500 cost centers per enterprise.',
      'The cost center limit is 250.',
      'Maximum: 100 cost centers.'
    ],
    negative: [
      'Up to 1,000 cost centers per enterprise (since 2026-06-26), up from 500.',
      'A cost center can hold up to 25,000 resources.',
      'Most enterprises use 10–50 cost centers.',
      'Assign the 500 users in Engineering to one cost center.'
    ]
  },
  'copilot-default-model-gpt-4o': {
    positive: [
      'GPT-4o is the default model for Copilot Business.',
      'Set GPT-4o as the default.',
      'The base model is GPT-4.1.'
    ],
    negative: [
      'GPT-5.3-Codex replaced GPT-4.1 as the base model on 2026-05-17.'
    ]
  },
  'ssh-rsa-2048-minimum': {
    positive: [
      'RSA keys must be at least 2048 bits.',
      'The minimum RSA key size is 2048.',
      'GitHub accepts 2048-bit RSA keys.'
    ],
    negative: [
      'RSA keys added from 2026-10-14 must be at least 3072 bits; existing 2048-bit keys keep working.'
    ]
  },
  'checks-retained-400-days': {
    positive: [
      'Check runs are retained for 400 days.',
      'There is a 400-day retention period for checks.'
    ],
    negative: [
      'Before 2026-10-01, check runs were kept for 400+ days.'
    ]
  },
  'content-exclusions-not-in-cli': {
    positive: [
      "Content exclusions don't apply to Copilot CLI.",
      'Copilot CLI ignores content exclusions.',
      'Exclusions are not enforced in the Copilot CLI.',
      "Content exclusions aren't supported in Copilot CLI."
    ],
    negative: [
      'Before 2026-09-02, content exclusions did not apply to Copilot CLI.',
      'Content exclusions are not supported in the Edit and Agent modes of Copilot Chat in VS Code.'
    ]
  },
  'github-apps-no-enterprise-access': {
    positive: [
      "GitHub Apps can't access the enterprise object.",
      'GitHub Apps cannot be installed on the enterprise account.',
      "Apps don't have access to the enterprise."
    ],
    negative: [
      'Enterprise-installed GitHub Apps cannot receive webhooks.',
      'Enterprise installations do not grant access to organizations or repositories in the enterprise.',
      'GitHub Apps can be installed on the enterprise account since 2026-08-07.'
    ]
  },
  'oauth-tokens-until-revoked': {
    positive: [
      'OAuth app tokens never expire.',
      "OAuth tokens don't expire until the user revokes them.",
      'OAuth access tokens are valid until revoked.'
    ],
    negative: [
      'Unless the app uses expiring tokens, OAuth tokens never expire.',
      'OAuth apps can opt in to expiring tokens: an 8-hour access token and a 6-month refresh token.'
    ]
  },
  'security-tab-renamed': {
    positive: [
      'Open the Security tab of the repository.',
      'Go to Security → Code scanning alerts.',
      'Go to **Security** → **Code scanning**.'
    ],
    negative: [
      'Go to the **Security & quality** tab → **Code scanning**.',
      'Open **Settings** → **Security** → **Code security**.',
      'Open Settings → Security → Secret scanning.'
    ]
  },
  'copilot-no-retention-absolute': {
    positive: [
      "Copilot doesn't retain prompts or suggestions.",
      'Copilot Business never stores your code.',
      'No data retention for Business and Enterprise.'
    ],
    negative: [
      'Eligible enterprises can use zero data retention for Claude Fable 5.1.',
      'Retention is limited, not zero.'
    ]
  },
  'code-quality-in-ghas-policy': {
    positive: [
      'Code Quality is part of GitHub Advanced Security.',
      'Code Quality is included with Code Security.'
    ],
    negative: [
      'GitHub Code Quality is a standalone paid product, complementary to GitHub Advanced Security rather than bundled with it.'
    ]
  },
  'github-spark-retired': {
    positive: [
      'GitHub Spark is recommended for prototyping internal apps.',
      'Enterprise adds GitHub Spark for app prototyping.'
    ],
    negative: [
      'GitHub Spark on github.com was retired: no new users from 2026-08-04, access ended 2026-08-31.'
    ]
  }
};

for (const [id, extra] of Object.entries(REWORDINGS)) {
  if (!FIXTURES[id]) throw new Error(`REWORDINGS names unknown rule ${id}`);
  FIXTURES[id].positive.push(...(extra.positive || []));
  FIXTURES[id].negative.push(...(extra.negative || []));
}

// The judge's first-round probe sentences: all 26 rewordings and the 6 exception-pattern bypasses, plus the
// false-positive traps it named. Each bypass was an `unless` filter that let a stale sentence through: two by matching
// inside an unrelated word, the others by matching a keyword elsewhere on the line. #24 is reworded (see its note).
const JUDGE_PROBES = {
  'copilot-unconfigured-means-disabled': {
    positive: [
      'If a policy is left Unconfigured, Copilot behaves as if it were Disabled.',
      'An Unconfigured policy is equivalent to Disabled.',
      'Unconfigured policies are treated as disabled; review the Default policy for new features later.'
    ],
    negative: ['An enterprise policy left **Unconfigured** is not simply **Disabled**.']
  },
  'copilot-mcp-disabled-by-default': {
    positive: [
      'MCP servers are off by default for Copilot Business and Enterprise.',
      'The MCP servers in Copilot policy is disabled unless an admin enables it.'
    ]
  },
  'copilot-premium-requests-billing': {
    positive: [
      'Download the premium request usage history from the billing page.',
      'Set an annual budget for Copilot premium requests.'
    ]
  },
  'ghas-budgets-alert-only': {
    positive: [
      "GHAS budgets only send alerts; they don't block usage.",
      "You can't cap GHAS spend with a budget."
    ]
  },
  'cost-center-limit': {
    positive: [
      'An enterprise supports 250 cost centers.',
      'The cost center limit is 250 per enterprise.'
    ],
    negative: ['For example, a platform engineering cost center can get $250 per user while everyone else stays on a $40 universal budget.']
  },
  'copilot-default-model-gpt-4o': {
    positive: [
      'The default Copilot model is GPT-4o.',
      'GPT-4o is the base model for Copilot Business.'
    ]
  },
  'ssh-rsa-2048-minimum': {
    positive: [
      'RSA keys must be at least 2048 bits.',
      '- **RSA:** minimum 2048 bits, 4096 recommended'
    ]
  },
  'checks-retained-400-days': {
    positive: [
      'Workflow runs and statuses are retained for 400 days.',
      'Check runs are kept for 400 days.'
    ]
  },
  'content-exclusions-not-in-cli': {
    positive: [
      "Content exclusions don't apply to Copilot CLI.",
      'Copilot CLI ignores content exclusions.'
    ]
  },
  'github-apps-no-enterprise-access': {
    positive: [
      "GitHub Apps can't access the enterprise object.",
      'GitHub Apps cannot be installed on an enterprise account.'
    ]
  },
  'oauth-tokens-until-revoked': {
    positive: [
      'OAuth tokens never expire.',
      'OAuth app tokens are valid until revoked.'
    ]
  },
  'security-tab-renamed': {
    positive: [
      'Open the repository Security page and select Code scanning.',
      'Go to **Security** > **Code scanning**.',
      'On GitHub.com and GHES, open the Security tab to review alerts.'
    ],
    negative: [
      'Open the Security overview page for the organization.',
      'Add a Security policy page to the repository.',
      'Enable it from the Advanced Security page in Settings.'
    ]
  },
  'copilot-no-retention-absolute': {
    positive: [
      "Copilot Business doesn't retain your code or prompts.",
      // The judge's #24, made unscoped: true for IDE code completions only, so the scoped form is a negative
      'Prompts and suggestions are discarded as soon as a suggestion is returned.'
    ],
    negative: ['For code completions in the IDE, prompts are discarded as soon as a suggestion is returned.']
  },
  'code-quality-in-ghas-policy': {
    positive: ['Code Quality is part of GitHub Advanced Security.']
  },
  'github-spark-retired': {
    positive: [
      'Copilot Enterprise includes Spark.',
      'GitHub Spark is recommended for rapid prototyping on Copilot Enterprise.',
      '| **GitHub Spark (public preview)** | — | ✓ | intended for prototypes'
    ],
    negative: [
      'Run the job on Apache Spark.',
      'A bundled AI credits budget covers every AI Credit SKU, including Copilot, Copilot cloud agent and Spark AI credits.'
    ]
  }
};

for (const [id, extra] of Object.entries(JUDGE_PROBES)) {
  if (!FIXTURES[id]) throw new Error(`JUDGE_PROBES names unknown rule ${id}`);
  FIXTURES[id].positive.push(...(extra.positive || []));
  FIXTURES[id].negative.push(...(extra.negative || []));
}

// Real lines that an over-wide pattern flagged during development: correct content that must stay unflagged.
// Each one pins a boundary (same sentence only; negated forms are not the claim).
const REAL_NEGATIVES = {
  'content-exclusions-not-in-cli': [
    '> ⚠️ **Important:** Content exclusions are not supported in the Edit and Agent modes of Copilot Chat in IDEs, and they don\'t cover third-party agents. The docs disagree on Copilot cloud agent (the content exclusion availability table doesn\'t list it; the supported-surfaces reference says exclusions apply to it), so test before you rely on it. Since 2026-09-02 exclusions apply in Copilot CLI and the GitHub Copilot app, and since 2026-06-12 Copilot code review skips excluded files.'
  ],
  'code-quality-in-ghas-policy': [
    '| **GitHub Code Quality** (separate product, not part of GHAS) | **Allow for selected organizations** | Billed separately since 2026-07-20; allow it where the cost is budgeted - See note | ☐ |',
    "Code Quality isn't part of GHAS.",
    // docs/08: the negation comes before "GHAS"
    "> **Not part of GHAS:** GitHub Code Quality (GA 2026-07-20) is a separate paid product: $10 per active committer per month, plus AI Credits for its AI-powered detection and autofix and Actions minutes for its CodeQL scans. It has its own license count and its own enterprise policy (enterprise **Policies → Code Quality**); the Advanced Security policies don't control it."
  ],
  'ghas-budgets-alert-only': [
    "GHAS budgets don't stop GHAS on repositories where it's already enabled."
  ],
  'copilot-premium-requests-billing': [
    // docs/19: the legacy endpoints are still documented; the date that scopes them is in the next sentence
    'The `premium_request/usage` endpoints at the same levels are still documented. They report premium-request usage, which for Copilot Business and Enterprise means usage before 2026-06-01.'
  ]
};

for (const [id, lines] of Object.entries(REAL_NEGATIVES)) {
  if (!FIXTURES[id]) throw new Error(`REAL_NEGATIVES names unknown rule ${id}`);
  FIXTURES[id].negative.push(...lines);
}

// The judge's delta re-review (2026-10-02), verbatim: 57 rewordings written to avoid each pattern's wording, 3 cases
// where a dot inside a domain or version number must not end the sentence, and 45 correct sentences, many of them
// corrective wording, that must not fail CI. Its 4 exception bypasses are among the rewordings. Left out: the 2
// sentences it found ambiguous against the docs, and "Export your apps before the GitHub Spark shutdown." (moot since
// 2026-08-31).
const JUDGE_ROUND2 = {
  'copilot-unconfigured-means-disabled': {
    positive: [
      'Copilot treats unconfigured policies as disabled.',
      'If you leave a policy unconfigured, the feature stays off.',
      'Leaving a policy unconfigured disables it.',
      'Unconfigured policies behave like Disabled.',
      "Policies you haven't configured are disabled.",
      'An unconfigured policy keeps the feature turned off.',
      'Unconfigured policies on GitHub.com are disabled.'
    ],
    negative: [
      'Unconfigured preview features are off until you opt in.',
      'With the Default policy for new features set to Disabled, unconfigured features are disabled.',
      'Copilot Memory is in public preview, so an unconfigured Memory policy is off.',
      'From 2026-10-22, unconfigured features are enabled by default.',
      'Unconfigured is a third state, distinct from Enabled and Disabled.'
    ]
  },
  'copilot-mcp-disabled-by-default': {
    positive: [
      "MCP servers aren't enabled by default.",
      'MCP access is opt-in for Copilot Business and Enterprise.',
      'The MCP servers in Copilot policy defaults to Disabled.',
      'Admins must enable the MCP servers in Copilot policy before developers can use MCP.',
      "By default, Copilot can't use MCP servers.",
      '| MCP servers in Copilot | Disabled (default) |',
      'MCP servers in VS Code 1.122 are disabled by default.'
    ],
    negative: [
      'From 2026-10-22, MCP servers are no longer off by default.',
      "MCP isn't disabled by default from 2026-10-22.",
      'Is MCP disabled by default? Not from 2026-10-22: an Unconfigured policy follows the Default policy for new features.',
      'Copilot Memory is off by default; MCP servers follow the Default policy for new features from 2026-10-22.',
      'Until 2026-10-22, the MCP servers in Copilot policy is off by default.'
    ]
  },
  'copilot-premium-requests-billing': {
    positive: [
      'Each Copilot Business user gets 300 premium model requests a month.',
      'Claude Opus uses a 10x request multiplier.',
      'Business users get a monthly allowance of 300 requests to premium models.',
      'Usage beyond the allowance is billed at $0.04 per request.'
    ],
    negative: [
      'Copilot Pro and Pro+ subscribers on an annual plan keep premium requests until renewal.',
      'Since 2026-06-01, premium requests no longer apply to Copilot Business.',
      'Premium requests were replaced by GitHub AI Credits on 2026-06-01.',
      'Historical usage reports still list the premium request SKUs.',
      'Copilot Business usage was billed in premium requests until June 2026.'
    ]
  },
  'ghas-budgets-alert-only': {
    positive: [
      "GHAS spending can't be limited with a budget.",
      'A budget on Advanced Security only triggers email notifications.',
      'There is no hard limit for GHAS budgets.'
    ],
    negative: [
      "GHAS budgets can't stop usage on repositories where GHAS is already enabled.",
      "Without the limit option, GHAS budgets don't block usage.",
      "Even with a hard limit, GHAS budgets don't cap spend exactly: new committers in enabled repositories are still billed."
    ]
  },
  'cost-center-limit': {
    positive: [
      'Up to 500 cost centers per enterprise, up from 250.',
      'Up to 250 cost centers per enterprise (previously 100).',
      'Cost centers: up to 250 per enterprise.',
      '| Cost centers | 250 per enterprise |'
    ],
    negative: [
      'An enterprise with 500 cost centers should manage them through the REST API.',
      'In this example, 100 cost centers map to 100 product teams.',
      'The 2026-06-10 post raised the limit to 500 cost centers; the 2026-06-26 post raised it to 1,000.'
    ]
  },
  'copilot-default-model-gpt-4o': {
    positive: [
      'Copilot Business uses GPT-4o by default.',
      'The fallback model is GPT-4.1.',
      'When no model is selected, Copilot uses GPT-4o.',
      'GPT-4o is the default model, replacing GPT-3.5 Turbo.'
    ],
    negative: [
      'GPT-4o is no longer the default model.',
      "GPT-4.1 isn't the base model anymore; GPT-5.3-Codex is, since 2026-05-17."
    ]
  },
  'ssh-rsa-2048-minimum': {
    positive: [
      'RSA keys need at least 2048 bits; 3072 bits or more is recommended.',
      'Use ssh-keygen -t rsa -b 2048 to create the key.',
      'RSA keys shorter than 2048 bits are rejected.'
    ],
    negative: [
      'Existing 2048-bit RSA keys keep working after 2026-10-14.',
      "GitHub doesn't revoke existing 2048-bit RSA keys.",
      // Not about SSH: an RSA + 2048 sentence in another context
      'Entra ID signs SAML responses with a 2048-bit RSA certificate.'
    ]
  },
  'checks-retained-400-days': {
    positive: [
      'GitHub keeps CI results for 400 days.',
      'Run history stays for 400 days regardless of your retention setting.',
      'Statuses from third-party CI are kept for 400 days.'
    ],
    negative: [
      'Checks, workflow runs and statuses follow the retention setting, which can be up to 400 days for private repositories.',
      'Since 2026-10-01, checks are no longer kept for 400 days.'
    ]
  },
  'content-exclusions-not-in-cli': {
    positive: [
      'Content exclusions have no effect in Copilot CLI.',
      'Excluded files are still visible to Copilot CLI.',
      'Content exclusions are not available for Copilot CLI.',
      'Content exclusions only work in the IDE and on GitHub.com, not in the CLI.',
      'Copilot CLI 1.0 ignores content exclusions.'
    ],
    negative: [
      "Content exclusions aren't supported in Edit and Agent modes, but they do apply in Copilot CLI since 2026-09-02.",
      'Content exclusions do not apply to agent mode; Copilot CLI has respected them since 2026-09-02.'
    ]
  },
  'github-apps-no-enterprise-access': {
    positive: [
      'GitHub Apps are limited to organizations and repositories.',
      'Only OAuth apps and PATs can call enterprise APIs.',
      "Enterprise automation needs an OAuth App because GitHub Apps can't be installed at the enterprise level."
    ],
    negative: [
      "Private GitHub Apps owned outside your enterprise can't be installed on the enterprise.",
      "Third-party apps with the Enterprise organization installations permission can't be installed on an enterprise they don't belong to.",
      "A GitHub App installed on an organization can't access the enterprise account."
    ]
  },
  'oauth-tokens-until-revoked': {
    positive: [
      'OAuth tokens remain valid until someone revokes them.',
      "An OAuth token works until it's revoked.",
      'OAuth app tokens have no expiration.'
    ],
    negative: [
      'OAuth tokens stay valid until revoked unless the app opts in to expiring tokens.'
    ]
  },
  'security-tab-renamed': {
    positive: [
      'Navigate to **Security** → **Advisories**.',
      'Navigate to Security → Campaigns.',
      'Select Security in the repository navigation bar, then Code scanning.'
    ],
    negative: [
      'On GHES, open the Security tab to review alerts.',
      'On GitHub Enterprise Server, the Security tab keeps its name.',
      'Since 2026-04-02, the Security tab is called **Security & quality** on GitHub.com.',
      "Turn it on from the enterprise's Authentication security page."
    ]
  },
  'copilot-no-retention-absolute': {
    positive: [
      "GitHub doesn't keep any of your prompts.",
      "Prompts aren't stored by Copilot Business.",
      'Your code is never retained.',
      "Copilot doesn't save prompts."
    ],
    negative: [
      'Prompts and suggestions from Copilot Chat on GitHub.com are deleted after 28 days.',
      "Anthropic doesn't retain prompts for Claude models other than Fable 5 and 5.1.",
      "Kimi K3 runs under a zero data retention agreement, so Fireworks AI doesn't store prompts."
    ]
  },
  'code-quality-in-ghas-policy': {
    positive: [
      'GHAS comes with Code Quality.',
      'Code Quality is part of the GHAS license.',
      'Code Quality is a GHAS feature.',
      'GitHub Advanced Security: Secret Protection, Code Security and Code Quality.'
    ],
    negative: [
      'GHAS includes Secret Protection and Code Security; Code Quality is a separate product.',
      'GitHub Advanced Security includes Secret Protection and Code Security, but not Code Quality.'
    ]
  },
  'github-spark-retired': {
    positive: [
      'Spark is included in Copilot Pro+.',
      'Copilot Pro+ comes with Spark.',
      '| Spark | ✓ |'
    ],
    negative: [
      'GitHub Spark was discontinued on github.com in August 2026.'
    ]
  },
  'support-portal-url': {
    negative: [
      "Accounts that haven't moved yet still use support.github.com."
    ]
  }
};

for (const [id, extra] of Object.entries(JUDGE_ROUND2)) {
  if (!FIXTURES[id]) throw new Error(`JUDGE_ROUND2 names unknown rule ${id}`);
  FIXTURES[id].positive.push(...(extra.positive || []));
  FIXTURES[id].negative.push(...(extra.negative || []));
}

// Held out from the probes above. Negatives: correct sentences from the changelog corpus and the requirements
// document, written after each change. Positives: a history word elsewhere in the sentence must not rescue a stale
// claim; it has to be attached to the claim.
const HELD_OUT = {
  'github-spark-retired': {
    negative: ['- Existing apps you’ve already deployed will continue to work after GitHub Spark shuts down.']
  },
  'support-portal-url': {
    negative: [
      'If you don’t have access yet, support.github.com will continue to work as expected.',
      'support.github.com keeps working until access arrives.'
    ]
  },
  'checks-retained-400-days': {
    negative: ['Starting October 1, 2026, checks, workflow runs, and statuses will be governed by the same Actions retention setting that already controls how long artifacts and logs are kept, with a default of 90 days. Until now, checks, workflow runs, and statuses were retained for 400+ days regardless of your retention configuration.']
  },
  'cost-center-limit': {
    negative: ['  - The per-enterprise cost center limit doubled from 250 to 500 for GitHub Enterprise Cloud, applied automatically (raised again to 1,000 on 2026-06-26).']
  },
  'copilot-no-retention-absolute': {
    // Data residency, not Copilot retention
    negative: ['Data is not stored outside the region you choose.']
  },
  'copilot-premium-requests-billing': {
    positive: [
      'Copilot cloud agent (formerly coding agent) consumes premium requests.',
      // Verbatim stale lines from docs/19 at 787ebb6: the old SKU ids presented as current
      '| `copilot_premium_request` | Chat, CLI, Code Review, Extensions, Spaces |',
      "  -f sku='copilot_premium_request' \\",
      // tests/README.md example: a scope in an earlier sentence doesn't count
      'For example, a 1x model draws down 0.9 premium requests.'
    ],
    negative: [
      'GitHub AI Credits (formerly premium requests) are pooled across the enterprise.',
      // 2026-07-01 post; "these subscribers" are the annual Pro/Pro+ plans named in the sentence before
      'For these subscribers, auto is billed in premium requests and the 10% discount applies to the model multiplier.',
      // tests/README.md example: the scope has to be in the same sentence
      'On annual Pro and Pro+ plans, a 1x model draws down 0.9 premium requests.'
    ]
  },
  'copilot-unconfigured-means-disabled': {
    positive: ['If a policy was left unconfigured, it is treated as disabled.'],
    negative: [
      // 2026-09-24 post
      '- Eligible generally available features and capabilities left **Unconfigured** will follow your selected global default of enabled, disabled, or let organizations decide.',
      // Requirements document: describes the assumption, doesn't make it
      "Enterprises that rely on 'Unconfigured' behaving as off must set the policy to Disabled or configure each feature explicitly before then."
    ]
  },
  'copilot-mcp-disabled-by-default': {
    // Bold markers between the negation and the state
    positive: ['MCP servers are not **enabled** by default.'],
    negative: ['MCP servers are not **disabled** by default from 2026-10-22.']
  },
  'copilot-default-model-gpt-4o': {
    positive: ['GPT-4o is the default model, which was chosen for stability.'],
    // Requirements document: "the base-model post" names a post, not the base model
    negative: ['- Context from the May 17 base-model post: GPT-4.1 stays force-enabled at a 0x multiplier until it deprecates alongside the launch of usage-based billing on June 1, 2026.']
  }
};

for (const [id, extra] of Object.entries(HELD_OUT)) {
  if (!FIXTURES[id]) throw new Error(`HELD_OUT names unknown rule ${id}`);
  FIXTURES[id].positive.push(...(extra.positive || []));
  FIXTURES[id].negative.push(...(extra.negative || []));
}

// Out of sample: written after the clause-scoped rules passed every fixture above, then run once before any tuning.
// Measured then: 25 of 32 stale sentences caught, 0 of 32 correct sentences flagged. The 7 misses were then fixed.
// The two traps at the end were added with those fixes; they are true per the docs.
const OUT_OF_SAMPLE = {
  'copilot-unconfigured-means-disabled': {
    positive: [
      'Anything you leave unconfigured stays disabled for your organizations.',
      '| Unconfigured | Off for everyone |'
    ],
    negative: [
      "From 2026-10-22, leaving a feature unconfigured no longer means it's disabled.",
      'Set the policy to Disabled if you want it off; Unconfigured follows the default policy.'
    ]
  },
  'copilot-mcp-disabled-by-default': {
    positive: [
      'MCP server access is turned off by default for Copilot Business.',
      'Out of the box, MCP is blocked until an enterprise owner allows it.'
    ],
    negative: [
      'Starting 2026-10-22, an Unconfigured MCP policy follows the Default policy for new features, which is Enabled.',
      'Before 2026-10-22, MCP servers were disabled by default.'
    ]
  },
  'copilot-premium-requests-billing': {
    positive: [
      'Copilot Enterprise includes 1,000 premium requests per user per month.',
      "Track each developer's PRU consumption in the usage dashboard."
    ],
    negative: [
      'Premium requests were retired for Copilot Business on 2026-06-01.',
      'Since 2026-06-01, overage is billed in GitHub AI Credits, not premium requests.'
    ]
  },
  'ghas-budgets-alert-only': {
    positive: [
      'Budgets for GitHub Advanced Security can only warn you; they never stop spending.',
      "Advanced Security budgets don't enforce a hard limit."
    ],
    negative: [
      'A GHAS budget with Stop usage turned on blocks enabling GHAS on more repositories.',
      'GHAS budgets were alert-only before 2026-05-28.',
      "Without the limit option, Advanced Security budgets don't enforce a hard limit."
    ]
  },
  'cost-center-limit': {
    positive: [
      'Plan for a maximum of 500 cost centers per enterprise.',
      'Enterprises are limited to 250 cost centers.'
    ],
    negative: [
      'Since 2026-06-26 an enterprise can have up to 1,000 cost centers.',
      'We created 250 cost centers for our business units.'
    ]
  },
  'copilot-default-model-gpt-4o': {
    positive: [
      'Copilot falls back to GPT-4.1 as its default model.',
      'Out of the box, Copilot Chat uses GPT-4o as the default.'
    ],
    negative: [
      'On 2026-05-17 GPT-5.3-Codex became the base model, replacing GPT-4.1.',
      'GPT-4o is still available as a model choice.'
    ]
  },
  'ssh-rsa-2048-minimum': {
    positive: [
      'Generate an RSA key of 2048 bits or more.',
      'The smallest RSA key GitHub accepts is 2048 bits.'
    ],
    negative: [
      'From 2026-10-14, new RSA keys must be at least 3072 bits.',
      'Your existing 2048-bit RSA key still works.'
    ]
  },
  'checks-retained-400-days': {
    positive: [
      'Check suites are kept for 400 days.',
      'Workflow run history is retained for 400 days.'
    ],
    negative: [
      'Before 2026-10-01, check runs were kept for 400 days.',
      'You can set Actions retention to up to 400 days in private repositories.'
    ]
  },
  'content-exclusions-not-in-cli': {
    positive: [
      "Copilot CLI doesn't honor content exclusions.",
      'Content exclusions are not enforced when developers use the CLI.'
    ],
    negative: [
      'Since 2026-09-02, Copilot CLI honors content exclusions.',
      "Content exclusions don't apply in agent mode."
    ]
  },
  'github-apps-no-enterprise-access': {
    positive: [
      "You can't install a GitHub App on the enterprise itself.",
      "Enterprise-level APIs aren't available to GitHub Apps."
    ],
    negative: [
      'Since 2026-08-07, GitHub Apps can be installed on the enterprise account.',
      "An app installed on the enterprise doesn't get access to its organizations' repositories.",
      // Enterprise-installed apps can't call every enterprise API yet
      "Some enterprise APIs aren't available to GitHub Apps yet."
    ]
  },
  'oauth-tokens-until-revoked': {
    positive: [
      "OAuth access tokens don't expire.",
      'Tokens issued to OAuth apps never expire unless revoked.'
    ],
    negative: [
      'OAuth apps can opt in to expiring user tokens.',
      'Before 2026-08-14, OAuth tokens never expired.'
    ]
  },
  'security-tab-renamed': {
    positive: [
      "Open the repository's Security tab and select Dependabot.",
      'In the org, go to **Security** → **Overview**.'
    ],
    negative: [
      'Open the **Security & quality** tab and select **Findings**.',
      'On GHES 3.22 the tab is still called Security.'
    ]
  },
  'copilot-no-retention-absolute': {
    positive: [
      'Copilot never stores your prompts.',
      "Your prompts aren't retained by GitHub."
    ],
    negative: [
      'Copilot Chat on GitHub.com keeps prompts for 28 days.',
      'Data residency keeps your data in the region you choose.'
    ]
  },
  'code-quality-in-ghas-policy': {
    positive: [
      'GitHub Code Quality is included in GitHub Advanced Security.',
      'With GHAS you also get Code Quality.'
    ],
    negative: [
      'Code Quality is licensed separately from GHAS.',
      'GHAS is sold as Secret Protection and Code Security; Code Quality is not included.'
    ]
  },
  'support-portal-url': {
    positive: [
      'Open a ticket at https://support.github.com/contact.',
      'Use support.github.com for enterprise support.'
    ],
    negative: [
      'Open a ticket at https://help.github.com.',
      'Until your account moves, support.github.com still works.'
    ]
  },
  'github-spark-retired': {
    positive: [
      'Use GitHub Spark to prototype internal tools.',
      'Copilot Pro+ subscribers get Spark.'
    ],
    negative: [
      'GitHub Spark was retired on 2026-08-31.',
      'Run batch jobs on Apache Spark.'
    ]
  }
};

for (const [id, extra] of Object.entries(OUT_OF_SAMPLE)) {
  if (!FIXTURES[id]) throw new Error(`OUT_OF_SAMPLE names unknown rule ${id}`);
  FIXTURES[id].positive.push(...(extra.positive || []));
  FIXTURES[id].negative.push(...(extra.negative || []));
}

// The judge's round-3 adversarial pass (2026-10-02), verbatim. Positives: the 22 stale phrasings it rated likely
// (S2). Negatives: its cheap false positives and the date-first timeline row (the date in the first cell makes the
// row history). Left out, by design: dates held in column headers or on a parent line, and its S3 cases.
const JUDGE_ROUND3 = {
  'copilot-unconfigured-means-disabled': {
    positive: ['An **Unconfigured** policy blocks the feature for every member.']
  },
  'copilot-mcp-disabled-by-default': {
    positive: [
      'Copilot Business ships with MCP turned off.',
      "Developers can't use MCP servers until an admin enables the policy."
    ],
    negative: [
      'To keep MCP off by default, set the **MCP servers in Copilot** policy to **Disabled**.',
      'Set **MCP servers in Copilot** to **Disabled** explicitly if MCP must stay off by default.'
    ]
  },
  'ghas-budgets-alert-only': {
    positive: [
      "You can't set a hard limit on GHAS spend.",
      "Budgets can't block GHAS usage because it's license-based."
    ]
  },
  'cost-center-limit': {
    positive: [
      'The cap on cost centers is 500.',
      "There's a limit of 250 on cost centers."
    ],
    negative: [
      '| 2026-06-10 | Cost center limit raised to 500 |',
      '| 2026-06-10 | Up to 500 cost centers per enterprise |'
    ]
  },
  'copilot-default-model-gpt-4o': {
    positive: ['If no model is chosen, Copilot falls back to GPT-4.1.']
  },
  'ssh-rsa-2048-minimum': {
    positive: ['GitHub requires RSA keys to be 2048 bits.']
  },
  'content-exclusions-not-in-cli': {
    positive: [
      "Don't rely on content exclusions in Copilot CLI.",
      'Content exclusions are ignored by the Copilot CLI.',
      "Copilot CLI isn't covered by content exclusions."
    ]
  },
  'github-apps-no-enterprise-access': {
    positive: [
      "GitHub Apps don't work at the enterprise level.",
      'GitHub Apps can only be installed on organizations and user accounts.'
    ],
    negative: [
      "A GitHub App can't access an enterprise unless it's installed on the enterprise account.",
      // Design-time trap for the "can only be installed on organizations" pattern; true per the docs
      'GitHub Apps with the Enterprise organization installations permission can only be installed on organizations in the owning enterprise.'
    ]
  },
  'oauth-tokens-until-revoked': {
    positive: [
      'OAuth tokens are permanent until revoked.',
      'OAuth tokens stay active until the user revokes them.',
      "OAuth app access tokens don't have an expiry date."
    ]
  },
  'security-tab-renamed': {
    positive: [
      "Click **Security** in the repository's top navigation.",
      'Under **Security**, open **Secret scanning**.'
    ]
  },
  'copilot-no-retention-absolute': {
    positive: ['GitHub discards all Copilot prompts right away.']
  },
  'code-quality-in-ghas-policy': {
    positive: [
      'Code Quality ships with GitHub Advanced Security.',
      'GHAS covers Code Quality too.'
    ]
  },
  'copilot-premium-requests-billing': {
    negative: [
      'Premium requests ended for Copilot Business on 2026-06-01.',
      'Copilot Business moved from premium requests to GitHub AI Credits on 2026-06-01.'
    ]
  },
  'support-portal-url': {
    negative: ['Some accounts still use support.github.com during the rollout that began on 2026-09-08.']
  }
};

for (const [id, extra] of Object.entries(JUDGE_ROUND3)) {
  if (!FIXTURES[id]) throw new Error(`JUDGE_ROUND3 names unknown rule ${id}`);
  FIXTURES[id].positive.push(...(extra.positive || []));
  FIXTURES[id].negative.push(...(extra.negative || []));
}

// Second out-of-sample set, aimed at the round-3 vocabulary, run once before tuning: 12 of 12 stale sentences
// caught, 2 of 24 correct sentences flagged ("sets the policy to Disabled", "Some GitHub Apps …"). Both then fixed.
const OUT_OF_SAMPLE_2 = {
  'copilot-unconfigured-means-disabled': {
    negative: ['A Disabled policy blocks the feature; an Unconfigured one follows the default policy from 2026-10-22.']
  },
  'copilot-mcp-disabled-by-default': {
    positive: [
      'Copilot Enterprise ships with MCP disabled.',
      "Users can't use MCP until an org owner turns it on."
    ],
    negative: [
      'Copilot Business ships with MCP enabled by default from 2026-10-22.',
      "If your enterprise sets the policy to Disabled, developers can't use MCP servers until an admin enables it.",
      'On 2026-10-22, the MCP servers policy stops being disabled by default.'
    ]
  },
  'ghas-budgets-alert-only': {
    positive: ['You cannot set a spending limit for Advanced Security.'],
    negative: [
      "Before 2026-05-28 you couldn't set a hard limit on GHAS spend.",
      "Budgets can't block GHAS usage on repositories where GHAS is already enabled.",
      '| 2026-05-28 | GHAS budgets are alert-only no longer: hard limits added |'
    ]
  },
  'cost-center-limit': {
    positive: ['The limit for cost centers is 250.'],
    negative: [
      'The cap on cost centers is 1,000 per enterprise.',
      'Before 2026-06-10 there was a limit of 250 on cost centers.'
    ]
  },
  'copilot-default-model-gpt-4o': {
    positive: ['If no model is selected, Copilot defaults to GPT-4o.'],
    negative: ['If no model is chosen, Copilot uses GPT-5.3-Codex, the base model.']
  },
  'ssh-rsa-2048-minimum': {
    negative: ['From 2026-10-14, GitHub requires RSA keys to be at least 3072 bits.']
  },
  'content-exclusions-not-in-cli': {
    positive: [
      'Content exclusions are skipped in the Copilot CLI.',
      'Copilot CLI is not covered by exclusions.'
    ],
    negative: [
      "Don't rely on content exclusions in agent mode.",
      'Before 2026-09-02, content exclusions were ignored by the Copilot CLI.',
      'Copilot CLI is covered by content exclusions since 2026-09-02.'
    ]
  },
  'github-apps-no-enterprise-access': {
    positive: ['GitHub Apps can only be installed on orgs.'],
    negative: [
      "Some GitHub Apps don't work at the enterprise level because they need repository access.",
      'Before 2026-08-07, GitHub Apps could only be installed on organizations and user accounts.'
    ]
  },
  'oauth-tokens-until-revoked': {
    positive: ['OAuth tokens remain active until revoked.'],
    negative: [
      'OAuth tokens stay active until revoked unless the app opts in to expiring tokens.',
      "OAuth apps that opted in to expiring tokens don't have long-lived tokens."
    ]
  },
  'security-tab-renamed': {
    positive: ['Click Security in the top navigation, then Dependabot.'],
    negative: [
      'On GHES, click **Security** in the repository navigation.',
      'In repository settings, under **Security**, open **Advanced Security**.'
    ]
  },
  'copilot-no-retention-absolute': {
    positive: ['Copilot deletes your prompts immediately.'],
    negative: ['For code completions, GitHub discards prompts right away.']
  },
  'code-quality-in-ghas-policy': {
    positive: ['Code Quality comes with GHAS.'],
    negative: [
      'Code Quality ships with its own license, separate from GHAS.',
      'GHAS covers secret scanning and code scanning, but not Code Quality.'
    ]
  },
  'copilot-premium-requests-billing': {
    negative: ['Copilot Business switched from premium requests to GitHub AI Credits in June 2026.']
  }
};

for (const [id, extra] of Object.entries(OUT_OF_SAMPLE_2)) {
  if (!FIXTURES[id]) throw new Error(`OUT_OF_SAMPLE_2 names unknown rule ${id}`);
  FIXTURES[id].positive.push(...(extra.positive || []));
  FIXTURES[id].negative.push(...(extra.negative || []));
}

function normalizeFixture(fixture) {
  return typeof fixture === 'string' ? { file: DEFAULT_FILE, text: fixture } : fixture;
}

function findingsFor(id, fixture) {
  const { file, text } = normalizeFixture(fixture);
  return scanContent(file, text).filter(f => f.id === id);
}

test('module exports the rules, the suppressions and a pure scanContent without running main()', () => {
  assert.ok(Array.isArray(DEPRECATED_PATTERNS) && DEPRECATED_PATTERNS.length > 0);
  assert.equal(typeof CONTEXTUAL_SUPPRESSIONS, 'object');
  assert.equal(typeof scanContent, 'function');
});

test('every rule has a unique id, a global regex, a message and a known severity', () => {
  const ids = DEPRECATED_PATTERNS.map(r => r.id);
  assert.deepEqual(ids.filter((id, i) => !id || ids.indexOf(id) !== i), [], 'missing or duplicate ids');
  for (const rule of DEPRECATED_PATTERNS) {
    assert.ok(rule.pattern instanceof RegExp && rule.pattern.global, `${rule.id}: pattern must be a /g RegExp`);
    assert.ok(rule.message, `${rule.id}: message missing`);
    assert.ok(['warn', 'error'].includes(rule.severity), `${rule.id}: unknown severity ${rule.severity}`);
  }
});

test('unless and files filters are non-global RegExps (a /g RegExp makes .test() stateful)', () => {
  for (const rule of DEPRECATED_PATTERNS) {
    for (const key of ['unless', 'files']) {
      if (rule[key] === undefined) continue;
      assert.ok(rule[key] instanceof RegExp, `${rule.id}: ${key} must be a RegExp`);
      assert.ok(!rule[key].global && !rule[key].sticky, `${rule.id}: ${key} must not use the g or y flag`);
    }
  }
});

test('FIXTURES covers exactly the rules in DEPRECATED_PATTERNS, each with positive and negative cases', () => {
  const ruleIds = DEPRECATED_PATTERNS.map(r => r.id).sort();
  assert.deepEqual(Object.keys(FIXTURES).sort(), ruleIds);
  for (const [id, fx] of Object.entries(FIXTURES)) {
    assert.ok(fx.positive.length > 0, `${id}: no positive fixture`);
    assert.ok(fx.negative.length > 0, `${id}: no negative fixture`);
  }
});

for (const [id, fx] of Object.entries(FIXTURES)) {
  test(`${id}: severity is ${fx.severity}`, () => {
    const rule = DEPRECATED_PATTERNS.find(r => r.id === id);
    assert.ok(rule, `rule ${id} not found`);
    assert.equal(rule.severity, fx.severity);
  });

  test(`${id}: flags every positive fixture`, () => {
    for (const fixture of fx.positive) {
      const found = findingsFor(id, fixture);
      assert.ok(found.length > 0, `not flagged: ${JSON.stringify(normalizeFixture(fixture))}`);
      assert.ok(found.every(f => f.severity === fx.severity));
    }
  });

  test(`${id}: ignores every negative fixture`, () => {
    for (const fixture of fx.negative) {
      const found = findingsFor(id, fixture);
      assert.deepEqual(found.map(f => f.match), [], `wrongly flagged: ${JSON.stringify(normalizeFixture(fixture))}`);
    }
  });
}

test('scanContent reports the 1-based line of each match', () => {
  const text = 'line one\nline two\n      - uses: actions/checkout@v3\n';
  const [finding] = scanContent(DEFAULT_FILE, text).filter(f => f.id === 'checkout-version');
  assert.equal(finding.line, 3);
  assert.equal(finding.file, DEFAULT_FILE);
});

test('scanContent reports one finding per match', () => {
  const text = 'actions/checkout@v2 and actions/checkout@v3';
  assert.equal(scanContent(DEFAULT_FILE, text).filter(f => f.id === 'checkout-version').length, 2);
});

test('htmlToText strips tags, style and script but keeps line numbers and decodes entities', () => {
  const html = '<style>\n.a{}\n</style>\n<p><strong>Security</strong>&nbsp;&amp;&nbsp;quality</p>\n<script>x</script>';
  const text = freshness.htmlToText(html);
  assert.equal(text.split('\n').length, html.split('\n').length);
  assert.match(text.split('\n')[3], /Security\s+&\s+quality/);
  assert.ok(!text.includes('.a{}'));
});

test('scanContent scans HTML files as text (tags cannot hide a stale phrase)', () => {
  const html = '<li>Pin <code>actions/checkout@v3</code></li>';
  const found = scanContent('docs/slides-fixture.html', html).filter(f => f.id === 'checkout-version');
  assert.equal(found.length, 1);
});

test('htmlToText keeps speaker notes held in data-notes attributes, on the tag line', () => {
  const html = '<p>x</p>\n<div class="slide" data-notes="Pin actions/checkout@v3\nhere">\n<p>y</p>';
  const text = freshness.htmlToText(html);
  assert.equal(text.split('\n').length, html.split('\n').length);
  assert.match(text.split('\n')[1], /Pin actions\/checkout@v3 here/);
  const found = scanContent('docs/slides-fixture.html', html).filter(f => f.id === 'checkout-version');
  assert.deepEqual(found.map(f => f.line), [2]);
});

// ── Clause scoping and the shared corrective filter (P0 rules) ──

function clauseOf(text, needle) {
  const i = text.indexOf(needle);
  assert.ok(i >= 0, `fixture error: "${needle}" is not in "${text}"`);
  const c = freshness.clauseAround(text, i, i + needle.length);
  return { ...c, text: text.slice(c.start, c.end) };
}

function corrective(since, clause, match) {
  const i = clause.indexOf(match);
  assert.ok(i >= 0, `fixture error: "${match}" is not in "${clause}"`);
  return freshness.isCorrective(since, clause, i, i + match.length);
}

test('every P0 rule names the date its claim went stale', () => {
  for (const rule of DEPRECATED_PATTERNS.filter(r => r.severity === 'error')) {
    assert.match(rule.since || '', /^\d{4}-\d{2}-\d{2}$/, `${rule.id}: since must be YYYY-MM-DD`);
  }
});

test('clauseAround: a dot inside a domain, version or abbreviation does not end the clause', () => {
  const text = 'Intro. Copilot CLI 1.0 on GitHub.com ignores exclusions, e.g. in agent mode. Next.';
  assert.equal(clauseOf(text, 'Copilot').text.trim(), 'Copilot CLI 1.0 on GitHub.com ignores exclusions, e.g. in agent mode.');
});

test('clauseAround: a newline, semicolon or table pipe ends a clause; a match that spans cells keeps them', () => {
  assert.equal(clauseOf('One clause; another clause\nnext line', 'another').text, ' another clause');
  assert.equal(clauseOf('| Default model | GPT-4o | Notes |', 'Default model | GPT-4o').text, ' Default model | GPT-4o ');
  assert.equal(clauseOf('**Done.** Next sentence', 'Next').text, ' Next sentence');
});

test('clauseAround: reports whether the clause is a question', () => {
  const text = 'Is MCP disabled by default? Not from 2026-10-22.';
  assert.equal(clauseOf(text, 'MCP disabled').question, true);
  assert.equal(clauseOf(text, 'Not from').question, false);
});

test('isCorrective: a since/from date on or after the change date marks the new state; an earlier one does not', () => {
  assert.equal(corrective('2026-06-01', 'From 2026-06-01, X applies', 'X applies'), true);
  assert.equal(corrective('2026-06-01', 'Since 2025-04-01, X applies', 'X applies'), false);
  assert.equal(corrective('2026-10-01', 'Starting October 1, 2026, X applies', 'X applies'), true);
  assert.equal(corrective('2026-10-01', 'From 1 October 2026, X applies', 'X applies'), true);
  // A month without a day counts from the 1st, so it can't cover a change later in that month
  assert.equal(corrective('2026-06-26', 'Since June 2026, X applies', 'X applies'), false);
});

test('isCorrective: until, before or prior to a date marks history', () => {
  assert.equal(corrective('2026-05-28', 'Before 2026-05-28, X applied', 'X applied'), true);
  assert.equal(corrective('2026-06-01', 'X applied until June 2026', 'X applied'), true);
  assert.equal(corrective('2026-10-22', 'Prior to **2026-10-22** X applies', 'X applies'), true);
});

test('isCorrective: "on" or "in" a date on or after the change date dates an event; an earlier one does not', () => {
  assert.equal(corrective('2026-06-01', 'Premium requests ended for Copilot Business on 2026-06-01', 'Premium requests'), true);
  assert.equal(corrective('2026-06-01', 'Premium requests stopped applying to Copilot Business in June 2026', 'Premium requests'), true);
  assert.equal(corrective('2026-06-01', 'On 2026-05-01, each seat includes 300 premium requests', 'premium requests'), false);
});

test('isCorrective: a change verb inside the match dates it', () => {
  assert.equal(corrective('2026-06-26', 'Cost center limit raised to 500', 'Cost center limit raised to 500'), true);
  assert.equal(corrective('2026-06-26', 'The cost center limit is 500', 'cost center limit is 500'), false);
});

test('isCorrective: a history word counts only when it is attached to the match', () => {
  assert.equal(corrective('2026-06-26', 'Up to 1,000 (previously 250 cost centers)', '250 cost centers'), true);
  assert.equal(corrective('2026-06-26', 'Up to 250 cost centers per enterprise (previously 100)', 'Up to 250 cost centers'), false);
  assert.equal(corrective('2026-06-26', 'Up to 500 cost centers per enterprise, up from 250', 'Up to 500 cost centers'), false);
  assert.equal(corrective('2026-05-17', 'GPT-5.3-Codex replaced GPT-4.1 as the base model', 'GPT-4.1 as the base model'), true);
  assert.equal(corrective('2026-05-17', 'GPT-4o is the default model, replacing GPT-3.5 Turbo', 'GPT-4o is the default model'), false);
  assert.equal(corrective('2026-08-04', 'GitHub Spark was created to help people', 'GitHub Spark'), true);
  assert.equal(corrective('2026-05-17', 'GPT-4o is the default model, which was chosen', 'GPT-4o is the default model'), false);
  assert.equal(corrective('2026-10-22', 'MCP servers are no longer off by default', 'MCP servers are no longer off by default'), true);
  assert.equal(corrective('2026-05-17', "GPT-4.1 isn't the base model anymore", 'GPT-4.1'), true);
  // Subjunctive, not past tense
  assert.equal(corrective('2026-08-26', 'Unconfigured, Copilot behaves as if it were Disabled', 'Unconfigured, Copilot behaves as if it were Disabled'), false);
});
