import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Inline generated tokens into the published stylesheet; no bare @import. */
const tokenCss = readFileSync(
  resolve(process.cwd(), '../ui-tokens/generated/styles.css'),
  'utf8',
).trim();
const source = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
const importLine = "@import '@ilovecode33/ui-tokens/styles.css';";
if (!source.includes(importLine)) throw new Error('token import missing from src/styles.css');
const componentCss = readFileSync(resolve(process.cwd(), 'dist/index.css'), 'utf8');
writeFileSync(
  resolve(process.cwd(), 'dist/styles.css'),
  `${source.replace(importLine, tokenCss)}\n${componentCss}`,
);
console.log('wrote dist/styles.css with inlined tokens');
