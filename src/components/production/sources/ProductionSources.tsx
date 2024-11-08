'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
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
import { useDeleteHtmlSource } from '../../../hooks/renderingEngine/useDeleteHtmlSource';
import { useDeleteMediaSource } from '../../../hooks/renderingEngine/useDeleteMediaSource';
import { useCreateHtmlSource } from '../../../hooks/renderingEngine/useCreateHtmlSource';
import { useCreateMediaSource } from '../../../hooks/renderingEngine/useCreateMediaSource';
import { CreateHtmlModal } from '../../modal/renderingEngineModals/CreateHtmlModal';
import { CreateMediaModal } from '../../modal/renderingEngineModals/CreateMediaModal';
import { GlobalContext } from '../../../contexts/GlobalContext';
import {
  usePutProductionPipelineSourceAlignmentAndLatency,
  useReplaceProductionSourceStreamIds
} from '../../../hooks/productions';
import { useIngestSourceId } from '../../../hooks/ingests';
import { useMultiviews } from '../../../hooks/multiviews';
import { updateSetupItem } from '../../../hooks/items/updateSetupItem';
import { ISource } from '../../../hooks/useDragableItems';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProductionSourceList from './ProductionSourceList';
import Section from '../../section/Section';
import { MultiviewSettings } from '../../../interfaces/multiview';
import { PipelineSettings } from '../../../interfaces/pipeline';
import { useGetFirstEmptySlot } from '../../../hooks/useGetFirstEmptySlot';
import useEffectNotOnMount from '../../../hooks/utils/useEffectNotOnMount';
import { LoadingCover } from '../../loader/LoadingCover';

interface ProductionSourcesProps {
  sources: SourceReference[];
  updateSources: (sources: SourceReference[]) => void;
  multiviewPipelineId?: string;
  multiviews: MultiviewSettings[];
  isProductionActive: boolean;
  pipelines: PipelineSettings[];
  updatePipelines: (pipelines: PipelineSettings[]) => void;
  productionId: string;
  refreshProduction: () => void;
}

const ProductionSources: React.FC<ProductionSourcesProps> = (props) => {
  const {
    sources: sourcesProp,
    updateSources,
    multiviewPipelineId,
    multiviews,
    isProductionActive,
    pipelines,
    updatePipelines,
    productionId,
    refreshProduction
  } = props;

  const [apiSources, sourcesLoading] = useSources();
  const [selectedSources, setSelectedSources] = useState<SourceReference[]>(
    sourcesProp || []
  );

  useEffectNotOnMount(() => {
    updateSources(selectedSources);
  }, [selectedSources]);

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
  const [getIngestSourceId] = useIngestSourceId();
  const [updateMultiviewViews] = useMultiviews();
  const selectedProductionItems = useMemo(() => {
    return selectedSources.map((prod: any) => prod._id) || [];
  }, [selectedSources]);
  const [inventoryVisible, setInventoryVisible] = useState(false);

  //SOURCES

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

  // Rendering engine
  const [deleteHtmlSource, deleteHtmlLoading] = useDeleteHtmlSource();
  const [deleteMediaSource, deleteMediaLoading] = useDeleteMediaSource();
  const [createHtmlSource, createHtmlLoading] = useCreateHtmlSource();
  const [createMediaSource, createMediaLoading] = useCreateMediaSource();

  const replaceProductionSourceStreamIds =
    useReplaceProductionSourceStreamIds();

  const updateMultiview = (
    source: SourceReference,
    productionSources: SourceReference[]
  ) => {
    multiviews?.map((singleMultiview) => {
      if (multiviewPipelineId && multiviews && singleMultiview.multiview_id) {
        updateMultiviewViews(
          multiviewPipelineId,
          productionSources,
          source,
          singleMultiview
        );
      }
    });
  };

  const updateSource = (source: SourceReference) => {
    const updatedSources = updateSetupItem(source, selectedSources);
    setSelectedSources(updatedSources);
    updateMultiview(source, updatedSources);
  };

  const addSource = (source: SourceReference) => {
    const newSources = [...selectedSources, source];
    setSelectedSources(newSources);
    setAddSourceModal(false);
    setSelectedSource(undefined);
  };

  const removeSource = (source: SourceReference, ingestSourceId?: number) => {
    const tempItems = selectedSources.filter(
      (tempItem) => tempItem._id !== source._id
    );

    let updatedPipelines = pipelines;

    if (ingestSourceId !== undefined) {
      updatedPipelines = pipelines.map((pipeline) => ({
        ...pipeline,
        sources: pipeline.sources
          ? pipeline.sources.filter(
              (pipelineSource) => pipelineSource.source_id !== ingestSourceId
            )
          : []
      }));
    }

    setSelectedSources(tempItems);
    updatePipelines(updatedPipelines);
  };

  const updatePipelinesWithSource = async (source: SourceWithId) => {
    const updatedPipelines = await Promise.all(
      pipelines.map(async (pipeline) => {
        const newSource = {
          source_id: await getIngestSourceId(
            source.ingest_name,
            source.ingest_source_name
          ),
          settings: {
            alignment_ms: pipeline.alignment_ms,
            max_network_latency_ms: pipeline.max_network_latency_ms
          }
        };

        const exists = pipeline.sources?.some(
          (s) => s.source_id === newSource.source_id
        );

        const updatedSources = exists
          ? pipeline.sources
          : [...(pipeline.sources || []), newSource];

        return {
          ...pipeline,
          sources: updatedSources
        };
      })
    );
    updatePipelines(updatedPipelines);
  };

  const addSourceAction = (source: SourceWithId) => {
    if (isProductionActive) {
      setSelectedSource(source);
      setAddSourceModal(true);
    } else {
      const input: SourceReference = {
        _id: source._id.toString(),
        type: 'ingest_source',
        label: source.name || source.ingest_source_name,
        input_slot: firstEmptySlot(selectedSources)
      };
      addSource(input);
      updatePipelinesWithSource(source);
    }
  };

  const addHtmlSource = (height: number, width: number, url: string) => {
    const sourceToAdd: SourceReference = {
      type: 'html',
      label: `HTML ${firstEmptySlot(selectedSources)}`,
      input_slot: firstEmptySlot(selectedSources),
      html_data: {
        height: height,
        url: url,
        width: width
      }
    };
    // MIGHT NEED TO REFRESH PRODUCTION @SANDRA
    addSource(sourceToAdd);

    if (isProductionActive && sourceToAdd.html_data) {
      createHtmlSource(
        pipelines,
        sourceToAdd.input_slot,
        sourceToAdd.html_data,
        sourceToAdd
      );
    }
  };

  const addMediaSource = (filename: string) => {
    const sourceToAdd: SourceReference = {
      type: 'mediaplayer',
      label: `Media Player ${firstEmptySlot(selectedSources)}`,
      input_slot: firstEmptySlot(selectedSources),
      media_data: {
        filename: filename
      }
    };
    // MIGHT NEED TO REFRESH
    addSource(sourceToAdd);
    if (isProductionActive && sourceToAdd.media_data) {
      createMediaSource(
        pipelines,
        sourceToAdd.input_slot,
        sourceToAdd.media_data,
        sourceToAdd
      );
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
      isProductionActive &&
      selectedSource &&
      multiviews.some((singleMultiview: any) => singleMultiview?.layout?.views)
    ) {
      for (let i = 0; i < pipelines.length; i++) {
        const pipeline = pipelines[i];

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

        updatePipelines(
          pipelines.map((p: any, index: number) => {
            if (index === i) {
              p.sources.push(newSource);
            }
            return p;
          })
        );
      }

      const result = await createStream(
        selectedSource,
        pipelines,
        firstEmptySlot(selectedSources)
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
            input_slot: firstEmptySlot(selectedSources)
          };
          addSource(sourceToAdd);
          setAddSourceStatus(undefined);
        } else {
          setAddSourceStatus({ success: false, steps: result.value.steps });
        }
      }
    }
  };

  const handleRemoveSource = async (ingestSource?: SourceWithId) => {
    if (isProductionActive && selectedSourceRef) {
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
          if (!pipelines[0].pipeline_id) return;

          const result = await deleteStream(
            selectedSourceRef.stream_uuids,
            pipelines,
            multiviews,
            selectedSources,
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
                removeSource(selectedSourceRef);
                return;
              }
            }
            return;
          }

          removeSource(selectedSourceRef);
          setRemoveSourceModal(false);
          setSelectedSourceRef(undefined);
          return;
        }

        const result = await deleteStream(
          selectedSourceRef.stream_uuids,
          pipelines,
          multiviews,
          selectedSources,
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
              removeSource(selectedSourceRef);
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
        for (let i = 0; i < pipelines.length; i++) {
          const pipelineId = pipelines[i].pipeline_id;
          if (pipelineId) {
            if (selectedSourceRef.type === 'html') {
              await deleteHtmlSource(
                pipelineId,
                selectedSourceRef.input_slot,
                multiviews,
                selectedSources
              );
            } else if (selectedSourceRef.type === 'mediaplayer') {
              await deleteMediaSource(
                pipelineId,
                selectedSourceRef.input_slot,
                multiviews,
                selectedSources
              );
            }
          }
        }
      }

      const ingestSourceId =
        ingestSource !== undefined
          ? await getIngestSourceId(
              ingestSource.ingest_name,
              ingestSource.ingest_source_name
            )
          : undefined;

      removeSource(selectedSourceRef, ingestSourceId);
      setRemoveSourceModal(false);
      setSelectedSourceRef(undefined);
      setSelectedSource(undefined);
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
    }[],
    shouldRestart?: boolean,
    streamUuids?: string[]
  ) => {
    if (productionId && source?.ingest_name && source?.ingest_source_name) {
      data.forEach(({ pipeline_uuid, stream_uuid, alignment, latency }) => {
        putProductionPipelineSourceAlignmentAndLatency(
          productionId,
          pipeline_uuid,
          source.ingest_name,
          source.ingest_source_name,
          alignment,
          latency
        ).then(() => refreshProduction());

        if (isProductionActive) {
          updateStream(stream_uuid, alignment);
        }

        updatePipelines(
          pipelines.map((pipeline: any) => {
            if (pipeline.pipeline_id === pipeline_uuid) {
              pipeline.sources?.map((source: any) => {
                if (source.source_id === sourceId) {
                  source.settings.alignment_ms = alignment;
                  source.settings.max_network_latency_ms = latency;
                }
              });
            }
            return pipeline;
          })
        );
      });
    }
    if (shouldRestart && streamUuids) {
      const sourceToDeleteFrom = selectedSources.find((source) =>
        source.stream_uuids?.includes(streamUuids[0])
      );
      deleteStream(
        streamUuids,
        pipelines,
        multiviews,
        selectedSources,
        source.input_slot
      )
        .then(() => {
          delete sourceToDeleteFrom?.stream_uuids;
        })
        .then(() =>
          setTimeout(async () => {
            const result = await createStream(
              source,
              pipelines,
              source.input_slot
            );
            if (result.ok) {
              if (result.value.success) {
                const newStreamUuids = result.value.streams.map(
                  (r) => r.stream_uuid
                );
                if (sourceToDeleteFrom?._id) {
                  replaceProductionSourceStreamIds(
                    productionId,
                    sourceToDeleteFrom?._id,
                    newStreamUuids
                  ).then(() => refreshProduction());
                }
              }
            }
          }, 1500)
        );
    }
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
      <div className="flex flex-col h-full min-h-[200px] justify-center items-center">
        {sourcesLoading && <LoadingCover />}
        <>
          <div
            className={`flex flex-col h-fit w-full ${
              sourcesLoading ? 'invisible h-0' : ''
            }`}
          >
            <div
              id="prevCameras"
              className="grid p-3 my-2 bg-container grow rounded grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 h-fit"
            >
              {selectedSources && apiSources.size > 0 && (
                <DndProvider backend={HTML5Backend}>
                  <SourceCards
                    pipelines={pipelines}
                    onConfirm={handleSetPipelineSourceSettings}
                    locked={locked}
                    productionId={productionId}
                    isProductionActive={isProductionActive}
                    sources={selectedSources}
                    setSources={setSelectedSources}
                    onSourceUpdate={(source: SourceReference) => {
                      updateSource(source);
                    }}
                    onSourceRemoval={async (
                      source: SourceReference,
                      ingestSource?: ISource
                    ) => {
                      if (isProductionActive) {
                        setSelectedSource(ingestSource);
                        setSelectedSourceRef(source);
                        setRemoveSourceModal(true);
                      } else {
                        const ingestSourceId = ingestSource
                          ? await getIngestSourceId(
                              ingestSource.ingest_name,
                              ingestSource.ingest_source_name
                            )
                          : undefined;
                        removeSource(source, ingestSourceId);
                        setRemoveSourceModal(false);
                        setSelectedSourceRef(undefined);
                      }
                    }}
                    loading={loading}
                  />
                  {removeSourceModal && selectedSourceRef && (
                    <RemoveSourceModal
                      name={selectedSourceRef.label}
                      open={removeSourceModal}
                      onAbort={handleAbortRemoveSource}
                      onConfirm={() => handleRemoveSource(selectedSource)}
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
                  disabled={locked}
                />
                <div className="flex flex-row">
                  <Select
                    classNames="w-full"
                    disabled={locked}
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
                      handleOpenModal(
                        selectedValue === 'HTML' ? 'html' : 'media'
                      )
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
              sources={apiSources}
              action={addSourceAction}
              actionText={t('workflow.add_source')}
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
        </>
      </div>
    </Section>
  );
};

export default ProductionSources;
