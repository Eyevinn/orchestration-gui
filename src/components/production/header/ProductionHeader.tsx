'use client';

import { KeyboardEvent, useContext, useEffect, useState } from 'react';
import { StartProductionButton } from '../../startProduction/StartProductionButton';
import { GlobalContext } from '../../../contexts/GlobalContext';
import { Production } from '../../../interfaces/production';
import { useTranslate } from '../../../i18n/useTranslate';
import Icons from '../../icons/Icons';

interface ProductionHeaderProps {
  production?: Production;
  onProductionNameChange: (name: string) => void;
  refreshProduction: () => void;
  presetName: string;
}

const ProductionHeader: React.FC<ProductionHeaderProps> = (props) => {
  const { production, onProductionNameChange, refreshProduction, presetName } =
    props;
  const { locked } = useContext(GlobalContext);
  const t = useTranslate();
  const [name, setName] = useState<string>(production?.name || '');

  const updateConfigName = (nameChange: string) => {
    if (production?.name === nameChange) {
      return;
    }
    setName(nameChange);
    onProductionNameChange(nameChange);
  };

  return (
    <div className="flex flex-row justify-between bg-container rounded-xl p-4">
      <div id="header-texts" className="text-white">
        <div className="flex flex-row items-center">
          <Icons name="IconPencil" className="w-8 h-8 mr-2" />
          <input
            className="text-4xl text-p bg-transparent grow text-start pointer-events-auto"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key.includes('Enter')) {
                e.currentTarget.blur();
              }
            }}
            onBlur={() => updateConfigName(name)}
            disabled={locked}
          />
        </div>
        <p className="text-p italic ml-[40px]">{presetName}</p>
      </div>
      <div
        className="flex mr-2 w-fit rounded justify-end items-center gap-3"
        key={'StartProductionButtonKey'}
        id="presetDropdownDefaultCheckbox"
      >
        <StartProductionButton
          refreshProduction={refreshProduction}
          production={production}
          disabled={locked}
        />
      </div>
    </div>
  );
};

export default ProductionHeader;
