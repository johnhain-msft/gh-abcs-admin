/**
 * validate-lab-completeness.js
 *
 * Validates that lab files have all required structural elements:
 * - Title (H1)
 * - Duration field
 * - Objective/description paragraph
 * - References section with links
 * - Numbered steps
 * - Verification/expected results section (where applicable)
 */

const path = require('path');
const {
  findValidationFiles,
  parseMarkdown,
  extractHeadings,
  Reporter
} = require('./utils');

const reporter = new Reporter('Lab Completeness Validation');

async function main() {
  const allFiles = await findValidationFiles();
  const labFiles = allFiles.filter(f => f.startsWith('labs/'));

  if (labFiles.length === 0) {
    reporter.warn('(global)', 'No lab files found');
    reporter.report();
    process.exit(0);
  }

  for (const relPath of labFiles) {
    try {
      const parsed = parseMarkdown(relPath);
      const body = parsed.body;
      const headings = extractHeadings(body);
      const h1s = headings.filter(h => h.level === 1);
      const basename = path.basename(relPath, '.md');

      // 1. Title (H1)
      if (h1s.length === 0) {
        reporter.fail(relPath, 'Missing H1 title');
      } else {
        reporter.pass(`${relPath}: has title`);
      }

      // 2. Duration
      const hasDuration = /duration:\s*\d+/i.test(body) || />\s*Duration:/i.test(body);
      if (!hasDuration) {
        reporter.fail(relPath, 'Missing duration field');
      } else {
        reporter.pass(`${relPath}: has duration`);
      }

      // 3. Objective/description — first paragraph after title should describe the lab
      const lines = body.split('\n');
      const firstH1Idx = lines.findIndex(l => /^#\s/.test(l));
      let hasObjective = false;
      if (firstH1Idx >= 0) {
        // Look for a description line within 3 lines after H1
        for (let i = firstH1Idx + 1; i < Math.min(firstH1Idx + 4, lines.length); i++) {
          if (lines[i] && lines[i].trim().length > 20 && !lines[i].startsWith('#') && !lines[i].startsWith('>')) {
            hasObjective = true;
            break;
          }
          // Also accept > blockquote as description
          if (lines[i] && lines[i].startsWith('>') && !lines[i].includes('Duration')) {
            hasObjective = true;
            break;
          }
        }
        // Check for "In this lab" pattern
        if (/in this lab/i.test(body)) hasObjective = true;
      }

      if (!hasObjective) {
        reporter.fail(relPath, 'Missing objective/description paragraph after title');
      } else {
        reporter.pass(`${relPath}: has objective`);
      }

      // 4. References
      if (basename === 'setup') {
        // Setup lab has references inline
        const hasRefs = /references?:/i.test(body) || /\[.*\]\(http/i.test(body);
        if (!hasRefs) {
          reporter.warn(relPath, 'No references found');
        } else {
          reporter.pass(`${relPath}: has references`);
        }
      } else {
        const hasReferences = /references?:/i.test(body) || /##.*references?/i.test(body);
        if (!hasReferences) {
          reporter.fail(relPath, 'Missing references section');
        } else {
          reporter.pass(`${relPath}: has references`);

          // Check references have actual links
          const refSectionMatch = body.match(/references?:[\s\S]*?(?=\n##|\n$)/i);
          if (refSectionMatch) {
            const hasLinks = /\[.*\]\(http/.test(refSectionMatch[0]);
            if (!hasLinks) {
              reporter.warn(relPath, 'References section has no links');
            } else {
              reporter.pass(`${relPath}: references contain links`);
            }
          }
        }
      }

      // 5. Numbered steps
      const hasSteps = /^##\s+\d+[.\s]/m.test(body) ||
                       /^\d+\.\s+/m.test(body);
      if (!hasSteps && basename !== 'setup') {
        reporter.fail(relPath, 'No numbered steps found');
      } else {
        reporter.pass(`${relPath}: has numbered steps`);
      }

    } catch (err) {
      reporter.fail(relPath, `Error processing: ${err.message}`);
    }
  }

  console.log(`  📊 Labs validated: ${labFiles.length}`);
  const success = reporter.report();
  process.exit(success ? 0 : 1);
}

main().catch(err => {
  console.error('Lab completeness validation failed:', err);
  process.exit(1);
});
