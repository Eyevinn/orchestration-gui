import cloneDeep from 'lodash.clonedeep';
import { usePipelines } from '../../../hooks/pipelines';
import { PipelineSettings } from '../../../interfaces/pipeline';
import Section from '../../section/Section';
import ProductionPipelineCard from './ProductionPipelineCard';

interface NewProductionPipelinesProps {
  pipelines: PipelineSettings[];
  onChange: (pipelines: PipelineSettings[]) => void;
}

const NewProductionPipelines: React.FC<NewProductionPipelinesProps> = (
  props
) => {
  const { pipelines: productionPipelines, onChange } = props;
  const [apiPipelines] = usePipelines();

  const onPipelineChange = (pipeline: PipelineSettings, index: number) => {
    const newPipelines = cloneDeep(productionPipelines);
    newPipelines[index] = pipeline;
    onChange(newPipelines);
  };

  return (
    <Section title="Pipelines" startOpen>
      <div className="-mb-4">
        {!!apiPipelines?.length &&
          productionPipelines.map((pipeline, index) => (
            <ProductionPipelineCard
              key={'pipeline-card-' + index}
              pipeline={pipeline}
              pipelines={apiPipelines}
              onPipelineChange={(pipeline: PipelineSettings) =>
                onPipelineChange(pipeline, index)
              }
            />
          ))}
      </div>
    </Section>
  );
};

export default NewProductionPipelines;
