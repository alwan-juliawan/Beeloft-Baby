/**
 * BEELOFT BABY — Build
 *
 * Copies the project into a `dist/` folder ready for static hosting.
 * No bundling needed — this is fully static HTML/CSS/JS.
 *
 * Exit code: 0 = success, 1 = failure.
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

/* Files/directories to copy verbatim */
const include = [
  'index.html',
  'css/style.css',
  'js/script.js',
];

console.log('\n  📦 Beeloft Baby — Build\n');

/* Clean & create dist */
if (existsSync(dist)) {
  readdirSync(dist).forEach((f) => {
    try { copyFileSync(join(dist, f), join('/dev/null', f)); } catch {}
  });
}
mkdirSync(dist, { recursive: true });
mkdirSync(join(dist, 'css'), { recursive: true });
mkdirSync(join(dist, 'js'), { recursive: true });

/* Copy each file */
for (const f of include) {
  const src = join(root, f);
  const dst = join(dist, f);
  if (!existsSync(src)) {
    console.error(`  ✘  Source not found: ${f}`);
    process.exit(1);
  }
  copyFileSync(src, dst);
  const size = statSync(dst).size;
  console.log(`  ✓  ${f} (${(size / 1024).toFixed(1)} KB)`);
}

const total = include.length;
console.log(`\n  ✓  Build complete: ${total} files → ${dist}\n`);
