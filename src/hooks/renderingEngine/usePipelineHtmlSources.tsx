import { CallbackHook } from '../types';
import { useState } from 'react';
import { API_SECRET_KEY } from '../../utils/constants';

export function usePipelineHtmlSources(): CallbackHook<
  (pipelineUuid: string) => Promise<void>
> {
  const [loading, setLoading] = useState<boolean>(false);

  const getPipelineHtmlSources = async (
    pipelineUuid: string
  ): Promise<void> => {
    setLoading(true);
    const response = await fetch(
      `/api/manager/pipelines/${pipelineUuid}/rendering-engine/html/get`,
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
  return [getPipelineHtmlSources, loading];
}
