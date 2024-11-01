import { useState } from 'react';
import {
  AddRenderingEngineSourceResult,
  SourceReference
} from '../../interfaces/Source';
import { Production } from '../../interfaces/production';
import { CallbackHook } from '../types';
import { Result } from '../../interfaces/result';
import { API_SECRET_KEY } from '../../utils/constants';
import { MediaSource } from '../../interfaces/renderingEngine';
import { PipelineSettings } from '../../interfaces/pipeline';

export function useCreateMediaSource(): CallbackHook<
  (
    pipelines: PipelineSettings[],
    inputSlot: number,
    mediaBody: MediaSource,
    source: SourceReference
  ) => Promise<Result<AddRenderingEngineSourceResult>>
> {
  const [loading, setLoading] = useState<boolean>(false);

  const createMediaSource = async (
    pipelines: PipelineSettings[],
    inputSlot: number,
    mediaBody: MediaSource,
    source: SourceReference
  ): Promise<Result<AddRenderingEngineSourceResult>> => {
    setLoading(true);

    return fetch(`/api/manager/rendering-engine/media`, {
      method: 'POST',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify({
        pipelines,
        inputSlot: inputSlot,
        mediaBody: mediaBody,
        source: source
      })
    })
      .then(async (response) => {
        if (response.ok) {
          const text = await response.text();
          return text ? JSON.parse(text) : {};
        }
        throw await response.text();
      })
      .finally(() => setLoading(false));
  };
  return [createMediaSource, loading];
}
