import { useState, useEffect, useCallback } from 'react';

function useMedia(
  query: string,
  defaultValue: boolean | null = null,
  options?:
    | {
        callback?: (this: MediaQueryList, ev: MediaQueryListEvent) => void;
        asObject: false;
      }
    | {
        callback?: (ev: MediaQueryListEvent) => void;
        asObject: true;
      }
) {
  const isInBrowser = typeof window !== 'undefined' && window.matchMedia;

  const mq = isInBrowser ? window.matchMedia(query) : null;

  const getValue = useCallback(() => mq?.matches, [mq?.matches]);

  const [value, setValue] = useState(isInBrowser ? getValue : defaultValue);

  useEffect(() => {
    if (mq === null) {
      return;
    }

    if (options?.asObject) {
      const handler = {
        handleEvent: (ev: MediaQueryListEvent) => {
          setValue(getValue);

          options?.callback?.(ev);
        },
      };

      mq.addEventListener('change', handler);

      return () => mq.removeEventListener('change', handler);
    }

    function handler(this: MediaQueryList, ev: MediaQueryListEvent) {
      setValue(getValue);

      options?.callback?.call(this, ev);
    }

    mq.addEventListener('change', handler);

    return () => mq.removeEventListener('change', handler);
  }, [getValue, mq, options]);

  return value;
}

export default useMedia;
