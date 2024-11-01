import cloneDeep from 'lodash.clonedeep';
import { usePipelines } from '../../../hooks/pipelines';
import { PipelineSettings } from '../../../interfaces/pipeline';
import Section from '../../section/Section';
import ProductionPipelineCard from './ProductionPipelineCard';
import { LoadingCover } from '../../loader/LoadingCover';

interface ProductionPipelinesProps {
  pipelines: PipelineSettings[];
  onChange: (pipelines: PipelineSettings[]) => void;
}

const ProductionPipelines: React.FC<ProductionPipelinesProps> = (props) => {
  const { pipelines: productionPipelines, onChange } = props;
  const [apiPipelines] = usePipelines();

  const onPipelineChange = (pipeline: PipelineSettings, index: number) => {
    const newPipelines = cloneDeep(productionPipelines);
    newPipelines[index] = pipeline;
    onChange(newPipelines);
  };

  return (
    <Section title="Pipelines">
      <div className="-mb-4">
        {(!!apiPipelines?.length &&
          productionPipelines.map((pipeline, index) => (
            <ProductionPipelineCard
              key={'pipeline-card-' + index}
              pipeline={pipeline}
              pipelines={apiPipelines}
              onPipelineChange={(pipeline: PipelineSettings) =>
                onPipelineChange(pipeline, index)
              }
            />
          ))) || (
          <div className="h-full w-full min-h-[200px] flex flex-col justify-center items center">
            <LoadingCover />
          </div>
        )}
      </div>
    </Section>
  );
};

export default ProductionPipelines;
