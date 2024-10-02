import { useState } from 'react';
import { MultiviewViews } from '../interfaces/multiview';
import { CallbackHook } from './types';
import { Production } from '../interfaces/production';
import {
  useGetMultiviewLayouts,
  usePutMultiviewLayout
} from './multiviewLayout';

export function useUpdateSourceInputSlotOnMultiviewLayouts(): CallbackHook<
  (production: Production) => Promise<void>
> {
  const [loading, setLoading] = useState(false);
  const multiviewLayouts = useGetMultiviewLayouts();
  const updateLayout = usePutMultiviewLayout();

  const updateSourceInputSlot = async (production: Production) => {
    const layouts = await multiviewLayouts();
    if (layouts) {
      layouts.map((singleLayout) => {
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

              if ((view.id && view.id.length < 5) || preview || program) {
                return view;
              } else if (isUpdatedInputSlot || isSameInputSlot) {
                return {
                  ...view,
                  input_slot: isUpdatedInputSlot
                    ? isUpdatedInputSlot.input_slot
                    : view.input_slot
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
          return updateLayout({
            ...singleLayout,
            layout: {
              ...singleLayout.layout,
              views: updated
            }
          });
        }
      });
    }
  };

  return [updateSourceInputSlot, loading];
}
