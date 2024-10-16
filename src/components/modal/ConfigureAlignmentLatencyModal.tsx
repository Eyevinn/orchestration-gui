import { Modal } from './Modal';
import { useTranslate } from '../../i18n/useTranslate';
import { Button } from '../button/Button';
import { Loader } from '../loader/Loader';
import { ISource } from '../../hooks/useDragableItems';
import { useState, useEffect } from 'react';
import { useIngestStreams } from '../../hooks/ingests';
import { usePipelines } from '../../hooks/pipelines';
import { useGetProductionSourceAlignmentAndLatency } from '../../hooks/productions';
import {
  ResourcesCompactPipelineResponse,
  ResourcesIngestStreamResponse
} from '../../../types/ateliere-live';
import Input from '../input/Input';

type ConfigureAlignmentModalProps = {
  productionId: string;
  source: ISource;
  open: boolean;
  loading: boolean;
  onAbort: () => void;
  onConfirm: (
    source: ISource,
    sourceId: number,
    data: {
      pipeline_uuid: string;
      stream_uuid: string;
      alignment: number;
      latency: number;
    }[]
  ) => void;
};

interface Settings {
  [key: string]: number;
}

export function ConfigureAlignmentLatencyModal({
  productionId,
  source,
  open,
  loading,
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
  const [sourceId, setSourceId] = useState<number>(0);

  const [inputErrors, setInputErrors] = useState<Record<string, boolean>>({});

  const t = useTranslate();
  const getIngestStreams = useIngestStreams();
  const getProductionSourceAlignmentAndLatency =
    useGetProductionSourceAlignmentAndLatency();
  const [pipelines, pipelinesLoading, pipelinesError, fetchPipelines]: [
    ResourcesCompactPipelineResponse[] | undefined,
    boolean,
    unknown,
    () => void
  ] = usePipelines();

  useEffect(() => {
    setAvailablePipelines(pipelines);
  }, [pipelines]);

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
      for (const stream of sourceStreams) {
        const result = await getSourceAlignmentAndLatency(stream.pipeline_uuid);
        if (result) {
          const { alignment, latency } = result;
          newAlignments[stream.pipeline_uuid] = alignment;
          newLatencies[stream.pipeline_uuid] = latency;
        } else {
          newAlignments[stream.pipeline_uuid] = 0;
          newLatencies[stream.pipeline_uuid] = 0;
        }
        setSourceId(stream.source_id);
      }
      setAlignments(newAlignments);
      setLatencies(newLatencies);
    };

    fetchAlignmentsAndLatencies();
  }, [sourceStreams]);

  const handleSaveAlignmentAndLatency = () => {
    const alignmentData = sourceStreams.map((stream) => ({
      pipeline_uuid: stream.pipeline_uuid,
      stream_uuid: stream.stream_uuid,
      alignment: alignments[stream.pipeline_uuid],
      latency: latencies[stream.pipeline_uuid]
    }));

    const errors: Record<string, boolean> = {};
    let hasError = false;

    sourceStreams.forEach((stream) => {
      if (alignments[stream.pipeline_uuid] < latencies[stream.pipeline_uuid]) {
        errors[stream.pipeline_uuid] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setInputErrors(errors);
      return;
    }

    setInputErrors({});
    onConfirm(source, sourceId, alignmentData);
    onAbort();
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

    // Clear error when the alignment is valid again
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

  return (
    <Modal className="w-[500px]" open={open} outsideClick={onAbort}>
      <div className="flex flex-col space-y-6 px-10 py-10">
        <h1 className="text-2xl">
          {t('configure_alignment_latency.configure_alignment_latency')}
        </h1>
        <p>
          {t('configure_alignment_latency.source_name')}: {source.name}
        </p>

        <div className="mt-12 mb-2 flex flex-col w-full space-y-6">
          {sourceStreams.map((stream, index) => (
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
            onClick={handleSaveAlignmentAndLatency}
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
    </Modal>
  );
}
