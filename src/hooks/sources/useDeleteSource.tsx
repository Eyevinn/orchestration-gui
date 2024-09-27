import { useState } from 'react';
import { CallbackHook } from '../types';
import { API_SECRET_KEY } from '../../utils/constants';

export function useDeleteSrtSource(): CallbackHook<
  (ingest_name: string, ingest_source_name: string) => void
> {
  const [deleteSrtLoading, setDeleteSrtLoading] = useState<boolean>(false);

  const deleteSrtSource = async (
    ingest_name: string,
    ingest_source_name: string
  ) => {
    setDeleteSrtLoading(true);
    return fetch(`/api/manager/srt/${ingest_name}/${ingest_source_name}/`, {
      method: 'DELETE',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        }
        throw await response.text;
      })
      .finally(() => setDeleteSrtLoading(false));
  };
  return [deleteSrtSource, deleteSrtLoading];
}
