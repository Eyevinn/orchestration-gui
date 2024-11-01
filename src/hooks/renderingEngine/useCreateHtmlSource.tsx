import { useState } from 'react';
import {
  AddRenderingEngineSourceResult,
  SourceReference
} from '../../interfaces/Source';
import { Production } from '../../interfaces/production';
import { CallbackHook } from '../types';
import { Result } from '../../interfaces/result';
import { API_SECRET_KEY } from '../../utils/constants';
import { HTMLSource } from '../../interfaces/renderingEngine';
import { PipelineSettings } from '../../interfaces/pipeline';

export function useCreateHtmlSource(): CallbackHook<
  (
    pipelines: PipelineSettings[],
    inputSlot: number,
    htmlBody: HTMLSource,
    source: SourceReference
  ) => Promise<Result<AddRenderingEngineSourceResult>>
> {
  const [loading, setLoading] = useState<boolean>(false);

  const createHtmlSource = async (
    pipelines: PipelineSettings[],
    inputSlot: number,
    htmlBody: HTMLSource,
    source: SourceReference
  ): Promise<Result<AddRenderingEngineSourceResult>> => {
    setLoading(true);

    return fetch(`/api/manager/rendering-engine/html`, {
      method: 'POST',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify({
        pipelines,
        inputSlot: inputSlot,
        htmlBody: htmlBody,
        source: source
      })
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        }
        throw await response.text();
      })
      .finally(() => setLoading(false));
  };
  return [createHtmlSource, loading];
}
