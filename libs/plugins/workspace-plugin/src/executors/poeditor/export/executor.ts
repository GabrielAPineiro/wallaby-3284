import { ProjectsApiFactory } from '@exclaimer/shared/api-client-poeditor';
import { ExecutorContext, logger } from '@nx/devkit';
import axios from 'axios';
import { DEFAULT_LANGUAGES, downloadToFile, exec, findProjectIdByName } from '../utils';
import { PoeditorExportExecutorSchema } from './schema';

interface NormalizedSchema extends PoeditorExportExecutorSchema {
	apiKey: string;
	projectId: number;
}

async function normalizeOptions(options: PoeditorExportExecutorSchema): Promise<NormalizedSchema> {
	const apiKey = options.apiKey ?? process.env.NX_POEDITOR_API_KEY;

	if (!apiKey) {
		throw new Error('No API key defined, please set "NX_POEDITOR_API_KEY"!');
	}

	const projectId = typeof options.project === 'number' ? options.project : await findProjectIdByName(apiKey, options.project);

	if (!projectId) {
		throw new Error(`Could not find project with name "${options.project}"!`);
	}

	return {
		...options,
		apiKey,
		projectId,
	};
}

export default async function runExecutor(options: PoeditorExportExecutorSchema, context: ExecutorContext): Promise<{ success: boolean }> {
	const normalizedOptions = await normalizeOptions(options);
	if (context.isVerbose) {
		logger.info(`Normalized options: ${JSON.stringify(normalizedOptions)}`);
	}

	const results = await Promise.all(
		DEFAULT_LANGUAGES.map((language) => {
			const filePath = `${normalizedOptions.outputPath}/${language}.json`;
			logger.log(`Exporting ${language} translations to "${filePath}".`);
			return exportLanguage(normalizedOptions, language, filePath);
		}),
	);

	for (const result of results) {
		if (!result.success) {
			return result;
		}
	}

	logger.log('All translations exported successfully!');

	logger.log('Formatting translations...');

	exec(`npx prettier --write ${normalizedOptions.outputPath}`);

	return { success: true };
}

async function exportLanguage(normalizedOptions: NormalizedSchema, language: string, filePath: string): Promise<{ success: boolean }> {
	const exportUrl = await getLanguageExportUrl(normalizedOptions, language);

	if (!exportUrl) {
		return { success: false };
	}

	const success = await downloadToFile(axios, exportUrl, filePath);

	return { success };
}

async function getLanguageExportUrl(normalizedOptions: NormalizedSchema, language: string, type: string = 'key_value_json'): Promise<string | null> {
	const projectsApi = ProjectsApiFactory();

	const exportUrlResponse = await projectsApi.projectsExportPost(normalizedOptions.apiKey, normalizedOptions.projectId, language, type);

	if (exportUrlResponse.status !== 200) {
		return null;
	}

	return exportUrlResponse.data.result?.url ?? null;
}
