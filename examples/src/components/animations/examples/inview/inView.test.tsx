import { render, act, screen, waitFor } from '@testing-library/react';

import {
  mockIntersectionObserver,
  mockAnimationsApi,
} from '../../../../../../dist';

import InView from './InView';

const io = mockIntersectionObserver();
mockAnimationsApi();

describe('Animations/InView', () => {
  it('works with real timers', async () => {
    render(<InView />);

    // first section

    expect(screen.getByText('Scroll')).not.toBeVisible();

    act(() => {
      io.enterNode(screen.getByTestId('section1'));
    });

    await waitFor(() => {
      expect(screen.getByText('Scroll')).toBeVisible();
    });

    // second section
    expect(screen.getByText('to')).not.toBeVisible();

    act(() => {
      io.enterNode(screen.getByTestId('section2'));
    });

    await waitFor(() => {
      expect(screen.getByText('to')).toBeVisible();
    });

    // third section
    expect(screen.getByText('trigger')).not.toBeVisible();

    act(() => {
      io.enterNode(screen.getByTestId('section3'));
    });

    await waitFor(() => {
      expect(screen.getByText('trigger')).toBeVisible();
    });

    // fourth section
    expect(screen.getByText('animations!')).not.toBeVisible();

    act(() => {
      io.enterNode(screen.getByTestId('section4'));
    });

    await waitFor(() => {
      expect(screen.getByText('animations!')).toBeVisible();
    });
  });

  it('works with fake timers', async () => {
    runner.useFakeTimers();
    
    render(<InView />);

    // Mock element dimensions for visibility detection in jsdom
    document.querySelectorAll('span').forEach(span => {
      Object.defineProperty(span, 'offsetWidth', { value: 100 });
      Object.defineProperty(span, 'offsetHeight', { value: 50 });
    });

    // first section
    expect(screen.getByText('Scroll')).not.toBeVisible();

    act(() => {
      io.enterNode(screen.getByTestId('section1'));
      runner.advanceTimersByTime(1200); // Complete animation (200ms delay + 900ms duration + buffer)
    });

    await waitFor(() => {
      expect(screen.getByText('Scroll')).toBeVisible();
    });

    // second section
    expect(screen.getByText('to')).not.toBeVisible();

    act(() => {
      io.enterNode(screen.getByTestId('section2'));
      runner.advanceTimersByTime(1200);
    });

    await waitFor(() => {
      expect(screen.getByText('to')).toBeVisible();
    });

    // third section
    expect(screen.getByText('trigger')).not.toBeVisible();

    act(() => {
      io.enterNode(screen.getByTestId('section3'));
      runner.advanceTimersByTime(1200);
    });

    await waitFor(() => {
      expect(screen.getByText('trigger')).toBeVisible();
    });

    // fourth section
    expect(screen.getByText('animations!')).not.toBeVisible();

    act(() => {
      io.enterNode(screen.getByTestId('section4'));
      runner.advanceTimersByTime(1200);
    });

    await waitFor(() => {
      expect(screen.getByText('animations!')).toBeVisible();
    });
  });
});