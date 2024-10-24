import { useState } from 'react';
import { SrtSource } from '../../interfaces/Source';
import { CallbackHook } from '../types';
import { API_SECRET_KEY } from '../../utils/constants';

export function useCreateSrtSource(): CallbackHook<
  (uuid: string, srtPayload: SrtSource) => Promise<Response | undefined>
> {
  const [reloadList, setReloadList] = useState(false);

  const createSrtSource = async (uuid: string, srtPayload: SrtSource) => {
    setReloadList(false);
    return fetch(`/api/manager/ingests/${uuid}/srt/`, {
      method: 'POST',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify({ srtPayload })
    }).then(async (response) => {
      if (response.ok) {
        setTimeout(() => {
          setReloadList(true);
        }, 1500);
        return response;
      }
      throw await response.text();
    });
  };
  return [createSrtSource, reloadList];
}
