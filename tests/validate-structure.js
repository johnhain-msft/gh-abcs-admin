/**
 * validate-structure.js
 *
 * Validates structural requirements for docs, labs, and VBD materials:
 * - Docs: Must have H1 title, introduction paragraph, at least one H2 section
 * - Labs: Must have H1 title, duration, references, numbered steps
 * - VBD materials: Must have required sections per template
 */

const path = require('path');
const fs = require('fs');
const {
  findValidationFiles,
  parseMarkdown,
  extractHeadings,
  Reporter,
  rootPath
} = require('./utils');

const reporter = new Reporter('Structure Validation');

// Load expectation fixtures — fail loudly if expected but missing
function loadFixture(name, required = false) {
  const fixturePath = rootPath('tests', 'fixtures', name);
  if (fs.existsSync(fixturePath)) {
    return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
  }
  if (required) {
    reporter.fail(`fixtures/${name}`, 'Required fixture file is missing — regression safety compromised');
  }
  return null;
}

function validateDoc(relPath, parsed) {
  const headings = extractHeadings(parsed.body);
  const h1s = headings.filter(h => h.level === 1);
  const h2s = headings.filter(h => h.level === 2);

  // Must have at least one H1 (in body or front matter title)
  let hasTitle = h1s.length > 0;
  if (!hasTitle && parsed.frontmatter) {
    // Check if front matter has a title field
    try {
      const fm = require('yaml').parse(parsed.frontmatter);
      if (fm && fm.title) hasTitle = true;
    } catch { /* ignore parse errors — handled by frontmatter validator */ }
  }

  if (!hasTitle) {
    reporter.fail(relPath, 'Missing H1 title (and no front matter title)');
  } else {
    reporter.pass(`${relPath}: has title`);
  }

  // Must have at least one H2 section
  if (h2s.length === 0) {
    reporter.fail(relPath, 'No H2 sections found — docs should have structured sections');
  } else {
    reporter.pass(`${relPath}: has ${h2s.length} H2 section(s)`);
  }

  // Must have meaningful content (at least 10 non-empty lines after front matter)
  const nonEmptyLines = parsed.body.split('\n').filter(l => l.trim().length > 0);
  if (nonEmptyLines.length < 10) {
    reporter.fail(relPath, `Very short content (${nonEmptyLines.length} non-empty lines)`);
  } else {
    reporter.pass(`${relPath}: has ${nonEmptyLines.length} non-empty lines`);
  }
}

function validateLab(relPath, parsed) {
  const headings = extractHeadings(parsed.body);
  const h1s = headings.filter(h => h.level === 1);
  const body = parsed.body;

  // Must have H1 title
  if (h1s.length === 0) {
    reporter.fail(relPath, 'Missing H1 title');
  } else {
    reporter.pass(`${relPath}: has H1 title`);
  }

  // Must have duration
  const hasDuration = /duration:\s*\d+/i.test(body) || />\s*Duration:/i.test(body);
  if (!hasDuration) {
    reporter.fail(relPath, 'Missing duration field');
  } else {
    reporter.pass(`${relPath}: has duration`);
  }

  // Must have references section (unless it's setup.md)
  const basename = path.basename(relPath);
  const hasReferences = /references?:/i.test(body) || /##.*references?/i.test(body);
  if (!hasReferences && basename !== 'setup.md') {
    reporter.warn(relPath, 'No references section found');
  } else {
    reporter.pass(`${relPath}: has references`);
  }

  // Must have numbered steps (H2 or ordered list items)
  const hasSteps = /^##\s+\d+\./m.test(body) ||
                   /^\d+\.\s+/m.test(body) ||
                   /^##\s+\d+\s+/m.test(body);
  if (!hasSteps) {
    reporter.warn(relPath, 'No numbered steps detected');
  } else {
    reporter.pass(`${relPath}: has numbered steps`);
  }
}

function validateVBDMaterial(relPath, parsed) {
  const headings = extractHeadings(parsed.body);
  const h1s = headings.filter(h => h.level === 1);

  // Must have H1 title
  if (h1s.length === 0) {
    reporter.fail(relPath, 'Missing H1 title');
  } else {
    reporter.pass(`${relPath}: has H1 title`);
  }

  // Minimum content
  const nonEmptyLines = parsed.body.split('\n').filter(l => l.trim().length > 0);
  if (nonEmptyLines.length < 5) {
    reporter.fail(relPath, `Very short content (${nonEmptyLines.length} non-empty lines)`);
  } else {
    reporter.pass(`${relPath}: has content`);
  }
}

// Categorize a file based on its path
function categorize(relPath) {
  if (relPath.startsWith('labs/')) return 'lab';
  if (relPath.startsWith('docs/')) {
    const basename = path.basename(relPath).toUpperCase();
    const vbdFiles = ['AGENDA', 'INSTRUCTOR-GUIDE', 'PRE-WORKSHOP-CHECKLIST',
                      'KNOWLEDGE-CHECKS', 'POST-WORKSHOP-ASSESSMENT',
                      'REFERENCE-CARD', 'SLIDE-DECK-OUTLINE'];
    if (vbdFiles.some(v => basename.includes(v))) return 'vbd';
    return 'doc';
  }
  return 'other';
}

async function main() {
  // Find all markdown files in docs/ and labs/
  const allFiles = await findValidationFiles();

  if (allFiles.length === 0) {
    reporter.fail('(global)', 'No markdown files found');
    reporter.report();
    process.exit(1);
  }

  // Load expectation fixtures — required for regression safety
  const docExpectations = loadFixture('doc-expectations.json', true);
  const labExpectations = loadFixture('lab-expectations.json', true);

  let matchedExpectations = 0;
  let unmatchedFiles = [];

  for (const relPath of allFiles) {
    try {
      const parsed = parseMarkdown(relPath);
      const category = categorize(relPath);

      switch (category) {
        case 'doc':
          validateDoc(relPath, parsed);
          break;
        case 'lab':
          validateLab(relPath, parsed);
          break;
        case 'vbd':
          validateVBDMaterial(relPath, parsed);
          break;
        default:
          validateDoc(relPath, parsed);
      }

      // Check against fixture expectations if available
      let matched = false;
      if (docExpectations && category === 'doc') {
        const basename = path.basename(relPath, '.md');
        const expectation = docExpectations[basename];
        if (expectation) {
          validateAgainstExpectation(relPath, parsed, expectation);
          matched = true;
        }
      }

      if (labExpectations && category === 'lab') {
        const basename = path.basename(relPath, '.md');
        const expectation = labExpectations[basename];
        if (expectation) {
          validateAgainstExpectation(relPath, parsed, expectation);
          matched = true;
        }
      }

      if (docExpectations && category === 'vbd') {
        const basename = path.basename(relPath, '.md');
        const expectation = docExpectations[basename];
        if (expectation) {
          validateAgainstExpectation(relPath, parsed, expectation);
          matched = true;
        }
      }

      if (matched) {
        matchedExpectations++;
      } else if (docExpectations || labExpectations) {
        unmatchedFiles.push(relPath);
      }
    } catch (err) {
      reporter.fail(relPath, `Error reading/parsing: ${err.message}`);
    }
  }

  if (docExpectations || labExpectations) {
    console.log(`\n  📊 Expectation Coverage:`);
    console.log(`     Files with expectations: ${matchedExpectations}/${allFiles.length}`);
    if (unmatchedFiles.length > 0) {
      console.log(`     Files without expectations: ${unmatchedFiles.join(', ')}`);
    }
  }

  const success = reporter.report();
  process.exit(success ? 0 : 1);
}

function validateAgainstExpectation(relPath, parsed, expectation) {
  const headings = extractHeadings(parsed.body);

  // Check expected H1
  if (expectation.expectedH1) {
    const h1s = headings.filter(h => h.level === 1);
    const hasExpectedH1 = h1s.some(h =>
      h.text.toLowerCase().includes(expectation.expectedH1.toLowerCase())
    );
    if (!hasExpectedH1) {
      reporter.fail(relPath, `Expected H1 containing "${expectation.expectedH1}"`);
    } else {
      reporter.pass(`${relPath}: H1 matches expectation`);
    }
  } else if (expectation.expectedH1 === null) {
    // Explicitly expected to have no H1 (known issue, e.g., doc 18)
    const h1s = headings.filter(h => h.level === 1);
    if (h1s.length > 0) {
      reporter.warn(relPath, `Expected no H1 (known issue) but found "${h1s[0].text}" — was this fixed?`);
    } else {
      reporter.pass(`${relPath}: no H1 as expected (known issue)`);
    }
  }

  // Check expected H2 sections
  if (expectation.expectedH2s && Array.isArray(expectation.expectedH2s)) {
    const h2Texts = headings.filter(h => h.level === 2).map(h => h.text.toLowerCase());
    for (const expected of expectation.expectedH2s) {
      const found = h2Texts.some(t => t.includes(expected.toLowerCase()));
      if (!found) {
        reporter.fail(relPath, `Missing expected H2 section: "${expected}"`);
      } else {
        reporter.pass(`${relPath}: has H2 "${expected}"`);
      }
    }
  }

  // Check minimum line count
  if (expectation.minLines) {
    const lineCount = parsed.content.split('\n').length;
    if (lineCount < expectation.minLines) {
      reporter.fail(relPath, `Expected at least ${expectation.minLines} lines, found ${lineCount}`);
    } else {
      reporter.pass(`${relPath}: meets minimum line count (${lineCount})`);
    }
  }

  // Check minimum Mermaid diagram count
  if (expectation.minMermaidDiagrams !== undefined) {
    const mermaidCount = (parsed.body.match(/```mermaid/g) || []).length;
    if (mermaidCount < expectation.minMermaidDiagrams) {
      reporter.fail(relPath,
        `Expected at least ${expectation.minMermaidDiagrams} Mermaid diagrams, found ${mermaidCount}`);
    } else {
      reporter.pass(`${relPath}: has ${mermaidCount} Mermaid diagram(s)`);
    }
  }

  // Check front matter presence if specified
  if (expectation.hasFrontMatter !== undefined) {
    const hasFM = parsed.frontmatter !== null;
    if (expectation.hasFrontMatter && !hasFM) {
      reporter.fail(relPath, 'Expected YAML front matter but none found');
    } else if (!expectation.hasFrontMatter && hasFM) {
      reporter.warn(relPath, 'Found unexpected YAML front matter');
    } else {
      reporter.pass(`${relPath}: front matter presence matches expectation`);
    }
  }

  // Check minimum heading count (catches deletion of H3+ subsections)
  if (expectation.headingCount) {
    const actualCount = headings.length;
    const minExpected = Math.floor(expectation.headingCount * 0.8);
    if (actualCount < minExpected) {
      reporter.fail(relPath,
        `Expected at least ${minExpected} headings (80% of ${expectation.headingCount}), found ${actualCount}`);
    } else {
      reporter.pass(`${relPath}: heading count OK (${actualCount} ≥ ${minExpected})`);
    }
  }
}

main().catch(err => {
  console.error('Structure validation failed:', err);
  process.exit(1);
});
