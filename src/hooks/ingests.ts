import { useEffect, useState } from 'react';
import { ResourcesIngestResponse } from '../../types/ateliere-live';
import { API_SECRET_KEY } from '../utils/constants';

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
