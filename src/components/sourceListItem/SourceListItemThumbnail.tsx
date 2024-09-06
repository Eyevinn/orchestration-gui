import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Source, SourceWithId } from '../../interfaces/Source';
import { getSourceThumbnail } from '../../utils/source';
import { IconExclamationCircle } from '@tabler/icons-react';
import Icons from '../icons/Icons';

type SourceThumbnailProps = { source: SourceWithId };

export const SourceListItemThumbnail = (props: SourceThumbnailProps) => {
  const { source } = props;
  const sourceThumbnail = useMemo(() => {
    return getSourceThumbnail(source);
  }, [source]);
  const [loaded, setLoaded] = useState(false);

  const getIcon = (source: Source) => {
    const isGone = source.status === 'gone';
    const className = isGone ? 'text-error' : 'text-brand';

    const types = {
      camera: (
        <Icons
          name={isGone ? 'IconVideoOff' : 'IconVideo'}
          className={className}
        />
      ),
      microphone: (
        <Icons
          name={isGone ? 'IconMicrophone2Off' : 'IconMicrophone2'}
          className={className}
        />
      ),
      graphics: (
        <Icons
          name={isGone ? 'IconVectorOff' : 'IconVector'}
          className={className}
        />
      )
    };

    return types[source.type];
  };

  return (
    <div className="w-60 min-h-full flex flex-col items-center justify-around">
      <div className="relative left-0 z-50 aspect-video min-w-full overflow-hidden border rounded-lg bg-zinc-700">
        <div className="absolute top-4 left-4">{getIcon(source)}</div>
        {(sourceThumbnail &&
          source.status !== 'gone' &&
          source.type === 'camera' && (
            <Image
              alt="Source Listem Item Thumbnail"
              className={`transition-opacity opacity-0 ${
                loaded ? 'opacity-100' : ''
              }`}
              src={sourceThumbnail}
              onLoadingComplete={() => setLoaded(true)}
              placeholder="empty"
              width={0}
              height={0}
              sizes="20vh"
              style={{
                width: 'auto',
                height: '100%'
              }}
            />
          )) || (
          <IconExclamationCircle className="relative z-50 text-error fill-white w-full h-full opacity-100" />
        )}
      </div>
    </div>
  );
};
