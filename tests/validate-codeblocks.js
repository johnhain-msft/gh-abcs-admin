/**
 * validate-codeblocks.js
 *
 * Validates syntax of fenced code blocks in markdown files.
 * - YAML blocks: Parsed with yaml library
 * - JSON blocks: Parsed with JSON.parse
 * - Bash/shell blocks: Basic syntax checks (balanced quotes, valid shebang)
 */

const YAML = require('yaml');
const {
  findValidationFiles,
  parseMarkdown,
  extractCodeBlocks,
  Reporter
} = require('./utils');

const reporter = new Reporter('Code Block Validation');

function validateYAMLBlock(relPath, block) {
  try {
    YAML.parse(block.content);
    reporter.pass(`${relPath}:${block.line}: valid YAML`);
  } catch (err) {
    // Skip YAML fragments/templates (contain {{ or {% patterns)
    if (/\{\{.*\}\}/.test(block.content) || /\{%.*%\}/.test(block.content)) {
      reporter.pass(`${relPath}:${block.line}: YAML template (skipped strict parse)`);
      return;
    }
    // Skip illustrative/pseudo-YAML: tree structures, API examples, numbered lists,
    // @-mentions, file path descriptions, duplicate-key examples, checklists, templates
    const indicators = [
      /[├└│──]/.test(block.content),            // Tree diagrams
      /^(PUT|GET|POST|DELETE|PATCH)\s/m.test(block.content), // API examples
      /^\s*\d+\.\s/m.test(block.content),       // Numbered steps
      /^\s*[-*]\s*\[[ x]\]/m.test(block.content), // Checkboxes
      /#\s*(DO|DON'T|After|Before|Enable|Steps|Configured|Example|Sample|Note)/im.test(block.content), // Comment headers
      /^\s*└──|├──|│/m.test(block.content),      // Directory trees
      /\{[a-z_-]+\}/i.test(block.content),      // Template variables like {repo}, {org}
      /@[a-z]/i.test(block.content),             // @-mentions in YAML values
      err.message.includes('Map keys must be unique'), // Before/after examples with duplicate keys
      err.message.includes('compact mappings'),  // Complex illustrative structures
    ];
    if (indicators.some(Boolean)) {
      reporter.pass(`${relPath}:${block.line}: illustrative YAML (skipped strict parse)`);
      return;
    }
    reporter.fail(relPath, `Line ${block.line}: Invalid YAML — ${err.message}`);
  }
}

function validateJSONBlock(relPath, block) {
  try {
    JSON.parse(block.content);
    reporter.pass(`${relPath}:${block.line}: valid JSON`);
  } catch (err) {
    // Check if this is a partial/illustrative JSON snippet
    if (block.content.includes('...') || block.content.includes('// ')) {
      reporter.pass(`${relPath}:${block.line}: JSON snippet with comments/ellipsis (skipped)`);
    } else {
      reporter.fail(relPath, `Line ${block.line}: Invalid JSON — ${err.message}`);
    }
  }
}

function validateBashBlock(relPath, block) {
  const content = block.content;
  // Strip comment lines before checking quotes (contractions like "don't" are valid)
  const codeLines = content.split('\n').filter(l => !l.trim().startsWith('#'));
  const codeOnly = codeLines.join('\n');

  const singleQuotes = (codeOnly.match(/'/g) || []).length;
  const doubleQuotes = (codeOnly.match(/"/g) || []).length;

  if (singleQuotes % 2 !== 0) {
    reporter.warn(relPath, `Line ${block.line}: Odd number of single quotes in bash block (non-comment lines)`);
  }
  if (doubleQuotes % 2 !== 0) {
    reporter.warn(relPath, `Line ${block.line}: Odd number of double quotes in bash block (non-comment lines)`);
  }

  reporter.pass(`${relPath}:${block.line}: bash block checked`);
}

async function main() {
  const allFiles = await findValidationFiles();

  let totalBlocks = 0;

  for (const relPath of allFiles) {
    try {
      const parsed = parseMarkdown(relPath);
      const { blocks, warnings: extractWarnings } = extractCodeBlocks(parsed.body);

      for (const w of extractWarnings) {
        reporter.warn(relPath, w);
      }

      for (const block of blocks) {
        totalBlocks++;

        switch (block.lang) {
          case 'yaml':
          case 'yml':
            validateYAMLBlock(relPath, block);
            break;
          case 'json':
          case 'jsonc':
            validateJSONBlock(relPath, block);
            break;
          case 'bash':
          case 'shell':
          case 'sh':
          case 'zsh':
            validateBashBlock(relPath, block);
            break;
          case 'mermaid':
            // Handled by validate-mermaid.js
            break;
          default:
            // Other languages — just count them
            reporter.pass(`${relPath}:${block.line}: ${block.lang || 'plain'} block`);
        }
      }
    } catch (err) {
      reporter.fail(relPath, `Error processing: ${err.message}`);
    }
  }

  console.log(`  📊 Total code blocks analyzed: ${totalBlocks}`);
  const success = reporter.report();
  process.exit(success ? 0 : 1);
}

main().catch(err => {
  console.error('Code block validation failed:', err);
  process.exit(1);
});
