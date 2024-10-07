import { useState } from 'react';
import { CallbackHook } from './types';
import { Production } from '../interfaces/production';
import { ResourcesCompactPipelineResponse } from '../../types/ateliere-live';

export function useCheckProductionPipelinesAndControlPanels(): CallbackHook<
  (
    production: Production,
    pipelines: ResourcesCompactPipelineResponse[] | undefined
  ) => Production
> {
  const [loading, setLoading] = useState(false);

  const checkProductionPipelinesAndControlPanels = (
    production: Production,
    pipelines: ResourcesCompactPipelineResponse[] | undefined
  ) => {
    if (!production.production_settings) return production;
    const productionPipelines = production.production_settings.pipelines;

    const activePipelinesForProduction = pipelines?.filter((pipeline) =>
      productionPipelines.some(
        (productionPipeline) =>
          productionPipeline.pipeline_name === pipeline.name
      )
    );
    const availablePipelines = productionPipelines.map((productionPipeline) => {
      const activePipeForProduction = activePipelinesForProduction?.find(
        (p) => p.name === productionPipeline.pipeline_name
      );
      if (activePipeForProduction?.streams.length === 0) {
        return productionPipeline;
      }
      return productionPipeline;
    });

    return {
      ...production,
      production_settings: {
        ...production.production_settings,
        pipelines: availablePipelines
      }
    };
  };
  return [checkProductionPipelinesAndControlPanels, loading];
}
