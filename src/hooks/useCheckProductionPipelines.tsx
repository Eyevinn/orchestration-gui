import { useState } from 'react';
import { CallbackHook } from './types';
import { Production } from '../interfaces/production';
import { ResourcesCompactPipelineResponse } from '../../types/ateliere-live';

export function useCheckProductionPipelines(): CallbackHook<
  (
    production: Production,
    pipelines: ResourcesCompactPipelineResponse[] | undefined
  ) => Production
> {
  const [loading, setLoading] = useState(false);

  const checkProductionPipelines = (
    production: Production,
    pipelines: ResourcesCompactPipelineResponse[] | undefined
  ) => {
    if (!production) return production;
    const productionPipelines = production.pipelines;

    const activePipelinesForProduction = pipelines?.filter((pipeline) =>
      productionPipelines.some(
        (productionPipeline) => productionPipeline.pipeline_id === pipeline.uuid
      )
    );
    const availablePipelines = productionPipelines.map((productionPipeline) => {
      const activePipeForProduction = activePipelinesForProduction?.find(
        (p) => p.uuid === productionPipeline.pipeline_id
      );
      if (activePipeForProduction?.streams.length === 0) {
        return productionPipeline;
      }
      return productionPipeline;
    });

    return {
      ...production
    };
  };
  return [checkProductionPipelines, loading];
}
