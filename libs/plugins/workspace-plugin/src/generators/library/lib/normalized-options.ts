import { getWorkspaceLayout, names, Tree } from '@nx/devkit';
import { dotnetProjectNames } from '../../utils/dotnet-project-names';
import { LibraryGeneratorSchema } from '../schema';

export interface NormalizedSchema extends LibraryGeneratorSchema {
	projectName: string;
	projectDirectory: string;
	projectRoot: string;
	fullProjectRoot: string;
	stackType: string;
	libType: string;
	importPath?: string;
	parsedTags: string[];
	addStorybook: boolean;
}

export enum LibraryType {
	FrontendDataAccess = 'frontend-data-access',
	FrontendFeature = 'frontend-feature',
	FrontendI18n = 'frontend-i18n',
	FrontendUi = 'frontend-ui',
	FrontendEmpty = 'frontend-empty',
	FrontendMain = 'frontend-main',
	BackendClassLibrary = 'backend-class-library',
	TestPageObjects = 'test-page-objects',
}

export interface LibraryTypeConfig {
	canAddStorybook?: boolean;
	libraryType: LibraryType;
}

export const libraryTypeConfigs: Record<LibraryType, LibraryTypeConfig> = {
	[LibraryType.FrontendDataAccess]: { libraryType: LibraryType.FrontendDataAccess },
	[LibraryType.FrontendFeature]: {
		libraryType: LibraryType.FrontendFeature,
		canAddStorybook: true,
	},
	[LibraryType.FrontendI18n]: { libraryType: LibraryType.FrontendI18n },
	[LibraryType.FrontendUi]: {
		libraryType: LibraryType.FrontendUi,
		canAddStorybook: true,
	},
	[LibraryType.FrontendMain]: {
		libraryType: LibraryType.FrontendMain,
		canAddStorybook: true,
	},
	[LibraryType.FrontendEmpty]: { libraryType: LibraryType.FrontendEmpty },
	[LibraryType.BackendClassLibrary]: { libraryType: LibraryType.BackendClassLibrary },
	[LibraryType.TestPageObjects]: { libraryType: LibraryType.TestPageObjects },
};

export function normalizeOptions(tree: Tree, options: LibraryGeneratorSchema): NormalizedSchema {
	const { libsDir } = getWorkspaceLayout(tree);

	const domain = names(options.domain).fileName;
	const subdomain = options.subdomain ? names(options.subdomain).fileName : null;
	const dotnetRootNamespace = `Exclaimer.CloudUi.${names(options.domain).className}`;
	options.dotnetRootNamespace = dotnetRootNamespace;

	const [stackType] = options.type.split('-');
	const libType = options.type.substring(stackType.length + 1);

	const projectName = getProjectName(options);
	const projectDirectory = `${domain}/${stackType}${subdomain ? `/${subdomain}` : ''}`;
	const projectRoot = `${projectDirectory}/${projectName}`;
	const fullProjectRoot = `${libsDir}/${projectRoot}`;
	const importPath = `@exclaimer/${domain}/${subdomain ? `${subdomain}/` : ''}${projectName}`;

	const parsedTags = new Set([
		`scope:${domain}`,
		`domain:${domain}`,
		`type:${libType}`,
		...(subdomain ? [`subdomain:${subdomain}`] : []),
		...(options.tags ? options.tags.split(',').map((s) => s.trim()) : []),
	]);

	return {
		...options,
		projectName,
		projectDirectory,
		projectRoot,
		fullProjectRoot,
		stackType,
		libType,
		importPath,
		parsedTags: Array.from(parsedTags),
		addStorybook: options.addStorybook ?? true,
	};
}

function getProjectName(options: LibraryGeneratorSchema): string {
	switch (options.type) {
		case LibraryType.BackendClassLibrary: {
			const dotnetNames = dotnetProjectNames(String(options.dotnetRootNamespace), options.name);
			return dotnetNames.classLib;
		}
		case LibraryType.FrontendFeature: {
			if (!options.name) {
				throw new Error('Missing name for frontend-feature');
			}

			const [, ...typeName] = options.type.split('-');
			typeName.push(names(options.name).fileName);
			return names(typeName.join('-')).fileName;
		}
		case LibraryType.FrontendEmpty: {
			if (!options.name) {
				throw new Error('Missing name for frontend-empty');
			}

			return names(options.name).fileName;
		}
		default: {
			const [, ...typeName] = options.type.split('-');
			return names(typeName.join('-')).fileName;
		}
	}
}
