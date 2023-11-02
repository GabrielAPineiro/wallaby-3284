import { formatFiles, generateFiles, joinPathFragments, names, readProjectConfiguration, Tree, updateJson } from '@nx/devkit';
import { ConfigurationSettingsGeneratorSchema } from './schema';

function underscore(val: string): string {
	return val.replace('-', '_');
}
function noSpecialChars(val: string): string {
	return val.replace(/[^a-zA-Z0-9]/g, '');
}

export async function configurationSettingsGenerator(tree: Tree, schema: ConfigurationSettingsGeneratorSchema): Promise<void> {
	const libraryRoot = readProjectConfiguration(tree, schema.configurationArea).root;
	const fileNames = names(schema.name);
	generateFiles(
		tree, // the virtual file system
		joinPathFragments(__dirname, './files'), // path to the file templates
		joinPathFragments(libraryRoot, 'src', 'lib', fileNames.fileName), // destination path of the files
		{
			componentName: fileNames.className,
			fileName: fileNames.fileName,
			noSpecialChars,
			underscore,
			...schema, // config object to replace variable in file templates
			tpl: '', // empty string to replace __tpl__ in file names
		},
	);

	// Update the translations file as we added a new component
	const i18nLibraryRoot = readProjectConfiguration(tree, 'cloud-ui-i18n').root;
	updateJson(tree, joinPathFragments(i18nLibraryRoot, 'src', 'translations', 'en-us.json'), (json: { [key: string]: unknown }) => {
		// eslint-disable-next-line camelcase
		json[underscore(fileNames.fileName)] = { title: fileNames.className, subtitle: '', help_link: `Help - ${fileNames.className}` };

		return json;
	});
	await formatFiles(tree);
}

export default configurationSettingsGenerator;
