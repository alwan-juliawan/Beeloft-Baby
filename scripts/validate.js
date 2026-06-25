/**
 * BEELOFT BABY — Validate (lint: file integrity & syntax)
 *
 * Runs: JS syntax check (node --check), CSS brace balance, HTML
 * structure sanity, asset path check for broken links, image existence.
 *
 * Exit code: 0 = pass, 1 = fail.
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

let errors = 0;

const err = (msg, file) => {
  console.error(`  ✘  [${file}] ${msg}`);
  errors++;
};

const pass = (msg, file) => {
  // console.debug(`  ✓  [${file}] ${msg}`);
};

/* ------------------------------------------------------------------ */
/*  1. File existence                                                  */
/* ------------------------------------------------------------------ */
const required = [
  'index.html',
  'css/style.css',
  'js/script.js',
];
for (const f of required) {
  const p = join(root, f);
  if (!existsSync(p)) {
    err(`Missing required file: ${f}`, f);
  } else {
    const size = statSync(p).size;
    pass(`${f} (${(size / 1024).toFixed(1)} KB)`, f);
  }
}

/* ------------------------------------------------------------------ */
/*  2. JavaScript syntax check (node --check)                          */
/* ------------------------------------------------------------------ */
try {
  execSync(`node --check "${join(root, 'js/script.js')}"`, { stdio: 'pipe' });
  pass('Syntax OK', 'js/script.js');
} catch (e) {
  err(`Syntax error: ${e.stderr?.toString().trim()}`, 'js/script.js');
}

/* ------------------------------------------------------------------ */
/*  3. CSS — basic brace balance & rule count                          */
/* ------------------------------------------------------------------ */
const css = readFileSync(join(root, 'css/style.css'), 'utf-8');
const opens = (css.match(/\{/g) || []).length;
const closes = (css.match(/\}/g) || []).length;
if (opens !== closes) {
  err(`CSS brace mismatch: ${opens} { vs ${closes} }`, 'css/style.css');
} else {
  pass(`CSS: ${opens} rules, ${(css.length / 1024).toFixed(0)} KB`, 'css/style.css');
}

/* ------------------------------------------------------------------ */
/*  4. HTML — check <!DOCTYPE html>, <title>, closing tags for section */
/* ------------------------------------------------------------------ */
const html = readFileSync(join(root, 'index.html'), 'utf-8');
if (!html.includes('<!DOCTYPE html>'))             err('Missing <!DOCTYPE html>', 'index.html');
if (!html.includes('<title>'))                     err('Missing <title>', 'index.html');
if (!html.includes('</html>'))                     err('Missing </html>', 'index.html');

// Check all referenced local assets
const imgRefs = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+\.(?:svg|png|jpg|jpeg|gif|ico|css|js))["']/gi)];
for (const [, ref] of imgRefs) {
  if (ref.startsWith('http') || ref.startsWith('data:')) continue;
  const resolved = join(root, ref);
  if (!existsSync(resolved)) {
    err(`Linked file not found: ${ref}`, 'index.html');
  } else {
    pass(`Link OK: ${ref}`, 'index.html');
  }
}

/* ------------------------------------------------------------------ */
/*  5. CSS content has all expected section classes                    */
/* ------------------------------------------------------------------ */
const expectedClasses = [
  '.hero', '.features', '.products', '.about', '.testimonials', '.shop', '.footer'
];
for (const cls of expectedClasses) {
  if (!css.includes(cls)) {
    err(`Missing CSS section: ${cls}`, 'css/style.css');
  }
}

/* ------------------------------------------------------------------ */
/*  Results                                                            */
/* ------------------------------------------------------------------ */
console.log(`\n  Lint: ${errors === 0 ? '✓ PASS' : `✘ FAIL (${errors} error${errors > 1 ? 's' : ''})`}\n`);
process.exit(errors > 0 ? 1 : 0);
