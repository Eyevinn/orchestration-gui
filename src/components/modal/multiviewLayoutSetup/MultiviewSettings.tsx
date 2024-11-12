import { useEffect, useMemo, useState } from 'react';
import { useTranslate } from '../../../i18n/useTranslate';
import { MultiviewSettings } from '../../../interfaces/multiview';
import { TMultiviewLayout } from '../../../interfaces/preset';
import Input from '../configureOutputModal/Input';
import Options from '../configureOutputModal/Options';
import toast from 'react-hot-toast';
import { useMultiviewLayouts } from '../../../hooks/multiviewLayout';

type MultiviewSettingsProps = {
  lastItem: boolean;
  multiview?: MultiviewSettings;
  handleUpdateMultiview: (multiview: MultiviewSettings) => void;
  portDuplicateError: boolean;
  streamIdDuplicateError: boolean;
  newMultiviewLayout: TMultiviewLayout | null;
  productionId: string | undefined;
  refresh: boolean;
  disabled?: boolean;
};

export default function MultiviewSettingsConfig({
  lastItem,
  multiview,
  handleUpdateMultiview,
  portDuplicateError,
  streamIdDuplicateError,
  newMultiviewLayout,
  productionId,
  refresh,
  disabled
}: MultiviewSettingsProps) {
  const t = useTranslate();
  const [selectedMultiviewLayout, setSelectedMultiviewLayout] = useState<
    TMultiviewLayout | undefined
  >();
  const [multiviewLayouts] = useMultiviewLayouts(refresh);

  const currentValue = multiview || selectedMultiviewLayout;

  const avaliableMultiviewLayouts = useMemo(() => {
    return multiviewLayouts?.filter(
      (layout) => layout.productionId === productionId || !layout.productionId
    );
  }, [multiviewLayouts, productionId]);

  const defaultMultiview = multiviewLayouts
    ? multiviewLayouts.find((m) => m.productionId !== undefined)
    : undefined;

  const multiviewLayoutNames = useMemo(() => {
    return avaliableMultiviewLayouts?.map((layout) => layout.name) || [];
  }, [avaliableMultiviewLayouts]);

  useEffect(() => {
    if (
      refresh &&
      multiview &&
      avaliableMultiviewLayouts &&
      avaliableMultiviewLayouts.length > 0
    ) {
      handleSetSelectedMultiviewLayout(multiview.name);
    }
  }, [refresh, avaliableMultiviewLayouts]);

  useEffect(() => {
    if (multiview) {
      setSelectedMultiviewLayout(multiview);
      return;
    }
    if (defaultMultiview) {
      setSelectedMultiviewLayout(defaultMultiview);
    }
  }, [lastItem, multiview, newMultiviewLayout, defaultMultiview]);

  if (!multiview) {
    if (!defaultMultiview) {
      return null;
    }
    handleUpdateMultiview({
      ...defaultMultiview,
      _id: defaultMultiview._id?.toString(),
      for_pipeline_idx: 0
    });
  }

  const handleSetSelectedMultiviewLayout = (name: string) => {
    const selected = multiviewLayouts?.find((m) => m.name === name);
    if (!selected) {
      return;
    }
    const updatedMultiview = {
      ...selected,
      name,
      layout: {
        ...selected.layout
      },
      output: multiview?.output || selected.output
    };
    setSelectedMultiviewLayout(updatedMultiview);
    handleUpdateMultiview({
      ...updatedMultiview,
      _id: updatedMultiview._id?.toString(),
      for_pipeline_idx: 0
    });
  };

  const getNumber = (val: string, prev: number) => {
    if (
      val === '' ||
      (!isNaN(Number(val)) && Number.isInteger(parseFloat(val)))
    ) {
      return parseInt(val);
    } else {
      return prev;
    }
  };

  const handleChange = (key: string, value: string) => {
    if (!multiview) return;
    if (key === 'videoFormat') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          video_format: value
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
    if (key === 'videoKiloBit') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          video_kilobit_rate: getNumber(
            value,
            multiview.output.video_kilobit_rate
          )
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
    if (key === 'srtMode') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          srt_mode: value
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
    if (key === 'port') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          local_port: getNumber(value, multiview.output.local_port),
          remote_port: getNumber(value, multiview.output.remote_port)
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
    if (key === 'ip') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          local_ip: value,
          remote_ip: value
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
    if (key === 'srtStreamId') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          srt_stream_id: value
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
    if (key === 'srtPassphrase') {
      const updatedMultiview = {
        ...multiview,
        output: {
          ...multiview.output,
          srt_passphrase: value
        },
        for_pipeline_idx: 0
      };
      handleUpdateMultiview(updatedMultiview);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded p-4 pr-7 text-white">
      <div className="flex justify-between pb-5">
        <h1 className="font-bold">{t('preset.multiview_output_settings')}</h1>
      </div>
      <div>
        <Options
          disabled={disabled}
          label={t('preset.select_multiview_layout')}
          options={multiviewLayoutNames.map((singleItem) => ({
            label: singleItem
          }))}
          value={selectedMultiviewLayout?.name || ''}
          update={(value) => handleSetSelectedMultiviewLayout(value)}
        />
      </div>
      <div className="flex flex-col gap-3">
        <Options
          disabled={disabled}
          label={t('preset.video_format')}
          options={[{ label: 'AVC' }, { label: 'HEVC' }]}
          value={currentValue?.output.video_format || 'AVC'}
          update={(value) => handleChange('videoFormat', value)}
        />
        <Input
          disabled={disabled}
          type="number"
          label={t('preset.video_kilobit_rate')}
          inputError={!currentValue?.output.video_kilobit_rate}
          value={currentValue?.output.video_kilobit_rate || ''}
          update={(value) => handleChange('videoKiloBit', value)}
        />
        <Options
          disabled={disabled}
          label={t('preset.mode')}
          options={[{ label: 'listener' }, { label: 'caller' }]}
          value={currentValue?.output.srt_mode || 'listener'}
          update={(value) => handleChange('srtMode', value)}
        />
        <Input
          disabled={disabled}
          label={t('preset.port')}
          inputError={portDuplicateError || !currentValue?.output.local_port}
          value={currentValue?.output.local_port || ''}
          update={(value) => handleChange('port', value)}
        />
        <Input
          disabled={disabled}
          label={t('preset.ip')}
          inputError={
            !currentValue?.output.local_ip ||
            currentValue.output.local_ip === ''
          }
          value={currentValue?.output.local_ip || ''}
          update={(value) => handleChange('ip', value)}
        />
        <Input
          disabled={disabled}
          label={t('preset.srt_stream_id')}
          inputError={streamIdDuplicateError}
          value={currentValue?.output.srt_stream_id || ''}
          update={(value) => handleChange('srtStreamId', value)}
        />
        <Input
          disabled={disabled}
          label={t('preset.srt_passphrase')}
          value={currentValue?.output.srt_passphrase || ''}
          update={(value) => handleChange('srtPassphrase', value)}
        />
      </div>
    </div>
  );
}