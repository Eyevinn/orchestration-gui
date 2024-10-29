import { useEffect, useState } from 'react';
import { Production } from '../interfaces/production';
import { ResourcesCompactPipelineResponse } from '../../types/ateliere-live';
import { TListSource } from '../interfaces/multiview';
import { API_SECRET_KEY } from '../utils/constants';
import { SourceReference } from '../interfaces/Source';

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
      headers: [['x-api-key', `Bearer ${API_SECRET_KEY}`]]
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
