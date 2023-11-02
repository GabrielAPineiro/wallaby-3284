import { formatFiles, GeneratorCallback, names, Tree } from '@nx/devkit';
import { addFiles } from '../../utils/file-utils';
import { generateFrontendEmptyLibrary } from './generate-frontend-empty-library';
import { NormalizedSchema } from './normalized-options';

export async function generateFrontendI18nLibrary(tree: Tree, normalizedOptions: NormalizedSchema): Promise<GeneratorCallback> {
	const callback = await generateFrontendEmptyLibrary(tree, { ...normalizedOptions, skipFormat: true });

	const domainNames = names(normalizedOptions.domain);
	const normalizedDomain = domainNames.propertyName;

	addFiles(tree, { ...normalizedOptions, normalizedDomain }, 'frontend-i18n', 'src');

	if (!normalizedOptions.skipFormat) {
		await formatFiles(tree);
	}

	return callback;
}
