import { useCallback, useState } from 'react';
import {
  FlowStep,
  Production,
  StartProductionStep,
  StopProductionStep
} from '../interfaces/production';
import { CallbackHook } from './types';
import { Result } from '../interfaces/result';
import { API_SECRET_KEY } from '../utils/constants';
import { TeardownOptions } from '../api/manager/teardown';
import { MultiviewSettings } from '../interfaces/multiview';

export function useStopProduction(): CallbackHook<
  (production: Production) => Promise<Result<StopProductionStep[]>>
> {
  const [loading, setLoading] = useState(false);

  const stopPipelines = useCallback(async (production: Production) => {
    setLoading(true);

    return fetch('/api/manager/stop', {
      method: 'POST',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify({ production })
    })
      .then((response) => {
        if (response.ok) {
          return response.json() as Promise<Result<StopProductionStep[]>>;
        }
        throw response.text();
      })
      .finally(() => setLoading(false));
  }, []);

  return [stopPipelines, loading];
}

export function useStartProduction(): CallbackHook<
  (production: Production) => Promise<Result<StartProductionStep[]>>
> {
  const [loading, setLoading] = useState(false);

  const startProduction = useCallback(async (production: Production) => {
    setLoading(true);
    return fetch('/api/manager/start', {
      method: 'POST',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify(production)
    })
      .then((response) => {
        return response.json() as Promise<Result<StartProductionStep[]>>;
      })

      .finally(() => setLoading(false));
  }, []);

  return [startProduction, loading];
}

export function useTeardown(): CallbackHook<
  (option: TeardownOptions) => Promise<Result<FlowStep[]>>
> {
  const [loading, setLoading] = useState(false);

  const teardown = useCallback(async (options: TeardownOptions) => {
    setLoading(true);
    return fetch('/api/manager/teardown', {
      method: 'POST',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify(options)
    })
      .then((response) => {
        return response.json() as Promise<Result<FlowStep[]>>;
      })

      .finally(() => setLoading(false));
  }, []);

  return [teardown, loading];
}

export function useUpdateMultiviewersOnRunningProduction(): CallbackHook<
  (
    production: Production,
    additions: MultiviewSettings[],
    updates: MultiviewSettings[],
    removals: MultiviewSettings[]
  ) => void
> {
  const [loading, setLoading] = useState(false);

  const updateMultiviewersOnRunningProduction = useCallback(
    async (
      production: Production,
      additions: MultiviewSettings[],
      updates: MultiviewSettings[],
      removals: MultiviewSettings[]
    ) => {
      setLoading(true);
      switch (true) {
        case additions.length > 0:
          return fetch('/api/manager/multiviewersOnRunningProduction', {
            method: 'POST',
            headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
            body: JSON.stringify({ production, additions })
          }).finally(() => setLoading(false));
        case updates.length > 0:
          updates.forEach(async (multiview) => {
            try {
              return await fetch(
                `/api/manager/multiviewersOnRunningProduction/${multiview.multiview_id}`,
                {
                  method: 'PUT',
                  headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
                  body: JSON.stringify({ production, updates })
                }
              );
            } finally {
              setLoading(false);
            }
          });
          break;
        case removals.length > 0:
          removals.forEach(async (multiview) => {
            try {
              return await fetch(
                `/api/manager/multiviewersOnRunningProduction/${multiview.multiview_id}`,
                {
                  method: 'DELETE',
                  headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
                  body: JSON.stringify({ production, removals })
                }
              );
            } finally {
              setLoading(false);
            }
          });
          break;
      }
    },
    []
  );

  return [updateMultiviewersOnRunningProduction, loading];
}
