import { SourceReference } from '../../interfaces/Source';
import { Production } from '../../interfaces/production';

export function removeSetupItem(
  source: SourceReference,
  productionSetup: Production,
  ingestSourceName?: string,
  ingestName?: string
): Production | null {
  const tempItems = productionSetup.sources.filter(
    (tempItem) => tempItem._id !== source._id
  );

  let updatedPipelines = productionSetup.production_settings.pipelines;

  if (ingestSourceName !== undefined && ingestName !== undefined) {
    updatedPipelines = productionSetup.production_settings.pipelines.map(
      (pipeline) => ({
        ...pipeline,
        sources: pipeline.sources
          ? pipeline.sources.filter(
              (pipelineSource) =>
                pipelineSource.ingest_source_name !== ingestSourceName ||
                pipelineSource.ingest_name !== ingestName
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
