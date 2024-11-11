import { Modal } from './Modal';
import { useTranslate } from '../../i18n/useTranslate';
import { Button } from '../button/Button';
import { Loader } from '../loader/Loader';
import { ISource } from '../../hooks/useDragableItems';
import { useState, useEffect, useRef } from 'react';
import { useIngestStreams, useIngestSourceId } from '../../hooks/ingests';
import { useGetProductionSourceAlignmentAndLatency } from '../../hooks/productions';
import {
  ResourcesCompactPipelineResponse,
  ResourcesIngestStreamResponse
} from '../../../types/ateliere-live';
import Input from '../input/Input';
import { RestartStreamModal } from './RestartStreamModal';
import { GetPipelines } from '../../hooks/pipelines';
import { PipelineSettings } from '../../interfaces/pipeline';

type ConfigureAlignmentModalProps = {
  productionId: string;
  source: ISource;
  open: boolean;
  loading: boolean;
  pipelinesProp: PipelineSettings[];
  pipelinesAreSelected?: boolean;
  isProductionActive: boolean;
  onAbort: () => void;
  onConfirm: (
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
  ) => void;
};

interface Settings {
  [key: string]: number;
}

interface SettingsData {
  pipeline_uuid: string;
  stream_uuid: string;
  alignment: number;
  latency: number;
}

export function ConfigureAlignmentLatencyModal({
  productionId,
  source,
  open,
  loading,
  pipelinesProp,
  pipelinesAreSelected,
  isProductionActive,
  onAbort,
  onConfirm
}: ConfigureAlignmentModalProps) {
  const [sourceStreams, setSourceStreams] = useState<
    ResourcesIngestStreamResponse[]
  >([]);
  const [availablePipelines, setAvailablePipelines] = useState<
    ResourcesCompactPipelineResponse[] | undefined
  >([]);
  const [alignments, setAlignments] = useState<Settings>({});
  const [latencies, setLatencies] = useState<Settings>({});
  const previousLatenciesRef = useRef<Settings>({});
  const [sourceId, setSourceId] = useState<number>(0);
  const [showRestartStreamModal, setShowRestartStreamModal] =
    useState<boolean>(false);
  const [inputErrors, setInputErrors] = useState<Record<string, boolean>>({});
  const [getIngestSourceId] = useIngestSourceId();

  const t = useTranslate();
  const getIngestStreams = useIngestStreams();
  const getProductionSourceAlignmentAndLatency =
    useGetProductionSourceAlignmentAndLatency();
  const [pipelines] = GetPipelines();

  useEffect(() => {
    setAvailablePipelines(pipelines);
  }, [pipelines]);

  useEffect(() => {
    if (pipelinesAreSelected) {
      const productionPipelines = pipelinesProp;
      for (const pipeline of productionPipelines) {
        if (latencies[pipeline.pipeline_id || ''] === undefined) {
          latencies[pipeline.pipeline_id || ''] =
            pipeline.max_network_latency_ms;
        }
        if (alignments[pipeline.pipeline_id || ''] === undefined) {
          alignments[pipeline.pipeline_id || ''] = pipeline.alignment_ms;
        }
      }
    }
  }, [pipelinesAreSelected, latencies, alignments]);

  useEffect(() => {
    const fetchSourceId = async () => {
      const sourceId = await getIngestSourceId(
        source.ingest_name,
        source.ingest_source_name
      );
      setSourceId(sourceId);
    };

    fetchSourceId();
  }, [source]);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const streams = await getIngestStreams(
          source.ingest_name,
          source.ingest_source_name
        );
        setSourceStreams(streams);
      } catch (error) {
        console.error('Error fetching streams:', error);
      }
    };

    fetchStreams();
  }, [source]);

  useEffect(() => {
    const fetchAlignmentsAndLatencies = async () => {
      const newAlignments: Settings = {};
      const newLatencies: Settings = {};
      if (sourceStreams && sourceStreams.length > 0) {
        for (const stream of sourceStreams) {
          const result = await getSourceAlignmentAndLatency(
            stream.pipeline_uuid
          );
          if (result) {
            const { alignment, latency } = result;
            newAlignments[stream.pipeline_uuid] = alignment;
            newLatencies[stream.pipeline_uuid] = latency;
          } else {
            newAlignments[stream.pipeline_uuid] = 0;
            newLatencies[stream.pipeline_uuid] = 0;
          }
        }
      } else if (availablePipelines) {
        for (const pipeline of availablePipelines) {
          const result = await getSourceAlignmentAndLatency(pipeline.uuid);
          if (result) {
            const { alignment, latency } = result;
            newAlignments[pipeline.uuid] = alignment;
            newLatencies[pipeline.uuid] = latency;
          } else {
            newAlignments[pipeline.uuid] = 0;
            newLatencies[pipeline.uuid] = 0;
          }
        }
      }
      setAlignments(newAlignments);
      setLatencies(newLatencies);
    };

    fetchAlignmentsAndLatencies();
  }, [sourceStreams, availablePipelines]);

  useEffect(() => {
    if (open) {
      previousLatenciesRef.current = { ...latencies };
    }
  }, [open]);

  const handleSaveAlignmentAndLatency = (shouldRestart?: boolean) => {
    let alignmentData: SettingsData[] = [];

    const latenciesChanged = Object.keys(latencies).some(
      (key) => previousLatenciesRef.current[key] !== latencies[key]
    );

    if (latenciesChanged && isProductionActive) {
      setShowRestartStreamModal(true);
    }

    if (sourceStreams && sourceStreams.length > 0 && isProductionActive) {
      alignmentData = sourceStreams.map((stream) => ({
        pipeline_uuid: stream.pipeline_uuid,
        stream_uuid: stream.stream_uuid,
        alignment: alignments[stream.pipeline_uuid],
        latency: latencies[stream.pipeline_uuid]
      }));
    } else if (!isProductionActive) {
      alignmentData = pipelinesProp.map((pipeline) => ({
        pipeline_uuid: pipeline.pipeline_id || '',
        stream_uuid: '',
        alignment: alignments[pipeline.pipeline_id || ''],
        latency: latencies[pipeline.pipeline_id || '']
      }));
    }

    const errors: Record<string, boolean> = {};
    let hasError = false;

    if (sourceStreams.length > 0 && isProductionActive) {
      sourceStreams.forEach((stream) => {
        if (
          alignments[stream.pipeline_uuid] < latencies[stream.pipeline_uuid]
        ) {
          errors[stream.pipeline_uuid] = true;
          hasError = true;
        }

        if (hasError) {
          setInputErrors(errors);
          return;
        }

        setInputErrors({});
      });

      if (shouldRestart) {
        onConfirm(
          source,
          sourceId,
          alignmentData,
          true,
          sourceStreams.map((stream) => stream.stream_uuid)
        );
        handleCloseModal();
      } else {
        onConfirm(source, sourceId, alignmentData);
        if (!latenciesChanged) {
          handleCloseModal();
        }
      }
    } else if (!isProductionActive) {
      pipelinesProp.forEach((pipeline) => {
        if (
          alignments[pipeline.pipeline_id || ''] <
          latencies[pipeline.pipeline_id || '']
        ) {
          errors[pipeline.pipeline_id || ''] = true;
          hasError = true;
        }

        if (hasError) {
          setInputErrors(errors);
          return;
        }
        setInputErrors({});
      });

      onConfirm(source, sourceId, alignmentData);
      handleCloseModal();
    }
  };

  const handleInputChange = (
    pipelineId: string,
    value: number,
    type: 'alignment' | 'latency'
  ) => {
    if (type === 'alignment') {
      setAlignments((prevAlignments) => ({
        ...prevAlignments,
        [pipelineId]: value
      }));
    } else if (type === 'latency') {
      setLatencies((prevLatencies) => ({
        ...prevLatencies,
        [pipelineId]: value
      }));
    }

    if (alignments[pipelineId] >= latencies[pipelineId]) {
      setInputErrors((prevErrors) => ({
        ...prevErrors,
        [pipelineId]: false
      }));
    }
  };

  const handleCloseModal = () => {
    setInputErrors({});
    onAbort();
  };

  const getPipelineName = (pipelineId: string) => {
    return availablePipelines?.find((p) => p.uuid === pipelineId)?.name;
  };

  const getSourceAlignmentAndLatency = async (pipelineId: string) => {
    const result = await getProductionSourceAlignmentAndLatency(
      productionId,
      pipelineId,
      source.ingest_name,
      source.ingest_source_name
    );
    return result;
  };

  const handleCloseRestartStreamModal = () => {
    setShowRestartStreamModal(false);
    onAbort();
  };

  return (
    <Modal className="w-[500px]" open={open}>
      <div className="flex flex-col space-y-6 px-10 py-10">
        <h1 className="text-2xl">
          {t('configure_alignment_latency.configure_alignment_latency')}
        </h1>
        <p>
          {t('configure_alignment_latency.source_name')}: {source.name}
        </p>
        <div className="mt-12 mb-2 flex flex-col w-full space-y-6">
          {isProductionActive &&
            sourceStreams.map((stream, index) => (
              <div key={index}>
                <p className="text-md font-bold">
                  {getPipelineName(stream.pipeline_uuid)}
                </p>
                <p className="mt-1">Alignment (ms): </p>
                <Input
                  className="mt-2 w-full"
                  type="number"
                  value={alignments[stream.pipeline_uuid] || ''}
                  onChange={(e) =>
                    handleInputChange(
                      stream.pipeline_uuid,
                      e.target.valueAsNumber,
                      'alignment'
                    )
                  }
                />
                <p className="mt-2">Latency (ms): </p>
                <Input
                  className="mt-2 w-full"
                  type="number"
                  value={latencies[stream.pipeline_uuid] || ''}
                  onChange={(e) =>
                    handleInputChange(
                      stream.pipeline_uuid,
                      e.target.valueAsNumber,
                      'latency'
                    )
                  }
                />
                {inputErrors[stream.pipeline_uuid] && (
                  <p className="text-button-delete">
                    {t('configure_alignment_latency.error')}
                  </p>
                )}
              </div>
            ))}
          {!isProductionActive &&
            pipelinesProp.map((pipeline, index) => (
              <div key={index}>
                <p className="text-md font-bold">
                  {getPipelineName(pipeline.pipeline_id || '')}
                </p>
                <p className="mt-1">Alignment (ms): </p>
                <Input
                  className="mt-2 w-full"
                  type="number"
                  value={alignments[pipeline.pipeline_id || ''] || ''}
                  onChange={(e) =>
                    handleInputChange(
                      pipeline.pipeline_id || '',
                      e.target.valueAsNumber,
                      'alignment'
                    )
                  }
                />
                <p className="mt-2">Latency (ms): </p>
                <Input
                  className="mt-2 w-full"
                  type="number"
                  value={latencies[pipeline.pipeline_id || ''] || ''}
                  onChange={(e) =>
                    handleInputChange(
                      pipeline.pipeline_id || '',
                      e.target.valueAsNumber,
                      'latency'
                    )
                  }
                />
                {inputErrors[pipeline.pipeline_id || ''] && (
                  <p className="text-button-delete">
                    {t('configure_alignment_latency.error')}
                  </p>
                )}
              </div>
            ))}
        </div>
        <div className="flex flex-row justify-between mt-8">
          <Button
            className="bg-button-abort hover:bg-button-abort-hover"
            onClick={handleCloseModal}
          >
            {t('configure_alignment_latency.cancel')}
          </Button>
          <Button
            className={`bg-button-bg ${
              loading
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-button-primary-hover'
            }`}
            onClick={() => handleSaveAlignmentAndLatency()}
            disabled={loading}
          >
            {loading ? (
              <Loader className="w-10 h-5" />
            ) : (
              t('configure_alignment_latency.save')
            )}
          </Button>
        </div>
      </div>
      <RestartStreamModal
        open={showRestartStreamModal}
        loading={false}
        onAbort={handleCloseRestartStreamModal}
        onConfirm={() => handleSaveAlignmentAndLatency(true)}
      />
    </Modal>
  );
}
