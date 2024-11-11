import { useState } from 'react';
import DropDown from './DropDown';
import useEffectNotOnMount from '../../hooks/utils/useEffectNotOnMount';
import { useTranslate } from '../../i18n/useTranslate';

type PipelineNamesDropDownProps = {
  label: string;
  options: { option: string; available: boolean; id: string }[];
  disabled?: boolean;
  value: string;
  onChange: (id: string) => void;
};
export default function PipelineNamesDropDown({
  label,
  options,
  disabled = false,
  value,
  onChange
}: PipelineNamesDropDownProps) {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    options.find((o) => o.id === value)?.option
  );
  const t = useTranslate();

  useEffectNotOnMount(() => {
    if (options) {
      const foundOptionID = options.find(
        (o) => o.option === selectedOption
      )?.id;
      onChange(foundOptionID || '');
    }
  }, [selectedOption]);

  return (
    <div>
      <DropDown
        disabled={disabled}
        title={t('production.select_pipeline')}
        label={label}
        options={options}
        selected={selectedOption}
        setSelected={setSelectedOption}
      />
    </div>
  );
}
