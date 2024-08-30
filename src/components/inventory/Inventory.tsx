'use client';

import { useEffect, useState } from 'react';
import { useSources } from '../../hooks/sources/useSources';
import FilterOptions from '../../components/filter/FilterOptions';
import SourceListItem from '../../components/sourceListItem/SourceListItem';
import { SourceWithId } from '../../interfaces/Source';
import EditView from './editView/EditView';
import FilterContext from './FilterContext';
import { useDeleteSource } from '../../hooks/sources/useDeleteSource';
import styles from './Inventory.module.scss';

export default function Inventory() {
  const [deleteSource, deleteComplete] = useDeleteSource();
  const [updatedSource, setUpdatedSource] = useState<
    SourceWithId | undefined
  >();
  const [sources] = useSources(deleteComplete, updatedSource);
  const [currentSource, setCurrentSource] = useState<SourceWithId | null>();
  const [filteredSources, setFilteredSources] =
    useState<Map<string, SourceWithId>>(sources);

  const inventoryVisible = true;

  useEffect(() => {
    if (updatedSource && typeof updatedSource !== 'boolean') {
      setCurrentSource(updatedSource);
    }
  }, [updatedSource]);

  useEffect(() => {
    if (deleteComplete) {
      setCurrentSource(null);
    }
  }, [deleteComplete]);

  const editSource = (source: SourceWithId) => {
    setCurrentSource(() => source);
  };

  function getSourcesToDisplay(
    filteredSources: Map<string, SourceWithId>
  ): React.ReactNode {
    return Array.from(
      filteredSources.size > 0 ? filteredSources.values() : sources.values()
    ).map((source, index) => {
      if (source.status !== 'purge') {
        return (
          <SourceListItem
            edit
            key={`${source.ingest_source_name}-${index}`}
            source={source}
            disabled={false}
            action={(source) => {
              editSource(source);
            }}
          />
        );
      }
    });
  }

  return (
    <FilterContext sources={sources}>
      <div className="flex h-[93%] flex-row">
        <div
          className={
            inventoryVisible
              ? `${
                  styles.no_scrollbar
                }  min-w-fit overflow-hidden max-w-2xl transition-[width] ml-2 mt-2 max-h-[89vh]
          ${currentSource ? 'w-[30%]' : 'w-[50%]'}`
              : 'hidden'
          }
        >
          <div className="p-3 bg-container rounded break-all h-full">
            <div className="mb-1">
              <FilterOptions
                onFilteredSources={(filtered: Map<string, SourceWithId>) =>
                  setFilteredSources(new Map<string, SourceWithId>(filtered))
                }
              />
            </div>
            <ul
              className={`flex flex-col border-t border-gray-600 overflow-scroll h-[95%] ${styles.no_scrollbar}`}
            >
              {getSourcesToDisplay(filteredSources)}
            </ul>
          </div>
        </div>

        {currentSource ? (
          <div
            className={`p-3 ml-2 mt-2 bg-container rounded h-[60%] min-w-max`}
          >
            <EditView
              source={currentSource}
              updateSource={(source) => setUpdatedSource(source)}
              close={() => setCurrentSource(null)}
              deleteInventorySource={(source) => deleteSource(source)}
            />
          </div>
        ) : null}
      </div>
    </FilterContext>
  );
}
