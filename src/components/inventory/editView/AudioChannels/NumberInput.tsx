import styles from './checkbox.module.scss';

interface IEvent {
  target: {
    value: string;
  };
}
interface IInputRow {
  value: string;
  max: number;
  isDisabled: boolean;
  duplicateError: boolean;
  updateRows: (e: IEvent) => void;
}

export default function InputRow({
  value,
  max,
  isDisabled,
  duplicateError,
  updateRows
}: IInputRow) {
  return (
    <input
      type="number"
      min={1}
      value={value}
      max={max}
      onChange={updateRows}
      disabled={isDisabled}
      className={`w-[100%] h-[100%] appearance-none text-black text-center ${
        duplicateError ? 'bg-red-400' : ''
      } ${styles.numberInput} ${
        isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
    />
  );
}
