import { useEffect, useState } from 'react';
import { useMultiviewPresets } from '../../../../hooks/multiviewPreset';
import { MultiviewPreset } from '../../../../interfaces/preset';
import { useTranslate } from '../../../../i18n/useTranslate';
import { useSetupMultiviewLayout } from '../../../../hooks/useSetupMultiviewLayout';
import { useMultiviewLayouts } from '../../../../hooks/multiviewLayout';
import { Production } from '../../../../interfaces/production';
import { useConfigureMultiviewLayout } from '../../../../hooks/useConfigureMultiviewLayout';
import { TMultiviewLayout } from '../../../../interfaces/preset';
import { useCreateInputArray } from '../../../../hooks/useCreateInputArray';
import { TListSource } from '../../../../interfaces/multiview';
import Options from '../../configureOutputModal/Options';
import Input from '../../configureOutputModal/Input';
import MultiviewLayout from './MultiviewLayout';

type ChangeLayout = {
  defaultLabel?: string;
  source?: TListSource;
  viewId: string;
};

export default function MultiviewLayoutSettings({
  production,
  setNewMultiviewPreset
}: {
  production: Production | undefined;
  setNewMultiviewPreset: (preset: TMultiviewLayout | null) => void;
}) {
  const [selectedMultiviewPreset, setSelectedMultiviewPreset] =
    useState<MultiviewPreset | null>(null);
  const [changedLayout, setChangedLayout] = useState<ChangeLayout | null>(null);
  const [newPresetName, setNewPresetName] = useState<string | null>(null);
  const [layoutToChange, setLayoutToChange] = useState<string>('');
  const [multiviewLayouts] = useMultiviewLayouts();
  const [multiviewPresets] = useMultiviewPresets();
  const { multiviewPresetLayout } = useSetupMultiviewLayout(
    selectedMultiviewPreset
  );
  const { multiviewLayout } = useConfigureMultiviewLayout(
    production?._id,
    selectedMultiviewPreset,
    changedLayout?.defaultLabel,
    changedLayout?.source,
    changedLayout?.viewId,
    newPresetName
  );
  const { inputList } = useCreateInputArray(production);
  const t = useTranslate();

  const multiviewPresetNames = multiviewPresets?.map((preset) => preset.name)
    ? multiviewPresets?.map((preset) => preset.name)
    : [];

  const avaliableMultiviewLayouts = multiviewLayouts?.filter(
    (layout) => layout.productionId === production?._id || !layout.productionId
  );
  const multiviewLayoutNames =
    avaliableMultiviewLayouts?.map((layout) => layout.name) || [];

  // This useEffect is used to set the drawn layout of the multiviewer on start,
  // if this fails then the modal will be empty
  useEffect(() => {
    if (multiviewPresets && multiviewPresets[0]) {
      setSelectedMultiviewPreset(multiviewPresets[0]);
    }
  }, [multiviewPresets]);

  const layoutNameAlreadyExist = avaliableMultiviewLayouts?.find(
    (singlePreset) => singlePreset.name === multiviewLayout?.name
  )?.name;

  useEffect(() => {
    if (multiviewLayout) {
      setSelectedMultiviewPreset(multiviewLayout);
      setNewMultiviewPreset(multiviewLayout);
    } else {
      setSelectedMultiviewPreset(null);
      setNewMultiviewPreset(null);
    }
  }, [multiviewLayout]);

  const handleLayoutUpdate = (name: string, type: string) => {
    const choosenLayout = avaliableMultiviewLayouts?.find(
      (singleLayout) => singleLayout.name === name
    );
    const addBasePreset = multiviewPresets?.find(
      (singlePreset) => singlePreset.name === name
    );
    setLayoutToChange('');
    setNewPresetName(name);

    switch (type) {
      case 'layout':
        if (choosenLayout) {
          setSelectedMultiviewPreset(choosenLayout);
        }
        break;
      case 'preset':
        if (addBasePreset) {
          setSelectedMultiviewPreset(addBasePreset);
        }
        break;
    }
  };

  const handleChange = (viewId: string, value: string) => {
    if (inputList && avaliableMultiviewLayouts) {
      // Remove 2 from id to remove id for Preview- and Program-view
      // Add 1 to index to get the correct input_slot
      const idFirstInputView = parseInt(viewId, 10) - 2 + 1;
      const defaultLabel = avaliableMultiviewLayouts[0].layout.views.find(
        (item) => item.input_slot === idFirstInputView
      )?.label;
      inputList.map((source) => {
        if (value === '') {
          setChangedLayout({ defaultLabel, viewId });
        }
        if (source.id === value) {
          setChangedLayout({ source, viewId });
        }
      });
    }
  };

  return (
    <>
      {selectedMultiviewPreset && (
        <div className="flex flex-col w-full h-full">
          <div className="flex flex-col self-center w-[40%] pt-5">
            <Options
              label={t('preset.select_multiview_layout')}
              options={multiviewLayoutNames.map((singleItem) => ({
                label: singleItem
              }))}
              value={
                selectedMultiviewPreset ? selectedMultiviewPreset.name : ''
              }
              update={(value) => handleLayoutUpdate(value, 'layout')}
            />
            <Options
              label={t('preset.select_multiview_preset')}
              options={multiviewPresetNames.map((singleItem) => ({
                label: singleItem
              }))}
              value={
                selectedMultiviewPreset ? selectedMultiviewPreset.name : ''
              }
              update={(value) => handleLayoutUpdate(value, 'preset')}
            />
          </div>

          {multiviewPresetLayout && (
            <MultiviewLayout
              multiviewPresetLayout={multiviewPresetLayout}
              inputList={inputList}
              handleChange={handleChange}
            />
          )}
          <div className="flex flex-col w-[50%] h-full pt-3">
            <Input
              label={t('name')}
              value={newPresetName ? newPresetName : layoutToChange}
              update={(value) => handleLayoutUpdate(value, 'layout')}
              placeholder={t('preset.new_preset_name')}
            />
            {layoutNameAlreadyExist && (
              <p className="text-right mr-2 text-button-delete font-bold">
                {t('preset.layout_already_exist', { layoutNameAlreadyExist })}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
