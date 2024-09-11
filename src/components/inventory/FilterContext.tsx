'use client';
import { createContext, useState, useEffect, ReactNode } from 'react';
import { SourceWithId } from '../../interfaces/Source';
import milliseconds from 'date-fns/milliseconds';

interface IContext {
  locations: string[];
  types: string[];
  sources: Map<string, SourceWithId>;
  refetchIndex: number;
}

export const FilterContext = createContext<IContext>({
  locations: [],
  types: [],
  sources: new Map<string, SourceWithId>(),
  refetchIndex: 0
});

export default function Context({
  sources,
  refetchIndex,
  children
}: {
  sources: Map<string, SourceWithId>;
  refetchIndex: number;
  children: ReactNode;
}) {
  const [locations, setLocations] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    const temp: { location: Set<string>; type: Set<string> } = {
      location: new Set<string>(),
      type: new Set<string>()
    };

    for (const source of sources.values()) {
      if (source.tags.location)
        temp.location.add(source.tags.location.toLowerCase());
      if (source.type) temp.type.add(source.type.toLowerCase());
    }
    setLocations(Array.from(temp.location));
    setTypes(Array.from(temp.type));
  }, [sources]);

  return (
    <FilterContext.Provider
      value={{
        locations,
        types,
        sources,
        refetchIndex
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
