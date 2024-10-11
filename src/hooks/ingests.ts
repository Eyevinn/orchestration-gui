import { useState, useCallback, useEffect } from 'react';
import { API_SECRET_KEY } from '../utils/constants';
import {
  ResourcesIngestResponse,
  ResourcesIngestStreamResponse
} from '../../types/ateliere-live';
import { CallbackHook } from './types';

export function useIngests(): ResourcesIngestResponse[] {
  const [ingests, setIngests] = useState<ResourcesIngestResponse[]>([]);

  useEffect(() => {
    fetch('/api/manager/ingests/', {
      method: 'GET',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
    }).then(async (response) => {
      if (response.ok) {
        const fetchedIngests =
          (await response.json()) as ResourcesIngestResponse[];
        setIngests(fetchedIngests);
      }
    });
    return;
  }, []);
  return ingests;
}

export function useIngestStreams() {
  return async (
    ingest_name: string,
    ingest_source_name: string
  ): Promise<ResourcesIngestStreamResponse[]> => {
    if (ingest_name) {
      try {
        const response = await fetch(
          `/api/manager/ingests/streams/${ingest_name}/${ingest_source_name}`,
          {
            method: 'GET',
            headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
          }
        );
        if (response.ok) {
          return await response.json();
        } else {
          throw new Error(await response.text());
        }
      } catch (error) {
        console.error(`Error fetching ingest streams: ${error}`);
        throw error;
      }
    } else {
      throw new Error('Missing parameters: ingest_name');
    }
  };
}

export function useIngestSourceId(): CallbackHook<
  (ingest_name: string, ingest_source_name: string) => Promise<number>
> {
  const [loading, setLoading] = useState<boolean>(false);
  const getIngestSourceId = async (
    ingest_name: string,
    ingest_source_name: string
  ): Promise<number> => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/manager/ingests/source_id/${ingest_name}/${ingest_source_name}`,
        {
          method: 'GET',
          headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
        }
      );
      setLoading(false);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error(`Error fetching ingest source id: ${error}`);
      throw error;
    }
  };
  return [getIngestSourceId, loading];
}
