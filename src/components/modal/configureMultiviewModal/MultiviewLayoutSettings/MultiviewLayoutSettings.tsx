import { useEffect, useState } from 'react';
import { useMultiviewPresets } from '../../../../hooks/multiviewPreset';
import { MultiviewPreset } from '../../../../interfaces/preset';
import { useTranslate } from '../../../../i18n/useTranslate';
import { useSetupMultiviewLayout } from '../../../../hooks/useSetupMultiviewLayout';
import {
  useDeleteMultiviewLayout,
  useMultiviewLayouts
} from '../../../../hooks/multiviewLayout';
import { Production } from '../../../../interfaces/production';
import { useConfigureMultiviewLayout } from '../../../../hooks/useConfigureMultiviewLayout';
import { TMultiviewLayout } from '../../../../interfaces/preset';
import { useCreateInputArray } from '../../../../hooks/useCreateInputArray';
import { TListSource } from '../../../../interfaces/multiview';
import Options from '../../configureOutputModal/Options';
import Input from '../../configureOutputModal/Input';
import MultiviewLayout from './MultiviewLayout';
import { IconTrash } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { set } from 'lodash';

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
  const [refresh, setRefresh] = useState(true);
  const [changedLayout, setChangedLayout] = useState<ChangeLayout | null>(null);
  const [newPresetName, setNewPresetName] = useState<string | null>(null);
  const [layoutToChange, setLayoutToChange] = useState<string>('');
  const [multiviewLayouts] = useMultiviewLayouts(refresh);
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
  const deleteLayout = useDeleteMultiviewLayout();
  const t = useTranslate();

  const multiviewPresetNames = multiviewPresets?.map((preset) => preset.name)
    ? multiviewPresets?.map((preset) => preset.name)
    : [];

  const availableMultiviewLayouts = multiviewLayouts?.filter(
    (layout) => layout.productionId === production?._id || !layout.productionId
  );
  const multiviewLayoutNames =
    availableMultiviewLayouts?.map((layout) => layout.name) || [];

  const productionLayouts =
    multiviewLayouts?.filter(
      (layout) => layout.productionId === production?._id
    ) || [];
  const globalMultiviewLayouts = multiviewLayouts?.filter(
    (layout) => !layout.productionId
  );
  const deleteDisabled = productionLayouts.length < 1;

  // This useEffect is used to set the drawn layout of the multiviewer on start,
  // if this fails then the modal will be empty
  useEffect(() => {
    if (multiviewPresets && multiviewPresets[0]) {
      setSelectedMultiviewPreset(multiviewPresets[0]);
    }
  }, [multiviewPresets]);

  useEffect(() => {
    if (multiviewLayouts) {
      setRefresh(false);
    }
  }, [multiviewLayouts]);

  const layoutNameAlreadyExist = availableMultiviewLayouts?.find(
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
    const chosenLayout = availableMultiviewLayouts?.find(
      (singleLayout) => singleLayout.name === name
    );
    const addBasePreset = multiviewPresets?.find(
      (singlePreset) => singlePreset.name === name
    );
    setLayoutToChange('');
    setNewPresetName(name);

    switch (type) {
      case 'layout':
        if (chosenLayout) {
          setSelectedMultiviewPreset(chosenLayout);
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
    if (inputList && availableMultiviewLayouts) {
      // Remove 2 from id to remove id for Preview- and Program-view
      // Add 1 to index to get the correct input_slot
      const idFirstInputView = parseInt(viewId, 10) - 2 + 1;
      const defaultLabel = availableMultiviewLayouts[0].layout.views.find(
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

  const removeMultiviewLayout = () => {
    const layoutToRemove = productionLayouts.find(
      (layout) => layout.name === newPresetName
    );
    const globalLayoutToRemove = globalMultiviewLayouts?.find(
      (layout) => layout.name === newPresetName
    );

    if (!layoutToRemove && globalLayoutToRemove) {
      toast.error(t('preset.not_possible_delete_global_layout'));
      return;
    }
    if (layoutToRemove && !layoutToRemove._id) {
      toast.error(t('preset.could_not_delete_layout'));
      return;
    }
    if (layoutToRemove && layoutToRemove._id) {
      deleteLayout(layoutToRemove._id.toString()).then(() => {
        setRefresh(true);
        if (multiviewPresets && multiviewPresets[0]) {
          setSelectedMultiviewPreset(multiviewPresets[0]);
        }
        setNewPresetName('');
        toast.success(t('preset.layout_deleted'));
      });
    }
  };

  return (
    <>
      {selectedMultiviewPreset && (
        <div className="flex flex-col w-full h-full">
          <div className="flex flex-col self-center w-[40%] pt-5">
            <div className="relative">
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
              {!production?.isActive && (
                <button
                  type="button"
                  title={t('preset.remove_layout')}
                  className="absolute top-0 right-[-10%] min-w-fit"
                  onClick={() => removeMultiviewLayout()}
                  disabled={deleteDisabled}
                >
                  <IconTrash
                    className={`ml-4 ${
                      deleteDisabled
                        ? 'pointer-events-none text-zinc-400'
                        : 'text-button-delete hover:text-red-400'
                    }`}
                  />
                </button>
              )}
            </div>
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
