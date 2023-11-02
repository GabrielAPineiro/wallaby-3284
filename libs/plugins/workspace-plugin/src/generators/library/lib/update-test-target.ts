import { readProjectConfiguration, Tree, updateProjectConfiguration } from '@nx/devkit';
import { normalizeProjectName } from '../../utils/project';
import { NormalizedSchema } from './normalized-options';

export function updateTestTarget(host: Tree, options: NormalizedSchema): void {
	const projectName = normalizeProjectName(options.projectName, options.projectDirectory);
	const projectConfiguration = readProjectConfiguration(host, projectName);

	if (projectConfiguration.targets?.test) {
		projectConfiguration.targets.test = {
			...projectConfiguration.targets.test,
			configurations: {
				...projectConfiguration.targets.test.configurations,
				production: {
					watch: false,
					browsers: 'ChromeHeadlessNoSandbox',
				},
			},
		};
	}

	updateProjectConfiguration(host, projectName, projectConfiguration);
}
