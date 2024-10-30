'use client';

import { useState } from 'react';
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
};

export function MultiviewLayoutSetupButton({
  onUpdateLayoutPreset,
  productionId,
  isProductionActive,
  sourceList
}: MultiviewLayoutSetupButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const toggleConfigModal = () => {
    setModalOpen((state) => !state);
  };
  const t = useTranslate();
  return (
    <>
      <Button
        className="flex self-center hover:bg-green-400 min-w-fit max-w-fit mt-10"
        type="button"
        onClick={toggleConfigModal}
      >
        {t('preset.configure_layouts')}
        <IconSettings className="text-p inline ml-2" />
      </Button>
      <MultiviewLayoutSetup
        productionId={productionId}
        isProductionActive={isProductionActive}
        sourceList={sourceList}
        onUpdateLayoutPreset={() => {
          setModalOpen(false);
          onUpdateLayoutPreset;
        }}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
