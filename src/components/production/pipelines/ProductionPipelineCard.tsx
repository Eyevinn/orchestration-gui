'use client';

import { ResourcesCompactPipelineResponse } from '../../../../types/ateliere-live';
import { PipelineSettings } from '../../../interfaces/pipeline';
import PipelineNameDropDown from '../../dropDown/PipelineNameDropDown';
import cloneDeep from 'lodash.clonedeep';
import { useContext } from 'react';
import { GlobalContext } from '../../../contexts/GlobalContext';
import { useTranslate } from '../../../i18n/useTranslate';

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
  const t = useTranslate();

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
          label={t('pipeline_card.audio_format')}
          value={pipeline.audio_format}
        />
        <PipelineCardInfo
          label={t('pipeline_card.audio_mapping')}
          value={pipeline.audio_mapping}
        />
        <PipelineCardInfo
          label={t('pipeline_card.audio_sampling_frequency')}
          value={pipeline.audio_sampling_frequency}
        />
        <PipelineCardInfo
          label={t('pipeline_card.bit_depth')}
          value={pipeline.bit_depth}
        />
        <PipelineCardInfo
          label={t('pipeline_card.convert_color_range')}
          value={pipeline.convert_color_range}
        />
        <PipelineCardInfo
          label={t('pipeline_card.encoder')}
          value={pipeline.encoder}
        />
        <PipelineCardInfo
          label={t('pipeline_card.format')}
          value={pipeline.format}
        />
        <PipelineCardInfo
          label={t('pipeline_card.frame_rate_d')}
          value={pipeline.frame_rate_d}
        />
        <PipelineCardInfo
          label={t('pipeline_card.frame_rate_n')}
          value={pipeline.frame_rate_n}
        />
        <PipelineCardInfo
          label={t('pipeline_card.gop_length')}
          value={pipeline.gop_length}
        />
        <PipelineCardInfo
          label={t('pipeline_card.height')}
          value={pipeline.height}
        />
        <PipelineCardInfo
          label={t('pipeline_card.width')}
          value={pipeline.width}
        />
        <PipelineCardInfo
          label={t('pipeline_card.video_kilobit_rate')}
          value={pipeline.video_kilobit_rate}
        />
      </div>
    </div>
  );
};

export default ProductionPipelineCard;
