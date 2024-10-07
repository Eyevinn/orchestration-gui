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
    const layouts = await multiviewLayouts();
    if (layouts) {
      for (const singleLayout of layouts) {
        if (production._id === singleLayout.productionId) {
          const updated = singleLayout.layout.views.map(
            (view: MultiviewViews, index) => {
              const viewIndex = index - 2 + 1;
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
                return view;
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
                  input_slot: viewIndex,
                  x: view.x,
                  y: view.y,
                  height: view.height,
                  width: view.width,
                  label: `Input ${viewIndex}`
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

          const updatedPipelines = production?.production_settings.pipelines;
          if (updatedPipelines && updatedPipelines[0]) {
            const updatedFirstPipeline = {
              ...updatedPipelines[0],
              multiviews: updatedPipelines[0].multiviews?.map(
                (singleMultiview) => ({
                  ...singleMultiview,
                  layout: {
                    ...singleLayout.layout,
                    views: updated
                  }
                })
              )
            };

            // Replace the first pipeline with the updated one
            const newPipelines = [
              updatedFirstPipeline,
              ...updatedPipelines.slice(1)
            ];

            // Update the db-production with the new layout-input slot
            const res = await putProduction(production._id, {
              ...production,
              production_settings: {
                ...production?.production_settings,
                pipelines: newPipelines
              }
            });
            return res;
          }
        }
      }
    }
  };

  return [updateSourceInputSlot, loading];
}
