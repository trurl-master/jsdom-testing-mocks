import React from 'react'

import useMedia from './useMedia'

const Component = () => {
  const isDesktop = useMedia('(min-width: 1280px)')

  if (isDesktop === null) {
    return <div>server</div>
  }

  return <div>{isDesktop ? 'desktop' : 'not desktop'}</div>
}

export default Component
