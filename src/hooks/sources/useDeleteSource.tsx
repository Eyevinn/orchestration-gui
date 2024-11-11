import { useState } from 'react';
import { CallbackHook } from '../types';
import { API_SECRET_KEY } from '../../utils/constants';
import { useIngests, useIngestSources } from '../ingests';

export function useDeleteSrtSource(): CallbackHook<
  (ingest_name: string, ingest_source_name: string) => void
> {
  const [deleteSrtLoading, setDeleteSrtLoading] = useState<boolean>(false);
  const ingests = useIngests();
  const [getSources] = useIngestSources();

  const deleteSrtSource = async (
    ingest_name: string,
    ingest_source_name: string
  ) => {
    const ingestUuid =
      ingests.find((ingest) => ingest.name === ingest_name)?.uuid || '';

    const sources = await getSources(ingest_name);
    const sourceId = sources.find(
      (source) => source.name === ingest_source_name
    )?.source_id;

    if (ingestUuid !== '' && sourceId !== undefined) {
      return fetch(`/api/manager/srt/${ingestUuid}/${sourceId}/`, {
        method: 'DELETE',
        headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
      })
        .then(async (response) => {
          if (response.ok) {
            return response.json();
          }
          throw response.text;
        })
        .finally(() => setDeleteSrtLoading(false));
    } else {
      setDeleteSrtLoading(false);
      return;
    }
  };
  return [deleteSrtSource, deleteSrtLoading];
}
