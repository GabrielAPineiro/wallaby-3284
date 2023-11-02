import { ProjectsApiFactory } from '@exclaimer/shared/api-client-poeditor';
import { logger } from '@nx/devkit';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { execSync } from 'child_process';
import * as fs from 'fs';

export const DEFAULT_LANGUAGES = ['en-us', 'nl', 'fr', 'de', 'it', 'pt', 'es'];

export async function downloadToFile(axios: AxiosInstance, downloadUrl: string, filePath: string): Promise<boolean> {
	const writer = fs.createWriteStream(filePath);

	const config: AxiosRequestConfig = {
		method: 'GET',
		url: downloadUrl,
		responseType: 'stream',
	};

	const response = await axios.request(config);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	response.data.pipe(writer);

	return new Promise((resolve) => {
		writer.on('finish', () => resolve(true));
		writer.on('error', () => resolve(false));
	});
}

export function createFileReadStream(filePath: string): fs.ReadStream {
	return fs.createReadStream(filePath, 'utf8');
}

export function exec(command: string, captureStdout?: boolean): string | null {
	const stdout = execSync(command, {
		stdio: ['inherit', captureStdout ? 'pipe' : 'inherit', 'inherit'],
	});

	if (captureStdout) {
		process.stdout.write(stdout);
		return stdout.toString().trim();
	}

	return null;
}

export async function findProjectIdByName(apiKey: string, projectName: string): Promise<number | null> {
	const projectsApi = ProjectsApiFactory();

	const projectsResponse = await projectsApi.projectsListPost(apiKey);

	if (projectsResponse.status !== 200) {
		logger.error(`Could not list projects: ${projectsResponse.statusText}`);
		return null;
	}

	const project = projectsResponse.data.result?.projects?.find((p) => p.name === projectName);

	return project?.id ?? null;
}
