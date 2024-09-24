import { Preset, PresetWithId } from '../interfaces/preset';
import { ObjectId } from 'mongodb';

export function useGetPresets() {
  return async (): Promise<PresetWithId[]> => {
    const response = await fetch(`/api/manager/presets`, {
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

export function usePutPreset() {
  return async (id: ObjectId, preset: Preset): Promise<void> => {
    const response = await fetch(`/api/manager/presets/${id}`, {
      method: 'PUT',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]],
      body: JSON.stringify(preset)
    });
    if (response.ok) {
      return;
    }
    throw await response.text();
  };
}
