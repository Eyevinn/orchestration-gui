'use client';

import { useState } from 'react';
import styles from './../../sourceList/SourceList.module.scss';
import { IconX } from '@tabler/icons-react';
import { SourceWithId } from '../../../interfaces/Source';
import SourceListItem from '../../sourceListItem/SourceListItem';
import FilterContext from '../../../contexts/FilterContext';
import FilterOptions from '../../filter/FilterOptions';

interface SourceListProps {
  sources: Map<string, SourceWithId>;
  inventoryVisible?: boolean;
  onClose?: () => void;
  isDisabledFunc?: (source: SourceWithId) => boolean;
  action?: (source: SourceWithId) => void;
  actionText?: string;
  locked: boolean;
}

const ProductionSourceList: React.FC<SourceListProps> = (props) => {
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
      return (
        <SourceListItem
          actionText={actionText}
          key={`${source.ingest_source_name}-${index}`}
          source={source}
          disabled={isDisabledFunc?.(source)}
          action={action}
          locked={locked}
          className="w-[50%]"
        />
      );
    });
  }

  return (
    <FilterContext sources={sources}>
      <div className="flex h-full flex-row w-full">
        <div
          className={
            inventoryVisible
              ? `${styles.no_scrollbar} w-full max-h-[50vh]`
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
                <button className="flex h-12 justify-end">
                  <IconX
                    className="h-full w-8 ml-2 text-brand"
                    onClick={onClose}
                  />
                </button>
              )}
            </div>
            <ul
              className={`flex flex-row border-t border-gray-600 overflow-auto h-full ${styles.no_scrollbar} flex-wrap`}
            >
              {getSourcesToDisplay(filteredSources)}
            </ul>
          </div>
        </div>
      </div>
    </FilterContext>
  );
};

export default ProductionSourceList;
