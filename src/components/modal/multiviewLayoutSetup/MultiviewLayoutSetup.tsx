import { useEffect, useMemo, useState } from 'react';
import { MultiviewPreset } from '../../../interfaces/preset';
import { useTranslate } from '../../../i18n/useTranslate';
import { useSetupMultiviewLayout } from '../../../hooks/useSetupMultiviewLayout';
import {
  useDeleteMultiviewLayout,
  useMultiviewLayouts
} from '../../../hooks/multiviewLayout';
import { useConfigureMultiviewLayout } from '../../../hooks/useConfigureMultiviewLayout';
import { TMultiviewLayout } from '../../../interfaces/preset';
import { useCreateInputArray } from '../../../hooks/useCreateInputArray';
import { TListSource } from '../../../interfaces/multiview';
import Options from '../configureOutputModal/Options';
import Input from '../configureOutputModal/Input';
import MultiviewLayout from './MultiviewLayout';
import toast from 'react-hot-toast';
import RemoveLayoutButton from './RemoveLayoutButton';
import { SourceReference } from '../../../interfaces/Source';
import Decision from '../configureOutputModal/Decision';
import { Modal } from '../Modal';
import { useMultiviewDefaultPresets } from '../../../hooks/useMultiviewDefaultPresets';
import Checkbox from './Checkbox';

type ChangeLayout = {
  defaultLabel?: string;
  source?: TListSource;
  viewId: string;
};

export default function MultiviewLayoutSetup({
  onUpdateLayoutPreset,
  productionId,
  isProductionActive,
  sourceList,
  open,
  onClose,
  savedMultiviews
}: {
  onUpdateLayoutPreset: (newLayout: TMultiviewLayout | null) => void;
  productionId: string;
  isProductionActive: boolean;
  sourceList: SourceReference[];
  open: boolean;
  onClose: () => void;
  savedMultiviews: string[];
}) {
  const [selectedMultiviewPreset, setSelectedMultiviewPreset] =
    useState<MultiviewPreset | null>(null);
  const [presetName, setPresetName] = useState('');
  const [refresh, setRefresh] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [changedLayout, setChangedLayout] = useState<ChangeLayout | null>(null);
  const [newPresetName, setNewPresetName] = useState<string | null>(null);
  const { inputList } = useCreateInputArray(sourceList);
  const [multiviewLayouts] = useMultiviewLayouts(refresh);
  const { multiviewDefaultPresets } = useMultiviewDefaultPresets({
    sourceList,
    isChecked
  });
  const { multiviewPresetLayout } = useSetupMultiviewLayout(
    selectedMultiviewPreset
  );
  const { multiviewLayout } = useConfigureMultiviewLayout(
    productionId,
    selectedMultiviewPreset,
    changedLayout?.defaultLabel,
    changedLayout?.source,
    changedLayout?.viewId,
    newPresetName
  );

  const deleteLayout = useDeleteMultiviewLayout();
  const t = useTranslate();

  const multiviewPresetNames = multiviewDefaultPresets?.map(
    (preset) => preset.name
  )
    ? multiviewDefaultPresets?.map((preset) => preset.name)
    : [];

  const availableMultiviewLayouts = useMemo(() => {
    return (
      multiviewLayouts?.filter(
        (layout) => layout.productionId === productionId
      ) || []
    );
  }, [multiviewLayouts, productionId]);

  const multiviewLayoutNames =
    availableMultiviewLayouts?.map((layout) => layout.name) || [];
  const layoutNameAlreadyExist = availableMultiviewLayouts?.find(
    (singlePreset) => singlePreset.name === newPresetName
  )?.name;

  useEffect(() => {
    availableMultiviewLayouts ? setRefresh(false) : setRefresh(true);
  }, [availableMultiviewLayouts]);

  // This useEffect is used to set the drawn layout of the multiviewer on start,
  // if this fails then the modal will be empty
  useEffect(() => {
    const selectedLayout = multiviewLayouts?.find((layout) => {
      return layout.name === selectedMultiviewPreset?.name;
    });
    const loadedPreset = multiviewDefaultPresets?.find((preset) => {
      return preset.name === selectedMultiviewPreset?.name;
    });

    if (selectedLayout) {
      setSelectedMultiviewPreset(selectedLayout);
    } else if (loadedPreset && !selectedLayout) {
      setSelectedMultiviewPreset(loadedPreset);
    } else if (multiviewDefaultPresets && multiviewDefaultPresets[0]) {
      setPresetName(multiviewDefaultPresets[0].name);
      setSelectedMultiviewPreset(multiviewDefaultPresets[0]);
    }
  }, [
    multiviewDefaultPresets,
    multiviewLayouts,
    selectedMultiviewPreset?.name
  ]);

  // Refresh the layout list when a layout is deleted
  useEffect(() => {
    setRefresh(open);
    setChangedLayout(null);
  }, [open]);

  useEffect(() => {
    if (multiviewLayout) {
      setSelectedMultiviewPreset(multiviewLayout);
      setRefresh(false);
      setChangedLayout(null);
    }
  }, [multiviewLayout]);

  const resetLayoutSetup = () => {
    setNewPresetName('');
    setPresetName('');
    setIsChecked(false);
    setSelectedMultiviewPreset(null);
  };

  const handleLayoutUpdate = (name: string, type: string) => {
    const chosenLayout = availableMultiviewLayouts?.find(
      (singleLayout) => singleLayout.name === name
    );
    const addBasePreset = multiviewDefaultPresets?.find(
      (singlePreset) => singlePreset.name === name
    );

    switch (type) {
      case 'layout':
        if (availableMultiviewLayouts.length === 0) return;
        setNewPresetName(name || '');
        if (chosenLayout) {
          setIsChecked(false);
          setPresetName('');
          setSelectedMultiviewPreset(chosenLayout);
        }
        break;
      case 'preset':
        if (addBasePreset) {
          setNewPresetName('');
          setPresetName(addBasePreset.name);
          setSelectedMultiviewPreset(addBasePreset);
        }
        break;
    }
  };

  const handleChange = (viewId: string, value: string) => {
    if (inputList) {
      const emptyView = {
        id: '',
        input_slot: 0,
        label: ''
      };

      inputList.map((source) => {
        if (value === '') {
          setChangedLayout({ source: emptyView, viewId });
        }
        if (source.id === value) {
          setChangedLayout({ source, viewId });
        }
      });
    }
  };

  const removeMultiviewLayout = () => {
    const layoutToRemove = availableMultiviewLayouts.find(
      (layout) => layout.name === newPresetName
    );

    if (layoutToRemove && !layoutToRemove._id) {
      toast.error(t('preset.could_not_delete_layout'));
      return;
    }

    // Check if the layout is in use
    if (
      layoutToRemove &&
      layoutToRemove._id &&
      savedMultiviews.includes(
        typeof layoutToRemove._id === 'string'
          ? layoutToRemove._id
          : layoutToRemove._id.toString()
      )
    ) {
      toast.error(t('preset.could_not_delete_layout_in_use'));
      return;
    }

    if (layoutToRemove && layoutToRemove._id) {
      deleteLayout(layoutToRemove._id.toString()).then(() => {
        setRefresh(true);
        if (multiviewDefaultPresets?.[0]) {
          setSelectedMultiviewPreset(multiviewDefaultPresets[0]);
        }
        setNewPresetName('');
        toast.success(t('preset.layout_deleted'));
      });
    }
  };

  const saveNewLayout = () => {
    if (selectedMultiviewPreset && newPresetName) {
      onUpdateLayoutPreset({
        ...selectedMultiviewPreset,
        name: newPresetName,
        productionId: productionId
      });
      resetLayoutSetup();
    }
  };

  const closeLayoutModal = () => {
    setRefresh(true);
    resetLayoutSetup();
    onClose();
  };

  return (
    <Modal open={open}>
      {multiviewPresetLayout && (
        <div className="flex flex-col w-full h-full">
          <div className="flex flex-col self-center w-[50%] pt-5">
            <div className="flex flex-row align-middle items-center">
              <Options
                label={t('preset.select_multiview_layout')}
                options={
                  availableMultiviewLayouts.length > 0
                    ? multiviewLayoutNames.map((singleItem) => ({
                        label: singleItem
                      }))
                    : [{ label: t('preset.no_avaliable_layouts') }]
                }
                value={selectedMultiviewPreset?.name || ''}
                update={(value) => handleLayoutUpdate(value, 'layout')}
                emptyFirstOption
              />
              <RemoveLayoutButton
                removeMultiviewLayout={removeMultiviewLayout}
                deleteDisabled={availableMultiviewLayouts.length < 1}
                title={t('preset.remove_layout')}
                hidden={isProductionActive || false}
              />
            </div>
            <div className="flex flex-row align-middle items-center">
              <Options
                label={t('preset.select_multiview_preset')}
                options={multiviewPresetNames.map((singleItem) => ({
                  label: singleItem
                }))}
                value={presetName}
                update={(value) => handleLayoutUpdate(value, 'preset')}
                emptyFirstOption
              />
              <Checkbox
                handleCheckboxChange={() => setIsChecked((prev) => !prev)}
                isChecked={isChecked}
              />
            </div>
          </div>
          <MultiviewLayout
            multiviewPresetLayout={multiviewPresetLayout}
            inputList={inputList}
            handleChange={handleChange}
          />
          <div className="flex flex-col w-[50%] h-full pt-3">
            <Input
              label={t('name')}
              value={newPresetName || ''}
              update={(value) => setNewPresetName(value)}
              placeholder={t('preset.new_preset_name')}
            />
            {layoutNameAlreadyExist && newPresetName !== '' && (
              <p className="text-right mr-2 text-button-delete font-bold">
                {t('preset.layout_already_exist', { layoutNameAlreadyExist })}
              </p>
            )}
          </div>
          <Decision
            className="mt-6"
            onClose={closeLayoutModal}
            onSave={saveNewLayout}
          />
        </div>
      )}
    </Modal>
  );
}