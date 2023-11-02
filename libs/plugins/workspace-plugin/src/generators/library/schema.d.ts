export interface LibraryGeneratorSchema {
	domain: string;
	type: string;
	name?: string;
	subdomain?: string;
	tags?: string;
	shell?: boolean;
	skipFormat?: boolean;
	skipPackageJson?: boolean;
	dryRun?: boolean;
	addStorybook?: boolean;
	[key: string]: any;
}
