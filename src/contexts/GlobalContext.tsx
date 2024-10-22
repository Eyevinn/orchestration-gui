'use client';

import { SessionProvider } from 'next-auth/react';
import { createContext, useState, PropsWithChildren } from 'react';

interface IGlobalContext {
  locked: boolean;
  imageRefetchKey: number;
  refetchImages: () => void;
  toggleLocked: () => void;
}

export const GlobalContext = createContext<IGlobalContext>({
  locked: false,
  imageRefetchKey: 0,
  refetchImages: () => {
    // outsmarting lint
  },
  toggleLocked: () => {
    // outsmarting lint
  }
});

export const GlobalContextProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [locked, setLocked] = useState<boolean>(true);
  const [imageRefetchKey, setImageRefetchKey] = useState<number>(
    new Date().getTime()
  );

  const refetchImages = () => {
    setImageRefetchKey(new Date().getTime());
  };

  const toggleLocked = () => {
    setLocked(!locked);
  };

  return (
    <SessionProvider>
      <GlobalContext.Provider
        value={{
          locked,
          imageRefetchKey,
          refetchImages,
          toggleLocked
        }}
      >
        {children}
      </GlobalContext.Provider>
    </SessionProvider>
  );
};
