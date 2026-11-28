import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import ts from 'typescript-compiler-api';

const repositoryRoot = resolve(import.meta.dir, '../../..');
const appRoot = resolve(repositoryRoot, 'apps/ui-landing');
const uiEntryPath = resolve(repositoryRoot, 'packages/ui/src/index.ts');
const galleryPath = resolve(appRoot, 'src/component-details.tsx');
const outputPath = resolve(appRoot, 'src/generated-library-reference.ts');

const configPath = resolve(appRoot, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));

const parsedConfig = ts.parseJsonConfigFileContent(config.config, ts.sys, dirname(configPath));
const program = ts.createProgram({ rootNames: parsedConfig.fileNames, options: parsedConfig.options });
const checker = program.getTypeChecker();
const uiSource = program.getSourceFile(uiEntryPath);
if (!uiSource) throw new Error(`Could not load UI exports: ${uiEntryPath}`);

type PropDoc = {
  name: string;
  type: string;
  optional: boolean;
  description: string;
};

type ParameterDoc = PropDoc & { options: PropDoc[] };

type ReferenceDoc = {
  name: string;
  kind: 'component' | 'hook';
  description: string;
  returnType: string;
  parameters: ParameterDoc[];
  props: PropDoc[];
  nativeElement?: 'button' | 'input' | 'textarea' | 'html';
  example: string;
};

const gallerySources = [
  program.getSourceFile(galleryPath),
  program.getSourceFile(resolve(appRoot, 'src/main.tsx')),
].filter((source): source is ts.SourceFile => Boolean(source));
const sourcePrinter = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const workspacePackagePath = `${resolve(repositoryRoot, 'packages')}/`;

function commentText(symbol: ts.Symbol, tagName?: string): string {
  const tag = tagName && symbol.getJsDocTags(checker).find((item) => item.name === tagName);
  if (tag?.text) return tag.text.map((part) => part.text).join('').trim();
  return tagName ? '' : ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
}

function typeText(type: ts.Type, location: ts.Node): string {
  return checker.typeToString(
    type,
    location,
    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
  );
}

function propertyDocs(type: ts.Type, location: ts.Node): PropDoc[] {
  return checker.getPropertiesOfType(type).flatMap((property) => {
    const declaration = property.valueDeclaration ?? property.declarations?.[0];
    if (!declaration || !resolve(declaration.getSourceFile().fileName).startsWith(workspacePackagePath)) return [];

    const propertyType = checker.getTypeOfSymbolAtLocation(property, declaration);
    return [{
      name: property.getName(),
      type: typeText(propertyType, declaration),
      optional: Boolean(property.flags & ts.SymbolFlags.Optional),
      description: ts.displayPartsToString(property.getDocumentationComment(checker)).trim(),
    }];
  });
}

function nativeElement(type: ts.Type): ReferenceDoc['nativeElement'] {
  const names = new Set<string>();
  const visited = new Set<ts.Type>();
  const visit = (current: ts.Type) => {
    if (visited.has(current)) return;
    visited.add(current);
    if (current.aliasSymbol) names.add(current.aliasSymbol.getName());
    if (current.getSymbol()) names.add(current.getSymbol()!.getName());
    if (checker.isArrayType(current)) visit(checker.getElementTypeOfArrayType(current));
    if (current.flags & ts.TypeFlags.Object) {
      for (const base of checker.getBaseTypes(current as ts.InterfaceType)) visit(base);
    }
  };
  visit(type);
  if ([...names].some((name) => name.includes('InputHTMLAttributes'))) return 'input';
  if ([...names].some((name) => name.includes('TextareaHTMLAttributes'))) return 'textarea';
  if ([...names].some((name) => name.includes('ButtonHTMLAttributes'))) return 'button';
  if ([...names].some((name) => name === 'HTMLAttributes')) return 'html';
  return undefined;
}

function stripExampleFence(example: string): string {
  return example
    .replace(/^\s*```(?:tsx?|jsx?)?\s*\n?/, '')
    .replace(/\n?\s*```\s*$/, '')
    .trim();
}

function componentUsage(name: string): string {
  for (const source of gallerySources) {
    let found: ts.JsxElement | ts.JsxSelfClosingElement | undefined;
    const visit = (node: ts.Node) => {
      if (found) return;
      if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
        if (ts.isIdentifier(node.tagName) && node.tagName.text === name) {
          const parent = node.parent;
          if (ts.isJsxSelfClosingElement(node)) found = node;
          else if (ts.isJsxElement(parent)) found = parent;
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    if (!found) continue;

    const opening = ts.isJsxElement(found) ? found.openingElement : found;
    const openingText = sourcePrinter.printNode(ts.EmitHint.Unspecified, opening, source);
    if (ts.isJsxSelfClosingElement(found)) return openingText;
    const closing = found.closingElement.tagName.getText(source);
    return `${openingText}\n  {/* content */}\n</${closing}>`;
  }
  return '';
}

function hookUsage(name: string): string {
  const sourceFiles = [
    ...gallerySources,
    ...program.getSourceFiles()
      .filter((source) => resolve(source.fileName).startsWith(workspacePackagePath))
      .filter((source) => !/\.(?:spec|test)\.[cm]?[jt]sx?$/.test(source.fileName)),
  ];

  for (const source of sourceFiles) {
    let statement: ts.VariableStatement | ts.ExpressionStatement | undefined;
    const visit = (node: ts.Node) => {
      if (statement) return;
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === name) {
        const parent = node.parent;
        if (ts.isVariableDeclaration(parent) && ts.isVariableStatement(parent.parent.parent)) {
          statement = parent.parent.parent;
        } else if (ts.isExpressionStatement(parent)) {
          statement = parent;
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    if (statement) return sourcePrinter.printNode(ts.EmitHint.Unspecified, statement, source).trim();
  }
  return '';
}

function isReactComponent(signature: ts.Signature): boolean {
  const returnType = signature.getReturnType();
  const printed = typeText(returnType, signature.getDeclaration() ?? uiSource);
  return /(?:^|[.\s])(?:Element|ReactElement|ReactNode)(?:<|\b)/.test(printed);
}

function parameterDocs(signature: ts.Signature): ParameterDoc[] {
  return signature.getParameters().map((parameter) => {
    const declaration = parameter.valueDeclaration ?? parameter.declarations?.[0] ?? signature.getDeclaration() ?? uiSource;
    const parameterType = checker.getTypeOfSymbolAtLocation(parameter, declaration);
    const options = propertyDocs(parameterType, declaration);
    return {
      name: parameter.getName().startsWith('__')
        ? (options.length ? 'options' : 'props')
        : parameter.getName(),
      type: typeText(parameterType, declaration),
      optional: Boolean(parameter.flags & ts.SymbolFlags.Optional),
      description: ts.displayPartsToString(parameter.getDocumentationComment(checker)).trim(),
      options,
    };
  });
}

const moduleSymbol = checker.getSymbolAtLocation(uiSource);
if (!moduleSymbol) throw new Error('Could not resolve the public @ilovecode33/ui exports.');

const references: ReferenceDoc[] = [];
for (const exported of checker.getExportsOfModule(moduleSymbol)) {
  const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0] ?? uiSource;
  const name = exported.getName();
  const kind = /^use[A-Z]/.test(name) ? 'hook' : undefined;
  const signatures = checker.getTypeOfSymbolAtLocation(symbol, declaration).getCallSignatures();
  const signature = signatures.find((item) => kind || isReactComponent(item));
  if (!signature || (!kind && !isReactComponent(signature))) continue;

  const parameters = parameterDocs(signature);
  const isComponent = !kind;
  const primaryParameter = parameters[0];
  const parameterType = signature.getParameters()[0]
    ? checker.getTypeOfSymbolAtLocation(
      signature.getParameters()[0],
      signature.getParameters()[0].valueDeclaration ?? declaration,
    )
    : undefined;
  const typedExample = stripExampleFence(commentText(symbol, 'example'));
  const sourceExample = isComponent ? componentUsage(name) : hookUsage(name);
  const example = typedExample || sourceExample;

  references.push({
    name,
    kind: isComponent ? 'component' : 'hook',
    description: commentText(symbol),
    returnType: typeText(signature.getReturnType(), declaration),
    parameters,
    props: isComponent && parameterType ? propertyDocs(parameterType, declaration) : [],
    nativeElement: isComponent && parameterType ? nativeElement(parameterType) : undefined,
    example,
  });
}

references.sort((left, right) => left.kind === right.kind
  ? left.name.localeCompare(right.name)
  : left.kind === 'component' ? -1 : 1);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `// Generated from @ilovecode33/ui exports and their TSDoc/JSDoc. Do not edit by hand.\n` +
    `type LibraryPropDoc = { name: string; type: string; optional: boolean; description: string };\n` +
    `type LibraryParameterDoc = LibraryPropDoc & { options: LibraryPropDoc[] };\n` +
    `export type LibraryReferenceEntry = { name: string; kind: 'component' | 'hook'; description: string; returnType: string; parameters: LibraryParameterDoc[]; props: LibraryPropDoc[]; nativeElement?: 'button' | 'input' | 'textarea' | 'html'; example: string };\n` +
    `export const LIBRARY_REFERENCE: LibraryReferenceEntry[] = ${JSON.stringify(references, null, 2)};\n`,
);

console.log(`Generated ${references.length} component and hook references.`);
