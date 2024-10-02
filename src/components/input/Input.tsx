interface InputProps {
  className?: string;
  type?: 'text' | 'number';
  value: string | number | undefined;
  name?: string;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({
  className,
  type,
  value,
  name,
  placeholder,
  error,
  disabled,
  onChange
}: InputProps) => {
  return (
    <input
      className={`${className} ${
        error ? 'border-error' : 'border-gray-600'
      } border text-sm rounded-lg pl-2 pt-1 pb-1 bg-gray-700 placeholder-gray-400 text white focus:ring-blue-500 focus:border-blue-500`}
      type={type}
      value={value}
      name={name}
      placeholder={placeholder}
      disabled={disabled}
      onChange={onChange}
    />
  );
};

export default Input;
