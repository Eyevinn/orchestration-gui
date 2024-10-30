import { useTranslate } from '../../../../i18n/useTranslate';

type RemoveLayoutButtonProps = {
  handleCheckboxChange: () => void;
  isChecked: boolean;
};

export default function Checkbox({
  handleCheckboxChange,
  isChecked
}: RemoveLayoutButtonProps) {
  const t = useTranslate();
  return (
    <div className="flex items-center flex-row mb-5 pl-2 w-[50%]">
      <input
        type="checkbox"
        id="clearPreset"
        className="w-5 h-5 text-gray-500 accent-gray-500"
        checked={isChecked}
        onChange={handleCheckboxChange}
      />
      <label htmlFor="clearPreset" className="pl-2">
        {t('preset.clear_layout')}
      </label>
    </div>
  );
}
