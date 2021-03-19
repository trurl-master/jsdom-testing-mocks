import React from 'react';
import { render, act, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { mockViewport } from '../src/mocks/viewport';

import CustomUseMedia from '../example/viewport/custom-use-media/CustomUseMedia';

const VIEWPORT_DESKTOP = { width: '1440px', height: '900px' };
const VIEWPORT_MOBILE = { width: '320px', height: '568px' };

describe('It renders correctly on server, desktop and mobile', () => {
  it('works on the server', () => {
    render(<CustomUseMedia />);

    expect(screen.getByText('server')).toBeInTheDocument();
  });

  it('works on desktop', () => {
    const viewport = mockViewport(VIEWPORT_DESKTOP);

    render(<CustomUseMedia />);

    expect(screen.getByText('desktop')).toBeInTheDocument();

    viewport.cleanup();
  });

  it('works on mobile', () => {
    const viewport = mockViewport(VIEWPORT_MOBILE);

    render(<CustomUseMedia />);

    expect(screen.getByText('not desktop')).toBeInTheDocument();

    viewport.cleanup();
  });

  it('works on desktop and mobile, even if we change the viewport description', () => {
    const viewport = mockViewport(VIEWPORT_DESKTOP);

    render(<CustomUseMedia />);

    expect(screen.getByText('desktop')).toBeInTheDocument();
    expect(screen.queryByText('not desktop')).not.toBeInTheDocument();

    act(() => {
      viewport.set(VIEWPORT_MOBILE);
    });

    expect(screen.getByText('not desktop')).toBeInTheDocument();
    expect(screen.queryByText('desktop')).not.toBeInTheDocument();

    viewport.cleanup();
  });
});
