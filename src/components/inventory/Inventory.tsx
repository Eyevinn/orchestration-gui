'use client';

import { useEffect, useState } from 'react';
import { useSources, useUpdateSources } from '../../hooks/sources/useSources';
import { useSetSourceToPurge } from '../../hooks/sources/useSetSourceToPurge';
import { SourceWithId, SrtSource } from '../../interfaces/Source';
import EditView from './editView/EditView';
import SourceList from '../sourceList/SourceList';
import { useTranslate } from '../../i18n/useTranslate';
import { useRemoveInventorySourceItem } from '../../hooks/sources/useRemoveInventorySource';
import { useCreateSrtSource } from '../../hooks/sources/useCreateSrtSource';
import { AddSrtModal } from '../modal/addSrtModal/AddSrtModal';
import { IconReload } from '@tabler/icons-react';
import { Loader } from '../loader/Loader';

export default function Inventory({ locked }: { locked: boolean }) {
  const [showSrtModal, setShowSrtModal] = useState<boolean>(false);
  const [updatedSource, setUpdatedSource] = useState<
    SourceWithId | undefined
  >();
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [currentSource, setCurrentSource] = useState<SourceWithId | null>();

  const [purgeInventorySource, reloadList] = useSetSourceToPurge();
  const [removeInventorySourceItem, reloadInventoryList] =
    useRemoveInventorySourceItem();
  const [createSrtSource, reloadSourceList] = useCreateSrtSource();
  const [sources, loadingSources] = useSources(
    reloadList || reloadInventoryList || reloadSourceList || !!refreshKey,
    updatedSource,
    refreshKey
  );
  const [updateSources, updateSourcesLoading] = useUpdateSources();
  const t = useTranslate();

  useEffect(() => {
    if (updatedSource && typeof updatedSource !== 'boolean') {
      setCurrentSource(updatedSource);
    }
  }, [updatedSource]);

  useEffect(() => {
    if (reloadList || reloadInventoryList) {
      setCurrentSource(null);
    }
  }, [reloadList, reloadInventoryList]);

  const editSource = (source: SourceWithId) => {
    setCurrentSource(source);
  };

  const handleCreateSrtSource = (
    ingestUuid: string,
    srtPayload: SrtSource,
    callback: () => void
  ) => {
    createSrtSource(ingestUuid, srtPayload).then(() => {
      callback();
    });
  };

  const handleRefreshInventory = async () => {
    await updateSources();
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <div className="flex flex-row space-x-4">
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
        <button
          className="bg-zinc-600 px-2 rounded hover:bg-zinc-500"
          onClick={handleRefreshInventory}
        >
          <div className="flex flex-row space-x-2">
            <p className="text-p font-semibold">
              {t('inventory_list.refresh_inventory')}
            </p>
            {updateSourcesLoading || loadingSources ? (
              <Loader />
            ) : (
              <IconReload color="white" />
            )}
          </div>
        </button>
      </div>
      <div className="flex h-full">
        <SourceList
          sources={sources}
          action={editSource}
          actionText={'edit'}
          locked={locked}
        />
        {currentSource ? (
          <div className={`ml-2 mt-2 rounded self-start`}>
            <EditView
              locked={locked}
              source={currentSource}
              updateSource={(source) => setUpdatedSource(source)}
              close={() => setCurrentSource(null)}
              purgeInventorySource={purgeInventorySource}
              removeInventorySourceItem={removeInventorySourceItem}
            />
          </div>
        ) : null}
      </div>
      <AddSrtModal
        open={showSrtModal}
        onConfirm={handleCreateSrtSource}
        onAbort={() => setShowSrtModal(false)}
      />
    </>
  );
}
