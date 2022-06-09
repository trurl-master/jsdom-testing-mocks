import * as React from 'react';
import { useState, useEffect } from 'react';

function useMedia(
  query: string,
  defaultValue: any | null = null,
  callback?: (this: MediaQueryList, ev: MediaQueryListEvent) => any
) {
  const isInBrowser = typeof window !== 'undefined' && window.matchMedia;

  const mq = isInBrowser ? window.matchMedia(query) : null;

  const getValue = () => mq?.matches;

  const [value, setValue] = useState(isInBrowser ? getValue : defaultValue);

  useEffect(() => {
    if (mq === null) {
      return;
    }

    function handler(this: MediaQueryList, ev: MediaQueryListEvent) {
      setValue(getValue);

      callback?.call(this, ev);
    }

    mq.addListener(handler);

    return () => mq.removeListener(handler);
  }, []);

  return value;
}

const DeprecatedCustomUseMedia = ({
  query = '(min-width: 640px)',
  callback,
  messages: { ok = 'desktop', ko = 'not desktop' } = {
    ok: 'desktop',
    ko: 'not desktop',
  },
}: {
  query?: string;
  callback?: () => void;
  messages?: { ok: string; ko: string };
}) => {
  const doesMatch = useMedia(query, null, callback);

  if (doesMatch === null) {
    return <div>server</div>;
  }

  return <div>{doesMatch ? ok : ko}</div>;
};

export default DeprecatedCustomUseMedia;
