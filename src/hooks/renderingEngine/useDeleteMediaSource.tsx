import { MultiviewSettings } from '../../interfaces/multiview';
import { Production } from '../../interfaces/production';
import { Result } from '../../interfaces/result';
import {
  DeleteRenderingEngineSourceStep,
  SourceReference
} from '../../interfaces/Source';
import { API_SECRET_KEY } from '../../utils/constants';
import { CallbackHook } from '../types';
import { useState } from 'react';

export function useDeleteMediaSource(): CallbackHook<
  (
    pipelineUuid: string,
    inputSlot: number,
    multiviews: MultiviewSettings[],
    sources: SourceReference[]
  ) => Promise<Result<DeleteRenderingEngineSourceStep[]>>
> {
  const [loading, setLoading] = useState<boolean>(false);

  const deleteMediaSource = async (
    pipelineUuid: string,
    inputSlot: number,
    multiviews: MultiviewSettings[],
    sources: SourceReference[]
  ) => {
    setLoading(true);
    const multiviewViews = multiviews?.flatMap((singleMultiview) => {
      return singleMultiview.layout.views;
    });
    const multiviewsToUpdate = multiviewViews?.filter(
      (v) => v.input_slot === inputSlot
    );

    if (!multiviewsToUpdate || multiviewsToUpdate.length === 0) {
      return fetch(
        `/api/manager/pipelines/${pipelineUuid}/rendering-engine/media/${inputSlot}`,
        {
          method: 'DELETE',
          headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
        }
      )
        .then(async (response) => {
          if (response.ok) {
            const text = await response.text();
            const data = text ? JSON.parse(text) : null;
            return data ? data : null;
          }
          throw await response.text;
        })
        .finally(() => setLoading(false));
    }

    const updatedMultiviews = multiviewsToUpdate?.map((view) => {
      return {
        ...view,
        label: view.label
      };
    });

    const rest = multiviewViews?.filter((v) => v.input_slot !== inputSlot);

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
        error: 'error'
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

    return fetch(
      `/api/manager/pipelines/${pipelineUuid}/rendering-engine/media/${inputSlot}`,
      {
        method: 'DELETE',
        headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]],
        body: JSON.stringify({
          pipelineId: pipelineUuid,
          multiview: multiview
        })
      }
    )
      .then(async (response) => {
        if (response.ok) {
          const text = await response.text();
          const data = text ? JSON.parse(text) : null;
          return data ? data : null;
        }
        throw await response.text;
      })
      .finally(() => setLoading(false));
  };
  return [deleteMediaSource, loading];
}
