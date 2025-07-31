import { render, act, screen } from '@testing-library/react';

import {
  mockViewport,
  mockViewportForTestGroup,
  configMocks,
} from '../../../../dist';

import CustomUseMedia from './custom-use-media/CustomUseMedia';
import DeprecatedUseMedia from './deprecated-use-media/DeprecatedUseMedia';

const VIEWPORT_DESKTOP = { width: '1440px', height: '900px' };
const VIEWPORT_DESKTOP_EDGE = { width: '640px', height: '400px' };

const VIEWPORT_MOBILE = { width: '320px', height: '568px' };
const VIEWPORT_MOBILE_EDGE = { width: '639px', height: '400px' };

configMocks({ act });

describe('mockViewport', () => {
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

    it('changing viewport description triggers callbacks', () => {
      const viewport = mockViewport(VIEWPORT_DESKTOP);

      render(<CustomUseMedia />);

      expect(screen.getByText('desktop')).toBeInTheDocument();
      expect(screen.queryByText('not desktop')).not.toBeInTheDocument();

      viewport.set(VIEWPORT_MOBILE);

      expect(screen.getByText('not desktop')).toBeInTheDocument();
      expect(screen.queryByText('desktop')).not.toBeInTheDocument();

      viewport.cleanup();
    });

    it('changing viewport description triggers deprecated callbacks', () => {
      const viewport = mockViewport(VIEWPORT_DESKTOP);
      const cb = runner.fn();

      render(<DeprecatedUseMedia callback={cb} />);

      expect(screen.getByText('desktop')).toBeInTheDocument();
      expect(screen.queryByText('not desktop')).not.toBeInTheDocument();
      expect(cb).toHaveBeenCalledTimes(0);

      viewport.set(VIEWPORT_MOBILE);

      const [event] = cb.mock.calls[0] as [MediaQueryListEvent];

      expect(screen.getByText('not desktop')).toBeInTheDocument();
      expect(screen.queryByText('desktop')).not.toBeInTheDocument();
      expect(cb).toHaveBeenCalledTimes(1);
      expect(event).toBeInstanceOf(MediaQueryListEvent);
      expect(event.media).toBe('(min-width: 640px)');
      expect(event.matches).toBe(false);

      viewport.cleanup();
    });

    it('changing viewport description triggers callbacks with correct params', () => {
      const viewport = mockViewport(VIEWPORT_DESKTOP);
      const cb = runner.fn();

      render(<CustomUseMedia callback={cb} />);

      expect(screen.getByText('desktop')).toBeInTheDocument();
      expect(screen.queryByText('not desktop')).not.toBeInTheDocument();
      expect(cb).toHaveBeenCalledTimes(0);

      viewport.set(VIEWPORT_MOBILE);

      const [event] = cb.mock.calls[0] as [MediaQueryListEvent];

      expect(cb).toHaveBeenCalledTimes(1);
      expect(event).toBeInstanceOf(MediaQueryListEvent);
      expect(event.media).toBe('(min-width: 640px)');
      expect(event.matches).toBe(false);

      viewport.cleanup();
    });

    it('changing viewport description triggers callbacks (passed as object) with correct params', () => {
      const viewport = mockViewport(VIEWPORT_DESKTOP);
      const cb = runner.fn();

      render(<CustomUseMedia callback={cb} asObject />);

      expect(screen.getByText('desktop')).toBeInTheDocument();
      expect(screen.queryByText('not desktop')).not.toBeInTheDocument();
      expect(cb).toHaveBeenCalledTimes(0);

      viewport.set(VIEWPORT_MOBILE);

      const [event] = cb.mock.calls[0] as [MediaQueryListEvent];

      expect(cb).toHaveBeenCalledTimes(1);
      expect(event).toBeInstanceOf(MediaQueryListEvent);
      expect(event.media).toBe('(min-width: 640px)');
      expect(event.matches).toBe(false);

      viewport.cleanup();
    });

    it('triggers callbacks only when state actually changes', () => {
      const viewport = mockViewport(VIEWPORT_DESKTOP);
      const cb = runner.fn();

      render(<CustomUseMedia callback={cb} />);

      expect(screen.getByText('desktop')).toBeInTheDocument();
      expect(screen.queryByText('not desktop')).not.toBeInTheDocument();
      expect(cb).toHaveBeenCalledTimes(0);

      viewport.set(VIEWPORT_DESKTOP_EDGE);

      expect(screen.getByText('desktop')).toBeInTheDocument();
      expect(screen.queryByText('not desktop')).not.toBeInTheDocument();
      expect(cb).toHaveBeenCalledTimes(0);

      viewport.set(VIEWPORT_MOBILE_EDGE);

      expect(screen.getByText('not desktop')).toBeInTheDocument();
      expect(screen.queryByText('desktop')).not.toBeInTheDocument();
      expect(cb).toHaveBeenCalledTimes(1);

      viewport.set(VIEWPORT_MOBILE);

      expect(screen.getByText('not desktop')).toBeInTheDocument();
      expect(screen.queryByText('desktop')).not.toBeInTheDocument();
      expect(cb).toHaveBeenCalledTimes(1);

      viewport.cleanup();
    });

    it('works with multiple lists', () => {
      const viewport = mockViewport({ width: '600px' });
      const cb1 = runner.fn();
      const cb2 = runner.fn();

      render(
        <>
          <CustomUseMedia
            query="(min-width: 300px)"
            callback={cb1}
            messages={{ ok: '>=300px', ko: '<300px' }}
          />
          <CustomUseMedia
            query="(min-width: 500px)"
            callback={cb2}
            messages={{ ok: '>=500px', ko: '<500px' }}
          />
        </>
      );

      expect(screen.getByText('>=300px')).toBeInTheDocument();
      expect(screen.getByText('>=500px')).toBeInTheDocument();
      expect(cb1).toHaveBeenCalledTimes(0);
      expect(cb2).toHaveBeenCalledTimes(0);

      viewport.set({ width: '500px' });

      expect(screen.getByText('>=300px')).toBeInTheDocument();
      expect(screen.getByText('>=500px')).toBeInTheDocument();
      expect(cb1).toHaveBeenCalledTimes(0);
      expect(cb2).toHaveBeenCalledTimes(0);

      viewport.set({ width: '499px' });

      expect(screen.getByText('>=300px')).toBeInTheDocument();
      expect(screen.getByText('<500px')).toBeInTheDocument();
      expect(cb1).toHaveBeenCalledTimes(0);
      expect(cb2).toHaveBeenCalledTimes(1);

      viewport.set({ width: '300px' });

      expect(screen.getByText('>=300px')).toBeInTheDocument();
      expect(screen.getByText('<500px')).toBeInTheDocument();
      expect(cb1).toHaveBeenCalledTimes(0);
      expect(cb2).toHaveBeenCalledTimes(1);

      viewport.set({ width: '299px' });

      expect(screen.getByText('<300px')).toBeInTheDocument();
      expect(screen.getByText('<500px')).toBeInTheDocument();
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);

      viewport.set({ width: '600px' });

      expect(screen.getByText('>=300px')).toBeInTheDocument();
      expect(screen.getByText('>=500px')).toBeInTheDocument();
      expect(cb1).toHaveBeenCalledTimes(2);
      expect(cb2).toHaveBeenCalledTimes(2);

      viewport.cleanup();
    });
  });
});

describe('mockViewportForTestGroup', () => {
  describe('Desktop', () => {
    mockViewportForTestGroup(VIEWPORT_DESKTOP);

    it('works on desktop and mobile, even if we change the viewport description', () => {
      render(<CustomUseMedia />);

      expect(screen.getByText('desktop')).toBeInTheDocument();
      expect(screen.queryByText('not desktop')).not.toBeInTheDocument();
    });
  });

  describe('Mobile', () => {
    mockViewportForTestGroup(VIEWPORT_MOBILE);

    it('works on desktop and mobile, even if we change the viewport description', () => {
      render(<CustomUseMedia />);

      expect(screen.getByText('not desktop')).toBeInTheDocument();
      expect(screen.queryByText('desktop')).not.toBeInTheDocument();
    });
  });
});
