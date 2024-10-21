import { CallbackHook } from '../types';
import { useState } from 'react';
import { API_SECRET_KEY } from '../../utils/constants';
import { ResourcesRenderingEngineResponse } from '../../../types/ateliere-live';

export function useRenderingEngine(): CallbackHook<
  (pipelineUuid: string) => Promise<ResourcesRenderingEngineResponse>
> {
  const [loading, setLoading] = useState<boolean>(false);

  const getRenderingEngine = async (
    pipelineUuid: string
  ): Promise<ResourcesRenderingEngineResponse> => {
    setLoading(true);
    const response = await fetch(
      `/api/manager/pipelines/${pipelineUuid}/rendering-engine`,
      {
        method: 'GET',
        headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
      }
    );
    setLoading(false);
    if (response.ok) {
      return await response.json();
    }
    throw await response.json();
  };
  return [getRenderingEngine, loading];
}
