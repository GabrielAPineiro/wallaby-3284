/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { generateFiles, offsetFromRoot, readProjectConfiguration, Tree, updateProjectConfiguration } from '@nx/devkit';
import * as path from 'path';
import { NormalizedSchema } from '../library/lib/normalized-options';
import { normalizeProjectName } from './project';

export function addFiles(tree: Tree, options: NormalizedSchema & { [k: string]: any }, source: string, destination?: string): void {
	const templateOptions = {
		...options,
		offsetFromRoot: offsetFromRoot(options.fullProjectRoot),
		tpl: '',
	};

	const target = destination ? path.join(options.fullProjectRoot, destination) : options.fullProjectRoot;
	generateFiles(tree, path.join(__dirname, '../library/files/', source), target, templateOptions);
}

export function addStorybookToProject(tree: Tree, options: NormalizedSchema): void {
	const projectName = normalizeProjectName(options.projectName, options.projectDirectory);
	const projectConfiguration = readProjectConfiguration(tree, projectName);

	if (projectConfiguration.targets) {
		projectConfiguration.targets.storybook = {
			executor: '@storybook/angular:start-storybook',
			options: {
				port: 4400,
				configDir: path.join(options.fullProjectRoot, '.storybook'),
				browserTarget: `${options.domain}-${options.projectName}:build`,
				compodoc: false,
			},
			configurations: {
				ci: {
					quiet: true,
				},
			},
		};

		projectConfiguration.targets['build-storybook'] = {
			executor: '@storybook/angular:build-storybook',
			outputs: ['{options.outputDir}'],
			options: {
				outputDir: `dist/storybook/${options.projectName}`,
				configDir: path.join(options.fullProjectRoot, '.storybook'),
				browserTarget: `${options.domain}-${options.projectName}:build`,
				compodoc: false,
			},
			configurations: {
				ci: {
					quiet: true,
				},
			},
		};
	}

	updateProjectConfiguration(tree, projectName, projectConfiguration);
}
