'use client';
import React, { ChangeEvent, KeyboardEvent, useContext, useState } from 'react';
import { IconTrash, IconSettings } from '@tabler/icons-react';
import { SourceReference } from '../../interfaces/Source';
import { useTranslate } from '../../i18n/useTranslate';
import { ISource } from '../../hooks/useDragableItems';
import ImageComponent from '../image/ImageComponent';
import { getSourceThumbnail } from '../../utils/source';
import { GlobalContext } from '../../contexts/GlobalContext';
import { ConfigureAlignmentLatencyModal } from '../modal/ConfigureAlignmentLatencyModal';
import { PipelineSettings } from '../../interfaces/pipeline';

type SourceCardProps = {
  source?: ISource;
  loading: boolean;
  onSourceUpdate: (source: SourceReference) => void;
  onSourceRemoval: (source: SourceReference, ingestSource?: ISource) => void;
  onSelectingText: (bool: boolean) => void;
  onConfirm: (
    source: ISource,
    sourceId: number,
    data: {
      pipeline_uuid: string;
      stream_uuid: string;
      alignment: number;
      latency: number;
    }[],
    shouldRestart?: boolean
  ) => void;
  forwardedRef?: React.LegacyRef<HTMLDivElement>;
  style?: object;
  sourceRef?: SourceReference;
  productionId: string;
  isProductionActive: boolean;
  pipelines: PipelineSettings[];
};

export default function SourceCard({
  source,
  loading,
  onSourceUpdate,
  onSourceRemoval,
  onSelectingText,
  onConfirm,
  forwardedRef,
  style,
  sourceRef,
  productionId,
  isProductionActive,
  pipelines
}: SourceCardProps) {
  const [sourceLabel, setSourceLabel] = useState(sourceRef?.label || '');
  const [isAlignmentModalOpen, setIsAlignmentModalOpen] = useState(false);

  const t = useTranslate();

  const { locked } = useContext(GlobalContext);

  const pipelinesAreSelected =
    pipelines.some(
      (pipeline) =>
        pipeline.pipeline_id === undefined || pipeline.pipeline_id === ''
    ) === false;

  const updateText = (event: ChangeEvent<HTMLInputElement>) => {
    setSourceLabel(event.currentTarget.value);
  };

  const saveText = () => {
    onSelectingText(false);
    if (sourceLabel?.length === 0) {
      if (source) {
        setSourceLabel(source.name);
      } else if (sourceRef) {
        setSourceLabel(sourceRef.label);
      }
    }
    if (source) {
      onSourceUpdate({
        _id: source._id.toString(),
        type: 'ingest_source',
        label: sourceLabel || source.name,
        input_slot: source.input_slot
      });
    } else if (sourceRef) {
      onSourceUpdate({
        _id: sourceRef._id,
        type: sourceRef.type,
        label: sourceLabel || sourceRef.label,
        input_slot: sourceRef.input_slot
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  const closeAlignmentLatencyModal = () => setIsAlignmentModalOpen(false);

  return (
    <div
      ref={forwardedRef}
      style={style}
      className="relative bg-zinc-700 aspect-video m-2 overflow-hidden cursor-pointer"
    >
      <div className="relative">
        <input
          className={`absolute z-20 bg-zinc-900 text-center hover:border focus:hover:border-none w-full text-p bg-opacity-90 focus:bg-opacity-100`}
          value={sourceLabel}
          onChange={updateText}
          onKeyDown={handleKeyDown}
          onSelect={() => {
            onSelectingText(true);
          }}
          onBlur={saveText}
          disabled={locked}
        />
      </div>
      {source && <ImageComponent src={getSourceThumbnail(source)} />}
      {!source && sourceRef && <ImageComponent type={sourceRef.type} />}
      {(source || sourceRef) && (
        <h2
          className={`${
            source && 'absolute bottom-4'
          } p-1 text-p text-xs bg-zinc-900 w-full bg-opacity-90 z-10 ${
            sourceRef && !source && 'absolute bottom-0'
          }`}
        >
          {t('source.input_slot', {
            input_slot:
              sourceRef?.input_slot?.toString() ||
              source?.input_slot?.toString() ||
              ''
          })}
        </h2>
      )}
      {source && (
        <h2 className="z-10 px-1 absolute bottom-0 text-p text-xs bg-zinc-900 w-full bg-opacity-90">
          {t('source.ingest', {
            ingest: source.ingest_name
          })}
        </h2>
      )}
      {pipelinesAreSelected && source && (
        <button
          disabled={locked}
          className={`${
            locked
              ? 'bg-zinc-600/50'
              : 'hover:border hover:bg-zinc-500 bg-zinc-600'
          } absolute top-0 left-0 text-p   min-w-fit p-1 rounded-br-lg z-50`}
          onClick={() => setIsAlignmentModalOpen(true)}
        >
          <IconSettings className="text-p w-4 h-4" />
        </button>
      )}
      {sourceRef && (
        <button
          disabled={locked}
          className={`${
            locked
              ? 'bg-red-700/50'
              : 'bg-red-700 hover:bg-red-600 hover:border-l hover:border-t'
          } absolute bottom-0 right-0 text-p min-w-fit p-1 rounded-tl-lg z-20`}
          onClick={() => onSourceRemoval(sourceRef, source)}
        >
          <IconTrash className="text-p w-4 h-4" />
        </button>
      )}
      {source && (
        <ConfigureAlignmentLatencyModal
          pipelinesAreSelected={pipelinesAreSelected}
          productionId={productionId}
          source={source}
          open={isAlignmentModalOpen}
          onAbort={closeAlignmentLatencyModal}
          onConfirm={onConfirm}
          loading={loading}
          isProductionActive={isProductionActive}
          pipelinesProp={pipelines}
        />
      )}
    </div>
  );
}
