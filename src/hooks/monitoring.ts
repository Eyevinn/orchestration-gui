import { useCallback, useEffect, useState } from 'react';
import { Monitoring } from '../interfaces/monitoring';
import { CallbackHook, DataHook, MonitoringHook } from './types';
import { API_SECRET_KEY } from '../utils/constants';

const TIMEOUT = 5000;
export function useMonitoring(id: string): DataHook<Monitoring | undefined> {
  const [trigger, setTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState<Monitoring | undefined>();
  const refresh = useCallback(() => setTrigger((trigger) => trigger + 1), []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    setLoading(true);
    getMonitoring(id)
      .then((monitoring) => {
        setMonitoring(monitoring);
      })
      .finally(() => {
        setLoading(false);
        timeout = setTimeout(() => setTrigger(trigger + 1), TIMEOUT);
      });
    return () => clearTimeout(timeout);
  }, [trigger, id]);

  return [monitoring, loading, refresh];
}
const getMonitoring = async (id: string): Promise<Monitoring | undefined> => {
  const response = await fetch(`/api/manager/monitoring/${id}`, {
    method: 'GET',
    // TODO: Implement api key
    headers: [['x-api-key', `Bearer apisecretkey`]]
  });
  if (response.ok) {
    return response.json();
  }
  throw await response.text();
};

export function useDeleteMonitoring(): CallbackHook<
  (productionId: string) => Promise<void>
> {
  const [loading, setLoading] = useState(false);

  const deleteMonitoring = useCallback(async (productionId: string) => {
    setLoading(true);

    return fetch(`/api/manager/monitoring/${productionId}`, {
      method: 'DELETE',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
    })
      .then((response) => {
        if (response.ok) {
          return;
        }
        throw response.text();
      })
      .finally(() => setLoading(false));
  }, []);

  return [deleteMonitoring, loading];
}
export function useMonitoringError(id: string): MonitoringHook<boolean> {
  const [trigger, setTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const refresh = useCallback(() => setTrigger((trigger) => trigger + 1), []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    setLoading(true);
    getMonitoring(id)
      .then((monitoring) => {
        if (monitoring && monitoring.productionErrors.anyError) {
          setHasError(monitoring.productionErrors.anyError);
        } else {
          setHasError(false);
        }
      })
      .finally(() => {
        setLoading(false);
        timeout = setTimeout(() => setTrigger(trigger + 1), TIMEOUT);
      });
    return () => clearTimeout(timeout);
  }, [trigger, id]);

  return [hasError, loading, refresh];
}
