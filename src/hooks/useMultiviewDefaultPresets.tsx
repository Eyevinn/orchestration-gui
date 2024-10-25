import { useEffect, useState } from 'react';
import { useMultiviewPresets } from './multiviewPreset';
import { MultiviewPreset } from '../interfaces/preset';
import { SourceReference } from '../interfaces/Source';

export function useMultiviewDefaultPresets({
  sourceList,
  isChecked
}: {
  sourceList: SourceReference[] | undefined;
  isChecked: boolean;
}) {
  const [updatedMultiviewPresets, setUpdatedMultiviewPresets] = useState<
    MultiviewPreset[]
  >([]);
  const [databaseMultiviewPresets] = useMultiviewPresets();

  useEffect(() => {
    if (databaseMultiviewPresets) {
      const sourceListLength = sourceList ? sourceList.length : 0;

      const updatedPresets = databaseMultiviewPresets.map((preset) => {
        return {
          ...preset,
          layout: {
            ...preset.layout,
            views: preset.layout.views.map((view, index) => {
              // Remove 2 from index to remove id for Preview- and Program-view
              const sourceSlot = index - 2;
              const source =
                sourceSlot < sourceListLength &&
                sourceList &&
                sourceSlot >= 0 &&
                !isChecked
                  ? sourceList[sourceSlot]
                  : {
                      type: 'ingest_source',
                      input_slot: 0,
                      label: '',
                      _id: ''
                    };

              return {
                ...view,
                label: sourceSlot >= 0 ? source.label : view.label,
                id: sourceSlot >= 0 ? source._id : view.id
              };
            })
          }
        };
      });
      setUpdatedMultiviewPresets(updatedPresets);
    }
  }, [databaseMultiviewPresets, sourceList, isChecked]);

  return { multiviewDefaultPresets: updatedMultiviewPresets };
}
