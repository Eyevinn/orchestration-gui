'use client';

import { useTranslate } from '../../i18n/useTranslate';
import { useState } from 'react';
import { AddSrtModal } from '../modal/addSrtModal/AddSrtModal';
import { useCreateSrtSource } from '../../hooks/sources/useCreateSrtSource';
import { SrtSource } from '../../interfaces/Source';

export default function HeaderNavigation({
  children,
  isInventoryManagement,
  locked
}: {
  children: React.ReactNode;
  isInventoryManagement?: boolean;
  locked?: boolean;
}) {
  const t = useTranslate();

  const [showSrtModal, setShowSrtModal] = useState<boolean>(false);
  const [createSrtSource, createSourceLoading] = useCreateSrtSource();

  const handleCreateSrtSource = (ingestUuid: string, srtPayload: SrtSource) => {
    createSrtSource(ingestUuid, srtPayload);
  };

  return (
    <div className="flex flex-row justify-between">
      <div className="flex m-2 rounded align-center">
        {isInventoryManagement && (
          <button
            disabled={locked}
            className={`${
              locked
                ? 'pointer-events-none bg-button-bg/50'
                : 'bg-button-bg hover:bg-button-hover-bg'
            } text-button-text font-bold py-2 px-4 rounded inline-flex items-center ml-2 w-fit`}
            onClick={() => setShowSrtModal(true)}
          >
            {t('inventory_list.create_srt')}
          </button>
        )}
      </div>
      {children}
      <AddSrtModal
        open={showSrtModal}
        loading={createSourceLoading}
        onConfirm={handleCreateSrtSource}
        onAbort={() => setShowSrtModal(false)}
      />
    </div>
  );
}
