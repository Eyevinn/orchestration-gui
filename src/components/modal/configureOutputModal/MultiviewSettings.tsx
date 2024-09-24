import { useEffect, useState } from 'react';
import { useTranslate } from '../../../i18n/useTranslate';
import { MultiviewSettings } from '../../../interfaces/multiview';
import { MultiviewPreset } from '../../../interfaces/preset';
import Input from './Input';
import Options from './Options';
import toast from 'react-hot-toast';
import { IconSettings } from '@tabler/icons-react';
import { useMultiviewLayouts } from '../../../hooks/multiviewLayout';

type MultiviewSettingsProps = {
  lastItem: boolean;
  multiview?: MultiviewSettings;
  handleUpdateMultiview: (multiview: MultiviewSettings) => void;
  portDuplicateError: boolean;
  openConfigModal: (input: string) => void;
  newMultiviewPreset: MultiviewPreset | null;
  productionId: string | undefined;
};

export default function MultiviewSettingsConfig({
  lastItem,
  multiview,
  handleUpdateMultiview,
  portDuplicateError,
  openConfigModal,
  newMultiviewPreset,
  productionId
}: MultiviewSettingsProps) {
  const t = useTranslate();
  const [multiviewLayouts, loading] = useMultiviewLayouts();
  const [avaliableMultiviewPresets, setAvaliableMultiviewPresets] = useState<
    MultiviewPreset[] | undefined
  >();
  const [selectedMultiviewPreset, setSelectedMultiviewPreset] = useState<
    MultiviewPreset | undefined
  >(multiview);

  // TODO: When possible to edit layout, uncomment the following code
  // const [modalOpen, setModalOpen] = useState(false);
  // const toggleConfigModal = () => {
  //   setModalOpen((state) => !state);
  // };

  useEffect(() => {
    if (multiviewLayouts) {
      const globalPresets = multiviewLayouts.filter((preset) => {
        !preset.production_id;
      });

      const productionPresets = multiviewLayouts.filter((preset) => {
        preset.production_id?.toString() === productionId;
      });

      setAvaliableMultiviewPresets([...globalPresets, ...productionPresets]);
    }
  }, [multiviewLayouts, productionId]);

  useEffect(() => {
    if (newMultiviewPreset && lastItem) {
      setSelectedMultiviewPreset(newMultiviewPreset);
      return;
    }
    if (multiview) {
      setSelectedMultiviewPreset(multiview);
      return;
    }
    if (avaliableMultiviewPresets && avaliableMultiviewPresets[0]) {
      setSelectedMultiviewPreset(avaliableMultiviewPresets[0]);
    }
  }, [avaliableMultiviewPresets, multiview, newMultiviewPreset]);

  if (!multiview) {
    if (!multiviewLayouts || multiviewLayouts.length === 0) {
      return null;
    }
    handleUpdateMultiview({
      ...multiviewLayouts[0],
      for_pipeline_idx: 0
    });
  }

  const handleSetSelectedMultiviewPreset = (name: string) => {
    const selected = multiviewLayouts?.find((m) => m.name === name);
    if (!selected) {
      toast.error(t('preset.no_multiview_found'));
      return;
    }
    setSelectedMultiviewPreset(selected);
    handleUpdateMultiview({ ...selected, for_pipeline_idx: 0 });
  };

  const getNumber = (val: string, prev: number) => {
    if (Number.isNaN(parseInt(val))) {
      return prev;
    }
    return parseInt(val);
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
  const multiviewPresetNames = multiviewLayouts?.map((preset) => preset.name)
    ? multiviewLayouts?.map((preset) => preset.name)
    : [];

  const multiviewOrPreset = multiview ? multiview : selectedMultiviewPreset;

  return (
    <div className="flex flex-col gap-2 rounded p-4 pr-7">
      <div className="flex justify-between">
        <h1 className="font-bold">{t('preset.multiview_output_settings')}</h1>
      </div>
      <div className="relative">
        <Options
          label={t('preset.select_multiview_layout')}
          options={multiviewPresetNames.map((singleItem) => ({
            label: singleItem
          }))}
          value={selectedMultiviewPreset ? selectedMultiviewPreset.name : ''}
          update={(value) => handleSetSelectedMultiviewPreset(value)}
        />
        {lastItem && (
          // TODO: When possible to edit layout, uncomment the following code and remove the button below
          <button
            onClick={() => openConfigModal('create')}
            title={t('preset.configure_layout')}
            className={`absolute top-0 right-[-10%] min-w-fit`}
          >
            <IconSettings className="text-p" />
          </button>
          // <>
          //   <button
          //     onClick={toggleConfigModal}
          //     title={t('preset.configure_layout')}
          //     className={`absolute top-0 right-[-10%] min-w-fit`}
          //   >
          //     <IconSettings className="text-p" />
          //   </button>
          //   {modalOpen && (
          //     <div className="absolute top-5 right-[-65%] flex flex-col">
          //       <button
          //         type="button"
          //         className={`min-w-fit bg-zinc-700 rounded-t-sm p-1 border-b-[1px] border-b-zinc-600 hover:bg-zinc-600`}
          //         onClick={() => openConfigModal('create')}
          //       >
          //         {t('preset.create_layout')}
          //       </button>
          //       <button
          //         type="button"
          //         className={`min-w-fit bg-zinc-700 rounded-b-sm  p-1 hover:bg-zinc-600`}
          //         onClick={() => openConfigModal('edit')}
          //       >
          //         {t('preset.update_layout')}
          //       </button>
          //     </div>
          //   )}
          // </>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Options
          label={t('preset.video_format')}
          options={[{ label: 'AVC' }, { label: 'HEVC' }]}
          value={
            multiviewOrPreset?.output.video_format
              ? multiviewOrPreset?.output.video_format
              : 'AVC'
          }
          update={(value) => handleChange('videoFormat', value)}
        />
        <Input
          type="number"
          label={t('preset.video_kilobit_rate')}
          value={
            multiviewOrPreset?.output.video_kilobit_rate !== undefined
              ? multiviewOrPreset?.output.video_kilobit_rate
              : '5000'
          }
          update={(value) => handleChange('videoKiloBit', value)}
        />
        <Options
          label={t('preset.mode')}
          options={[{ label: 'listener' }, { label: 'caller' }]}
          value={
            multiviewOrPreset?.output.srt_mode
              ? multiviewOrPreset?.output.srt_mode
              : 'listener'
          }
          update={(value) => handleChange('srtMode', value)}
        />
        <Input
          label={t('preset.port')}
          inputError={portDuplicateError}
          value={
            multiviewOrPreset?.output.local_port
              ? multiviewOrPreset?.output.local_port
              : '1234'
          }
          update={(value) => handleChange('port', value)}
        />
        <Input
          label={t('preset.ip')}
          value={
            multiviewOrPreset?.output.local_ip
              ? multiviewOrPreset?.output.local_ip
              : '0.0.0.0'
          }
          update={(value) => handleChange('ip', value)}
        />
        <Input
          label={t('preset.srt_passphrase')}
          value={
            multiviewOrPreset?.output.srt_passphrase
              ? multiviewOrPreset?.output.srt_passphrase
              : ''
          }
          update={(value) => handleChange('srtPassphrase', value)}
        />
      </div>
    </div>
  );
}
