import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCssVariables, buildSwiftTokens, buildTokensJson } from '../src/index';

/** Dev-time generator: emits the token representation for each renderer. */
const out = resolve(process.cwd(), 'generated');
mkdirSync(out, { recursive: true });

const files: Array<[string, string]> = [
  ['styles.css', buildCssVariables()],
  ['tokens.json', `${buildTokensJson()}\n`],
  ['Tokens.swift', buildSwiftTokens()],
];

for (const [name, content] of files) {
  writeFileSync(resolve(out, name), content, 'utf8');
  console.log(`wrote generated/${name}`);
}
