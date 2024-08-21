import { getEnabledValue } from './utils';
import NumberInput from './NumberInput';
import styles from './checkbox.module.scss';

interface IContents {
  value: string;
  id: string;
}

interface IEvent {
  target: {
    value: string;
  };
}
interface IOutput {
  contents: IContents[];
  outputRows: IContents[][];
  rowIndex: number;
  max: number;
  updateRows?: (e: IEvent, rowIndex: number, index: number, id: string) => void;
  small?: boolean;
}

export default function Outputs({
  contents,
  outputRows,
  rowIndex,
  max,
  updateRows,
  small = false
}: IOutput) {
  return (
    <div className="flex">
      {contents.map(({ value, id }, index) => {
        const arraysInObject = {
          outputRows,
          contents
        };
        const indexes = {
          rowIndex,
          index
        };

        const isEnabled = getEnabledValue(arraysInObject, indexes);
        return (
          <div
            key={rowIndex + id}
            className={`${
              small ? 'mr-2 w-4 h-3 mb-1' : 'mr-5 w-5 h-5'
            } relative ${styles.checkbox}`}
          >
            <NumberInput
              isDisabled={small || !isEnabled}
              max={max}
              value={value}
              updateRows={(e: IEvent) =>
                updateRows && updateRows(e, rowIndex, index, id)
              }
            />
          </div>
        );
      })}
    </div>
  );
}
