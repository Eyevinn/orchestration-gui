import { useEffect, useState } from 'react';
import { TMultiviewLayout } from '../interfaces/preset';
import { DataHook } from './types';
import { WithId } from 'mongodb';
import { API_SECRET_KEY } from '../utils/constants';

export function useGetMultiviewLayouts() {
  return async (): Promise<TMultiviewLayout[]> => {
    const response = await fetch(`/api/manager/multiviews`, {
      method: 'GET',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
    });
    if (response.ok) {
      return response.json();
    }
    throw await response.text();
  };
}

export function useGetMultiviewLayout() {
  return async (id: string): Promise<WithId<TMultiviewLayout>> => {
    const response = await fetch(`/api/manager/multiviews/${id}`, {
      method: 'GET',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
    });
    if (response.ok) {
      return await response.json();
    }
    throw await response.text();
  };
}

export function useMultiviewLayouts(): DataHook<TMultiviewLayout[]> {
  const [loading, setLoading] = useState(true);
  const [multiviewLayouts, setmultiviewLayouts] = useState<TMultiviewLayout[]>(
    []
  );

  useEffect(() => {
    setLoading(true);
    fetch('/api/manager/multiviews', {
      method: 'GET',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
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
  return async (newMultiviewLayout: TMultiviewLayout): Promise<void> => {
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
