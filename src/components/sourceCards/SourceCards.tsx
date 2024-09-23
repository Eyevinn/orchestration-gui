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
  updateProduction,
  onSourceUpdate,
  onSourceRemoval,
  isLocked
}: {
  productionSetup: Production;
  updateProduction: (updated: Production) => void;
  onSourceUpdate: (source: SourceReference) => void;
  onSourceRemoval: (source: SourceReference) => void;
  isLocked: boolean;
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

  for (let i = 0; i < items[items.length - 1].input_slot; i++) {
    tempItems.every((source) => {
      const id = source._id ? source._id : '';
      const isSource = isISource(source);
      if (source.input_slot === i + 1) {
        tempItems = tempItems.filter((i) => i._id !== source._id);
        if (!productionSetup.isActive) {
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
                source={source}
                label={source.label}
                src={source.src}
                onSourceUpdate={onSourceUpdate}
                onSourceRemoval={onSourceRemoval}
                onSelectingText={(isSelecting: boolean) =>
                  setSelectingText(isSelecting)
                }
                isLocked={isLocked}
              />
            </DragItem>
          );
        } else {
          gridItems.push(
            <SourceCard
              key={`${source.ingest_source_name}-${source.input_slot}-key`}
              source={source}
              label={source.label}
              src={source.src}
              onSourceUpdate={onSourceUpdate}
              onSourceRemoval={onSourceRemoval}
              onSelectingText={(isSelecting: boolean) =>
                setSelectingText(isSelecting)
              }
              isLocked={isLocked}
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
