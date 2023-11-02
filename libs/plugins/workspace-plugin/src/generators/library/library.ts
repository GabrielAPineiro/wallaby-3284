import { GeneratorCallback, Tree } from '@nx/devkit';
import { normalizeOptions } from './lib/normalized-options';
import { processLibraryType } from './lib/process-library-type';
import type { LibraryGeneratorSchema } from './schema';

export function libraryGenerator(tree: Tree, options: LibraryGeneratorSchema): Promise<GeneratorCallback> {
	const normalizedOptions = normalizeOptions(tree, options);
	console.log(normalizedOptions);
	return processLibraryType(tree, normalizedOptions);
}

export default libraryGenerator;
