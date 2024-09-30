'use client';

import { useEffect, useState } from 'react';
import { IconSettings } from '@tabler/icons-react';
import { Preset } from '../../interfaces/preset';
import { useTranslate } from '../../i18n/useTranslate';
import { Button } from '../button/Button';
import { ConfigureOutputModal } from '../modal/configureOutputModal/ConfigureOutputModal';
import { Production } from '../../interfaces/production';

type ConfigureOutputButtonProps = {
  preset?: Preset;
  disabled?: boolean;
  updatePreset: (preset: Preset) => void;
};

export function ConfigureOutputButton({
  preset,
  updatePreset,
  disabled
}: ConfigureOutputButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(
    !preset || disabled || false
  );
  const toggleConfigModal = () => {
    if (preset) {
      setModalOpen((state) => !state);
    }
  };

  useEffect(() => {
    if (!preset || disabled) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [preset, disabled]);

  const t = useTranslate();
  return (
    <>
      <Button
        onClick={toggleConfigModal}
        disabled={isDisabled}
        hoverMessage={!preset ? t('preset.preset_necessary') : ''}
        className={`min-w-fit ${
          isDisabled ? 'bg-button-bg/50 pointer-events-none' : 'bg-button-bg'
        }`}
      >
        Pipeline Outputs
        <IconSettings
          className={`${disabled ? 'text-p/50' : 'text-p'} inline ml-2`}
        />
      </Button>
      {preset && !isDisabled && (
        <ConfigureOutputModal
          open={modalOpen}
          preset={preset}
          onClose={toggleConfigModal}
          updatePreset={updatePreset}
        />
      )}
    </>
  );
}
