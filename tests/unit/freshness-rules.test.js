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
