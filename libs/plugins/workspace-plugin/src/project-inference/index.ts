import { TargetConfiguration } from '@nx/devkit';
import { registerDotnetProjectTargets } from './registerDotnetProjectTargets';

export const projectFilePatterns = ['*.csproj'];

export function registerProjectTargets(projectFilePath: string): Record<string, TargetConfiguration> {
	if (projectFilePath.endsWith('.csproj')) {
		return registerDotnetProjectTargets(projectFilePath);
	}

	return {};
}
