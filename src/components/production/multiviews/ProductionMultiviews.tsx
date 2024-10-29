import { TMultiviewLayout, Preset } from '../../../interfaces/preset';
import { useEffect, useState } from 'react';
import { useTranslate } from '../../../i18n/useTranslate';
import toast from 'react-hot-toast';
import { MultiviewSettings } from '../../../interfaces/multiview';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  useGetMultiviewLayout,
  usePutMultiviewLayout
} from '../../../hooks/multiviewLayout';
import { IconSettings } from '@tabler/icons-react';
import { Button } from '../../button/Button';
import Section from '../../section/Section';
import MultiviewSettingsConfig from '../../modal/configureMultiviewModal/MultiviewSettings';
import MultiviewLayoutSettings from '../../modal/configureMultiviewModal/MultiviewLayoutSettings/MultiviewLayoutSettings';
import Decision from '../../modal/configureOutputModal/Decision';
import { UpdateMultiviewersModal } from '../../modal/UpdateMultiviewersModal';
import { SourceReference } from '../../../interfaces/Source';

type ProductionMultiviewsProps = {
  productionId: string;
  isProductionActive: boolean;
  sources: SourceReference[];
  multiviews: MultiviewSettings[];
  updateMultiviews: (mvs: MultiviewSettings[]) => void;
};

export default function ProductionMultiviews(props: ProductionMultiviewsProps) {
  const {
    productionId,
    isProductionActive,
    sources,
    multiviews: multiviewsProp,
    updateMultiviews
  } = props;

  const [multiviews, setMultiviews] =
    useState<MultiviewSettings[]>(multiviewsProp);
  const [portDuplicateIndexes, setPortDuplicateIndexes] = useState<number[]>(
    []
  );
  const [streamIdDuplicateIndexes, setStreamIdDuplicateIndexes] = useState<
    number[]
  >([]);
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(true);
  const [confirmUpdateModalOpen, setConfirmUpdateModalOpen] = useState(false);
  const [newMultiviewLayout, setNewMultiviewLayout] =
    useState<TMultiviewLayout | null>(null);
  const addNewLayout = usePutMultiviewLayout();
  const t = useTranslate();
  const getMultiviewLayout = useGetMultiviewLayout();

  useEffect(() => {
    console.log(multiviews);
  }, [multiviews]);

  const clearInputs = () => {
    setLayoutModalOpen(false);
    setMultiviews(multiviewsProp || []);
  };

  useEffect(() => {
    runDuplicateCheck(multiviews);
  }, [multiviews]);

  const onSave = () => {
    if (isProductionActive && !confirmUpdateModalOpen) {
      setConfirmUpdateModalOpen(true);
      return;
    }
    if (isProductionActive && confirmUpdateModalOpen) {
      setConfirmUpdateModalOpen(false);
    }

    if (!multiviews) {
      toast.error(t('preset.no_multiview_selected'));
      return;
    }

    if (portDuplicateIndexes.length > 0) {
      toast.error(t('preset.no_port_selected'));
      return;
    }

    if (streamIdDuplicateIndexes.length > 0) {
      toast.error(t('preset.unique_stream_id'));
      return;
    }

    const multiviewsToUpdate = multiviews.map((singleMultiview) => {
      return { ...singleMultiview };
    });

    updateMultiviews(multiviewsToUpdate);
  };

  const onUpdateLayoutPreset = async () => {
    const noLayoutName = newMultiviewLayout?.name === '';
    const defaultLayout = newMultiviewLayout?.name.includes('Default');
    if (noLayoutName) {
      toast.error(t('preset.layout_name_missing'));
      return;
    }
    if (!newMultiviewLayout || defaultLayout) {
      toast.error(t('preset.no_updated_layout'));
      return;
    }

    await addNewLayout(newMultiviewLayout);
    setLayoutModalOpen(false);
    setRefresh(true);
  };

  const closeLayoutModal = () => {
    setLayoutModalOpen(false);
    setRefresh(true);
  };

  const findDuplicateValues = (mvs: MultiviewSettings[]) => {
    const ports = mvs.map(
      (item: MultiviewSettings) =>
        item.output.local_ip + ':' + item.output.local_port.toString()
    );
    const streamIds = mvs.map(
      (item: MultiviewSettings) => item.output.srt_stream_id
    );
    const duplicatePortIndices: number[] = [];
    const duplicateStreamIdIndices: number[] = [];
    const seenPorts = new Set();
    const seenIds = new Set();

    ports.forEach((port, index) => {
      if (seenPorts.has(port)) {
        duplicatePortIndices.push(index);

        // Also include the first occurrence if it's not already included
        const firstIndex = ports.indexOf(port);
        if (!duplicatePortIndices.includes(firstIndex)) {
          duplicatePortIndices.push(firstIndex);
        }
      } else {
        seenPorts.add(port);
      }
    });

    streamIds.forEach((streamId, index) => {
      if (streamId === '' || !streamId) {
        return;
      }

      if (seenIds.has(streamId)) {
        duplicateStreamIdIndices.push(index);

        // Also include the first occurrence if it's not already included
        const firstIndex = streamIds.indexOf(streamId);
        if (!duplicateStreamIdIndices.includes(firstIndex)) {
          duplicateStreamIdIndices.push(firstIndex);
        }
      } else {
        seenIds.add(streamId);
      }
    });

    return {
      hasDuplicatePort: duplicatePortIndices,
      hasDuplicateStreamId: duplicateStreamIdIndices
    };
  };

  const runDuplicateCheck = (mvs: MultiviewSettings[]) => {
    const { hasDuplicatePort, hasDuplicateStreamId } = findDuplicateValues(mvs);

    if (hasDuplicatePort.length > 0) {
      setPortDuplicateIndexes(hasDuplicatePort);
    }

    if (hasDuplicateStreamId.length > 0) {
      setStreamIdDuplicateIndexes(hasDuplicateStreamId);
    }

    if (hasDuplicatePort.length === 0) {
      setPortDuplicateIndexes([]);
    }

    if (hasDuplicateStreamId.length === 0) {
      setStreamIdDuplicateIndexes([]);
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
    // Remove _id from newMultiview to avoid conflicts with existing multiviews
    delete newMultiview._id;

    setMultiviews((prevMultiviews) =>
      prevMultiviews ? [...prevMultiviews, newMultiview] : [newMultiview]
    );
  };

  const removeNewMultiview = (index: number) => {
    const newMultiviews = multiviews.filter((_, i) => i !== index);
    setMultiviews(newMultiviews);
  };

  return (
    <Section title="Multiviewers" startOpen>
      {!layoutModalOpen && (
        <div className="flex gap-3">
          {(multiviews &&
            multiviews.length > 0 &&
            multiviews.map((singleItem, index) => {
              return (
                <div className="flex" key={index}>
                  {index !== 0 && (
                    <div className="min-h-full border-l border-separate opacity-10 my-12"></div>
                  )}
                  <div className="flex flex-col">
                    <MultiviewSettingsConfig
                      productionId={productionId}
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
                      streamIdDuplicateError={
                        streamIdDuplicateIndexes.length > 0
                          ? streamIdDuplicateIndexes.includes(index)
                          : false
                      }
                      refresh={refresh}
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
                          title={t('preset.remove_multiview')}
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
                          title={t('preset.add_another_multiview')}
                          onClick={() =>
                            addNewMultiview({
                              ...singleItem,
                              multiview_id: (singleItem.multiview_id ?? 0) + 1
                            })
                          }
                        >
                          <IconPlus className="mr-2 text-green-400 hover:text-green-200" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })) || <div>No Multiviews</div>}
        </div>
      )}
      {layoutModalOpen && (
        <MultiviewLayoutSettings
          productionId={productionId}
          isProductionActive={isProductionActive}
          sources={sources}
          setNewMultiviewPreset={setNewMultiviewLayout}
          layoutModalOpen={layoutModalOpen}
        />
      )}
      <div className="flex flex-col">
        {!layoutModalOpen && (
          <Button
            className="flex self-center hover:bg-green-400 min-w-fit max-w-fit mt-10"
            type="button"
            onClick={() => {
              setRefresh(false);
              setLayoutModalOpen(true);
            }}
          >
            {t('preset.configure_layouts')}
            <IconSettings className="text-p inline ml-2" />
          </Button>
        )}
        <Decision
          className="mt-6"
          onClose={() => (layoutModalOpen ? closeLayoutModal() : clearInputs())}
          onSave={() => (layoutModalOpen ? onUpdateLayoutPreset() : onSave())}
        />
      </div>

      {confirmUpdateModalOpen && (
        <UpdateMultiviewersModal
          open={confirmUpdateModalOpen}
          onAbort={() => setConfirmUpdateModalOpen(false)}
          onConfirm={() => onSave()}
        />
      )}
    </Section>
  );
}
