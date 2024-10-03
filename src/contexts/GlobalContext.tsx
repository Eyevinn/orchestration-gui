'use client';

import { SessionProvider } from 'next-auth/react';
import { createContext, useState, PropsWithChildren } from 'react';

interface IGlobalContext {
  locked: boolean;
  imageRefetchIndex: number;
  incrementImageRefetchIndex: () => void;
  toggleLocked: () => void;
}

export const GlobalContext = createContext<IGlobalContext>({
  locked: false,
  imageRefetchIndex: 0,
  incrementImageRefetchIndex: () => {
    // outsmarting lint
  },
  toggleLocked: () => {
    // outsmarting lint
  }
});

export const GlobalContextProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [locked, setLocked] = useState<boolean>(false);
  const [imageRefetchIndex, setImageRefetchIndex] = useState<number>(0);

  const incrementImageRefetchIndex = () => {
    setImageRefetchIndex(imageRefetchIndex + 1);
  };

  const toggleLocked = () => {
    setLocked(!locked);
  };

  return (
    <SessionProvider>
      <GlobalContext.Provider
        value={{
          locked,
          imageRefetchIndex,
          incrementImageRefetchIndex,
          toggleLocked
        }}
      >
        {children}
      </GlobalContext.Provider>
    </SessionProvider>
  );
};
