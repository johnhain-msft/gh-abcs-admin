/**
 * validate-frontmatter.js
 *
 * Validates YAML front matter in markdown files and Jekyll _config.yml.
 * Checks:
 * - Front matter is valid YAML
 * - Known fields have correct types
 * - _config.yml is valid and has required Jekyll settings
 */

const fs = require('fs');
const YAML = require('yaml');
const {
  findValidationFiles,
  parseMarkdown,
  rootPath,
  Reporter
} = require('./utils');

const reporter = new Reporter('Front Matter Validation');

// Known valid front matter keys and expected types
const KNOWN_KEYS = {
  'render_with_liquid': 'boolean',
  'title': 'string',
  'description': 'string',
  'author': 'string',
  'ms.date': 'string',
  'layout': 'string',
  'permalink': 'string'
};

function validateFrontMatter(relPath, parsed) {
  if (!parsed.frontmatter) {
    // No front matter is valid — not all files need it
    reporter.pass(`${relPath}: no front matter (ok)`);
    return;
  }

  // Parse YAML
  let data;
  try {
    data = YAML.parse(parsed.frontmatter);
  } catch (err) {
    reporter.fail(relPath, `Invalid YAML front matter: ${err.message}`);
    return;
  }

  if (data === null || typeof data !== 'object') {
    reporter.fail(relPath, 'Front matter parsed but is not an object');
    return;
  }

  reporter.pass(`${relPath}: valid YAML front matter`);

  // Check known field types
  for (const [key, value] of Object.entries(data)) {
    if (KNOWN_KEYS[key]) {
      const expectedType = KNOWN_KEYS[key];
      const actualType = typeof value;
      if (actualType !== expectedType) {
        reporter.warn(relPath,
          `Front matter key "${key}" expected ${expectedType}, got ${actualType}`);
      }
    }
  }
}

function validateJekyllConfig() {
  const configPath = rootPath('_config.yml');
  if (!fs.existsSync(configPath)) {
    reporter.fail('_config.yml', 'Jekyll _config.yml not found');
    return;
  }

  let config;
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    config = YAML.parse(content);
  } catch (err) {
    reporter.fail('_config.yml', `Invalid YAML: ${err.message}`);
    return;
  }

  reporter.pass('_config.yml: valid YAML');

  // Check required Jekyll fields
  if (!config.title) {
    reporter.fail('_config.yml', 'Missing "title" field');
  } else {
    reporter.pass('_config.yml: has title');
  }

  if (!config.theme) {
    reporter.warn('_config.yml', 'No "theme" specified');
  } else {
    reporter.pass('_config.yml: has theme');
  }

  if (!config.markdown) {
    reporter.warn('_config.yml', 'No "markdown" renderer specified');
  } else {
    reporter.pass('_config.yml: has markdown renderer');
  }

  // Check collections include docs and labs
  if (config.collections) {
    if (!config.collections.docs) {
      reporter.fail('_config.yml', 'Missing "docs" collection');
    } else {
      reporter.pass('_config.yml: has docs collection');
    }
    if (!config.collections.labs) {
      reporter.fail('_config.yml', 'Missing "labs" collection');
    } else {
      reporter.pass('_config.yml: has labs collection');
    }
  } else {
    reporter.warn('_config.yml', 'No collections defined');
  }

  // Check node_modules is excluded
  if (config.exclude && Array.isArray(config.exclude)) {
    if (!config.exclude.includes('node_modules')) {
      reporter.warn('_config.yml', 'node_modules not in exclude list');
    } else {
      reporter.pass('_config.yml: node_modules excluded');
    }
  }
}

async function main() {
  const allFiles = await findValidationFiles();

  // Validate Jekyll _config.yml
  validateJekyllConfig();

  for (const relPath of allFiles) {
    try {
      const parsed = parseMarkdown(relPath);
      validateFrontMatter(relPath, parsed);
    } catch (err) {
      reporter.fail(relPath, `Error reading file: ${err.message}`);
    }
  }

  const success = reporter.report();
  process.exit(success ? 0 : 1);
}

main().catch(err => {
  console.error('Front matter validation failed:', err);
  process.exit(1);
});
