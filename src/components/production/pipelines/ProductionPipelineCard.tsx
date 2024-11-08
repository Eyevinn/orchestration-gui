'use client';

import { ResourcesCompactPipelineResponse } from '../../../../types/ateliere-live';
import { PipelineSettings } from '../../../interfaces/pipeline';
import PipelineNameDropDown from '../../dropDown/PipelineNameDropDown';
import cloneDeep from 'lodash.clonedeep';
import { useContext } from 'react';
import { GlobalContext } from '../../../contexts/GlobalContext';

interface PipelineCardInfoProps {
  label: string;
  value: string | number | boolean;
}

export const PipelineCardInfo: React.FC<PipelineCardInfoProps> = (props) => {
  const { label, value } = props;

  return (
    <div className="flex flex-row w-1/5 px-4 py-2">
      <div className="mr-4">{label + ':'}</div>
      <div className="italic text-gray-300">{value.toString()}</div>
    </div>
  );
};

interface ProductionPipelineCardProps {
  pipeline: PipelineSettings;
  pipelines: ResourcesCompactPipelineResponse[];
  onPipelineChange: (pipeline: PipelineSettings) => void;
}

const ProductionPipelineCard: React.FC<ProductionPipelineCardProps> = (
  props
) => {
  const { pipeline, pipelines, onPipelineChange } = props;
  const { locked } = useContext(GlobalContext);

  const updatePipelineID = (id: string) => {
    const newPipeline = cloneDeep(pipeline);
    newPipeline.pipeline_id = id;
    onPipelineChange(newPipeline);
  };

  return (
    <div id="card-wrapper" className="mb-4">
      <div className="rounded-t-xl bg-zinc-700 p-4">
        <PipelineNameDropDown
          disabled={locked}
          label={pipeline.pipeline_readable_name}
          options={pipelines.map(
            (pipeline: ResourcesCompactPipelineResponse) => ({
              option: pipeline.name,
              id: pipeline.uuid,
              available: pipeline.streams.length === 0
            })
          )}
          value={pipeline.pipeline_id || ''}
          onChange={updatePipelineID}
        />
      </div>
      <div
        id="card-body"
        className="rounded-b-xl bg-zinc-600 text-white w-full flex flex-row flex-wrap"
      >
        <PipelineCardInfo
          label={'Alignment (ms)'}
          value={pipeline.alignment_ms}
        />
        <PipelineCardInfo
          label={'Audio Format'}
          value={pipeline.audio_format}
        />
        <PipelineCardInfo
          label={'Audio Mapping'}
          value={pipeline.audio_mapping}
        />
        <PipelineCardInfo
          label={'Audio Sampling Frequency'}
          value={pipeline.audio_sampling_frequency}
        />
        <PipelineCardInfo label={'Bit Depth'} value={pipeline.bit_depth} />
        <PipelineCardInfo
          label={'Convert Color Range'}
          value={pipeline.convert_color_range}
        />
        <PipelineCardInfo label={'Encoder'} value={pipeline.encoder} />
        <PipelineCardInfo label={'Format'} value={pipeline.format} />
        <PipelineCardInfo
          label={'Frame Rate D'}
          value={pipeline.frame_rate_d}
        />
        <PipelineCardInfo
          label={'Frame Rate N'}
          value={pipeline.frame_rate_n}
        />
        <PipelineCardInfo label={'GOP Length'} value={pipeline.gop_length} />
        <PipelineCardInfo label={'Height'} value={pipeline.height} />
        <PipelineCardInfo label={'Width'} value={pipeline.width} />
        <PipelineCardInfo
          label={'Video Kilobit Rate'}
          value={pipeline.video_kilobit_rate}
        />
      </div>
    </div>
  );
};

export default ProductionPipelineCard;
