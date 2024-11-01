import cloneDeep from 'lodash.clonedeep';
import { PipelineOutput, PipelineSettings } from '../../../interfaces/pipeline';
import Section from '../../section/Section';
import ProductionOutputsCard from './ProductionOutputsCard';

interface ProductionOutputsProps {
  outputs: PipelineOutput[][];
  onOuputsChange: (outputs: PipelineOutput[][]) => void;
  pipelines: PipelineSettings[];
}

const ProductionOutputs: React.FC<ProductionOutputsProps> = (props) => {
  const { outputs, onOuputsChange, pipelines } = props;

  const onChange = (localOutputs: PipelineOutput[], index: number) => {
    const newOutputs = cloneDeep(outputs);
    newOutputs[index] = localOutputs;
    onOuputsChange(newOutputs);
  };

  return (
    <Section title="Outputs">
      {pipelines.map((pipeline, index) => (
        <ProductionOutputsCard
          key={'outputs-card-' + index}
          pipeline={pipeline}
          outputs={outputs[index]}
          onOutputsChange={(outputs: PipelineOutput[]) =>
            onChange(outputs, index)
          }
        />
      ))}
    </Section>
  );
};

export default ProductionOutputs;
