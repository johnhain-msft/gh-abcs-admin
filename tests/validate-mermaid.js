/**
 * validate-mermaid.js
 *
 * Validates Mermaid diagram syntax in markdown files.
 * Checks for:
 * - Valid diagram type declaration (graph, flowchart, sequenceDiagram, etc.)
 * - Balanced brackets/braces
 * - Non-empty diagram content
 * - Common syntax errors
 */

const {
  findValidationFiles,
  parseMarkdown,
  extractCodeBlocks,
  Reporter
} = require('./utils');

const reporter = new Reporter('Mermaid Diagram Validation');

// Valid Mermaid diagram types
const VALID_TYPES = [
  'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
  'stateDiagram', 'stateDiagram-v2', 'erDiagram', 'journey',
  'gantt', 'pie', 'quadrantChart', 'requirementDiagram',
  'gitgraph', 'mindmap', 'timeline', 'sankey-beta',
  'xychart-beta', 'block-beta', 'C4Context', 'C4Container',
  'C4Component', 'C4Deployment', 'architecture-beta',
  'packet-beta', 'kanban',
  '%%', // Comment-only blocks
];

function validateMermaidBlock(relPath, block) {
  const content = block.content.trim();

  if (!content) {
    reporter.fail(relPath, `Line ${block.line}: Empty Mermaid diagram`);
    return;
  }

  // Check for valid diagram type on first non-comment, non-empty line
  const lines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('%%'));
  if (lines.length === 0) {
    reporter.pass(`${relPath}:${block.line}: comment-only Mermaid block`);
    return;
  }

  const firstLine = lines[0].trim();
  const hasValidType = VALID_TYPES.some(type =>
    firstLine.startsWith(type)
  );

  if (!hasValidType) {
    reporter.fail(relPath,
      `Line ${block.line}: Unknown Mermaid diagram type: "${firstLine.substring(0, 40)}..."`);
    return;
  }

  // Check balanced brackets/braces (common Mermaid syntax)
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  const openBrackets = (content.match(/\[/g) || []).length;
  const closeBrackets = (content.match(/\]/g) || []).length;
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;

  if (openParens !== closeParens) {
    reporter.warn(relPath,
      `Line ${block.line}: Unbalanced parentheses (${openParens} open, ${closeParens} close)`);
  }
  if (openBrackets !== closeBrackets) {
    reporter.warn(relPath,
      `Line ${block.line}: Unbalanced brackets (${openBrackets} open, ${closeBrackets} close)`);
  }
  if (openBraces !== closeBraces) {
    reporter.warn(relPath,
      `Line ${block.line}: Unbalanced braces (${openBraces} open, ${closeBraces} close)`);
  }

  // Check for minimum content (at least 2 lines for a meaningful diagram)
  if (lines.length < 2) {
    reporter.warn(relPath, `Line ${block.line}: Very short Mermaid diagram (${lines.length} line)`);
  }

  reporter.pass(`${relPath}:${block.line}: valid ${firstLine.split(/\s/)[0]} diagram`);
}

async function main() {
  const allFiles = await findValidationFiles();

  let totalDiagrams = 0;

  for (const relPath of allFiles) {
    try {
      const parsed = parseMarkdown(relPath);
      const { blocks } = extractCodeBlocks(parsed.body);
      const mermaidBlocks = blocks.filter(b => b.lang === 'mermaid');

      for (const block of mermaidBlocks) {
        totalDiagrams++;
        validateMermaidBlock(relPath, block);
      }
    } catch (err) {
      reporter.fail(relPath, `Error processing: ${err.message}`);
    }
  }

  console.log(`  📊 Total Mermaid diagrams analyzed: ${totalDiagrams}`);
  const success = reporter.report();
  process.exit(success ? 0 : 1);
}

main().catch(err => {
  console.error('Mermaid validation failed:', err);
  process.exit(1);
});
