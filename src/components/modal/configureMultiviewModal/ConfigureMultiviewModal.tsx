import { TMultiviewLayout, Preset } from '../../../interfaces/preset';
import { Modal } from '../Modal';
import { useEffect, useState } from 'react';
import { useTranslate } from '../../../i18n/useTranslate';
import toast from 'react-hot-toast';
import { MultiviewSettings } from '../../../interfaces/multiview';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Production } from '../../../interfaces/production';
import deepclone from 'lodash.clonedeep';
import MultiviewSettingsConfig from './MultiviewSettings';
import { usePutMultiviewLayout } from '../../../hooks/multiviewLayout';
import Decision from '../configureOutputModal/Decision';
import MultiviewLayoutSettings from './MultiviewLayoutSettings/MultiviewLayoutSettings';
import { IconSettings } from '@tabler/icons-react';
import { Button } from '../../button/Button';

type ConfigureMultiviewModalProps = {
  open: boolean;
  preset: Preset;
  onClose: () => void;
  updatePreset: (preset: Preset) => void;
  production?: Production;
};

export function ConfigureMultiviewModal({
  open,
  preset,
  onClose,
  updatePreset,
  production
}: ConfigureMultiviewModalProps) {
  const [multiviews, setMultiviews] = useState<MultiviewSettings[]>([]);
  const [portDuplicateIndexes, setPortDuplicateIndexes] = useState<number[]>(
    []
  );
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [newMultiviewLayout, setNewMultiviewLayout] =
    useState<TMultiviewLayout | null>(null);
  const addNewLayout = usePutMultiviewLayout();
  const t = useTranslate();

  useEffect(() => {
    if (preset.pipelines[0].multiviews) {
      if (!Array.isArray(preset.pipelines[0].multiviews)) {
        setMultiviews([preset.pipelines[0].multiviews]);
      } else {
        setMultiviews(preset.pipelines[0].multiviews);
      }
    }
  }, [preset.pipelines]);

  const clearInputs = () => {
    setLayoutModalOpen(false);
    setMultiviews(preset.pipelines[0].multiviews || []);
    onClose();
  };

  useEffect(() => {
    runDuplicateCheck(multiviews);
  }, [multiviews]);

  const onSave = () => {
    const presetToUpdate = deepclone(preset);

    if (!multiviews) {
      toast.error(t('preset.no_multiview_selected'));
      return;
    }

    if (portDuplicateIndexes.length > 0) {
      toast.error(t('preset.no_port_selected'));
      return;
    }

    presetToUpdate.pipelines[0].multiviews = multiviews.map(
      (singleMultiview) => {
        return { ...singleMultiview };
      }
    );

    updatePreset(presetToUpdate);
    onClose();
  };

  const onUpdateLayoutPreset = () => {
    const noLayoutName = newMultiviewLayout?.name === '';
    const defaultLayout = newMultiviewLayout?.name.includes('Default');
    if (!newMultiviewLayout || noLayoutName || defaultLayout) {
      toast.error(t('preset.no_updated_layout'));
      return;
    }

    addNewLayout(newMultiviewLayout);
    setLayoutModalOpen(false);
  };

  const closeLayoutModal = () => {
    setLayoutModalOpen(false);
  };

  const findDuplicateValues = (mvs: MultiviewSettings[]) => {
    const ports = mvs.map(
      (item: MultiviewSettings) =>
        item.output.local_ip + ':' + item.output.local_port.toString()
    );
    const duplicateIndices: number[] = [];
    const seenPorts = new Set();

    ports.forEach((port, index) => {
      if (seenPorts.has(port)) {
        duplicateIndices.push(index);

        // Also include the first occurrence if it's not already included
        const firstIndex = ports.indexOf(port);
        if (!duplicateIndices.includes(firstIndex)) {
          duplicateIndices.push(firstIndex);
        }
      } else {
        seenPorts.add(port);
      }
    });

    return duplicateIndices;
  };

  const runDuplicateCheck = (mvs: MultiviewSettings[]) => {
    const hasDuplicates = findDuplicateValues(mvs);

    if (hasDuplicates.length > 0) {
      setPortDuplicateIndexes(hasDuplicates);
    }

    if (hasDuplicates.length === 0) {
      setPortDuplicateIndexes([]);
    }
  };

  const handleUpdateMultiview = (
    multiview: MultiviewSettings,
    index: number
  ) => {
    const updatedMultiviews = multiviews.map((item, i) =>
      i === index ? { ...item, ...multiview } : item
    );

    runDuplicateCheck(multiviews);

    setMultiviews(updatedMultiviews);
  };

  const addNewMultiview = (newMultiview: MultiviewSettings) => {
    setMultiviews((prevMultiviews) =>
      prevMultiviews ? [...prevMultiviews, newMultiview] : [newMultiview]
    );
  };

  const removeNewMultiview = (index: number) => {
    const newMultiviews = multiviews.filter((_, i) => i !== index);
    setMultiviews(newMultiviews);
  };

  return (
    <Modal open={open} outsideClick={() => clearInputs()}>
      {!layoutModalOpen && (
        <div className="flex gap-3">
          {multiviews &&
            multiviews.length > 0 &&
            multiviews.map((singleItem, index) => {
              return (
                <div className="flex" key={index}>
                  {index !== 0 && (
                    <div className="min-h-full border-l border-separate opacity-10 my-12"></div>
                  )}
                  <div className="flex flex-col">
                    <MultiviewSettingsConfig
                      productionId={production?._id}
                      openConfigModal={() => setLayoutModalOpen(true)}
                      newMultiviewLayout={newMultiviewLayout}
                      lastItem={multiviews.length === index + 1}
                      multiview={singleItem}
                      handleUpdateMultiview={(input) =>
                        handleUpdateMultiview(input, index)
                      }
                      portDuplicateError={
                        portDuplicateIndexes.length > 0
                          ? portDuplicateIndexes.includes(index)
                          : false
                      }
                    />
                    <div
                      className={`w-full flex ${
                        multiviews.length > 1
                          ? 'justify-between'
                          : 'justify-end'
                      }`}
                    >
                      {multiviews.length > 1 && (
                        <button
                          type="button"
                          title="Add another multiview"
                          onClick={() => removeNewMultiview(index)}
                        >
                          <IconTrash
                            className={`ml-4 text-button-delete hover:text-red-400`}
                          />
                        </button>
                      )}
                      {multiviews.length === index + 1 && (
                        <button
                          type="button"
                          title="Add another multiview"
                          onClick={() => addNewMultiview(singleItem)}
                        >
                          <IconPlus className="mr-2 text-green-400 hover:text-green-200" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
      {layoutModalOpen && (
        <MultiviewLayoutSettings
          production={production}
          setNewMultiviewPreset={setNewMultiviewLayout}
        />
      )}
      <div className="flex flex-col">
        {!layoutModalOpen && (
          <Button
            className="flex self-center hover:bg-green-400 min-w-fit max-w-fit mt-10"
            type="button"
            onClick={() => setLayoutModalOpen(true)}
          >
            {t('preset.configure_layout')}
            <IconSettings className="text-p inline ml-2" />
          </Button>
        )}
        <Decision
          className="mt-6"
          onClose={() => (layoutModalOpen ? closeLayoutModal() : clearInputs())}
          onSave={() => (layoutModalOpen ? onUpdateLayoutPreset() : onSave())}
        />
      </div>
    </Modal>
  );
}
