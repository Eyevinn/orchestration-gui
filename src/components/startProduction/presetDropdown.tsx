import { ClickAwayListener } from '@mui/base';
import { PresetWithId } from '../../interfaces/preset';
import React, { useEffect, useState } from 'react';
import { Button } from '../button/Button';
import { useTranslate } from '../../i18n/useTranslate';
import { useGetPresets } from '../../hooks/presets';

type presetDropdownProps = {
  disabled?: boolean;
  preset?: PresetWithId;
  onChange: (preset?: PresetWithId) => void;
};

export const PresetDropdown = ({
  disabled = false,
  preset,
  onChange
}: presetDropdownProps) => {
  const t = useTranslate();
  const [hidden, setHidden] = useState<boolean>(true);
  const [presets, setPresets] = useState<PresetWithId[]>([]);

  const getPresets = useGetPresets();

  useEffect(() => {
    getPresets().then((presets) => {
      const foundPreset = presets.find(
        (p) => p._id.toString() === preset?._id.toString()
      );
      if (foundPreset) onChange(foundPreset);
      setPresets(presets);
    });
  }, []);

  const handleSetPresetHiddenState = (shouldHide: boolean) => {
    if (!disabled) {
      setHidden(shouldHide);
    }
  };

  function addPresetComponent(preset: PresetWithId, index: number) {
    const id = `${preset.name}-${index}-id`;
    return (
      <li
        key={preset.name + index}
        className="flex w-40 px-1 mb-1 hover:bg-gray-600 hover:cursor-pointer"
        onClick={() => {
          onChange(preset);
        }}
      >
        <div className="flex items-center w-full p-2 rounded hover:bg-gray-600 hover:cursor-pointer">
          <label
            htmlFor={id}
            className="w-full text-sm text-center font-medium hover:cursor-pointer"
          >
            {preset.name}
          </label>
        </div>
      </li>
    );
  }

  return (
    <ClickAwayListener
      key={'PresetClickAwayListenerKey'}
      onClickAway={() => handleSetPresetHiddenState(true)}
    >
      <div
        className={`flex flex-row w-fit rounded items-center ${
          disabled && 'opacity-40'
        }`}
      >
        <Button
          onClick={() => handleSetPresetHiddenState(!hidden)}
          className={`bg-container hover:bg-container text-p ${
            disabled && 'cursor-default'
          }`}
        >
          {preset ? preset.name : t('production.select_preset')}
        </Button>

        <div
          className={`relative ${
            hidden ? 'overflow-hidden max-h-0' : 'min-h-fit max-h-[100rem]'
          } transition-all duration-150 items-center mt-1 z-30 divide-y  rounded-lg shadow bg-zinc-700 divide-gray-600 dropend`}
        >
          <ul
            className={`absolute -right-7 top-6 rounded border flex-col min-h-fit px-3 text-sm bg-container text-p`}
            id="preset-checkbox-container"
            aria-labelledby="dropdownCheckboxButton"
          >
            {preset && (
              <li
                className="flex w-40 px-1 mt-1 hover:bg-gray-600 hover:cursor-pointer"
                onClick={() => onChange(undefined)}
              >
                <div className="flex items-center w-full p-2 rounded hover:bg-gray-600 hover:cursor-pointer">
                  <label className="w-full text-sm text-center font-medium hover:cursor-pointer">
                    {t('production.clear_selection')}
                  </label>
                </div>
              </li>
            )}
            {presets &&
              presets.map((item, index: number) => {
                return addPresetComponent(item, index);
              })}
          </ul>
        </div>
      </div>
    </ClickAwayListener>
  );
};
