import { useEffect, useState } from 'react';
import { SourceWithId } from '../../interfaces/Source';
import { API_SECRET_KEY } from '../../utils/constants';
import { CallbackHook } from '../types';

export function useSources(
  reloadList?: boolean,
  updatedSource?: SourceWithId,
  refreshKey?: number
): [Map<string, SourceWithId>, boolean] {
  const [sources, setSources] = useState<Map<string, SourceWithId>>(
    new Map<string, SourceWithId>()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/manager/sources?mocked=false', {
          method: 'GET',
          headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
        });

        if (response.ok) {
          const fetchedSources = (await response.json()) as SourceWithId[];
          const sourceMap = new Map<string, SourceWithId>();
          fetchedSources
            .sort((a, b) => (a.status === 'gone' ? 1 : -1))
            .map((source) => sourceMap.set(source._id.toString(), source));
          setSources(sourceMap);
        }
      } catch (error) {
        console.error('Error fetching sources:', error);
      } finally {
        setLoading(false);
      }
    };

    if (reloadList || !updatedSource || refreshKey) {
      fetchSources();
    } else if (updatedSource) {
      sources.set(updatedSource._id.toString(), updatedSource);
      setSources(new Map(sources));
    }
  }, [updatedSource, reloadList, refreshKey]);

  return [sources, loading];
}

export function useUpdateSources(): CallbackHook<
  () => Promise<Map<string, SourceWithId>[]>
> {
  const [loading, setLoading] = useState<boolean>(false);
  const updateSources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manager/sources?mocked=false', {
        method: 'GET',
        headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
      });
      setLoading(false);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error(`Error fetching sources: ${error}`);
      throw error;
    }
  };
  return [updateSources, loading];
}
