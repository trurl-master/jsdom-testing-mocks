import { render, act, screen } from '@testing-library/react';

import {
  mockResizeObserver,
  mockElementBoundingClientRect,
} from '../../../src';

import MeasureParent from '../components/resize-observer/measure-parent/MeasureParent';
import PrintMySize from '../components/resize-observer/print-my-size/PrintMySize';

const resizeObserver = mockResizeObserver();

describe('mockResizeObserver', () => {
  describe('MeasureParent', () => {
    it('should work', async () => {
      render(<MeasureParent />);

      expect(
        screen.getAllByTestId('result').map((node) => node.textContent)
      ).toEqual(["doesn't fit", "doesn't fit"]);

      const parent1 = screen.getByTestId('parent1');
      const parent2 = screen.getByTestId('parent2');
      const child1 = screen.getByTestId('child1');
      const child2 = screen.getByTestId('child2');

      // the child is smaller than the parent, so it should fit
      mockElementBoundingClientRect(parent1, { width: 400, height: 200 });
      mockElementBoundingClientRect(child1, { width: 200, height: 100 });

      // the child is larger than the parent, so it should not fit
      mockElementBoundingClientRect(parent2, { width: 400, height: 200 });
      mockElementBoundingClientRect(child2, { width: 500, height: 300 });

      act(() => {
        resizeObserver.resize(parent1);
        resizeObserver.resize(parent2);
      });

      expect(
        screen.getAllByTestId('result').map((node) => node.textContent)
      ).toEqual(['fit', "doesn't fit"]);

      // make the first parent smaller
      mockElementBoundingClientRect(parent1, { width: 400, height: 90 });

      // make the second parent bigger
      mockElementBoundingClientRect(parent2, { width: 600, height: 400 });

      act(() => {
        resizeObserver.resize(parent1);
        resizeObserver.resize(parent2);
      });

      expect(
        screen.getAllByTestId('result').map((node) => node.textContent)
      ).toEqual(["doesn't fit", 'fit']);
    });
  });

  describe('PrintMySize', () => {
    it('should work', async () => {
      render(<PrintMySize />);

      expect(
        screen.getAllByTestId('element').map((node) => node.textContent)
      ).toEqual(['', '']);

      const elements = screen.getAllByTestId('element');

      mockElementBoundingClientRect(elements[0], { width: 400, height: 200 });
      mockElementBoundingClientRect(elements[1], { width: 230, height: 70 });

      act(() => {
        resizeObserver.resize(elements);
      });

      expect(
        screen.getAllByTestId('element').map((node) => node.textContent)
      ).toEqual(['400x200', '230x70']);
    });
  });
});
