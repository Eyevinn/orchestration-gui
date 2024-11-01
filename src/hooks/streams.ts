import { useState } from 'react';
import {
  AddSourceResult,
  DeleteSourceStep,
  SourceReference,
  SourceWithId
} from '../interfaces/Source';
import { CallbackHook } from './types';
import { MultiviewSettings } from '../interfaces/multiview';
import { Result } from '../interfaces/result';
import { API_SECRET_KEY } from '../utils/constants';
import { PipelineSettings } from '../interfaces/pipeline';

export function useCreateStream(): CallbackHook<
  (
    source: SourceWithId,
    pipelines: PipelineSettings[],
    input_slot: number
  ) => Promise<Result<AddSourceResult>>
> {
  const [loading, setLoading] = useState(false);

  const createStream = async (
    source: SourceWithId,
    pipelines: PipelineSettings[],
    input_slot: number
  ): Promise<Result<AddSourceResult>> => {
    setLoading(true);

    return fetch(`/api/manager/streams/`, {
      method: 'POST',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify({
        source: source,
        pipelines,
        input_slot: input_slot
      })
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        }
        throw await response.text();
      })
      .finally(() => setLoading(false));
  };
  return [createStream, loading];
}

export function useDeleteStream(): CallbackHook<
  (
    streamUuids: string[],
    pipelines: PipelineSettings[],
    multiviews: MultiviewSettings[],
    sources: SourceReference[],
    input_slot: number
  ) => Promise<Result<DeleteSourceStep[]>>
> {
  const [loading, setLoading] = useState(false);
  const deleteStream = async (
    streamUuids: string[],
    pipelines: PipelineSettings[],
    multiviews: MultiviewSettings[],
    sources: SourceReference[],
    input_slot: number
  ): Promise<Result<DeleteSourceStep[]>> => {
    setLoading(true);

    const pipelineUUID = pipelines[0].pipeline_id;
    const multiviewViews = multiviews?.flatMap((singleMultiview) => {
      return singleMultiview.layout.views;
    });
    const multiviewsToUpdate = multiviewViews?.filter(
      (v) => v.input_slot === input_slot
    );

    if (!multiviewsToUpdate || multiviewsToUpdate.length === 0) {
      const streamRequests = streamUuids.map((streamUuid) => {
        return fetch(`/api/manager/streams/${streamUuid}`, {
          method: 'DELETE',
          headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
          body: JSON.stringify({
            pipelineUUID: pipelineUUID
          })
        });
      });
      const result = await Promise.all(streamRequests);
      const promises = result.map(async (r) => {
        return (await r.json()) as Result<DeleteSourceStep[]>;
      });
      const data = await Promise.all(promises);
      const failed = data.find((data) => !data.ok);
      if (failed) {
        setLoading(false);
        return failed;
      }
      setLoading(false);
      const ok = data.find((data) => data.ok);
      if (ok) {
        return ok;
      }
      return {
        ok: false,
        error: 'unexpected'
      };
    }

    const updatedMultiviews = multiviewsToUpdate?.map((view) => {
      return {
        ...view,
        label: view.label
      };
    });

    const rest = multiviewViews?.filter((v) => v.input_slot !== input_slot);

    const restWithLabels = rest?.map((v) => {
      const sourceForView = sources.find((s) => s.input_slot === v.input_slot);

      if (sourceForView) {
        return { ...v, label: sourceForView.label };
      }

      return v;
    });

    if (
      !restWithLabels ||
      !updatedMultiviews ||
      updatedMultiviews.length === 0 ||
      !multiviews?.some((singleMultiview) => singleMultiview.layout)
    ) {
      setLoading(false);
      return {
        ok: false,
        error: 'unexpected'
      };
    }

    const multiviewsWithLabels = [...restWithLabels, ...updatedMultiviews];

    const multiview: MultiviewSettings[] = multiviews.map(
      (singleMultiview, index) => ({
        ...singleMultiview,
        layout: {
          ...singleMultiview.layout,
          views: multiviewsWithLabels
        },
        for_pipeline_idx: index,
        multiviewId: index + 1
      })
    );

    const streamRequests = streamUuids.map((streamUuid) => {
      return fetch(`/api/manager/streams/${streamUuid}`, {
        method: 'DELETE',
        headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
        body: JSON.stringify({
          multiview: multiview,
          pipelineUUID: pipelineUUID
        })
      });
    });
    const result = await Promise.all(streamRequests);
    const promises = result.map(async (r) => {
      return (await r.json()) as Result<DeleteSourceStep[]>;
    });
    const data = await Promise.all(promises);
    const failed = data.find((data) => !data.ok);
    if (failed) {
      setLoading(false);
      return failed;
    }
    setLoading(false);
    const ok = data.find((data) => data.ok);
    if (ok) {
      return ok;
    }
    return {
      ok: false,
      error: 'unexpected'
    };
  };
  return [deleteStream, loading];
}

export function useUpdateStream(): CallbackHook<
  (streamUuid: string, alignment_ms: number) => void
> {
  const [loading, setLoading] = useState(false);

  const updateStream = async (
    streamUuid: string,
    alignment_ms: number
  ): Promise<void> => {
    setLoading(true);
    const response = await fetch(`/api/manager/streams/${streamUuid}`, {
      method: 'PATCH',
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
      body: JSON.stringify({ alignment_ms: alignment_ms })
    });

    setLoading(false);

    if (response.status === 204) {
      return;
    }

    if (response.ok) {
      return await response.json();
    }

    throw await response.text();
  };

  return [updateStream, loading];
}
