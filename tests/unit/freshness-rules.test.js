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
