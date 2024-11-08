import { KeyboardEvent } from 'react';

interface IInput {
  label: string;
  value: string | number;
  type?: string;
  update: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  size?: 'small' | 'large';
  inputError?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export default function Input({
  label,
  value,
  update,
  type = 'text',
  onKeyDown,
  size = 'small',
  inputError,
  placeholder,
  disabled
}: IInput) {
  const errorCss = 'border-red-500 focus:border-red-500 focus:outline';

  return (
    <div className={`flex mb-5 justify-between w-full px-2`}>
      <label className="flex items-center">{label}</label>
      <input
        disabled={disabled}
        onKeyDown={onKeyDown}
        type={type}
        value={value}
        onChange={(e) => update(e.target.value)}
        className={`${
          disabled
            ? 'bg-gray-500/50 text-white/50 pointer-events-none'
            : 'bg-gray-500 text-white pointer-events-auto'
        } cursor-pointer border text-sm rounded-lg ${
          size === 'small' ? 'w-6/12' : 'w-7/12'
        } pl-2 pt-1 pb-1 border-gray-600 placeholder-gray-400 focus:border-gray-400 focus:outline-none ${
          inputError ? errorCss : ''
        }`}
        placeholder={placeholder ? placeholder : ''}
      />
    </div>
  );
}
