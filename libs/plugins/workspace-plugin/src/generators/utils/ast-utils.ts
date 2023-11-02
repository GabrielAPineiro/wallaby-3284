import { tsquery } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

const IS_SINGLE_QUOTE = true;

export function stringifyNode(node: ts.Node): string {
	const sourceFile = ts.factory.createSourceFile([], ts.factory.createToken(ts.SyntaxKind.EndOfFileToken), ts.NodeFlags.None);
	return ts.createPrinter().printNode(ts.EmitHint.Unspecified, node, sourceFile);
}

export function insertImport(source: string, importPath: string, importName: string | string[]): string {
	const importDeclaration = createImportDeclaration(importPath, importName);

	const selector = 'ImportDeclaration';
	const importCount = tsquery.query(source, selector).length;
	return tsquery.replace(source, `${selector}:nth-child(${importCount})`, (node) => {
		return `${node.getText()}\n${stringifyNode(importDeclaration)}`;
	});
}

export function importRouterModule(source: string, routes: Array<{ path: string; component: string; importPath: string }>): string {
	let sourceFile = addImportToModule(source, createRouterModule(routes));
	sourceFile = insertImport(sourceFile, '@angular/router', 'RouterModule');

	for (const route of routes) {
		sourceFile = insertImport(sourceFile, route.importPath, route.component);
	}

	return sourceFile;
}

export function importTranslateModuleForChild(source: string, moduleClassName: string): string {
	let sourceFile = addImportToModule(source, ts.factory.createIdentifier('I18nModule'));
	sourceFile = addImportToModule(sourceFile, createTranslationModuleWithForChild());
	sourceFile = addTranslateService(sourceFile, moduleClassName);

	sourceFile = insertImport(sourceFile, '@ngx-translate/core', [
		'TranslateModule',
		'TranslateLoader',
		'MissingTranslationHandler',
		'TranslateService',
	]);
	sourceFile = insertImport(sourceFile, '@exclaimer/common/i18n', 'SupportedLanguage');
	sourceFile = insertImport(sourceFile, '@exclaimer/shared/common', [
		'ExclMissingTranslationHandler',
		'TranslateHttpLoaderFactory',
		'TranslateServiceHelper',
	]);
	sourceFile = insertImport(sourceFile, '@angular/core', ['Injector', 'isDevMode']);
	sourceFile = insertImport(sourceFile, '@angular/common/http', 'HttpClient');

	return sourceFile;
}

export function importTranslateModule(source: string): string {
	let sourceFile = addImportToModule(source, createTranslationModule());
	sourceFile = insertImport(sourceFile, '@ngx-translate/core', 'TranslateModule');

	return sourceFile;
}

export function addOrganizeImportsIgnore(source: string): string {
	return `// organize-imports-ignore\n${source}`;
}

function addImportToModule(source: string, moduleImport: ts.Expression): string {
	const selector = 'PropertyAssignment[name.escapedText=imports] ArrayLiteralExpression > :matches(Identifier,CallExpression)';
	const moduleImportCount = tsquery.query(source, selector).length;
	return tsquery.replace(source, `${selector}:nth-child(${moduleImportCount})`, (node) => {
		const text = node.getText();
		const comma = text.endsWith(',') ? '' : ',';
		return `${text}${comma} ${stringifyNode(moduleImport)}`;
	});
}

function createRouterModule(routes: Array<{ path: string; component: string }>): ts.Expression {
	return ts.factory.createCallExpression(
		ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('RouterModule'), ts.factory.createIdentifier('forChild')),
		[],
		[
			ts.factory.createArrayLiteralExpression(
				routes.map((route) => {
					return ts.factory.createObjectLiteralExpression([
						ts.factory.createPropertyAssignment('path', ts.factory.createStringLiteral(route.path, IS_SINGLE_QUOTE)),
						ts.factory.createPropertyAssignment('component', ts.factory.createIdentifier(route.component)),
					]);
				}),
			),
		],
	);
}

function createTranslationModuleWithForChild(): ts.Expression {
	return ts.factory.createCallExpression(
		ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('TranslateModule'), ts.factory.createIdentifier('forChild')),
		[],
		[
			ts.factory.createObjectLiteralExpression([
				ts.factory.createPropertyAssignment('defaultLanguage', ts.factory.createIdentifier('SupportedLanguage.enUs')),
				ts.factory.createPropertyAssignment('useDefaultLang', ts.factory.createIdentifier('!isDevMode()')),
				ts.factory.createPropertyAssignment(
					'missingTranslationHandler',
					ts.factory.createObjectLiteralExpression([
						ts.factory.createPropertyAssignment('provide', ts.factory.createIdentifier('MissingTranslationHandler')),
						ts.factory.createPropertyAssignment('useClass', ts.factory.createIdentifier('ExclMissingTranslationHandler')),
					]),
				),
				ts.factory.createPropertyAssignment(
					'loader',
					ts.factory.createObjectLiteralExpression([
						ts.factory.createPropertyAssignment('provide', ts.factory.createIdentifier('TranslateLoader')),
						ts.factory.createPropertyAssignment(
							'useFactory',
							ts.factory.createArrowFunction(
								[],
								[],
								[
									ts.factory.createParameterDeclaration(
										[],
										undefined,
										'http',
										undefined,
										ts.factory.createTypeReferenceNode('HttpClient'),
									),
									ts.factory.createParameterDeclaration(
										[],
										undefined,
										'inject',
										undefined,
										ts.factory.createTypeReferenceNode('Injector'),
									),
								],
								undefined,
								undefined,
								ts.factory.createCallExpression(
									ts.factory.createIdentifier('TranslateHttpLoaderFactory'),
									[],
									[
										ts.factory.createIdentifier('http'),
										ts.factory.createCallExpression(
											ts.factory.createIdentifier('inject.get'),
											[],
											[ts.factory.createIdentifier('MODULE_BASE_PATH')],
										),
									],
								),
							),
						),
						ts.factory.createPropertyAssignment(
							'deps',
							ts.factory.createArrayLiteralExpression([
								ts.factory.createIdentifier('HttpClient'),
								ts.factory.createIdentifier('Injector'),
							]),
						),
					]),
				),
				ts.factory.createPropertyAssignment('isolate', ts.factory.createTrue()),
			]),
		],
	);
}

function createTranslationModule(): ts.Expression {
	return ts.factory.createIdentifier('TranslateModule');
}

function addTranslateService(source: string, moduleClassName: string): string {
	const selector = `ClassDeclaration[name.name="${moduleClassName}"]`;
	const [existingModule] = tsquery.query(source, selector);

	if (!ts.canHaveDecorators(existingModule) || !ts.canHaveModifiers(existingModule)) {
		return source;
	}

	const constructor = ts.factory.createConstructorDeclaration(
		[ts.factory.createToken(ts.SyntaxKind.PublicKeyword)],
		[
			ts.factory.createParameterDeclaration(
				undefined,
				undefined,
				'translateService',
				undefined,
				ts.factory.createTypeReferenceNode('TranslateService'),
			),
		],
		ts.factory.createBlock([
			ts.factory.createExpressionStatement(
				ts.factory.createCallExpression(
					ts.factory.createIdentifier('TranslateServiceHelper.registerTranslateService'),
					[],
					[ts.factory.createIdentifier('translateService')],
				),
			),
		]),
	);

	const module = ts.factory.createClassDeclaration(
		[...(ts.getDecorators(existingModule) ?? []), ...(ts.getModifiers(existingModule) ?? [])],
		moduleClassName,
		undefined,
		undefined,
		[constructor],
	);

	return tsquery.replace(source, selector, () => stringifyNode(module));
}

function createImportDeclaration(importPath: string, importName: string | string[]): ts.ImportDeclaration {
	const importNames = Array.isArray(importName) ? importName : [importName];
	return ts.factory.createImportDeclaration(
		undefined,
		ts.factory.createImportClause(
			false,
			undefined,
			ts.factory.createNamedImports(
				importNames.map((name) => ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))),
			),
		),
		ts.factory.createStringLiteral(importPath, IS_SINGLE_QUOTE),
	);
}
