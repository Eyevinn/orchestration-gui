import { useEffect, useState } from 'react';
import { useMultiviewPresets } from '../../../hooks/multiviewPreset';
import Options from './Options';
import { MultiviewPreset } from '../../../interfaces/preset';
import toast from 'react-hot-toast';
import { useTranslate } from '../../../i18n/useTranslate';

export default function MultiviewLayoutSettings({
  configMode
}: {
  configMode: string;
}) {
  const [selectedMultiviewPreset, setSelectedMultiviewPreset] = useState<
    MultiviewPreset | undefined
  >();
  const [multiviewPresets, loading] = useMultiviewPresets();
  const t = useTranslate();

  const multiviewPresetNames = multiviewPresets?.map((preset) => preset.name)
    ? multiviewPresets?.map((preset) => preset.name)
    : [];

  useEffect(() => {
    // if (multiview) {
    //   setSelectedMultiviewPreset(multiview);
    //   return;
    // }
    if (multiviewPresets && multiviewPresets[0]) {
      console.log(multiviewPresets);
      setSelectedMultiviewPreset(multiviewPresets[0]);
    }
  }, [multiviewPresets]);

  const handlePresetUpdate = (name: string) => {
    const selected = multiviewPresets?.find((m) => m.name === name);
    if (!selected) {
      toast.error(t('preset.no_multiview_found'));
      return;
    }
    setSelectedMultiviewPreset(selected);
  };

  const handleChange = (key: string, value: string) => {
    console.log('onChange: ', key, value);
  };

  const renderPresetModel = () => {
    if (selectedMultiviewPreset) {
      const presetHeight =
        selectedMultiviewPreset.layout.output_height / 40 + 0.5;
      const presetWidth =
        selectedMultiviewPreset.layout.output_width / 40 + 0.5;

      return (
        <div
          className={`border-4 border-p/50 relative p-2 m-2`}
          style={{ width: `${presetWidth}rem`, height: `${presetHeight}rem` }}
        >
          {selectedMultiviewPreset.layout.views.map((singleView) => {
            return (
              <div
                key={singleView.x + singleView.y}
                className="flex items-center justify-center border-[1px] border-p/50 absolute w-full"
                style={{
                  width: `${singleView.width / 40}rem`,
                  height: `${singleView.height / 40}rem`,
                  top: `${singleView.y / 40}rem`,
                  left: `${singleView.x / 40}rem`
                }}
              >
                <Options
                  label={t('preset.video_format')}
                  options={selectedMultiviewPreset.layout.views.map(
                    (singleView) => singleView.label
                  )}
                  value={'string'}
                  update={(value) => handleChange('videoFormat', value)}
                  columnStyle
                />
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {renderPresetModel()}
      <div>
        <Options
          label={t('preset.select_multiview_layout')}
          options={multiviewPresetNames}
          value={selectedMultiviewPreset ? selectedMultiviewPreset.name : ''}
          update={(value) => handlePresetUpdate(value)}
        />
      </div>
    </div>
  );
}
