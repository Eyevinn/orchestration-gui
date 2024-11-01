import { useEffect, useRef } from 'react';

export default function useEffectNotOnMount(fn: () => void, inputs: any[]) {
  const isMountingRef = useRef(false);

  useEffect(() => {
    isMountingRef.current = true;
  }, []);

  useEffect(() => {
    if (!isMountingRef.current) {
      return fn();
    } else {
      isMountingRef.current = false;
    }
  }, inputs);
}
