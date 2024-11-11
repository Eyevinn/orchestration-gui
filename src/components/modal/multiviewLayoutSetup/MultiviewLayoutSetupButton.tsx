'use client';

import { useEffect, useState } from 'react';
import { IconSettings } from '@tabler/icons-react';
import { TMultiviewLayout } from '../../../interfaces/preset';
import { useTranslate } from '../../../i18n/useTranslate';
import { Button } from '../../button/Button';
import MultiviewLayoutSetup from './MultiviewLayoutSetup';
import { SourceReference } from '../../../interfaces/Source';

type MultiviewLayoutSetupButtonProps = {
  onUpdateLayoutPreset: (newLayout: TMultiviewLayout | null) => void;
  productionId: string;
  isProductionActive: boolean;
  sourceList: SourceReference[];
  disabled?: boolean;
  refreshLayoutList: (reload: boolean) => void;
  savedMultiviews: string[];
};

export function MultiviewLayoutSetupButton({
  onUpdateLayoutPreset,
  productionId,
  isProductionActive,
  sourceList,
  disabled,
  refreshLayoutList,
  savedMultiviews
}: MultiviewLayoutSetupButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const t = useTranslate();

  const toggleConfigModal = () => {
    setModalOpen((state) => !state);
  };

  useEffect(() => {
    refreshLayoutList(!modalOpen);
  }, [modalOpen, refreshLayoutList]);

  return (
    <>
      <Button
        className={`${
          disabled
            ? 'pointer-events-none bg-button-bg/50'
            : 'hover:bg-green-400'
        } flex self-center  min-w-fit max-w-fit mt-10`}
        type="button"
        onClick={toggleConfigModal}
        disabled={disabled}
      >
        {t('preset.configure_layouts')}
        <IconSettings className="text-p inline ml-2" />
      </Button>
      <MultiviewLayoutSetup
        productionId={productionId}
        isProductionActive={isProductionActive}
        sourceList={sourceList}
        onUpdateLayoutPreset={(newLayout: TMultiviewLayout | null) => {
          setModalOpen(false);
          onUpdateLayoutPreset(newLayout);
        }}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        savedMultiviews={savedMultiviews}
      />
    </>
  );
}
