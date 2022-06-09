import * as React from 'react';

import useMedia from './useMedia';

const CustomUseMedia = ({
  query = '(min-width: 640px)',
  callback,
  asObject = false,
  messages: { ok = 'desktop', ko = 'not desktop' } = {
    ok: 'desktop',
    ko: 'not desktop',
  },
}: {
  query?: string;
  callback?: () => void;
  asObject?: boolean;
  messages?: { ok: string; ko: string };
}) => {
  const doesMatch = useMedia(query, null, { callback, asObject });

  if (doesMatch === null) {
    return <div>server</div>;
  }

  return <div>{doesMatch ? ok : ko}</div>;
};

export default CustomUseMedia;
