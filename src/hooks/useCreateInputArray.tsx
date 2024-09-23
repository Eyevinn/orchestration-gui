import { useEffect, useState } from 'react';
import { usePipelines } from './pipelines';
import { Production } from '../interfaces/production';

export type TList = {
  id: string;
  input_slot: number;
  label: string;
};

export function useCreateInputArray(production: Production | undefined) {
  const [inputList, setInputList] = useState<TList[] | undefined>();
  const [pipelines] = usePipelines();

  useEffect(() => {
    if (production && pipelines) {
      const list: TList[] = [];
      production.sources.map((source) =>
        list.push({
          id: source._id,
          input_slot: source.input_slot,
          label: source.label
        })
      );
      pipelines.flatMap((pipeline) =>
        pipeline.feedback_streams.flatMap((source, index) => {
          if (source.input_slot > 1000) {
            list.push({
              id: (index + 1).toString(),
              input_slot: source.input_slot,
              label: source.name
            });
          }
        })
      );
      const uniqueList = list.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (t) => t.input_slot === item.input_slot && t.label === item.label
          )
      );
      return setInputList(uniqueList);
    }
  }, [production, pipelines]);
  return { inputList };
}
