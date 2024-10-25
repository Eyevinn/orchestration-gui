import { useTranslate } from '../../../i18n/useTranslate';

type optionTypes = { id?: string; label: string };

interface IOptions {
  label: string;
  options: optionTypes[];
  value: string;
  update: (value: string) => void;
  columnStyle?: boolean;
  emptyFirstOption?: boolean;
}

export default function Options({
  label,
  options,
  value,
  update,
  columnStyle,
  emptyFirstOption
}: IOptions) {
  const t = useTranslate();
  return (
    <div
      className="flex mb-5 justify-between px-2 w-full"
      style={
        columnStyle
          ? { flexDirection: 'column', alignItems: 'center' }
          : { flexDirection: 'row' }
      }
    >
      <label className="flex items-center">{label}</label>
      <select
        onChange={(e) => {
          update(e.target.value);
        }}
        value={value}
        className="cursor-pointer px-2 border justify-center text-sm rounded-lg w-6/12 pt-1 pb-1 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:border-gray-400 focus:outline-none"
      >
        {emptyFirstOption && (
          <option value="">{t('preset.select_option')}</option>
        )}
        {options.map((option, i) => (
          <option
            value={option.id ? option.id.toString() : option.label}
            key={option.id ? option.id.toString() : option.label + i}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
