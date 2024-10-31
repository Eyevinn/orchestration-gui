import { SourceReference } from '../../interfaces/Source';
import { Production } from '../../interfaces/production';

export function removeSetupItem(
  source: SourceReference,
  productionSetup: Production,
  ingestSourceId?: number
): Production | null {
  const tempItems = productionSetup.sources.filter(
    (tempItem) => tempItem._id !== source._id
  );

  let updatedPipelines = productionSetup.production_settings.pipelines;

  if (ingestSourceId !== undefined) {
    updatedPipelines = productionSetup.production_settings.pipelines.map(
      (pipeline) => ({
        ...pipeline,
        sources: pipeline.sources
          ? pipeline.sources.filter(
              (pipelineSource) => pipelineSource.source_id !== ingestSourceId
            )
          : []
      })
    );
  }

  return {
    ...productionSetup,
    sources: tempItems,
    production_settings: {
      ...productionSetup.production_settings,
      pipelines: updatedPipelines
    }
  };
}
