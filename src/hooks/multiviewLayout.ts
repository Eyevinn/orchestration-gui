import { useEffect, useState } from 'react';
import { MultiviewPreset } from '../interfaces/preset';
import { DataHook } from './types';
import { WithId } from 'mongodb';
import { API_SECRET_KEY } from '../utils/constants';

export function useGetMultiviewLayouts() {
  return async (): Promise<MultiviewPreset[]> => {
    const response = await fetch(`/api/manager/multiviews`, {
      method: 'GET',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]]
    });
    if (response.ok) {
      return response.json();
    }
    throw await response.text();
  };
}

export function useGetMultiviewLayout() {
  return async (id: string): Promise<WithId<MultiviewPreset>> => {
    const response = await fetch(`/api/manager/multiviews/${id}`, {
      method: 'GET',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]]
    });
    if (response.ok) {
      return await response.json();
    }
    throw await response.text();
  };
}

export function useMultiviewLayouts(): DataHook<MultiviewPreset[]> {
  const [loading, setLoading] = useState(true);
  const [multiviewLayouts, setmultiviewLayouts] = useState<MultiviewPreset[]>(
    []
  );

  useEffect(() => {
    setLoading(true);
    fetch('/api/manager/multiviews', {
      method: 'GET',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]]
    })
      .then(async (response) => {
        if (response.ok) {
          setmultiviewLayouts(await response.json());
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return [multiviewLayouts, loading, undefined];
}

export function usePutMultiviewLayout() {
  return async (newMultiviewLayout: MultiviewPreset): Promise<void> => {
    const response = await fetch('/api/manager/multiviews', {
      method: 'PUT',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify(newMultiviewLayout)
    });
    if (response.ok) {
      return;
    }
    throw await response.text();
  };
}
