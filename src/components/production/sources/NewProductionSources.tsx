'use client';

import { useContext, useEffect, useState } from 'react';
import { useSources } from '../../../hooks/sources/useSources';
import {
  AddSourceStatus,
  DeleteSourceStatus,
  SourceReference,
  SourceWithId
} from '../../../interfaces/Source';
import {
  useCreateStream,
  useDeleteStream,
  useUpdateStream
} from '../../../hooks/streams';
import { AddSourceModal } from '../../modal/AddSourceModal';
import { DndProvider } from 'react-dnd';
import SourceCards from '../../sourceCards/SourceCards';
import { RemoveSourceModal } from '../../modal/RemoveSourceModal';
import { AddInput } from '../../addInput/AddInput';
import { Select } from '../../select/Select';
import { useTranslate } from '../../../i18n/useTranslate';
import { Production } from '../../../interfaces/production';
import { useGetFirstEmptySlot } from '../../../hooks/useGetFirstEmptySlot';
import { useAddSource } from '../../../hooks/sources/useAddSource';
import { useDeleteHtmlSource } from '../../../hooks/renderingEngine/useDeleteHtmlSource';
import { useDeleteMediaSource } from '../../../hooks/renderingEngine/useDeleteMediaSource';
import { useCreateHtmlSource } from '../../../hooks/renderingEngine/useCreateHtmlSource';
import { useCreateMediaSource } from '../../../hooks/renderingEngine/useCreateMediaSource';
import { useRenderingEngine } from '../../../hooks/renderingEngine/useRenderingEngine';
import { CreateHtmlModal } from '../../modal/renderingEngineModals/CreateHtmlModal';
import { CreateMediaModal } from '../../modal/renderingEngineModals/CreateMediaModal';
import { GlobalContext } from '../../../contexts/GlobalContext';
import { usePutProductionPipelineSourceAlignmentAndLatency } from '../../../hooks/productions';
import { useIngestSourceId } from '../../../hooks/ingests';
import { useMultiviews } from '../../../hooks/multiviews';
import { updateSetupItem } from '../../../hooks/items/updateSetupItem';
import { addSetupItem } from '../../../hooks/items/addSetupItem';
import { removeSetupItem } from '../../../hooks/items/removeSetupItem';
import { ISource } from '../../../hooks/useDragableItems';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProductionSourceList from './ProductionSourceList';
import Section from '../../section/Section';

interface ProductionSourcesProps {
  productionSetup: any;
  setProductionSetup: any;
  setUpdateMuliviewLayouts: any;
  putProduction: any;
  refreshProduction: any;
}

const NewProductionSources: React.FC<ProductionSourcesProps> = (props) => {
  const {
    productionSetup,
    setProductionSetup,
    setUpdateMuliviewLayouts,
    putProduction,
    refreshProduction
  } = props;

  const t = useTranslate();
  const { locked } = useContext(GlobalContext);
  const putProductionPipelineSourceAlignmentAndLatency =
    usePutProductionPipelineSourceAlignmentAndLatency();
  const [addSourceStatus, setAddSourceStatus] = useState<AddSourceStatus>();
  const [deleteSourceStatus, setDeleteSourceStatus] =
    useState<DeleteSourceStatus>();
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState<boolean>(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);

  const [updateStream, loading] = useUpdateStream();
  const [getIngestSourceId, ingestSourceIdLoading] = useIngestSourceId();
  const [updateMultiviewViews] = useMultiviews();
  const selectedProductionItems =
    productionSetup?.sources.map((prod: any) => prod._id) || [];
  const [inventoryVisible, setInventoryVisible] = useState(false);

  //SOURCES
  const [sources] = useSources();
  const [selectedValue, setSelectedValue] = useState<string>(
    t('production.add_other_source_type')
  );
  const [addSourceModal, setAddSourceModal] = useState(false);
  const [removeSourceModal, setRemoveSourceModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<
    SourceWithId | undefined
  >();
  const [selectedSourceRef, setSelectedSourceRef] = useState<
    SourceReference | undefined
  >();
  const [createStream, loadingCreateStream] = useCreateStream();
  const [deleteStream, loadingDeleteStream] = useDeleteStream();

  // Create source
  const [firstEmptySlot] = useGetFirstEmptySlot();
  const [addSource] = useAddSource();

  // Rendering engine
  const [deleteHtmlSource, deleteHtmlLoading] = useDeleteHtmlSource();
  const [deleteMediaSource, deleteMediaLoading] = useDeleteMediaSource();
  const [createHtmlSource, createHtmlLoading] = useCreateHtmlSource();
  const [createMediaSource, createMediaLoading] = useCreateMediaSource();
  const [getRenderingEngine, renderingEngineLoading] = useRenderingEngine();

  const updateSource = (
    source: SourceReference,
    productionSetup: Production
  ) => {
    const updatedSetup = updateSetupItem(source, productionSetup);
    setProductionSetup(updatedSetup);
    setUpdateMuliviewLayouts(true);
    putProduction(updatedSetup._id.toString(), updatedSetup);
    const pipeline = updatedSetup.production_settings.pipelines[0];

    pipeline.multiviews?.map((singleMultiview) => {
      if (
        pipeline.pipeline_id &&
        pipeline.multiviews &&
        singleMultiview.multiview_id
      ) {
        updateMultiviewViews(
          pipeline.pipeline_id,
          updatedSetup,
          source,
          singleMultiview
        );
      }
    });
  };

  const addSourceAction = (source: SourceWithId) => {
    if (productionSetup && productionSetup.isActive) {
      setSelectedSource(source);
      setAddSourceModal(true);
    } else if (productionSetup) {
      const input: SourceReference = {
        _id: source._id.toString(),
        type: 'ingest_source',
        label: source.ingest_source_name,
        input_slot: firstEmptySlot(productionSetup)
      };
      addSource(input, productionSetup).then((updatedSetup) => {
        if (!updatedSetup) return;
        setProductionSetup(updatedSetup);
        setAddSourceModal(false);
        setSelectedSource(undefined);
      });
    }
  };

  const addHtmlSource = (height: number, width: number, url: string) => {
    if (productionSetup) {
      const sourceToAdd: SourceReference = {
        type: 'html',
        label: `HTML ${firstEmptySlot(productionSetup)}`,
        input_slot: firstEmptySlot(productionSetup),
        html_data: {
          height: height,
          url: url,
          width: width
        }
      };
      const updatedSetup = addSetupItem(sourceToAdd, productionSetup);
      if (!updatedSetup) return;
      setProductionSetup(updatedSetup);
      putProduction(updatedSetup._id.toString(), updatedSetup).then(() => {
        refreshProduction();
      });

      if (productionSetup?.isActive && sourceToAdd.html_data) {
        createHtmlSource(
          productionSetup,
          sourceToAdd.input_slot,
          sourceToAdd.html_data,
          sourceToAdd
        );
      }
    }
  };

  const addMediaSource = (filename: string) => {
    if (productionSetup) {
      const sourceToAdd: SourceReference = {
        type: 'mediaplayer',
        label: `Media Player ${firstEmptySlot(productionSetup)}`,
        input_slot: firstEmptySlot(productionSetup),
        media_data: {
          filename: filename
        }
      };
      const updatedSetup = addSetupItem(sourceToAdd, productionSetup);
      if (!updatedSetup) return;
      setProductionSetup(updatedSetup);
      putProduction(updatedSetup._id.toString(), updatedSetup).then(() => {
        refreshProduction();
      });

      if (productionSetup?.isActive && sourceToAdd.media_data) {
        createMediaSource(
          productionSetup,
          sourceToAdd.input_slot,
          sourceToAdd.media_data,
          sourceToAdd
        );
      }
    }
  };

  const isDisabledFunction = (source: SourceWithId): boolean => {
    return selectedProductionItems?.includes(source._id.toString());
  };

  const handleOpenModal = (type: 'html' | 'media') => {
    if (type === 'html') {
      setIsHtmlModalOpen(true);
    } else if (type === 'media') {
      setIsMediaModalOpen(true);
    }
  };

  const handleAddSource = async () => {
    setAddSourceStatus(undefined);
    if (
      productionSetup &&
      productionSetup.isActive &&
      selectedSource &&
      (Array.isArray(
        productionSetup?.production_settings.pipelines[0].multiviews
      )
        ? productionSetup.production_settings.pipelines[0].multiviews.some(
            (singleMultiview: any) => singleMultiview?.layout?.views
          )
        : false)
    ) {
      let updatedSetup = productionSetup;

      for (
        let i = 0;
        i < productionSetup.production_settings.pipelines.length;
        i++
      ) {
        const pipeline = productionSetup.production_settings.pipelines[i];

        if (!pipeline.sources) {
          pipeline.sources = [];
        }

        const newSource = {
          source_id: await getIngestSourceId(
            selectedSource.ingest_name,
            selectedSource.ingest_source_name
          ),
          settings: {
            alignment_ms: pipeline.alignment_ms,
            max_network_latency_ms: pipeline.max_network_latency_ms
          }
        };

        updatedSetup = {
          ...productionSetup,
          production_settings: {
            ...productionSetup.production_settings,
            pipelines: productionSetup.production_settings.pipelines.map(
              (p: any, index: number) => {
                if (index === i) {
                  if (!p.sources) {
                    p.sources = [];
                  }
                  p.sources.push(newSource);
                }
                return p;
              }
            )
          }
        } as Production;
      }

      const result = await createStream(
        selectedSource,
        updatedSetup,
        firstEmptySlot(productionSetup)
      );
      if (!result.ok) {
        if (!result.value) {
          setAddSourceStatus({
            success: false,
            steps: [{ step: 'add_stream', success: false }]
          });
        } else {
          setAddSourceStatus({
            success: false,
            steps: result.value.steps
          });
        }
      }
      if (result.ok) {
        if (result.value.success) {
          const sourceToAdd: SourceReference = {
            _id: result.value.streams[0].source_id,
            type: 'ingest_source',
            label: selectedSource.name,
            stream_uuids: result.value.streams.map((r) => r.stream_uuid),
            input_slot: firstEmptySlot(productionSetup)
          };
          const updatedSetup = addSetupItem(sourceToAdd, productionSetup);
          if (!updatedSetup) return;
          setProductionSetup(updatedSetup);
          putProduction(updatedSetup._id.toString(), updatedSetup).then(() => {
            refreshProduction();
            setAddSourceModal(false);
            setSelectedSource(undefined);
          });
          setAddSourceStatus(undefined);
        } else {
          setAddSourceStatus({ success: false, steps: result.value.steps });
        }
      }
    }
  };

  const handleRemoveSource = async () => {
    if (productionSetup && productionSetup.isActive && selectedSourceRef) {
      const multiviews =
        productionSetup.production_settings.pipelines[0].multiviews;

      if (!multiviews || multiviews.length === 0) return;

      const viewToUpdate = multiviews.some((multiview: any) =>
        multiview.layout.views.find(
          (v: any) => v.input_slot === selectedSourceRef.input_slot
        )
      );

      if (
        selectedSourceRef.stream_uuids &&
        selectedSourceRef.stream_uuids.length > 0
      ) {
        if (!viewToUpdate) {
          if (!productionSetup.production_settings.pipelines[0].pipeline_id)
            return;

          const result = await deleteStream(
            selectedSourceRef.stream_uuids,
            productionSetup,
            selectedSourceRef.input_slot
          );

          if (!result.ok) {
            if (!result.value) {
              setDeleteSourceStatus({
                success: false,
                steps: [{ step: 'unexpected', success: false }]
              });
            } else {
              setDeleteSourceStatus({ success: false, steps: result.value });
              const didDeleteStream = result.value.some(
                (step) => step.step === 'delete_stream' && step.success
              );
              if (didDeleteStream) {
                const updatedSetup = removeSetupItem(
                  selectedSourceRef,
                  productionSetup
                );
                if (!updatedSetup) return;
                setProductionSetup(updatedSetup);
                putProduction(updatedSetup._id.toString(), updatedSetup).then(
                  () => {
                    setSelectedSourceRef(undefined);
                  }
                );
                return;
              }
            }
            return;
          }

          const updatedSetup = removeSetupItem(
            selectedSourceRef,
            productionSetup
          );

          if (!updatedSetup) return;

          setProductionSetup(updatedSetup);
          putProduction(updatedSetup._id.toString(), updatedSetup).then(() => {
            setRemoveSourceModal(false);
            setSelectedSourceRef(undefined);
          });
          return;
        }

        const result = await deleteStream(
          selectedSourceRef.stream_uuids,
          productionSetup,
          selectedSourceRef.input_slot
        );

        if (!result.ok) {
          if (!result.value) {
            setDeleteSourceStatus({
              success: false,
              steps: [{ step: 'unexpected', success: false }]
            });
          } else {
            setDeleteSourceStatus({ success: false, steps: result.value });
            const didDeleteStream = result.value.some(
              (step) => step.step === 'delete_stream' && step.success
            );
            if (didDeleteStream) {
              const updatedSetup = removeSetupItem(
                selectedSourceRef,
                productionSetup
              );
              if (!updatedSetup) return;
              setProductionSetup(updatedSetup);
              putProduction(updatedSetup._id.toString(), updatedSetup);
              return;
            }
          }
          return;
        }
      }

      if (
        selectedSourceRef.type === 'html' ||
        selectedSourceRef.type === 'mediaplayer'
      ) {
        for (
          let i = 0;
          i < productionSetup.production_settings.pipelines.length;
          i++
        ) {
          const pipelineId =
            productionSetup.production_settings.pipelines[i].pipeline_id;
          if (pipelineId) {
            const renderingEngine = getRenderingEngine(pipelineId);
            if (selectedSourceRef.type === 'html') {
              await deleteHtmlSource(
                pipelineId,
                selectedSourceRef.input_slot,
                productionSetup
              );
            } else if (selectedSourceRef.type === 'mediaplayer') {
              await deleteMediaSource(
                pipelineId,
                selectedSourceRef.input_slot,
                productionSetup
              );
            }
          }
        }
      }

      const updatedSetup = removeSetupItem(selectedSourceRef, productionSetup);

      if (!updatedSetup) return;
      setProductionSetup(updatedSetup);
      putProduction(updatedSetup._id.toString(), updatedSetup).then(() => {
        setRemoveSourceModal(false);
        setSelectedSourceRef(undefined);
      });
    }
  };

  const handleAbortAddSource = () => {
    setAddSourceStatus(undefined);
    setAddSourceModal(false);
    setSelectedSource(undefined);
  };

  const handleAbortRemoveSource = () => {
    setRemoveSourceModal(false);
    setSelectedSource(undefined);
    setDeleteSourceStatus(undefined);
  };

  const handleSetPipelineSourceSettings = (
    source: ISource,
    sourceId: number,
    data: {
      pipeline_uuid: string;
      stream_uuid: string;
      alignment: number;
      latency: number;
    }[]
  ) => {
    if (
      productionSetup?._id &&
      source?.ingest_name &&
      source?.ingest_source_name
    ) {
      data.forEach(({ pipeline_uuid, stream_uuid, alignment, latency }) => {
        putProductionPipelineSourceAlignmentAndLatency(
          productionSetup._id,
          pipeline_uuid,
          source.ingest_name,
          source.ingest_source_name,
          alignment,
          latency
        );
        updateStream(stream_uuid, alignment);

        const updatedProduction = {
          ...productionSetup,
          productionSettings: {
            ...productionSetup.production_settings,
            pipelines: productionSetup.production_settings.pipelines.map(
              (pipeline: any) => {
                if (pipeline.pipeline_id === pipeline_uuid) {
                  pipeline.sources?.map((source: any) => {
                    if (source.source_id === sourceId) {
                      source.settings.alignment_ms = alignment;
                      source.settings.max_network_latency_ms = latency;
                    }
                  });
                }
                return pipeline;
              }
            )
          }
        };

        setProductionSetup(updatedProduction);
      });
    }
  };

  const updateProduction = (id: string, productionSetup: Production) => {
    setProductionSetup(productionSetup);
    putProduction(id, productionSetup);
  };

  useEffect(() => {
    if (selectedValue === t('production.source')) {
      setInventoryVisible(true);
    }
  }, [selectedValue]);

  const isAddButtonDisabled =
    (selectedValue !== 'HTML' && selectedValue !== 'Media Player') || locked;

  return (
    <Section title="Sources" startOpen>
      <div className="flex flex-col h-[70%]">
        <div className="flex flex-col h-fit w-full">
          <div
            id="prevCameras"
            className="grid p-3 my-2 bg-container grow rounded grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 h-fit"
          >
            {productionSetup?.sources && sources.size > 0 && (
              <DndProvider backend={HTML5Backend}>
                <SourceCards
                  onConfirm={handleSetPipelineSourceSettings}
                  productionSetup={productionSetup}
                  locked={locked}
                  updateProduction={(updated) => {
                    updateProduction(productionSetup._id, updated);
                    setUpdateMuliviewLayouts(true);
                  }}
                  onSourceUpdate={(source: SourceReference) => {
                    updateSource(source, productionSetup);
                    setUpdateMuliviewLayouts(true);
                  }}
                  onSourceRemoval={(source: SourceReference) => {
                    if (productionSetup && productionSetup.isActive) {
                      setSelectedSourceRef(source);
                      setRemoveSourceModal(true);
                    } else if (productionSetup) {
                      const updatedSetup = removeSetupItem(
                        {
                          _id: source._id,
                          type: source.type,
                          label: source.label,
                          input_slot: source.input_slot
                        },
                        productionSetup
                      );
                      if (!updatedSetup) return;
                      setProductionSetup(updatedSetup);
                      setUpdateMuliviewLayouts(true);
                      putProduction(
                        updatedSetup._id.toString(),
                        updatedSetup
                      ).then(() => {
                        setRemoveSourceModal(false);
                        setSelectedSourceRef(undefined);
                      });
                    }
                  }}
                  loading={loading}
                />
                {removeSourceModal && selectedSourceRef && (
                  <RemoveSourceModal
                    name={selectedSourceRef.label}
                    open={removeSourceModal}
                    onAbort={handleAbortRemoveSource}
                    onConfirm={handleRemoveSource}
                    status={deleteSourceStatus}
                    loading={
                      loadingDeleteStream ||
                      deleteHtmlLoading ||
                      deleteMediaLoading
                    }
                  />
                )}
              </DndProvider>
            )}
            <div className="bg-zinc-700 aspect-video m-2 p-2 text-p border-2 border-zinc-300 rounded flex flex-col gap-2 justify-center items-center">
              <AddInput
                onClickSource={() => setInventoryVisible(true)}
                disabled={false}
              />
              <div className="flex flex-row">
                <Select
                  classNames="w-full"
                  disabled={false}
                  options={[
                    t('production.add_other_source_type'),
                    'HTML',
                    'Media Player'
                  ]}
                  value={selectedValue}
                  onChange={(e) => {
                    setSelectedValue(e.target.value);
                  }}
                />
                <button
                  className={`p-1.5 rounded ml-2 ${
                    isAddButtonDisabled
                      ? 'bg-zinc-500/50 text-white/50'
                      : 'bg-zinc-500 text-white'
                  }`}
                  onClick={() =>
                    handleOpenModal(selectedValue === 'HTML' ? 'html' : 'media')
                  }
                  disabled={isAddButtonDisabled}
                >
                  {t('production.add')}
                </button>
              </div>
            </div>
          </div>
          <CreateHtmlModal
            open={isHtmlModalOpen}
            onAbort={() => setIsHtmlModalOpen(false)}
            onConfirm={addHtmlSource}
            loading={createHtmlLoading}
          />
          <CreateMediaModal
            open={isMediaModalOpen}
            onAbort={() => setIsMediaModalOpen(false)}
            onConfirm={addMediaSource}
            loading={createMediaLoading}
          />
        </div>
        <div
          className={`transition-[max-height] w-full min-w-0 max-h-0 overflow-hidden ${
            inventoryVisible ? 'max-h-[70vh]' : ''
          }`}
        >
          <ProductionSourceList
            sources={sources}
            action={addSourceAction}
            actionText={t('inventory_list.add')}
            onClose={() => setInventoryVisible(false)}
            isDisabledFunc={isDisabledFunction}
            locked={locked}
          />
          {addSourceModal && (selectedSource || selectedSourceRef) && (
            <AddSourceModal
              name={selectedSource?.name || selectedSourceRef?.label || ''}
              open={addSourceModal}
              onAbort={handleAbortAddSource}
              onConfirm={handleAddSource}
              status={addSourceStatus}
              loading={loadingCreateStream}
              locked={locked}
            />
          )}
        </div>
      </div>
    </Section>
  );
};

export default NewProductionSources;
