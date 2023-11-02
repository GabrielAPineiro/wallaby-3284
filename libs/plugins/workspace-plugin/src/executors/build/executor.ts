import { BuildExecutorSchema } from './schema';

export default function runExecutor(options: BuildExecutorSchema): Promise<{ success: boolean }> {
	console.log('Executor ran for Build', options);
	return Promise.resolve({
		success: true,
	});
}
