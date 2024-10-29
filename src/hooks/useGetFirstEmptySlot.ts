import { useState } from 'react';
import { Production } from '../interfaces/production';
import { CallbackHook } from './types';
import { SourceReference } from '../interfaces/Source';

export function useGetFirstEmptySlot(): CallbackHook<
  (sources: SourceReference[]) => number
> {
  const [loading, setLoading] = useState(true);

  const findFirstEmptySlot = (sources: SourceReference[]) => {
    let firstEmptySlotTemp = sources.length + 1;
    if (sources.length === 0) {
      return firstEmptySlotTemp;
    }
    for (let i = 0; i < sources[sources.length - 1].input_slot; i++) {
      if (!sources.some((source) => source.input_slot === i + 1)) {
        firstEmptySlotTemp = i + 1;
        break;
      }
    }
    return firstEmptySlotTemp;
  };
  return [findFirstEmptySlot, loading];
}
