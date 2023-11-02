import { getWorkspaceLayout, Tree } from '@nx/devkit';
import { addOrganizeImportsIgnore } from '../../utils/ast-utils';
import { NormalizedSchema } from './normalized-options';

export function addTestOrganizeImportsIgnore(host: Tree, options: NormalizedSchema): void {
	const { libsDir } = getWorkspaceLayout(host);
	const path = `${libsDir}/${options.projectRoot}/src/test.ts`;
	const source = host.read(path, 'utf-8');

	if (source) {
		const newSourceFile = addOrganizeImportsIgnore(source);
		host.write(path, newSourceFile);
	}
}
