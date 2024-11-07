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
  refreshLayoutList: (reload: boolean) => void;
  savedMultiviews: string[];
};

export function MultiviewLayoutSetupButton({
  onUpdateLayoutPreset,
  productionId,
  isProductionActive,
  sourceList,
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
