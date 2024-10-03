import { Preset, PresetWithId } from '../interfaces/preset';
import { ObjectId } from 'mongodb';
import { API_SECRET_KEY } from '../utils/constants';

export function useGetPresets() {
  return async (): Promise<PresetWithId[]> => {
    const response = await fetch(`/api/manager/presets`, {
      method: 'GET',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
    });
    if (response.ok) {
      return response.json();
    }
    throw await response.text();
  };
}

export function usePutPreset() {
  return async (id: ObjectId, preset: Preset): Promise<void> => {
    const response = await fetch(`/api/manager/presets/${id}`, {
      method: 'PUT',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify(preset)
    });
    if (response.ok) {
      return;
    }
    throw await response.text();
  };
}
