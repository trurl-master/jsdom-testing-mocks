import React from 'react'
import { render, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import { mockViewport } from '../../../src/mocks/viewport'

import Component from './Component'

const VIEWPORT_DESKTOP = { width: '1440px', height: '900px' }
const VIEWPORT_MOBILE = { width: '320px', height: '568px' }

describe('It renders correctly on server, desktop and mobile', () => {
  it('works on the server', () => {
    const { getByText } = render(<Component />)

    expect(getByText('server')).toBeInTheDocument()
  })

  it('works on desktop', () => {
    const viewport = mockViewport(VIEWPORT_DESKTOP)

    const { getByText } = render(<Component />)

    expect(getByText('desktop')).toBeInTheDocument()

    viewport.cleanup()
  })

  it('works on mobile', () => {
    const viewport = mockViewport(VIEWPORT_MOBILE)

    const { getByText } = render(<Component />)

    expect(getByText('not desktop')).toBeInTheDocument()

    viewport.cleanup()
  })

  it('works on desktop and mobile, even if we change the viewport description', () => {
    const viewport = mockViewport(VIEWPORT_DESKTOP)

    const { getByText, queryByText } = render(<Component />)

    expect(getByText('desktop')).toBeInTheDocument()
    expect(queryByText('not desktop')).not.toBeInTheDocument()

    act(() => {
      viewport.set(VIEWPORT_MOBILE)
    })

    expect(getByText('not desktop')).toBeInTheDocument()
    expect(queryByText('desktop')).not.toBeInTheDocument()

    viewport.cleanup()
  })
})
