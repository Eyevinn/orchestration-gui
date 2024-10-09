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
