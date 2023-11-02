import { formatFiles, generateFiles, joinPathFragments, names, readProjectConfiguration, Tree } from '@nx/devkit';
import { ComponentGeneratorSchema } from './schema';

export async function componentGenerator(tree: Tree, schema: ComponentGeneratorSchema): Promise<void> {
	const libraryConfig = readProjectConfiguration(tree, schema.project);
	const libraryRoot = libraryConfig.root;
	const fileNames = names(`${schema.domain}-${schema.name}`);
	generateFiles(
		tree, // the virtual file system
		joinPathFragments(__dirname, './files/base'), // path to the file templates
		joinPathFragments(libraryRoot, 'src', 'lib', schema.name), // destination path of the files
		{
			componentName: fileNames.className,
			fileName: fileNames.fileName,
			...schema, // config object to replace variable in file templates
			tpl: '', // empty string to replace __tpl__ in file names
		},
	);

	if (schema.includeHarness) {
		generateFiles(
			tree, // the virtual file system
			joinPathFragments(__dirname, './files/testing'), // path to the file templates
			joinPathFragments(libraryRoot, 'src', 'lib', schema.name, 'testing'), // destination path of the files
			{
				componentName: fileNames.className,
				fileName: fileNames.fileName,
				...schema, // config object to replace variable in file templates
				tpl: '', // empty string to replace __tpl__ in file names
			},
		);
	}

	if (schema.includeStories) {
		generateFiles(
			tree, // the virtual file system
			joinPathFragments(__dirname, './files/stories'), // path to the file templates
			joinPathFragments(libraryRoot, 'src', 'lib', schema.name), // destination path of the files
			{
				componentName: fileNames.className,
				fileName: fileNames.fileName,
				...schema, // config object to replace variable in file templates
				tpl: '', // empty string to replace __tpl__ in file names
			},
		);
	}

	await formatFiles(tree);
}

export default componentGenerator;
