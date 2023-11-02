import { scamGenerator as angularComponentGenerator } from '@nx/angular/generators';
import { formatFiles, GeneratorCallback, names, readNxJson, Tree } from '@nx/devkit';
import { importRouterModule, importTranslateModuleForChild } from '../../utils/ast-utils';
import { normalizeProjectName } from '../../utils/project';
import { generateFrontendEmptyLibrary } from './generate-frontend-empty-library';
import { NormalizedSchema } from './normalized-options';

export async function generateFrontendMainLibrary(tree: Tree, normalizedOptions: NormalizedSchema): Promise<GeneratorCallback> {
	const callback = await generateFrontendEmptyLibrary(tree, { ...normalizedOptions, skipFormat: true });

	const nxJson = readNxJson();
	const defaultAngularComponentGeneratorOptions = nxJson?.generators ? nxJson.generators['@nx/angular:component'] : {};

	const componentNames = names(`${normalizedOptions.domain}-${normalizedOptions.projectName}`);
	const componentClassName = `${componentNames.className}Component`;
	const moduleClassName = `${componentNames.className}ComponentModule`;

	const projectName = normalizeProjectName(normalizedOptions.projectName, normalizedOptions.projectDirectory);

	await angularComponentGenerator(tree, {
		...defaultAngularComponentGeneratorOptions,
		name: componentNames.fileName,
		project: projectName,
		flat: true,
		export: true,
		inlineScam: false,
	});

	const modulePath = `${normalizedOptions.fullProjectRoot}/src/lib/${componentNames.fileName}.module.ts`;
	const moduleSource = tree.read(modulePath, 'utf-8');

	if (moduleSource) {
		let newModuleSourceFile = importTranslateModuleForChild(moduleSource, moduleClassName);

		newModuleSourceFile = importRouterModule(newModuleSourceFile, [
			{
				path: '',
				component: componentClassName,
				importPath: `./${componentNames.fileName}.component`,
			},
		]);

		if (moduleSource !== newModuleSourceFile) {
			tree.write(modulePath, newModuleSourceFile);
		}
	}
	if (!normalizedOptions.skipFormat) {
		await formatFiles(tree);
	}

	return callback;
}
