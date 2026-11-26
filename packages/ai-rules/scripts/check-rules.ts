import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Validate the repository's AI-rule layout: the root rule documents, their
 * references, and the component/hook colocation and snapshot coverage that
 * QUALITY.md requires. Exits non-zero with a list of violations.
 */
const root = fileURLToPath(new URL('../../../', import.meta.url));
const failures: string[] = [];

const rel = (path: string) => relative(root, path).split('\\').join('/');

for (const doc of ['AGENTS.md', 'QUALITY.md']) {
  if (!existsSync(join(root, doc))) failures.push(`missing rule document: ${doc}`);
}

/** Collect files below a directory, skipping generated and tool folders. */
function walk(dir: string): string[] {
  const skip = new Set(['node_modules', 'dist', '.turbo', '.git', '.idea']);
  const result: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (skip.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) result.push(...walk(path));
    else result.push(path);
  }
  return result;
}

for (const file of walk(root).filter((path) => path.endsWith('.md'))) {
  if (readFileSync(file, 'utf8').includes('packages/ui/QUALITY.md')) {
    failures.push(`${rel(file)}: stale reference to the old package-local quality document`);
  }
}

const componentsDir = join(root, 'packages/ui/src/components');
const components = readdirSync(componentsDir)
  .filter((file) => file.endsWith('.tsx') && !file.endsWith('.spec.tsx'))
  .map((file) => file.slice(0, -'.tsx'.length));

for (const name of components) {
  const spec = join(componentsDir, `${name}.spec.tsx`);
  if (!existsSync(spec)) {
    failures.push(`${name}: missing ${name}.spec.tsx`);
    continue;
  }
  const source = readFileSync(spec, 'utf8');
  if (!source.includes('expectComponentSnapshot')) {
    failures.push(`${name}.spec.tsx: missing the structural snapshot case`);
  }
  const snapshot = join(componentsDir, '__snapshots__', `${name}.spec.tsx.snap`);
  if (!existsSync(snapshot)) failures.push(`${name}: missing __snapshots__/${name}.spec.tsx.snap`);
}

const hooksDir = join(root, 'packages/ui/src/hooks');
const hooks = readdirSync(hooksDir)
  .filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts') && file !== 'index.ts')
  .map((file) => file.slice(0, -'.ts'.length));

for (const name of hooks) {
  if (!existsSync(join(hooksDir, `${name}.spec.tsx`))) {
    failures.push(`${name}: missing ${name}.spec.tsx`);
  }
}

if (failures.length > 0) {
  console.error(`AI rules check failed (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `AI rules check passed: ${components.length} components, ${hooks.length} hooks, root rule documents present.`,
);
