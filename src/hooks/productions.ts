import { ObjectId } from 'mongodb';
import { Production } from '../interfaces/production';
import { API_SECRET_KEY } from '../utils/constants';
import { PresetWithId } from '../interfaces/preset';

export function usePostProduction() {
  return async (name: string, preset: PresetWithId): Promise<ObjectId> => {
    const response = await fetch('/api/manager/productions', {
      method: 'POST',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify({
        isActive: false,
        name,
        sources: [],
        preset_name: preset.name,
        pipelines: preset.pipelines,
        default_multiview_reference: preset.default_multiview_reference,
        control_connection: preset.control_connection,
        outputs: []
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

export function useGetProductionSourceAlignmentAndLatency() {
  return async (
    id: string,
    pipelineId: string,
    ingestName: string,
    ingestSourceName: string
  ): Promise<{ alignment: number; latency: number } | null> => {
    const response = await fetch(
      `/api/manager/productions/${id}/${pipelineId}/${ingestName}/${ingestSourceName}`,
      {
        method: 'GET',
        headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
      }
    );
    if (response.ok) {
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      return data ? { alignment: data.alignment, latency: data.latency } : null;
    }

    throw await response.text();
  };
}

export function usePutProductionPipelineSourceAlignmentAndLatency() {
  return async (
    id: string,
    pipelineId: string,
    ingestName: string,
    ingestSourceName: string,
    alignment: number,
    latency: number
  ): Promise<void> => {
    const response = await fetch(
      `/api/manager/productions/${id}/${pipelineId}/${ingestName}/${ingestSourceName}`,
      {
        method: 'PUT',
        headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
        body: JSON.stringify({
          alignment_ms: alignment,
          max_network_latency_ms: latency
        })
      }
    );

    if (response.status === 204) {
      return;
    }

    if (response.ok) {
      return await response.json();
    }

    throw await response.text();
  };
}
