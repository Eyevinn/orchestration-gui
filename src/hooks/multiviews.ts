import { useState } from 'react';
import { SourceReference } from '../interfaces/Source';
import { CallbackHook } from './types';
import { MultiviewSettings } from '../interfaces/multiview';
import { useTranslate } from '../i18n/useTranslate';

export function useMultiviews(): CallbackHook<
  (
    pipelineId: string,
    sources: SourceReference[],
    source: SourceReference,
    singleMultiview: MultiviewSettings
  ) => void
> {
  const [loading, setLoading] = useState(true);
  const t = useTranslate();

  const putMultiviewView = (
    pipelineId: string,
    sources: SourceReference[],
    source: SourceReference,
    singleMultiview: MultiviewSettings
  ) => {
    setLoading(true);

    if (!singleMultiview) throw t('preset.no_multiview');

    const rest = singleMultiview.layout.views.filter(
      (v) => v.input_slot !== source.input_slot
    );

    const viewsToUpdate = singleMultiview.layout.views.filter(
      (v) => v.input_slot === source.input_slot
    );

    const updatedViewsWithLabels = viewsToUpdate.map((v) => {
      return {
        ...v,
        label: source.label
      };
    });

    const restWithLabels = rest.map((view) => {
      const sourceForView = sources.find(
        (s) => s.input_slot === view.input_slot
      );

      if (sourceForView) {
        return { ...view, label: sourceForView.label };
      }
      return view;
    });

    if (!viewsToUpdate) {
      setLoading(false);
      return;
    }

    const updatedMultiviewViews = [
      ...restWithLabels,
      ...updatedViewsWithLabels
    ];

    fetch(`/api/manager/multiviews/${singleMultiview.multiview_id}`, {
      method: 'PUT',
      headers: [['x-api-key', `Bearer apisecretkey`]],
      body: JSON.stringify({
        pipelineId: pipelineId,
        multiviews: updatedMultiviewViews
      })
    })
      .then(async (response) => {
        if (response.ok) {
          return await response.json();
        }
      })
      .finally(() => setLoading(false));
  };

  return [putMultiviewView, loading];
}
