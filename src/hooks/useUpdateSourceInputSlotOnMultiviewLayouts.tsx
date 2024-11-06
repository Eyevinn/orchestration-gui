import { useState } from 'react';
import { MultiviewViews } from '../interfaces/multiview';
import { CallbackHook } from './types';
import { Production } from '../interfaces/production';
import {
  useGetMultiviewLayouts,
  usePutMultiviewLayout
} from './multiviewLayout';
import { usePutProduction } from './productions';

export function useUpdateSourceInputSlotOnMultiviewLayouts(): CallbackHook<
  (production: Production) => Promise<Production | undefined>
> {
  const [loading, setLoading] = useState(false);
  const multiviewLayouts = useGetMultiviewLayouts();
  const updateLayout = usePutMultiviewLayout();
  const putProduction = usePutProduction();

  const updateSourceInputSlot = async (production: Production) => {
    setLoading(true);
    const layouts = await multiviewLayouts();
    if (layouts) {
      const updatedLayouts = layouts.map(async (singleLayout) => {
        if (production._id === singleLayout.productionId) {
          const updated = singleLayout.layout.views.map(
            (view: MultiviewViews, index) => {
              const preview = index === 0;
              const program = index === 1;
              const isUpdatedInputSlot = production.sources.find((source) =>
                view.id
                  ? view.id === source._id &&
                    view.input_slot !== source.input_slot
                  : false
              );
              const isSameInputSlot = production.sources.find((source) =>
                view.id
                  ? view.id === source._id &&
                    view.input_slot === source.input_slot
                  : false
              );

              const isUpdatedLabel = production.sources.find(
                (source) =>
                  view.id === source._id && view.label !== source.label
              )?.label;

              if ((view.id && view.id.length < 5) || preview || program) {
                return {
                  ...view,
                  label: isUpdatedLabel || view.label
                };
              } else if (isUpdatedInputSlot || isSameInputSlot) {
                return {
                  ...view,
                  input_slot: isUpdatedInputSlot
                    ? isUpdatedInputSlot.input_slot
                    : view.input_slot,
                  label: isUpdatedLabel || view.label
                };
              } else {
                return {
                  ...view,
                  input_slot: 0
                };
              }
            }
          );

          // Update the db-multiviews with the new layout-input slot
          await updateLayout({
            ...singleLayout,
            layout: {
              ...singleLayout.layout,
              views: updated
            }
          });

          return {
            for_pipeline_idx: singleLayout.for_pipeline_idx || 0,
            _id: singleLayout._id || '',
            name: singleLayout.name,
            output: singleLayout.output,
            layout: {
              ...singleLayout.layout,
              views: updated.map((view) => ({
                ...view,
                label: view.input_slot === 0 ? '' : view.label
              }))
            }
          };
        }
      });
      const pipelines = production?.production_settings.pipelines;
      const multiviewsArr = await Promise.all(updatedLayouts);

      const updatedMultiviews = pipelines[0].multiviews?.map((oldItem) => {
        const updatedItem = multiviewsArr.find(
          (newItem) => newItem && newItem._id === oldItem._id
        );
        return updatedItem
          ? {
              ...oldItem,
              layout: updatedItem.layout
            }
          : oldItem;
      });

      if (pipelines && pipelines[0] && updatedMultiviews) {
        const updatedFirstPipeline = {
          ...pipelines[0],
          multiviews: updatedMultiviews.map((multiview) => ({
            ...multiview,
            _id: multiview._id?.toString() || ''
          }))
        };

        // Replace the first pipeline with the updated one
        const newPipelines = [updatedFirstPipeline, ...pipelines.slice(1)];

        // Update the db-production with the new layout-input slot
        const res = await putProduction(production._id, {
          ...production,
          production_settings: {
            ...production?.production_settings,
            pipelines: newPipelines
          }
        });
        setLoading(false);
        return res;
      }
    }
  };

  return [updateSourceInputSlot, loading];
}
