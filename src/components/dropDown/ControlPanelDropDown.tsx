import { useEffect, useState } from 'react';
import DropDown from './DropDown';

type ControlPanelDropDown = {
  options?: { option: string; available: boolean }[];
  initial?: string[];
  disabled: boolean;
  setSelectedControlPanel: (selected: string[]) => void;
};
export default function ControlPanelDropDown({
  options,
  initial,
  setSelectedControlPanel,
  disabled
}: ControlPanelDropDown) {
  const [selected, setSelected] = useState<string[] | undefined>(initial);

  useEffect(() => {
    if (!selected) {
      setSelectedControlPanel([]);
    } else {
      setSelectedControlPanel(selected);
    }
  }, [selected]);

  useEffect(() => {
    if (!options || !initial || options.length === 0) return;
    const cleanedInitial = initial?.filter((value) =>
      options?.find((o) => o.option === value)
    );
    if (cleanedInitial?.length === 0) {
      setSelected(undefined);
    } else {
      setSelected(initial);
    }
  }, []);

  const handleAddSelectedControlPanel = (option: string) => {
    setSelected((prevState) => {
      if (!prevState) {
        return [option];
      }
      if (prevState.includes(option)) {
        return [...prevState.filter((p) => p !== option)];
      }
      return [...prevState, option];
    });
  };
  return (
    <div>
      <DropDown
        disabled={disabled}
        title="Select control panel"
        label="Control panel"
        options={options}
        multipleSelected={selected}
        setSelected={handleAddSelectedControlPanel}
      />
    </div>
  );
}
