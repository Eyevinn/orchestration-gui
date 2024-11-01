import { useEffect, useState } from 'react';
import DropDown from './DropDown';
import useEffectNotOnMount from '../../hooks/utils/useEffectNotOnMount';

type ControlPanelDropDown = {
  options: { option: string; available: boolean; id: string }[];
  initial?: string[];
  disabled?: boolean;
  setSelectedControlPanel: (selected: string[]) => void;
};
export default function ControlPanelDropDown({
  options,
  initial,
  setSelectedControlPanel,
  disabled = false
}: ControlPanelDropDown) {
  const [selected, setSelected] = useState<string[] | undefined>(
    initial?.map(
      (id: string) => options.find((option) => option.id === id)?.option || id
    )
  );

  useEffectNotOnMount(() => {
    const mappedIds = selected?.map(
      (name: string) =>
        options.find((option) => option.option === name)?.id || name
    );
    setSelectedControlPanel(mappedIds || []);
  }, [selected]);

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
