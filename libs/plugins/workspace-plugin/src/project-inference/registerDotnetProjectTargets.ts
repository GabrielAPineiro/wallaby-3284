import { TargetConfiguration } from '@nx/devkit';
import * as path from 'path';

export function registerDotnetProjectTargets(projectFilePath: string): Record<string, TargetConfiguration> {
	const projectDirectory = path.dirname(projectFilePath);
	const projectFileName = path.basename(projectFilePath);
	const distDirectory = path.join('dist', projectDirectory).split(path.sep).join('/');
	const objDirectory = path.join(projectDirectory, 'obj').split(path.sep).join('/');

	const targetConfig: Record<string, TargetConfiguration> = {
		build: {
			executor: '@nx-dotnet/core:build',
			outputs: [distDirectory, objDirectory],
			options: {
				configuration: 'Debug',
				noDependencies: true,
				verbosity: 'normal',
			},
			configurations: {
				production: {
					configuration: 'Release',
				},
			},
		},
		lint: {
			executor: '@nx-dotnet/core:format',
			options: {
				verbosity: 'diagnostic',
				severity: 'error',
			},
		},
	};

	if (projectFileName.endsWith('.Test.csproj') || projectFileName.endsWith('.Tests.csproj')) {
		targetConfig.test = {
			executor: '@nx-dotnet/core:test',
			options: {
				verbosity: 'normal',
				logger: 'trx;LogFilePrefix=Results',
				collect: 'XPlat Code Coverage',
			},
		};
	} else if (projectDirectory.startsWith('apps')) {
		targetConfig.serve = {
			executor: '@nx-dotnet/core:serve',
			options: {
				configuration: 'Debug',
			},
			configurations: {
				production: {
					configuration: 'Release',
				},
			},
		};
	}

	return targetConfig;
}
