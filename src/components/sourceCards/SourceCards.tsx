'use client';

import React, { useState } from 'react';
import { SourceReference } from '../../interfaces/Source';
import DragItem from '../dragElement/DragItem';
import SourceCard from '../sourceCard/SourceCard';
import { ISource, useDragableItems } from '../../hooks/useDragableItems';
import { EmptySlotCard } from '../emptySlotCard/EmptySlotCard';
import { v4 as uuidv4 } from 'uuid';
import { PipelineSettings } from '../../interfaces/pipeline';

export default function SourceCards({
  locked,
  loading,
  onSourceUpdate,
  onSourceRemoval,
  onConfirm,
  sources,
  setSources,
  isProductionActive,
  productionId,
  pipelines
}: {
  sources: SourceReference[];
  setSources: (sources: SourceReference[]) => void;
  isProductionActive: boolean;
  productionId: string;
  locked: boolean;
  loading: boolean;
  onSourceUpdate: (source: SourceReference) => void;
  onSourceRemoval: (source: SourceReference, ingestSource?: ISource) => void;
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
  pipelines: PipelineSettings[];
}) {
  const [items, moveItem] = useDragableItems(sources);
  const [selectingText, setSelectingText] = useState(false);
  if (!items) return null;
  const isISource = (source: SourceReference | ISource): source is ISource => {
    return 'src' in source;
  };
  const gridItems: React.JSX.Element[] = [];
  let tempItems = items.map((source) => {
    if (!source._id) {
      return {
        ...source,
        _id: uuidv4()
      };
    }
    return source;
  });
  let firstEmptySlot = items.length + 1;
  if (!items || items.length === 0) return null;
  for (let i = 0; i < items[items.length - 1].input_slot; i++) {
    if (!items.some((source) => source.input_slot === i + 1)) {
      firstEmptySlot = i + 1;
      break;
    }
  }
  const productionSources = sources;

  for (let i = 0; i < items[items.length - 1].input_slot; i++) {
    tempItems.every((source) => {
      const id = source._id ? source._id : '';
      const isSource = isISource(source);
      if (source.input_slot === i + 1) {
        tempItems = tempItems.filter((i) => i._id !== source._id);
        if (!isProductionActive && !locked) {
          gridItems.push(
            <DragItem
              key={id === typeof String ? id : id.toString()}
              id={id}
              onMoveItem={moveItem}
              previousOrder={sources}
              currentOrder={items as SourceReference[]}
              selectingText={selectingText}
              setSources={setSources}
            >
              <SourceCard
                source={isSource ? source : undefined}
                sourceRef={
                  isSource
                    ? productionSources.find((s) => s._id === source._id)
                    : source
                }
                onSourceUpdate={onSourceUpdate}
                onSourceRemoval={onSourceRemoval}
                onSelectingText={(isSelecting) => setSelectingText(isSelecting)}
                productionId={productionId}
                isProductionActive={isProductionActive}
                onConfirm={onConfirm}
                loading={loading}
                pipelines={pipelines}
              />
            </DragItem>
          );
        } else {
          gridItems.push(
            <SourceCard
              key={id === typeof String ? id : id.toString()}
              source={isSource ? source : undefined}
              sourceRef={
                isSource
                  ? productionSources.find((s) => s._id === source._id)
                  : source
              }
              onSourceUpdate={onSourceUpdate}
              onSourceRemoval={onSourceRemoval}
              onSelectingText={(isSelecting) => setSelectingText(isSelecting)}
              onConfirm={onConfirm}
              productionId={productionId}
              isProductionActive={isProductionActive}
              loading={loading}
              pipelines={pipelines}
            />
          );
        }
        return false;
      } else {
        if (isProductionActive) {
          gridItems.push(
            <EmptySlotCard
              key={i}
              inputSlot={i + 1}
              isFirstEmptySlot={firstEmptySlot === i + 1}
            />
          );
        }
        return false;
      }
    });
  }
  return <>{gridItems}</>;
}
