import { ProjectGraph, ProjectGraphBuilder, ProjectGraphProcessorContext } from '@nx/devkit';
import { processStorybookProjectGraph } from './processStorybookProjectGraph';

export function processProjectGraph(graph: ProjectGraph, context: ProjectGraphProcessorContext): ProjectGraph {
	let builder = new ProjectGraphBuilder(graph);

	builder = processStorybookProjectGraph(builder, context);

	return builder.getUpdatedProjectGraph();
}
