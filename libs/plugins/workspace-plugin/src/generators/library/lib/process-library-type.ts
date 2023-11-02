import { GeneratorCallback, Tree } from '@nx/devkit';
import { generateBackendClassLibrary } from './generate-backend-class-library';
import { generateFrontendDataAccessLibrary } from './generate-frontend-data-access';
import { generateFrontendEmptyLibrary } from './generate-frontend-empty-library';
import { generateFrontendFeatureLibrary } from './generate-frontend-feature-library';
import { generateFrontendMainLibrary } from './generate-frontend-main-library';
import { generateFrontendI18nLibrary } from './generate-i18n-library';
import { LibraryType, NormalizedSchema } from './normalized-options';

export async function processLibraryType(tree: Tree, normalizedOptions: NormalizedSchema): Promise<GeneratorCallback> {
	switch (normalizedOptions.type) {
		case LibraryType.BackendClassLibrary:
			return generateBackendClassLibrary(tree, normalizedOptions);
		case LibraryType.FrontendDataAccess:
			return generateFrontendDataAccessLibrary(tree, normalizedOptions);
		case LibraryType.FrontendFeature:
			return generateFrontendFeatureLibrary(tree, normalizedOptions);
		case LibraryType.FrontendI18n:
			return generateFrontendI18nLibrary(tree, normalizedOptions);
		case LibraryType.FrontendUi:
			break;
		case LibraryType.FrontendEmpty:
			return generateFrontendEmptyLibrary(tree, normalizedOptions);
		case LibraryType.FrontendMain:
			return generateFrontendMainLibrary(tree, normalizedOptions);
		case LibraryType.TestPageObjects:
			break;
		default:
			throw new Error(`Unsupported library type: ${String(normalizedOptions.type)}`);
	}

	return () => Promise.resolve();
}
