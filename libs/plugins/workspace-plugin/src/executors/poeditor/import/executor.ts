import { LanguagesApiFactory, ProjectsApiFactory } from '@exclaimer/shared/api-client-poeditor';
import { ExecutorContext, logger, readJsonFile } from '@nx/devkit';
import * as os from 'os';
import { DEFAULT_LANGUAGES, findProjectIdByName } from '../utils';
import { PoeditorImportExecutorSchema } from './schema';

interface Term {
	term: string;
	context: string;
	translation: { content: string | string[] };
}

function getTerms(obj: Record<string, any>, path: string = ''): Term[] {
	return Object.entries(obj).reduce((acc, [key, value]) => {
		if (typeof value === 'string' || Array.isArray(value)) {
			acc.push({
				term: key,
				context: Array.isArray(value) ? `${path}.list` : path,
				translation: {
					content: Array.isArray(value) ? value.join(os.EOL) : value,
				},
			});
		} else {
			const newPath = path ? `${path}."${key}"` : `"${key}"`;
			acc.push(...getTerms(value as Record<string, any>, newPath));
		}

		return acc;
	}, [] as Term[]);
}

interface NormalizedSchema extends PoeditorImportExecutorSchema {
	apiKey: string;
	projectId: number;
	baseLanguage: string;
}

async function normalizeOptions(options: PoeditorImportExecutorSchema): Promise<NormalizedSchema> {
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
		baseLanguage: 'en-us',
	};
}

export default async function runExecutor(options: PoeditorImportExecutorSchema, context: ExecutorContext): Promise<{ success: boolean }> {
	const normalizedOptions = await normalizeOptions(options);

	if (context.isVerbose) {
		logger.info(`Normalized options: ${JSON.stringify(normalizedOptions)}`);
	}

	const projectsApi = ProjectsApiFactory();

	const file = readJsonFile<Record<string, any>>(`${normalizedOptions.outputPath}/${normalizedOptions.baseLanguage}.json`);

	const terms = getTerms(file);

	const response = await projectsApi.projectsSyncPost(normalizedOptions.apiKey, normalizedOptions.projectId, JSON.stringify(terms));

	if (response.status !== 200) {
		logger.error(response.statusText);
		return { success: false };
	}

	const results = await Promise.all(
		DEFAULT_LANGUAGES.map((language) => {
			const filePath = `${normalizedOptions.outputPath}/${language}.json`;
			logger.log(`Importing ${language} translations from "${filePath}".`);
			return importLanguage(normalizedOptions, language, filePath);
		}),
	);

	for (const result of results) {
		if (!result.success) {
			return result;
		}
	}

	logger.info(`Imported ${DEFAULT_LANGUAGES.length} languages successfully!`);

	return { success: true };
}

async function importLanguage(normalizedOptions: NormalizedSchema, language: string, filePath: string): Promise<{ success: boolean }> {
	const languagesApi = LanguagesApiFactory();

	try {
		await languagesApi.languagesDeletePost(normalizedOptions.apiKey, normalizedOptions.projectId, language);
		await languagesApi.languagesAddPost(normalizedOptions.apiKey, normalizedOptions.projectId, language);
	} catch (error) {
		logger.error(error);
		return { success: false };
	}

	const file = readJsonFile<Record<string, any>>(filePath);

	const terms = getTerms(file);

	const languagesUpdateResponse = await languagesApi.languagesUpdatePost(
		normalizedOptions.apiKey,
		normalizedOptions.projectId,
		language,
		undefined,
		JSON.stringify(terms),
	);

	if (languagesUpdateResponse.status !== 200) {
		logger.error(`Could not import ${language} translations: ${languagesUpdateResponse.statusText}`);
		return { success: false };
	}

	if (languagesUpdateResponse.data.response?.code !== '200') {
		logger.error(`Could not import ${language} translations: ${String(languagesUpdateResponse.data.response?.message)}`);
		return { success: false };
	}

	logger.info(`Imported ${language} translations successfully!`);
	logger.info(languagesUpdateResponse.data.result);

	return { success: true };
}
