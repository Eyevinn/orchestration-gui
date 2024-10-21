import { API_SECRET_KEY } from '../../utils/constants';
import { CallbackHook } from '../types';
import { useState } from 'react';

export function usePipelineMediaSources(): CallbackHook<
  (pipelineUuid: string) => Promise<void>
> {
  const [loading, setLoading] = useState<boolean>(false);
  const getPipelineMediaSources = async (
    pipelineUuid: string
  ): Promise<void> => {
    setLoading(true);
    const response = await fetch(
      `/api/manager/pipelines/${pipelineUuid}/rendering-engine/media/get`,
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
  return [getPipelineMediaSources, loading];
}
