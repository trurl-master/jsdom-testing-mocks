import * as React from 'react';
import { render, act, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { mockIntersectionObserver } from '../src/mocks/intersection-observer';

import App, {
  Section,
} from '../example/intersection-observer/global-observer/GlobalObserver';

const intersectionObserver = mockIntersectionObserver();

describe('Section is intersecting', () => {
  it('should render correctly when not inside the intersection zone', () => {
    render(<Section number={1} />);

    expect(
      screen.getByText('A section 1 - not intersecting')
    ).toBeInTheDocument();
  });

  it('should render correctly when entering the intersection zone', () => {
    const { container } = render(<Section number={1} />);

    act(() => {
      intersectionObserver.enterNode(container.firstChild as HTMLElement);
    });

    expect(screen.getByText('A section 1 - intersecting')).toBeInTheDocument();
  });

  it('should render correctly when leaving the intersection zone', () => {
    const { container } = render(<Section number={1} />);

    act(() => {
      intersectionObserver.enterNode(container.firstChild as HTMLElement);
    });

    expect(screen.getByText('A section 1 - intersecting')).toBeInTheDocument();

    act(() => {
      intersectionObserver.leaveNode(container.firstChild as HTMLElement);
    });

    expect(
      screen.getByText('A section 1 - not intersecting')
    ).toBeInTheDocument();
  });

  it('should enter all nodes at once', () => {
    render(<App />);

    act(() => {
      intersectionObserver.enterAll();
    });

    expect(
      screen.getAllByText(/A section/).map(node => node.textContent)
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
      intersectionObserver.enterAll();
    });

    expect(
      screen.getAllByText(/A section/).map(node => node.textContent)
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
      intersectionObserver.leaveAll();
    });

    expect(
      screen.getAllByText(/A section/).map(node => node.textContent)
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
      intersectionObserver.enterNode(
        screen.getByText('A section 4 - not intersecting')
      );
    });

    expect(
      screen.getAllByText(/A section/).map(node => node.textContent)
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
      intersectionObserver.enterNode(
        screen.getByText('A section 7 - not intersecting')
      );
      intersectionObserver.enterNode(
        screen.getByText('A section 8 - not intersecting')
      );
    });

    expect(
      screen.getAllByText(/A section/).map(node => node.textContent)
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
      intersectionObserver.leaveNode(
        screen.getByText('A section 4 - intersecting')
      );
    });

    expect(
      screen.getAllByText(/A section/).map(node => node.textContent)
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
      intersectionObserver.leaveAll();
    });

    expect(
      screen.getAllByText(/A section/).map(node => node.textContent)
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
});
