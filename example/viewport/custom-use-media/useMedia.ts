import { useState, useEffect } from 'react';

function useMedia(query: string, defaultValue: any | null = null) {
  const isInBrowser = typeof window !== 'undefined' && window.matchMedia;

  const mq = isInBrowser ? window.matchMedia(query) : null;

  const getValue = () => mq?.matches;

  const [value, setValue] = useState(isInBrowser ? getValue : defaultValue);

  useEffect(() => {
    if (mq === null) {
      return;
    }

    const handler = () => setValue(getValue);

    mq.addEventListener('change', handler);

    return () => mq.removeEventListener('change', handler);
  }, []);

  return value;
}

export default useMedia;
