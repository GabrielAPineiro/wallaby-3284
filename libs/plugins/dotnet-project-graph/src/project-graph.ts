import { logger, ProjectConfiguration, ProjectGraph, ProjectGraphBuilder, ProjectGraphProcessorContext } from '@nx/devkit';
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';

// eslint-disable-next-line dot-notation
const verbose = Boolean(process.env['NX_VERBOSE_LOGGING']);

function getSlnProjectPaths(): string[] {
	const cmd = `dotnet sln list`;
	if (verbose) {
		logger.debug(cmd);
	}
	const [, , ...projects] = execSync(cmd).toString().trim().split(os.EOL);
	return projects.map((project: string) => path.parse(project).dir);
}

function getProjectReferences(projectPath: string): string[] {
	const cmd = `dotnet list ${projectPath} reference`;
	if (verbose) {
		logger.debug(cmd);
	}
	const [, , ...projects] = execSync(cmd).toString().trim().split(os.EOL);

	return projects.map((project: string) => {
		const rootPath = path.join(projectPath, path.parse(project).dir);
		return rootPath;
	});
}

function parsePath(pathStr: string): string {
	const { dir, base } = path.parse(pathStr);
	return path.join(dir, base);
}

function getWorkspaceProjects(context: ProjectGraphProcessorContext): Map<string, ProjectConfiguration & { projectName: string }> {
	const { workspace } = context;
	const wspProjects = workspace.projects;

	const workspaceProjects = new Map<string, ProjectConfiguration & { projectName: string }>();

	try {
		for (const projectName of Object.keys(wspProjects)) {
			const project = wspProjects[projectName];
			const projectRoot = parsePath(project.root);
			workspaceProjects.set(projectRoot, { ...project, projectName });
		}
	} catch (error) {
		logger.error(error);
	}

	return workspaceProjects;
}

export function processProjectGraph(graph: ProjectGraph, context: ProjectGraphProcessorContext): ProjectGraph {
	const workspaceProjects = getWorkspaceProjects(context);

	const builder = new ProjectGraphBuilder(graph);

	try {
		const projectBasePaths = getSlnProjectPaths();

		for (const projectBasePath of projectBasePaths) {
			if (workspaceProjects.has(projectBasePath)) {
				const project = workspaceProjects.get(projectBasePath);
				const projectName = project?.projectName ?? '';

				const projectReferences = getProjectReferences(projectBasePath);

				for (const projectReference of projectReferences) {
					// eslint-disable-next-line max-depth
					if (workspaceProjects.has(projectReference)) {
						const depProject = workspaceProjects.get(projectReference);
						const depProjectName = depProject?.projectName ?? '';

						// eslint-disable-next-line max-depth
						if (verbose) {
							logger.log(`${projectName} -> ${depProjectName}`);
						}

						builder.addImplicitDependency(projectName, depProjectName);
					}
				}
			} else {
				logger.warn(`${projectBasePath} is missing a project.json config.`);
			}
		}
	} catch (error) {
		logger.log(error);
	}

	return builder.getUpdatedProjectGraph();
}
