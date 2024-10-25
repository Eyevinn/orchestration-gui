import { useEffect, useState } from 'react';
import { useMultiviewPresets } from './multiviewPreset';
import { MultiviewPreset } from '../interfaces/preset';
import { SourceReference } from '../interfaces/Source';

export function useCleanedDefaultPreset({
  sourceList,
  isChecked
}: {
  sourceList: SourceReference[] | undefined;
  isChecked: boolean;
}) {
  const [cleanedDefaultPresets, setCleanedDefaultPresets] = useState<
    MultiviewPreset[]
  >([]);
  const [dirtyMultiviewPresets] = useMultiviewPresets();

  useEffect(() => {
    if (dirtyMultiviewPresets) {
      const sourceListLength = sourceList ? sourceList.length : 0;

      const cleanedPresets = dirtyMultiviewPresets.map((preset) => {
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
      setCleanedDefaultPresets(cleanedPresets);
    }
  }, [dirtyMultiviewPresets, sourceList, isChecked]);

  return { cleanedDefaultPresets };
}
