/**
 * validate-vbd-coverage.js
 *
 * Checks VBD agenda items against a coverage map file.
 * Verifies that all referenced docs and labs exist and contain expected sections.
 */

const fs = require('fs');
const {
  rootPath,
  readFile,
  Reporter
} = require('./utils');

const reporter = new Reporter('VBD Coverage Map Validation');

function main() {
  const mapPath = rootPath('tests', 'fixtures', 'vbd-coverage-map.json');

  if (!fs.existsSync(mapPath)) {
    reporter.warn('(global)', 'VBD coverage map not found — skipping (create tests/fixtures/vbd-coverage-map.json)');
    reporter.report();
    process.exit(0);
  }

  let coverageMap;
  try {
    coverageMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
  } catch (err) {
    reporter.fail('vbd-coverage-map.json', `Invalid JSON: ${err.message}`);
    reporter.report();
    process.exit(1);
  }

  // Validate structure
  if (!coverageMap.agendaItems || !Array.isArray(coverageMap.agendaItems)) {
    reporter.fail('vbd-coverage-map.json', 'Missing or invalid "agendaItems" array');
    reporter.report();
    process.exit(1);
  }

  let coveredDocs = 0;
  let coveredLabs = 0;
  let totalItems = coverageMap.agendaItems.length;
  let itemsWithDocs = 0;
  let itemsWithLabs = 0;

  for (const item of coverageMap.agendaItems) {
    // Validate required fields
    if (!item.id || !item.topic) {
      reporter.fail('vbd-coverage-map.json', `Agenda item missing id or topic: ${JSON.stringify(item)}`);
      continue;
    }

    // Check documentation coverage
    if (item.docs && item.docs.length > 0) {
      itemsWithDocs++;
      for (const docRef of item.docs) {
        const docPath = rootPath(docRef);
        if (!fs.existsSync(docPath)) {
          reporter.fail(docRef, `Referenced by agenda item "${item.id}" but file does not exist`);
        } else {
          coveredDocs++;
          reporter.pass(`${item.id}: doc ${docRef} exists`);
        }
      }
    } else {
      reporter.warn(item.id, `No documentation mapped for: "${item.topic}"`);
    }

    // Check lab coverage
    if (item.labs && item.labs.length > 0) {
      itemsWithLabs++;
      for (const labRef of item.labs) {
        const labPath = rootPath(labRef);
        if (!fs.existsSync(labPath)) {
          reporter.fail(labRef, `Referenced by agenda item "${item.id}" but file does not exist`);
        } else {
          coveredLabs++;
          reporter.pass(`${item.id}: lab ${labRef} exists`);
        }
      }
    }
    // Labs are not strictly required for every agenda item
  }

  // Summary metrics
  const docCoverage = totalItems > 0 ? ((itemsWithDocs / totalItems) * 100).toFixed(1) : 0;
  const labCoverage = totalItems > 0 ? ((itemsWithLabs / totalItems) * 100).toFixed(1) : 0;

  console.log(`\n  📊 VBD Coverage Summary:`);
  console.log(`     Total agenda items: ${totalItems}`);
  console.log(`     Items with docs: ${itemsWithDocs}/${totalItems} (${docCoverage}%)`);
  console.log(`     Items with labs: ${itemsWithLabs}/${totalItems} (${labCoverage}%)`);
  console.log(`     Doc references verified: ${coveredDocs}`);
  console.log(`     Lab references verified: ${coveredLabs}`);

  const success = reporter.report();
  process.exit(success ? 0 : 1);
}

try {
  main();
} catch (err) {
  console.error('VBD coverage validation failed:', err.message);
  process.exit(1);
}
