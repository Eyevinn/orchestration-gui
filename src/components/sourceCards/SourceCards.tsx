'use client';

import React, { useState } from 'react';
import { SourceReference } from '../../interfaces/Source';
import { Production } from '../../interfaces/production';
import DragItem from '../dragElement/DragItem';
import SourceCard from '../sourceCard/SourceCard';
import { ISource, useDragableItems } from '../../hooks/useDragableItems';
import { EmptySlotCard } from '../emptySlotCard/EmptySlotCard';

export default function SourceCards({
  productionSetup,
  locked,
  loading,
  updateProduction,
  onSourceUpdate,
  onSourceRemoval,
  onConfirm
}: {
  productionSetup: Production;
  locked: boolean;
  loading: boolean;
  updateProduction: (updated: Production) => void;
  onSourceUpdate: (source: SourceReference) => void;
  onSourceRemoval: (source: SourceReference) => void;
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
}) {
  const [items, moveItem] = useDragableItems(productionSetup.sources);
  const [selectingText, setSelectingText] = useState(false);
  if (!items) return null;
  const isISource = (source: SourceReference | ISource): source is ISource => {
    return 'src' in source;
  };
  const gridItems: React.JSX.Element[] = [];
  let tempItems = [...items];
  let firstEmptySlot = items.length + 1;
  if (!items || items.length === 0) return null;
  for (let i = 0; i < items[items.length - 1].input_slot; i++) {
    if (!items.some((source) => source.input_slot === i + 1)) {
      firstEmptySlot = i + 1;
      break;
    }
  }
  const productionSources = productionSetup.sources;

  for (let i = 0; i < items[items.length - 1].input_slot; i++) {
    tempItems.every((source) => {
      const id = source._id ? source._id : '';
      const isSource = isISource(source);
      if (source.input_slot === i + 1) {
        tempItems = tempItems.filter((i) => i._id !== source._id);
        if (!productionSetup.isActive && !locked) {
          gridItems.push(
            <DragItem
              key={id === typeof String ? id : id.toString()}
              id={id}
              onMoveItem={moveItem}
              previousOrder={productionSetup.sources}
              currentOrder={items as SourceReference[]}
              productionSetup={productionSetup}
              updateProduction={updateProduction}
              selectingText={selectingText}
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
                productionSetup={productionSetup}
                onConfirm={onConfirm}
                loading={loading}
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
              productionSetup={productionSetup}
              loading={loading}
            />
          );
        }
        return false;
      } else {
        if (productionSetup.isActive) {
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
