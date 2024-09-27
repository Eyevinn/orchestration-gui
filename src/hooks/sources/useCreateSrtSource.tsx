import { useState } from 'react';
import { SrtSource } from '../../interfaces/Source';
import { CallbackHook } from '../types';
import { API_SECRET_KEY } from '../../utils/constants';

export function useCreateSrtSource(): CallbackHook<
  (uuid: string, srtPayload: SrtSource) => void
> {
  const [createSourceLoading, setCreateSourceLoading] = useState(false);
  const createSrtSource = async (uuid: string, srtPayload: SrtSource) => {
    setCreateSourceLoading(true);
    return fetch(`/api/manager/ingests/${uuid}/srt/`, {
      method: 'POST',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify({ srtPayload })
    })
      .then(async (response) => {
        if (response.ok) {
          return response;
        }
        throw await response.text();
      })
      .finally(() => setCreateSourceLoading(false));
  };
  return [createSrtSource, createSourceLoading];
}
