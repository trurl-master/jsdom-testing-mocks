import { render, act, screen } from '@testing-library/react';

import {
  mockIntersectionObserver,
  MockedIntersectionObserver,
} from '../../../src';

import type { IntersectionDescription } from '../../../src';

import App, {
  Section,
} from '../components/intersection-observer/global-observer/GlobalObserver';

const io = mockIntersectionObserver();

describe('Section is intersecting', () => {
  it('should render the initial state correctly', () => {
    render(<Section number={1} />);

    expect(
      screen.getByText('A section 1 - not intersecting')
    ).toBeInTheDocument();
  });

  it('should work correctly when entering and leaving an intersection zone', () => {
    const cb = jest.fn();
    render(<Section number={1} callback={cb} />);

    act(() => {
      io.enterNode(screen.getByText('A section 1 - not intersecting'));
    });

    expect(screen.getByText('A section 1 - intersecting')).toBeInTheDocument();
    const [entries1, observer1] = cb.mock.calls[0];

    expect(cb).toHaveBeenCalledTimes(1);
    expect(entries1).toHaveLength(1);
    expect(entries1[0]).toEqual(
      expect.objectContaining({
        intersectionRatio: 1,
        isIntersecting: true,
      })
    );
    expect(entries1[0].target).toBe(
      screen.getByText('A section 1 - intersecting')
    );
    expect(observer1).toBeInstanceOf(MockedIntersectionObserver);

    act(() => {
      io.leaveNode(screen.getByText('A section 1 - intersecting'));
    });

    expect(
      screen.getByText('A section 1 - not intersecting')
    ).toBeInTheDocument();

    const [entries2, observer2] = cb.mock.calls[1];
    expect(cb).toHaveBeenCalledTimes(2);
    expect(entries2).toHaveLength(1); // Number of entries
    expect(entries2[0]).toEqual(
      expect.objectContaining({
        intersectionRatio: 0,
        isIntersecting: false,
      })
    );
    expect(observer2).toBeInstanceOf(MockedIntersectionObserver);
  });

  it('should not override isIntersected, but allow overriding other params', () => {
    const cb = jest.fn();
    render(<Section number={1} callback={cb} />);

    act(() => {
      io.enterNode(screen.getByText('A section 1 - not intersecting'), {
        isIntersecting: false,
        intersectionRatio: 0.5,
      });
    });

    const [entries1] = cb.mock.calls[0];

    expect(entries1[0]).toEqual(
      expect.objectContaining({
        intersectionRatio: 0.5,
        isIntersecting: true,
      })
    );

    act(() => {
      io.leaveNode(screen.getByText('A section 1 - intersecting'), {
        isIntersecting: true,
        intersectionRatio: 0.5,
      });
    });

    const [entries2] = cb.mock.calls[1];
    expect(entries2[0]).toEqual(
      expect.objectContaining({
        intersectionRatio: 0.5,
        isIntersecting: false,
      })
    );
  });

  it('should enter all nodes at once', () => {
    render(<App />);

    act(() => {
      io.enterAll();
    });

    expect(
      screen.getAllByText(/A section/).map((node) => node.textContent)
    ).toEqual([
      'A section 0 - intersecting',
      'A section 1 - intersecting',
      'A section 2 - intersecting',
      'A section 3 - intersecting',
      'A section 4 - intersecting',
      'A section 5 - intersecting',
      'A section 6 - intersecting',
      'A section 7 - intersecting',
      'A section 8 - intersecting',
      'A section 9 - intersecting',
    ]);
  });

  it('should enter and leave all nodes at once', () => {
    render(<App />);

    act(() => {
      io.enterAll();
    });

    expect(
      screen.getAllByText(/A section/).map((node) => node.textContent)
    ).toEqual([
      'A section 0 - intersecting',
      'A section 1 - intersecting',
      'A section 2 - intersecting',
      'A section 3 - intersecting',
      'A section 4 - intersecting',
      'A section 5 - intersecting',
      'A section 6 - intersecting',
      'A section 7 - intersecting',
      'A section 8 - intersecting',
      'A section 9 - intersecting',
    ]);

    act(() => {
      io.leaveAll();
    });

    expect(
      screen.getAllByText(/A section/).map((node) => node.textContent)
    ).toEqual([
      'A section 0 - not intersecting',
      'A section 1 - not intersecting',
      'A section 2 - not intersecting',
      'A section 3 - not intersecting',
      'A section 4 - not intersecting',
      'A section 5 - not intersecting',
      'A section 6 - not intersecting',
      'A section 7 - not intersecting',
      'A section 8 - not intersecting',
      'A section 9 - not intersecting',
    ]);
  });

  it('should enter one node and leave one node', () => {
    render(<App />);

    act(() => {
      io.enterNode(screen.getByText('A section 4 - not intersecting'));
    });

    expect(
      screen.getAllByText(/A section/).map((node) => node.textContent)
    ).toEqual([
      'A section 0 - not intersecting',
      'A section 1 - not intersecting',
      'A section 2 - not intersecting',
      'A section 3 - not intersecting',
      'A section 4 - intersecting',
      'A section 5 - not intersecting',
      'A section 6 - not intersecting',
      'A section 7 - not intersecting',
      'A section 8 - not intersecting',
      'A section 9 - not intersecting',
    ]);

    act(() => {
      io.enterNode(screen.getByText('A section 7 - not intersecting'));
      io.enterNode(screen.getByText('A section 8 - not intersecting'));
    });

    expect(
      screen.getAllByText(/A section/).map((node) => node.textContent)
    ).toEqual([
      'A section 0 - not intersecting',
      'A section 1 - not intersecting',
      'A section 2 - not intersecting',
      'A section 3 - not intersecting',
      'A section 4 - intersecting',
      'A section 5 - not intersecting',
      'A section 6 - not intersecting',
      'A section 7 - intersecting',
      'A section 8 - intersecting',
      'A section 9 - not intersecting',
    ]);

    act(() => {
      io.leaveNode(screen.getByText('A section 4 - intersecting'));
    });

    expect(
      screen.getAllByText(/A section/).map((node) => node.textContent)
    ).toEqual([
      'A section 0 - not intersecting',
      'A section 1 - not intersecting',
      'A section 2 - not intersecting',
      'A section 3 - not intersecting',
      'A section 4 - not intersecting',
      'A section 5 - not intersecting',
      'A section 6 - not intersecting',
      'A section 7 - intersecting',
      'A section 8 - intersecting',
      'A section 9 - not intersecting',
    ]);

    act(() => {
      io.leaveAll();
    });

    expect(
      screen.getAllByText(/A section/).map((node) => node.textContent)
    ).toEqual([
      'A section 0 - not intersecting',
      'A section 1 - not intersecting',
      'A section 2 - not intersecting',
      'A section 3 - not intersecting',
      'A section 4 - not intersecting',
      'A section 5 - not intersecting',
      'A section 6 - not intersecting',
      'A section 7 - not intersecting',
      'A section 8 - not intersecting',
      'A section 9 - not intersecting',
    ]);
  });

  it('should enter, leave and trigger multiple nodes', () => {
    render(<App />);

    act(() => {
      io.enterNodes([
        { node: screen.getByText('A section 4 - not intersecting') },
        { node: screen.getByText('A section 5 - not intersecting') },
      ]);
    });

    expect(
      screen.getAllByText(/A section/).map((node) => node.textContent)
    ).toEqual([
      'A section 0 - not intersecting',
      'A section 1 - not intersecting',
      'A section 2 - not intersecting',
      'A section 3 - not intersecting',
      'A section 4 - intersecting',
      'A section 5 - intersecting',
      'A section 6 - not intersecting',
      'A section 7 - not intersecting',
      'A section 8 - not intersecting',
      'A section 9 - not intersecting',
    ]);

    act(() => {
      io.enterNodes([
        screen.getByText('A section 7 - not intersecting'),
        screen.getByText('A section 8 - not intersecting'),
      ]);
    });

    expect(
      screen.getAllByText(/A section/).map((node) => node.textContent)
    ).toEqual([
      'A section 0 - not intersecting',
      'A section 1 - not intersecting',
      'A section 2 - not intersecting',
      'A section 3 - not intersecting',
      'A section 4 - intersecting',
      'A section 5 - intersecting',
      'A section 6 - not intersecting',
      'A section 7 - intersecting',
      'A section 8 - intersecting',
      'A section 9 - not intersecting',
    ]);

    act(() => {
      io.triggerNodes([
        {
          node: screen.getByText('A section 4 - intersecting'),
          desc: { isIntersecting: false },
        },
        {
          node: screen.getByText('A section 5 - intersecting'),
          desc: { isIntersecting: false },
        },
        {
          node: screen.getByText('A section 6 - not intersecting'),
          desc: { isIntersecting: true },
        },
      ]);
    });

    expect(
      screen.getAllByText(/A section/).map((node) => node.textContent)
    ).toEqual([
      'A section 0 - not intersecting',
      'A section 1 - not intersecting',
      'A section 2 - not intersecting',
      'A section 3 - not intersecting',
      'A section 4 - not intersecting',
      'A section 5 - not intersecting',
      'A section 6 - intersecting',
      'A section 7 - intersecting',
      'A section 8 - intersecting',
      'A section 9 - not intersecting',
    ]);

    act(() => {
      io.leaveNodes([
        { node: screen.getByText('A section 6 - intersecting') },
        screen.getByText('A section 7 - intersecting'),
        { node: screen.getByText('A section 8 - intersecting') },
      ]);
    });

    expect(
      screen.getAllByText(/A section/).map((node) => node.textContent)
    ).toEqual([
      'A section 0 - not intersecting',
      'A section 1 - not intersecting',
      'A section 2 - not intersecting',
      'A section 3 - not intersecting',
      'A section 4 - not intersecting',
      'A section 5 - not intersecting',
      'A section 6 - not intersecting',
      'A section 7 - not intersecting',
      'A section 8 - not intersecting',
      'A section 9 - not intersecting',
    ]);
  });

  it('should receive intersection options to the callback', () => {
    const cb = jest.fn();
    const options: IntersectionDescription = {
      intersectionRatio: 1,
      rootBounds: {
        x: 0,
        y: 0,
        height: 100,
        width: 100,
      },
    };

    render(<Section number={1} callback={cb} />);

    expect(cb).not.toHaveBeenCalled();

    act(() => {
      io.enterNode(screen.getByText(/A section 1/), options);
    });

    const [entries] = cb.mock.calls[0];

    expect(cb).toHaveBeenCalledTimes(1);
    expect(entries).toHaveLength(1); // Number of entries
    expect(entries[0]).toEqual(
      expect.objectContaining({
        ...options,
        isIntersecting: true,
      })
    );
    expect(entries[0].target).toBe(screen.getByText(/A section 1/));
  });
});
