import { useEffect, useState } from 'react';
import { useMultiviewPresets } from '../../../../hooks/multiviewPreset';
import Options from '../Options';
import { MultiviewPreset } from '../../../../interfaces/preset';
import { useTranslate } from '../../../../i18n/useTranslate';
import { useSetupMultiviewLayout } from '../../../../hooks/useSetupMultiviewLayout';
import { Production } from '../../../../interfaces/production';
import { useConfigureMultiviewLayout } from '../../../../hooks/useConfigureMultiviewLayout';
import Input from '../Input';
import MultiviewLayout from './MultiviewLayout';
import {
  TList,
  useCreateInputArray
} from '../../../../hooks/useCreateInputArray';

type ChangeLayout = {
  defaultLabel?: string;
  source?: TList;
  id: number;
};

export default function MultiviewLayoutSettings({
  // configMode sets the mode of the configuration to create or edit, not implemented yet
  configMode,
  production,
  setNewMultiviewPreset
}: {
  configMode: string;
  production: Production | undefined;
  setNewMultiviewPreset: (preset: MultiviewPreset | null) => void;
}) {
  const [selectedMultiviewPreset, setSelectedMultiviewPreset] =
    useState<MultiviewPreset | null>(null);
  const [changedLayout, setChangedLayout] = useState<ChangeLayout | null>(null);
  const [newPresetName, setNewPresetName] = useState<string | null>(null);
  const [multiviewPresets, loading] = useMultiviewPresets();
  const { multiviewPresetLayout } = useSetupMultiviewLayout(
    selectedMultiviewPreset
  );
  const { multiviewLayout } = useConfigureMultiviewLayout(
    selectedMultiviewPreset,
    changedLayout?.defaultLabel,
    changedLayout?.source,
    changedLayout?.id,
    configMode,
    newPresetName
  );
  const { inputList } = useCreateInputArray(production);
  const t = useTranslate();

  const multiviewPresetNames = multiviewPresets?.map((preset) => preset.name)
    ? multiviewPresets?.map((preset) => preset.name)
    : [];

  useEffect(() => {
    setNewPresetName(null);
  }, [configMode]);

  useEffect(() => {
    if (multiviewPresets && multiviewPresets[0]) {
      setSelectedMultiviewPreset(multiviewPresets[0]);
    }
  }, [multiviewPresets]);

  useEffect(() => {
    if (multiviewLayout) {
      setSelectedMultiviewPreset(multiviewLayout);
      setNewMultiviewPreset(multiviewLayout);
    } else {
      setSelectedMultiviewPreset(null);
      setNewMultiviewPreset(null);
    }
  }, [multiviewLayout]);

  const handlePresetUpdate = (name: string) => {
    const presetLayout = multiviewPresets?.find(
      (singlePreset) => singlePreset.name === name
    );
    setNewPresetName(name);
    if (presetLayout) {
      setSelectedMultiviewPreset(presetLayout);
    }
  };

  const handleChange = (id: number | undefined, value: string) => {
    if (inputList && id && multiviewPresets) {
      // Remove 2 from id to remove id for Preview- and Program-view
      // Add 1 to index to get the correct input_slot
      const idFirstInputView = id - 2 + 1;
      const defaultLabel = multiviewPresets[0].layout.views.find(
        (item) => item.input_slot === idFirstInputView
      )?.label;
      inputList.map((source) => {
        if (value === '') {
          setChangedLayout({ defaultLabel, id });
        }
        if (source.label === value) {
          setChangedLayout({ source, id });
        }
      });
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {multiviewPresetLayout && (
        <MultiviewLayout
          multiviewPresetLayout={multiviewPresetLayout}
          inputList={inputList}
          handleChange={(id: number | undefined, value: string) =>
            handleChange(id, value)
          }
        />
      )}
      <div className="flex flex-col w-[50%] h-full">
        <Options
          label={t('preset.select_multiview_preset')}
          options={multiviewPresetNames}
          value={selectedMultiviewPreset ? selectedMultiviewPreset.name : ''}
          update={(value) => handlePresetUpdate(value)}
        />
        <Input
          label={t('name')}
          value={newPresetName ? newPresetName : ''}
          update={(value) => handlePresetUpdate(value)}
          placeholder={t('preset.new_preset_name')}
        />
      </div>
    </div>
  );
}
