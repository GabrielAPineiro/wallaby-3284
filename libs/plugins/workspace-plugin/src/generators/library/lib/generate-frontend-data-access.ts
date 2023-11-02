import { formatFiles, GeneratorCallback, names, Tree } from '@nx/devkit';
import { addFiles } from '../../utils/file-utils';
import { generateFrontendEmptyLibrary } from './generate-frontend-empty-library';
import { NormalizedSchema } from './normalized-options';

export async function generateFrontendDataAccessLibrary(tree: Tree, normalizedOptions: NormalizedSchema): Promise<GeneratorCallback> {
	const callback = await generateFrontendEmptyLibrary(tree, {
		...normalizedOptions,
		skipFormat: true,
	});

	const domainNames = names(normalizedOptions.domain);
	const normalizedDomain = domainNames.className;
	const uppercaseDomain = domainNames.constantName;
	const camelCaseDomain = domainNames.fileName;
	const featureFlagDomain = `${domainNames.propertyName}FeatureFlag`;

	addFiles(tree, { ...normalizedOptions, normalizedDomain, uppercaseDomain, camelCaseDomain, featureFlagDomain }, 'data-access', 'src');

	if (!normalizedOptions.skipFormat) {
		await formatFiles(tree);
	}

	return callback;
}
