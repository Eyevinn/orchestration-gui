'use client';

import React from 'react';
import CopyItem from './CopyItem';
import { WhepMultiview } from '../../interfaces/whep';
import { SrtOutput } from '../../interfaces/pipeline';

interface ISrtValue {
  isMulti?: boolean;
  value: SrtOutput;
  viewer?: WhepMultiview;
}
interface ICopyToClipboard {
  allSrtUrls: ISrtValue[];
}

export const CopyToClipboard = ({ allSrtUrls }: ICopyToClipboard) => {
  return (
    <div className="flex flex-col">
      {allSrtUrls.map(({ value, isMulti, viewer }) => (
        <CopyItem
          isMulti={isMulti}
          key={value.url}
          srtStream={value}
          viewer={viewer}
        />
      ))}
    </div>
  );
};

export default CopyToClipboard;
