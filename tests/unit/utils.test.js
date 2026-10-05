/**
 * Unit tests for tests/utils.js — cross-platform behaviour of the shared helpers.
 *
 * Every validator reads files and file lists through utils.js, so these tests guard the
 * whole suite against the two Windows failure classes: CRLF working-tree files
 * (core.autocrlf=true) and backslash-separated paths from glob.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const utils = require('../utils');

test('normalizeNewlines converts CRLF to LF and leaves LF untouched', () => {
  assert.equal(utils.normalizeNewlines('a\r\nb\r\n'), 'a\nb\n');
  assert.equal(utils.normalizeNewlines('a\nb\n'), 'a\nb\n');
});

test('toPosixPath converts backslash separators to forward slashes', () => {
  assert.equal(utils.toPosixPath('docs\\12-github-copilot-governance.md'), 'docs/12-github-copilot-governance.md');
  assert.equal(utils.toPosixPath('labs/lab01.md'), 'labs/lab01.md');
});

test('readFile returns LF-only content for a CRLF file', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ghabcs-utils-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'crlf.md');
  fs.writeFileSync(file, '---\r\ntitle: x\r\n---\r\n# H\r\n```yaml\r\nkey: "v"\r\n```\r\n');

  const content = utils.readFile(file);

  assert.ok(!content.includes('\r'), 'content still contains a carriage return');
});

test('parseMarkdown separates front matter and yields CR-free code blocks for a CRLF file', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ghabcs-utils-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'crlf.md');
  fs.writeFileSync(file, '---\r\ntitle: x\r\n---\r\n# H\r\n```yaml\r\nkey: "v"\r\n```\r\n');

  const parsed = utils.parseMarkdown(file);
  const { blocks } = utils.extractCodeBlocks(parsed.body);

  assert.equal(parsed.frontmatter, 'title: x');
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].content, 'key: "v"');
});

test('findValidationFiles returns forward-slash paths and honours SKIP_FILES', async () => {
  const files = await utils.findValidationFiles({ includeReadme: true });

  assert.ok(files.length > 0, 'no files found');
  assert.deepEqual(files.filter(f => f.includes('\\')), [], 'paths contain backslashes');
  assert.ok(files.includes('labs/lab01.md'), 'labs/lab01.md missing');
  assert.ok(files.includes('README.md'), 'README.md missing');
  assert.ok(!files.includes('docs/PLAN.md'), 'docs/PLAN.md is in SKIP_FILES but was returned');
});

test('npm scripts do not single-quote arguments (cmd.exe passes the quotes through)', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(utils.ROOT, 'package.json'), 'utf-8'));
  const offenders = Object.entries(pkg.scripts)
    .filter(([, cmd]) => cmd.includes("'"))
    .map(([name]) => name);

  assert.deepEqual(offenders, []);
});
