import { useEffect, useState } from 'react';
import { MultiviewPreset } from '../interfaces/preset';
import { MultiviewViewsWithId } from './useSetupMultiviewLayout';
import { TList } from './useCreateInputArray';

export function useConfigureMultiviewLayout(
  preset: MultiviewPreset | null,
  defaultLabel: string | undefined,
  source: TList | undefined,
  id: number | undefined,
  configMode: string,
  name: string | null
) {
  const [updatedPreset, setUpdatedPreset] = useState<MultiviewPreset | null>();

  useEffect(() => {
    setUpdatedPreset(null);
  }, [configMode]);

  useEffect(() => {
    if (preset && id && (defaultLabel || source)) {
      const arr: MultiviewViewsWithId[] = [];
      (preset.layout.views as MultiviewViewsWithId[]).map((item, index) => {
        if (index === id) {
          if (source) {
            arr.push({
              ...item,
              input_slot: source.input_slot,
              label: source.label
            });
          }
          if (defaultLabel) {
            arr.push({
              ...item,
              input_slot: id,
              label: defaultLabel
            });
          }
        } else {
          arr.push({
            ...item
          });
        }
      });
      return setUpdatedPreset({
        ...preset,
        layout: {
          ...preset.layout,
          views: arr
        }
      });
    }
  }, [source?.input_slot, source?.label, defaultLabel]);

  useEffect(() => {
    if (preset) {
      return setUpdatedPreset({
        ...preset,
        name: name ? name : preset.name
      });
    }
  }, [name]);

  return { multiviewLayout: updatedPreset };
}
