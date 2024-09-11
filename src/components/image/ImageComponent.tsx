import {
  PropsWithChildren,
  SyntheticEvent,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import Image from 'next/image';
import { FilterContext } from '../inventory/FilterContext';
import { IconExclamationCircle } from '@tabler/icons-react';
import { Loader } from '../loader/Loader';

interface ImageComponentProps extends PropsWithChildren {
  src: string;
  alt?: string;
}

const ImageComponent: React.FC<ImageComponentProps> = (props) => {
  const { src, alt = 'Image', children } = props;
  const { refetchIndex } = useContext(FilterContext);
  const [imgSrc, setImgSrc] = useState<string>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<SyntheticEvent<HTMLImageElement, Event>>();
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  useEffect(() => {
    setImgSrc(`${src}?refetch=${refetchIndex}}`);
    setError(undefined);
    setLoading(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setLoading(false), 500);
  }, [refetchIndex]);

  useEffect(() => {
    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  return (
    <div className="relative z-50 aspect-video min-w-full overflow-hidden border rounded-lg bg-zinc-700">
      {((!imgSrc || error) && (
        <IconExclamationCircle className="text-error fill-white w-full h-full" />
      )) || (
        <>
          <Image
            alt={alt}
            className={`transition-opacity opacity-0 ${
              loaded && !loading ? 'opacity-100' : ''
            }`}
            src={imgSrc!}
            onLoad={() => {
              setError(undefined);
              setLoaded(false);
            }}
            onLoadingComplete={() => {
              setLoaded(true);
            }}
            onError={(err) => {
              setError(err);
            }}
            placeholder="empty"
            width={0}
            height={0}
            sizes="20vh"
            style={{
              width: 'auto',
              height: '100%'
            }}
          />
          <Loader
            className={`absolute top-1/2 left-1/2 w-1/3 h-1/3 -translate-x-1/2 -translate-y-1/2 transition-opacity opacity-0 ${
              loading || !loaded ? 'opacity-100' : ''
            }`}
          />
        </>
      )}
      {children}
    </div>
  );
};

export default ImageComponent;
