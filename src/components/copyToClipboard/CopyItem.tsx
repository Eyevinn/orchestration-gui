'use client';

import React, { useEffect, useRef } from 'react';
import LaunchMultiview from '../launchMultiview/LaunchMultiview';
import Icons from '../icons/Icons';
import { useTranslate } from '../../i18n/useTranslate';
import { WhepMultiview } from '../../interfaces/whep';
import { LaunchWebMultiview } from '../launchMultiview/LaunchWebMultiview';
import { SrtOutput } from '../../interfaces/pipeline';

type CopyState = 'READY' | 'SUCCESS' | 'ERROR';
type ProductionInfoProps = {
  srtStream: SrtOutput;
  isMulti?: boolean;
  viewer?: WhepMultiview;
};

export const CopyItem = ({
  srtStream,
  isMulti,
  viewer
}: ProductionInfoProps) => {
  const [state, setState] = React.useState<CopyState>('READY');

  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const t = useTranslate();

  const handleCopyResult = (result: CopyState) => {
    setState(result);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setState('READY'), 3000);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  const copy = (valueToCopy: string) => {
    if ('clipboard' in navigator) {
      navigator.clipboard
        .writeText(valueToCopy)
        .then(() => {
          handleCopyResult('SUCCESS');
        })
        .catch(() => {
          console.log('Something went wrong copying:', valueToCopy);
          handleCopyResult('ERROR');
        });
    } else {
      console.log('Clipboard API not available:', valueToCopy);
      handleCopyResult('ERROR');
    }
  };

  return (
    <div className="flex flex-row items-center w-28">
      <div className="flex flex-row items-center">
        <Icons
          name={
            isMulti
              ? 'IconLayoutBoardSplit'
              : srtStream.srt_mode === 'listener'
              ? 'IconDeviceTv'
              : 'IconCast'
          }
          className="bg-transpired text-p w-5"
        />
        <p className="text-p text-xs pr-1 w-14">
          {state === 'READY'
            ? srtStream.url.split(':').pop()
            : t(state === 'ERROR' ? 'not_copied' : 'copied')}
        </p>
        <button
          type="button"
          className="pl-2"
          onClick={() => {
            copy(srtStream.url);
          }}
        >
          <Icons
            name={state === 'ERROR' ? 'IconCopyOff' : 'IconCopy'}
            className={`bg-transpired text-${
              state === 'READY' ? 'p' : 'unclickable-text'
            } w-5`}
          />
        </button>
        {isMulti && !viewer?.whepUrl ? (
          <LaunchMultiview multiviews={srtStream.url} />
        ) : null}
        {isMulti && viewer?.whepUrl ? (
          <LaunchWebMultiview viewer={viewer} />
        ) : null}
      </div>
    </div>
  );
};

export default CopyItem;
