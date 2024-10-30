'use client';

import { useState } from 'react';
import { SourceWithId } from '../../interfaces/Source';
import FilterContext from '../../contexts/FilterContext';
import SourceListItem from '../sourceListItem/SourceListItem';
import FilterOptions from '../filter/FilterOptions';
import styles from './SourceList.module.scss';
import { IconX } from '@tabler/icons-react';

interface SourceListProps {
  sources: Map<string, SourceWithId>;
  inventoryVisible?: boolean;
  onClose?: () => void;
  isDisabledFunc?: (source: SourceWithId) => boolean;
  action?: (source: SourceWithId) => void;
  actionText: string;
  locked: boolean;
}

const SourceList: React.FC<SourceListProps> = (props) => {
  const {
    sources,
    inventoryVisible = true,
    onClose,
    isDisabledFunc,
    action,
    actionText,
    locked
  } = props;

  const [filteredSources, setFilteredSources] =
    useState<Map<string, SourceWithId>>(sources);

  function getSourcesToDisplay(
    filteredSources: Map<string, SourceWithId>
  ): React.ReactNode {
    return Array.from(
      filteredSources.size >= 0 ? filteredSources.values() : sources.values()
    ).map((source, index) => {
      if (source.status !== 'purge') {
        return (
          <SourceListItem
            actionText={actionText}
            key={`${source.ingest_source_name}-${index}`}
            source={source}
            disabled={isDisabledFunc?.(source)}
            action={action}
            locked={locked}
          />
        );
      }
    });
  }

  return (
    <FilterContext sources={sources}>
      <div className="flex h-full flex-row">
        <div
          className={
            inventoryVisible
              ? `${styles.no_scrollbar} min-w-fit overflow-hidden max-w-2xl transition-[width] ml-2 mt-2 w-[50%]`
              : 'hidden'
          }
        >
          <div className="p-3 bg-container rounded break-all h-full">
            <div className="flex justify-between mb-1">
              <FilterOptions
                onFilteredSources={(filtered: Map<string, SourceWithId>) =>
                  setFilteredSources(new Map<string, SourceWithId>(filtered))
                }
              />
              {onClose && (
                <button className="flex justify-end">
                  <IconX
                    className="h-full w-8 ml-2 text-brand"
                    onClick={onClose}
                  />
                </button>
              )}
            </div>
            <ul
              className={`flex flex-col border-t border-gray-600 overflow-y-auto h-[calc(100vh-14rem)] ${styles.no_scrollbar}`}
            >
              {getSourcesToDisplay(filteredSources)}
            </ul>
          </div>
        </div>
      </div>
    </FilterContext>
  );
};

export default SourceList;
