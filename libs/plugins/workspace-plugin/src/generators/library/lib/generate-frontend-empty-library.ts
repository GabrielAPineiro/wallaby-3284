import { libraryGenerator as angularLibraryGenerator } from '@nx/angular/generators';
import { formatFiles, GeneratorCallback, readNxJson, Tree } from '@nx/devkit';
import { addFiles, addStorybookToProject } from '../../utils/file-utils';
import { addTestOrganizeImportsIgnore } from './add-test-organize-imports-ignore';
import { LibraryType, libraryTypeConfigs, NormalizedSchema } from './normalized-options';
import { updateTestTarget } from './update-test-target';

export async function generateFrontendEmptyLibrary(tree: Tree, normalizedOptions: NormalizedSchema): Promise<GeneratorCallback> {
	const nxJson = readNxJson();
	const defaultAngularLibraryGeneratorOptions = nxJson?.generators ? nxJson.generators['@nx/angular:library'] : {};

	const callback = await angularLibraryGenerator(tree, {
		...defaultAngularLibraryGeneratorOptions,
		name: normalizedOptions.projectName,
		directory: normalizedOptions.projectDirectory,
		prefix: normalizedOptions.domain,
		importPath: normalizedOptions.importPath,
		tags: normalizedOptions.parsedTags.join(','),
		skipPackageJson: normalizedOptions.skipPackageJson,
		skipFormat: true,
		skipModule: true,
	});

	updateTestTarget(tree, normalizedOptions);

	addTestOrganizeImportsIgnore(tree, normalizedOptions);
	tree.delete(`${normalizedOptions.fullProjectRoot}/.eslintrc.json`);
	tree.delete(`${normalizedOptions.fullProjectRoot}/karma.conf.js`);

	addFiles(tree, normalizedOptions, 'frontend-empty');

	if (normalizedOptions.addStorybook && canAddStorybook(normalizedOptions.type as LibraryType)) {
		addFiles(tree, normalizedOptions, '.storybook', '.storybook');
		addStorybookToProject(tree, normalizedOptions);
	}

	if (!normalizedOptions.skipFormat) {
		await formatFiles(tree);
	}

	return callback;
}

function canAddStorybook(type: LibraryType): boolean {
	return libraryTypeConfigs[type].canAddStorybook === true;
}
