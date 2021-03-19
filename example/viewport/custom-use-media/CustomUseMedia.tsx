import * as React from 'react';

import useMedia from './useMedia';

const CustomUseMedia = () => {
  const isDesktop = useMedia('(min-width: 640px)');

  if (isDesktop === null) {
    return <div>server</div>;
  }

  return <div>{isDesktop ? 'desktop' : 'not desktop'}</div>;
};

export default CustomUseMedia;
