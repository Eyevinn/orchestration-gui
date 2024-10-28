import { useEffect, useState } from 'react';
import { PipelineOutput, PipelineSettings } from '../../../interfaces/pipeline';
import ProductionOutputEdit from './ProductionOutputEdit';
import cloneDeep from 'lodash.clonedeep';

interface ProductionOutputsCardProps {
  pipeline: PipelineSettings;
  outputs?: PipelineOutput[];
  onOutputsChange: (outputs: PipelineOutput[]) => void;
}

const ProductionOutputsCard: React.FC<ProductionOutputsCardProps> = (props) => {
  const { pipeline, outputs: outputsProp, onOutputsChange } = props;
  const initialOutputs = () => {
    console.log('INITIAR');
    return [
      {
        uuid: 'program1',
        settings: {
          video_bit_depth: pipeline.bit_depth,
          video_format: pipeline.format,
          video_kilobit_rate: pipeline.video_kilobit_rate
        },
        streams: []
      },
      {
        uuid: 'program2',
        settings: {
          video_bit_depth: pipeline.bit_depth,
          video_format: pipeline.format,
          video_kilobit_rate: pipeline.video_kilobit_rate
        },
        streams: []
      },
      {
        uuid: 'clean',
        settings: {
          video_bit_depth: pipeline.bit_depth,
          video_format: pipeline.format,
          video_kilobit_rate: pipeline.video_kilobit_rate
        },
        streams: []
      },
      {
        uuid: 'aux1',
        settings: {
          video_bit_depth: pipeline.bit_depth,
          video_format: pipeline.format,
          video_kilobit_rate: pipeline.video_kilobit_rate
        },
        streams: []
      },
      {
        uuid: 'aux2',
        settings: {
          video_bit_depth: pipeline.bit_depth,
          video_format: pipeline.format,
          video_kilobit_rate: pipeline.video_kilobit_rate
        },
        streams: []
      },
      {
        uuid: 'iso1',
        settings: {
          video_bit_depth: pipeline.bit_depth,
          video_format: pipeline.format,
          video_kilobit_rate: pipeline.video_kilobit_rate
        },
        streams: []
      },
      {
        uuid: 'iso2',
        settings: {
          video_bit_depth: pipeline.bit_depth,
          video_format: pipeline.format,
          video_kilobit_rate: pipeline.video_kilobit_rate
        },
        streams: []
      },
      {
        uuid: 'quad',
        settings: {
          video_bit_depth: pipeline.bit_depth,
          video_format: pipeline.format,
          video_kilobit_rate: pipeline.video_kilobit_rate
        },
        streams: []
      }
    ];
  };
  const [outputs, setOutputs] = useState<PipelineOutput[]>(
    outputsProp?.length ? outputsProp : initialOutputs()
  );

  useEffect(() => {
    onOutputsChange(outputs);
  }, [outputs]);

  const onChange = (output: PipelineOutput, index: number) => {
    const newOutputs = cloneDeep(outputs);
    newOutputs[index] = output;
    setOutputs(newOutputs);
  };

  return (
    <div id="card-wrapper" className="mb-4 text-white">
      <div className="rounded-t-xl bg-zinc-700 p-4">
        {pipeline.pipeline_readable_name + ' outputs'}
      </div>
      <div
        id="card-body"
        className="rounded-b-xl bg-zinc-600 text-white w-full flex flex-row"
      >
        {outputs.map((o, index) => (
          <ProductionOutputEdit
            key={o.uuid + index}
            output={o}
            onOutputChange={(output: PipelineOutput) => onChange(output, index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductionOutputsCard;
