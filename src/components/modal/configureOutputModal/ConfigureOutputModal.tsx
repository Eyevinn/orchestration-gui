import { MultiviewPreset, Preset } from '../../../interfaces/preset';
import { Modal } from '../Modal';
import Decision from './Decision';
import PipelineOutputConfig, { PipelineTypes } from './PipelineOutputConfig';
import { useState } from 'react';
import { PipelineOutput, PipelineSettings } from '../../../interfaces/pipeline';
import { usePipelines } from '../../../hooks/pipelines';
import cloneDeep from 'lodash.clonedeep';
import toast from 'react-hot-toast';
import { MultiviewSettings } from '../../../interfaces/multiview';
import MultiviewSettingsConfig from './MultiviewSettings';
import MultiviewLayoutSettings from './MultiviewLayoutSettings/MultiviewLayoutSettings';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Production } from '../../../interfaces/production';
import { usePutMultiviewPreset } from '../../../hooks/multiviewPreset';

type ConfigureOutputModalProps = {
  open: boolean;
  preset: Preset;
  onClose: () => void;
  updatePreset: (preset: Preset) => void;
  production: Production | undefined;
};

export interface OutputStream {
  name: string;
  id: string;
  pipelineIndex: number;
  ip: string;
  srtMode: string;
  srtPassphrase: string;
  port: number;
  videoFormat: string;
  videoBit: number;
  videoKiloBit: number;
}

const DEFAULT_PORT_MUMBER = 9900;

export function ConfigureOutputModal({
  open,
  preset,
  onClose,
  updatePreset,
  production
}: ConfigureOutputModalProps) {
  const [pipelines, setPipelines] = useState<PipelineSettings[]>(
    preset.pipelines || []
  );
  const [currentError, setCurrentError] = useState<string>('');
  const [currentPortNumber, setCurrentPortNumber] =
    useState<number>(DEFAULT_PORT_MUMBER);

  const [pipes] = usePipelines();
  const [multiviews, setMultiviews] = useState<MultiviewSettings[]>([]);
  const [layoutModalOpen, setLayoutModalOpen] = useState<string | null>(null);
  const [newMultiviewPreset, setNewMultiviewPreset] =
    useState<MultiviewPreset | null>(null);
  const addNewPreset = usePutMultiviewPreset();
  

  const clearInputs = () => {
    setLayoutModalOpen(null);
    onClose();
  };

  const onSave = () => {
    const locations = pipelines
      .map((p) =>
        p.outputs?.map((o) =>
          o.streams.map((s) => `${s.local_ip}:${s.local_port}`)
        )
      )
      .flat(2);
    function findDuplicates(array: any[]) {
      return array.filter(
        (currentValue, currentIndex) =>
          array.indexOf(currentValue) !== currentIndex
      );
    }
    const duplicates = findDuplicates(locations);
    if (duplicates.length) {
      setCurrentError('Same <IP>:<Port> used for multiple streams');
      return;
    }
    updatePreset({ ...preset, pipelines: pipelines });
    onClose();
  };

  const onUpdateLayoutPreset = () => {
    if (!newMultiviewPreset) {
      toast.error(t('preset.no_updated_layout'));
      return;
    }
    addNewPreset(newMultiviewPreset);
    setLayoutModalOpen(null);
  };

  const closeLayoutModal = () => {
    setLayoutModalOpen(null);
  };

  const streamsToProgramOutputs = (
    pipelineIndex: number,
    outputStreams?: OutputStream[]
  ) => {
    if (!outputStreams) return [];
    return outputStreams.map((stream) => ({
      ...preset.pipelines[pipelineIndex].program_output[0],
      port: stream.port,
      [stream.srtMode === 'listener' ? 'local_ip' : 'remote_ip']: stream.ip,
      srt_mode: stream.srtMode,
      video_bit_depth: stream.videoBit,
      video_format: stream.videoFormat,
      video_kilobit_rate: stream.videoKiloBit,
      srt_passphrase: stream.srtPassphrase
    })) satisfies ProgramOutput[];
  };

  const addStream = (stream: OutputStream) => {
    const streams = outputstreams.filter(
      (o) => o.pipelineIndex === stream.pipelineIndex
    );
    if (streams.length > 4) return;
    setOutputStreams([
      ...outputstreams,
      {
        ...stream,
        name: `${t('preset.stream_name')} ${streams.length + 1}`,
        port: streams[streams.length - 1].port + 1
      }
    ]);
  };

  const updateStream = (updatedStream: OutputStream) => {
    setOutputStreams(
      [
        ...outputstreams.filter((o) => o.id !== updatedStream.id),
        updatedStream
      ].sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  const updateStreams = (updatedStreams: OutputStream[]) => {
    const streams = outputstreams.filter(
      (o) => !updatedStreams.some((u) => u.id === o.id)
    );
    setOutputStreams(
      [...streams, ...updatedStreams].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
  };

  const setNames = (outputstreams: OutputStream[], index: number) => {
    const streamsForPipe = outputstreams.filter(
      (o) => o.pipelineIndex === index
    );
    const rest = outputstreams.filter((o) => o.pipelineIndex !== index);
    return [
      ...streamsForPipe.map((s, i) => ({ ...s, name: `Stream ${i + 1}` })),
      ...rest
    ];
  };

  const deleteStream = (id: string, index: number) => {
    setOutputStreams(
      setNames(
        outputstreams.filter((o) => o.id !== id),
        index
      )
    );
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

  const getPortNumber = () => {
    setCurrentPortNumber(currentPortNumber + 1);
    return currentPortNumber;
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
    <Modal
      open={open}
      outsideClick={() => {
        clearInputs();
      }}
    >
      <div className="overflow-auto max-h-[90vh]">
        <div className="flex gap-3 flex-col text-center">
          {pipelines.map((pipeline, i) => {
            return (
              <PipelineOutputConfig
                key={pipeline.pipeline_readable_name + i}
                title={pipeline.pipeline_name || ''}
                outputs={
                  pipes?.find((p) => p.name === pipeline.pipeline_name)
                    ?.outputs || []
                }
                pipelineOutputs={pipeline.outputs || []}
                updatePipelineOutputs={(outputs: PipelineOutput[]) =>
                  updatePipelineOutputFunc(pipeline, outputs)
                }
                pipeline={pipeline}
                getPortNumber={getPortNumber}
              />
            );
          })}
          {multiviews &&
            multiviews.length > 0 &&
            multiviews.map((singleItem, index) => {
              return (
                <div className="flex" key={index}>
                  <div className="min-h-full border-l border-separate opacity-10 my-12"></div>
                  <div className="flex flex-col">
                    <MultiviewSettingsConfig
                      productionId={production?._id}
                      openConfigModal={(input: string) =>
                        setLayoutModalOpen(input)
                      }
                      newMultiviewPreset={newMultiviewPreset}
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
        {!!layoutModalOpen && (
        <MultiviewLayoutSettings
          configMode={layoutModalOpen}
          production={production}
          setNewMultiviewPreset={(newLayout) =>
            setNewMultiviewPreset(newLayout)
          }
        />
      )}
        <div className="text-button-delete text-center">{currentError}</div>
        <Decision
        onClose={() => (layoutModalOpen ? closeLayoutModal() : clearInputs())}
        onSave={() => (layoutModalOpen ? onUpdateLayoutPreset() : onSave())}
      />
      </div>
    </Modal>
  );
}
