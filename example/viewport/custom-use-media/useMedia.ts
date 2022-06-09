import { useState, useEffect } from 'react';

function useMedia(
  query: string,
  defaultValue: any | null = null,
  options?:
    | {
        callback?: (this: MediaQueryList, ev: MediaQueryListEvent) => any;
        asObject: false;
      }
    | {
        callback?: (ev: MediaQueryListEvent) => any;
        asObject: true;
      }
) {
  const isInBrowser = typeof window !== 'undefined' && window.matchMedia;

  const mq = isInBrowser ? window.matchMedia(query) : null;

  const getValue = () => mq?.matches;

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
  }, []);

  return value;
}

export default useMedia;
