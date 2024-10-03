import { ObjectId } from 'mongodb';
import { Production } from '../interfaces/production';
import { API_SECRET_KEY } from '../utils/constants';

export function usePostProduction() {
  return async (name: string): Promise<ObjectId> => {
    const response = await fetch('/api/manager/productions', {
      method: 'POST',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify({
        isActive: false,
        name,
        sources: []
      })
    });
    if (response.ok) {
      return await response.json();
    }
    throw await response.text();
  };
}

export function useGetProduction() {
  return async (id: string): Promise<Production> => {
    const response = await fetch(`/api/manager/productions/${id}`, {
      method: 'GET',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
    });
    if (response.ok) {
      return response.json();
    }
    throw await response.text();
  };
}

export function usePutProduction() {
  return async (id: string, production: Production): Promise<Production> => {
    const response = await fetch(`/api/manager/productions/${id}`, {
      method: 'PUT',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify(production)
    });
    if (response.ok) {
      return response.json();
    }
    throw await response.text();
  };
}

export function useDeleteProduction() {
  return async (id: string): Promise<void> => {
    const response = await fetch(`/api/manager/productions/${id}`, {
      method: 'DELETE',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
    });
    if (response.ok) {
      return;
    }
    throw await response.text();
  };
}
