import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { GeneratorCallback, ProjectConfiguration, Tree, addProjectConfiguration, formatFiles, names } from '@nx/devkit';
import { NormalizedSchema } from './normalized-options';

export async function generateBackendClassLibrary(tree: Tree, normalizedOptions: NormalizedSchema): Promise<GeneratorCallback> {
	const dotnetClient = new DotNetClient(dotnetFactory());

	const projectName = `${normalizedOptions.domain}-backend-${names(normalizedOptions.name || 'core').fileName}`;

	const projectConfiguration: ProjectConfiguration = {
		name: projectName,
		root: normalizedOptions.fullProjectRoot,
		sourceRoot: normalizedOptions.fullProjectRoot,
		projectType: 'library',
		tags: [...normalizedOptions.parsedTags, 'stack:dotnet'],
	};

	addProjectConfiguration(tree, projectName, projectConfiguration, true);

	const testProjectName = `${projectName}-test`;

	const testProjectConfiguration: ProjectConfiguration = {
		name: testProjectName,
		root: `${normalizedOptions.fullProjectRoot}.Test`,
		sourceRoot: `${normalizedOptions.fullProjectRoot}.Test`,
		projectType: 'library',
		tags: [...normalizedOptions.parsedTags, 'type:tests', 'stack:dotnet'],
	};

	addProjectConfiguration(tree, testProjectName, testProjectConfiguration, true);

	try {
		const output = `libs/${normalizedOptions.projectDirectory}`;
		const rootNamespace = String(normalizedOptions.dotnetRootNamespace);
		const slnPath = `${output}/${rootNamespace}.sln`;

		if (!tree.exists(slnPath)) {
			dotnetClient.new('sln', { name: rootNamespace, output, dryRun: normalizedOptions.dryRun });
		}

		dotnetClient.new('classlib', {
			name: normalizedOptions.projectName,
			output: `${output}/${normalizedOptions.projectName}`,
			dryRun: normalizedOptions.dryRun,
		});

		if (!normalizedOptions.dryRun) {
			dotnetClient.addProjectToSolution(slnPath, `${output}/${normalizedOptions.projectName}`);
		}

		dotnetClient.new('nunit', {
			name: `${normalizedOptions.projectName}.Test`,
			output: `${output}/${normalizedOptions.projectName}.Test`,
			dryRun: normalizedOptions.dryRun,
		});

		if (!normalizedOptions.dryRun) {
			dotnetClient.addProjectToSolution(slnPath, `${output}/${normalizedOptions.projectName}.Test`);
			dotnetClient.addProjectReference(`${output}/${normalizedOptions.projectName}.Test`, `${output}/${normalizedOptions.projectName}`);
		}
	} catch (e) {
		console.error(e);
	}

	if (!normalizedOptions.skipFormat) {
		await formatFiles(tree);
	}

	return () => Promise.resolve();
}
