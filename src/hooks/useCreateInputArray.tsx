import { useEffect, useState } from 'react';
import { Production } from '../interfaces/production';
import { ResourcesCompactPipelineResponse } from '../../types/ateliere-live';
import { TListSource } from '../interfaces/multiview';

type ModifiedDataHook<DataType> = [DataType | undefined, boolean];

function GetPipelines(): [
  ...ModifiedDataHook<ResourcesCompactPipelineResponse[]>
] {
  const [loading, setLoading] = useState(true);
  const [pipelines, setPipelines] = useState<
    ResourcesCompactPipelineResponse[]
  >([]);
  useEffect(() => {
    setLoading(true);
    fetch('/api/manager/pipelines', {
      method: 'GET',
      // TODO: Implement api key
      headers: [['x-api-key', `Bearer apisecretkey`]]
    })
      .then(async (response) => {
        if (response.ok) {
          setPipelines((await response.json()).pipelines);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return [pipelines.sort((a, b) => a.name.localeCompare(b.name)), loading];
}

export function useCreateInputArray(production: Production | undefined) {
  const [inputList, setInputList] = useState<TListSource[] | undefined>();
  const [pipelines] = GetPipelines();

  useEffect(() => {
    if (production && pipelines) {
      const list: TListSource[] = [];
      production.sources.map((source) => {
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
  }, [production, pipelines]);

  return { inputList };
}
