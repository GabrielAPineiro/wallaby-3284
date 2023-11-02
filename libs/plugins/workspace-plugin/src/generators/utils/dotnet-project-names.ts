import { names } from '@nx/devkit';

export function dotnetProjectNames(rootNamespace: string, name?: string): Record<string, string> {
	const classLib = name ? `${rootNamespace}.${names(name).className}` : `${rootNamespace}.Core`;

	return {
		rootNamespace,
		sln: `${rootNamespace}.sln`,
		classLib,
		classLibTests: `${classLib}.Test`,
		bff: `${rootNamespace}.Bff`,
		bffTests: `${rootNamespace}.Bff.Test`,
		apiTests: `${rootNamespace}.Tests.API`,
		e2eTests: `${rootNamespace}.Tests.E2E`,
	};
}
