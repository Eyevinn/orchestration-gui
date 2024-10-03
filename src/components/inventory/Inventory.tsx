'use client';

import { useEffect, useState } from 'react';
import { useSources } from '../../hooks/sources/useSources';
import { useSetSourceToPurge } from '../../hooks/sources/useSetSourceToPurge';
import { SourceWithId } from '../../interfaces/Source';
import EditView from './editView/EditView';
import SourceList from '../sourceList/SourceList';
import { useTranslate } from '../../i18n/useTranslate';
import { useRemoveInventorySourceItem } from '../../hooks/sources/useRemoveInventorySource';

export default function Inventory({ locked }: { locked: boolean }) {
  const [purgeInventorySource, reloadList] = useSetSourceToPurge();
  const [removeInventorySourceItem, reloadInventoryList] =
    useRemoveInventorySourceItem();
  const [updatedSource, setUpdatedSource] = useState<
    SourceWithId | undefined
  >();
  const [sources] = useSources(
    reloadList || reloadInventoryList,
    updatedSource
  );
  const [currentSource, setCurrentSource] = useState<SourceWithId | null>();
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
  return (
    <div className="flex h-full">
      <SourceList
        sources={sources}
        action={editSource}
        actionText={t('inventory_list.edit')}
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
  );
}
