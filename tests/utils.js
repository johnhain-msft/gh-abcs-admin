/**
 * Shared utilities for test validation scripts.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT = path.resolve(__dirname, '..');

// Files to skip validation on (dev artifacts, not deliverables)
const SKIP_FILES = [
  'docs/PLAN.md'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB guard

/**
 * Resolve a path relative to the repo root.
 */
function rootPath(...segments) {
  return path.join(ROOT, ...segments);
}

/**
 * Read a file relative to the repo root. Returns string content.
 * Skips files exceeding MAX_FILE_SIZE.
 */
function readFile(relPath) {
  const abs = rootPath(relPath);
  const stats = fs.statSync(abs);
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(stats.size / 1024 / 1024).toFixed(1)} MB > 10 MB limit)`);
  }
  return fs.readFileSync(abs, 'utf-8');
}

/**
 * Find markdown files matching a glob pattern relative to repo root.
 */
async function findMarkdownFiles(pattern) {
  return glob(pattern, { cwd: ROOT, absolute: false });
}

/**
 * Find all markdown files for validation (docs + labs + README), excluding dev artifacts.
 * @param {object} options
 * @param {boolean} options.includeReadme - Include README.md (default: false)
 * @returns {Promise<string[]>} Array of relative paths
 */
async function findValidationFiles({ includeReadme = false } = {}) {
  const docFiles = await findMarkdownFiles('docs/**/*.md');
  const labFiles = await findMarkdownFiles('labs/**/*.md');
  const readmeFiles = includeReadme ? await findMarkdownFiles('README.md') : [];
  return [...docFiles, ...labFiles, ...readmeFiles].filter(f =>
    !SKIP_FILES.includes(f) && !f.startsWith('docs/_research/')
  );
}

/**
 * Parse a markdown file into front matter and body.
 * Returns { frontmatter: string|null, body: string, path: relPath }
 */
function parseMarkdown(relPath) {
  const content = readFile(relPath);
  const lines = content.split('\n');
  let frontmatter = null;
  let bodyStart = 0;

  if (lines[0] && lines[0].trim() === '---') {
    const endIdx = lines.indexOf('---', 1);
    if (endIdx > 0) {
      frontmatter = lines.slice(1, endIdx).join('\n');
      bodyStart = endIdx + 1;
    }
  }

  return {
    frontmatter,
    body: lines.slice(bodyStart).join('\n'),
    content,
    path: relPath
  };
}

/**
 * Extract headings from markdown body.
 * Returns array of { level: number, text: string, line: number }
 */
function extractHeadings(body) {
  const headings = [];
  const lines = body.split('\n');
  let inCodeBlock = false;

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) return;

    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: idx + 1
      });
    }
  });

  return headings;
}

/**
 * Extract fenced code blocks from markdown.
 * Returns { blocks: Array<{ lang, content, line }>, warnings: string[] }
 */
function extractCodeBlocks(body) {
  const blocks = [];
  const warnings = [];
  const lines = body.split('\n');
  let inBlock = false;
  let currentBlock = null;

  lines.forEach((line, idx) => {
    const fenceMatch = line.match(/^```(\w*)/);
    if (fenceMatch && !inBlock) {
      inBlock = true;
      currentBlock = {
        lang: fenceMatch[1].toLowerCase() || '',
        content: '',
        line: idx + 1
      };
    } else if (line.trim() === '```' && inBlock) {
      inBlock = false;
      blocks.push(currentBlock);
      currentBlock = null;
    } else if (inBlock && currentBlock) {
      currentBlock.content += (currentBlock.content ? '\n' : '') + line;
    }
  });

  if (inBlock && currentBlock) {
    warnings.push(`Unclosed code block starting at line ${currentBlock.line}`);
  }

  return { blocks, warnings };
}

// Simple test reporter
class Reporter {
  constructor(suiteName) {
    this.suite = suiteName;
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
    this.errors = [];
    this.warningMessages = [];
  }

  pass(message) {
    this.passed++;
  }

  fail(file, message) {
    this.failed++;
    this.errors.push({ file, message });
  }

  warn(file, message) {
    this.warnings++;
    this.warningMessages.push({ file, message });
  }

  report() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  ${this.suite}`);
    console.log(`${'='.repeat(60)}`);

    if (this.errors.length > 0) {
      console.log(`\n  ❌ FAILURES (${this.failed}):`);
      this.errors.forEach(e => {
        console.log(`     ${e.file}: ${e.message}`);
      });
    }

    if (this.warningMessages.length > 0) {
      console.log(`\n  ⚠️  WARNINGS (${this.warnings}):`);
      this.warningMessages.forEach(w => {
        console.log(`     ${w.file}: ${w.message}`);
      });
    }

    const total = this.passed + this.failed;
    const status = this.failed === 0 ? '✅ PASS' : '❌ FAIL';
    console.log(`\n  ${status} — ${this.passed}/${total} checks passed`);
    if (this.warnings > 0) {
      console.log(`  ⚠️  ${this.warnings} warning(s)`);
    }
    console.log('');

    return this.failed === 0;
  }
}

module.exports = {
  ROOT,
  SKIP_FILES,
  rootPath,
  readFile,
  findMarkdownFiles,
  findValidationFiles,
  parseMarkdown,
  extractHeadings,
  extractCodeBlocks,
  Reporter
};
