import { useEffect, useState } from 'react';
import { TListSource } from '../interfaces/multiview';
import { GetPipelines } from './pipelines';
import { SourceReference } from '../interfaces/Source';

export function useCreateInputArray(sources: SourceReference[]) {
  const [inputList, setInputList] = useState<TListSource[] | undefined>();
  const [pipelines] = GetPipelines();

  useEffect(() => {
    if (sources && pipelines) {
      const list: TListSource[] = [];
      sources.map((source) => {
        list.push({
          id: source._id ? source._id : '',
          input_slot: source.input_slot,
          label: source.label
        });
      });
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
  }, [sources, pipelines]);

  return { inputList };
}
