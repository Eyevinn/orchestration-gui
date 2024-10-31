import React, { useEffect, useState } from 'react';
import { SourceWithId } from '../../interfaces/Source';
import videoSettings from '../../utils/videoSettings';
import { getHertz } from '../../utils/stream';
import { useTranslate } from '../../i18n/useTranslate';
import Icons from '../icons/Icons';
import NumbersRow from '../inventory/editView/AudioChannels/NumbersRow';
import Outputs from '../inventory/editView/AudioChannels/Outputs';
import { mapAudio } from '../../utils/audioMapping';
import { oneBased } from '../inventory/editView/AudioChannels/utils';
import capitalize from '../../utils/capitalize';
import { SourceListItemThumbnail } from './SourceListItemThumbnail';

type SourceListItemProps = {
  source: SourceWithId;
  action?: (source: SourceWithId) => void;
  actionText: string;
  disabled: unknown;
  locked: boolean;
};

function SourceListItem({
  source,
  action,
  disabled,
  locked,
  actionText
}: SourceListItemProps) {
  const t = useTranslate();

  const [outputRows, setOutputRows] = useState<
    { id: string; value: string }[][]
  >([]);

  const { video_stream: videoStream, audio_stream: audioStream } = source;
  const { width, height, frame_rate: frameRate } = videoStream || {};
  const { sample_rate: sampleRate, number_of_channels: numberOfChannels = 0 } =
    audioStream || {};

  const style = { textWrap: 'wrap' } as React.CSSProperties;

  const channelsInArray: number[] = [];
  for (let i = 1; i <= numberOfChannels; i++) {
    channelsInArray.push(i);
  }

  useEffect(() => {
    const audioMapping = source?.audio_stream.audio_mapping;

    if (audioMapping) {
      setOutputRows(() =>
        audioMapping.length
          ? mapAudio(oneBased(audioMapping), channelsInArray)
          : []
      );
    }
  }, [source?.audio_stream.audio_mapping]);

  return (
    <li
      className={`w-full items-center border-b border-gray-600 ${
        disabled ? 'bg-unclickable-bg' : 'hover:bg-zinc-700'
      } ${disabled || !action ? '' : 'hover:cursor-pointer'}`}
      style={{ boxSizing: 'border-box' }}
      onClick={() => (disabled || !action ? '' : action(source))}
    >
      <div className="flex">
        <div className="flex flex-row flex-1 items-center space-x-4 p-3 sm:pb-4">
          <SourceListItemThumbnail source={source} />
          <div
            style={style}
            className={`flex flex-col ${
              disabled ? 'text-unclickable-text' : 'text-p'
            }`}
          >
            <h2 className="text-sm mb-2">{source.name}</h2>
            <h2 className="text-sm">
              {t('source.type', { type: capitalize(source.type) })}
            </h2>
            <h2 className="text-sm">
              {t('source.location', {
                location:
                  source.tags.location === 'Unknown'
                    ? t('source.location_unknown')
                    : capitalize(source.tags.location)
              })}
            </h2>
            <h2 className="text-sm">
              {t('source.last_connected')}:{' '}
              {new Date(source.lastConnected).toLocaleString()}
            </h2>
            <h2 className="text-xs">
              {t('source.ingest', {
                ingest: source.ingest_name
              })}
            </h2>
            <h2 className="text-xs">
              {t('source.orig', {
                name: source.ingest_source_name
              })}
            </h2>
            {width && height ? (
              <h2 className="text-xs">
                {t('source.video', {
                  video: videoSettings(width, height, frameRate)
                })}
              </h2>
            ) : null}
            {sampleRate ? (
              <h2 className="text-xs mb-2">
                {t('source.audio', {
                  audio: getHertz(sampleRate)
                })}
              </h2>
            ) : null}

            {outputRows.length > 1 ? (
              <div className="text-gray-200 text-xs	 flex flex-col relative">
                <NumbersRow small numbers={channelsInArray} />
                {outputRows.map((contents, rowIndex) => (
                  <div className="flex" key={rowIndex}>
                    <Outputs
                      small
                      contents={contents}
                      outputRows={outputRows}
                      rowIndex={rowIndex}
                      max={channelsInArray[channelsInArray.length - 1]}
                      locked={locked}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex justify-center items-center relative">
          {actionText === 'edit' && (
            <Icons
              name="IconPencil"
              className={`absolute ${
                disabled ? 'text-unclickable-text' : 'text-brand'
              } r
              top-4 right-2 w-6`}
            />
          )}
          {actionText === 'add' && (
            <Icons
              name="IconPlus"
              className={`absolute ${
                disabled ? 'text-unclickable-text' : 'text-brand'
              } r
              top-4 right-2 w-6`}
            />
          )}
        </div>
      </div>
    </li>
  );
}

export default SourceListItem;
