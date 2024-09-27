import { API_SECRET_KEY } from '../../utils/constants';
import { useState } from 'react';
import { CallbackHook } from '../types';

export function useRemoveInventorySourceItem(): CallbackHook<
  (id: string) => Promise<Response | undefined>
> {
  const [reloadList, setReloadList] = useState(false);

  const removeInventorySourceItem = async (id: string) => {
    setReloadList(false);
    return fetch(`/api/manager/inventory/${id}/database/`, {
      method: 'DELETE',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
    }).then(async (response) => {
      if (response.ok) {
        setTimeout(() => {
          setReloadList(true);
        }, 1000);
        return response;
      }
      throw response.text;
    });
  };
  return [removeInventorySourceItem, reloadList];
}
