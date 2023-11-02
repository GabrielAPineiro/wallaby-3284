import { logger, ProjectGraphBuilder, ProjectGraphProcessorContext } from '@nx/devkit';

export function processStorybookProjectGraph(builder: ProjectGraphBuilder, context: ProjectGraphProcessorContext): ProjectGraphBuilder {
	try {
		const { projects } = context.workspace;
		const projectNames = Object.keys(context.workspace.projects);
		const projectNamesWithStorybook = projectNames.filter(
			(projectName) =>
				projectName !== 'monorepo-storybook' &&
				(projects[projectName].targets?.['build-storybook'] || projects[projectName].targets?.storybook),
		);

		for (const projectName of projectNamesWithStorybook) {
			// Add a dependency from the storybook project to the project.
			builder.addImplicitDependency('monorepo-storybook', projectName);
		}
	} catch (error) {
		logger.log(error);
	}

	return builder;
}
