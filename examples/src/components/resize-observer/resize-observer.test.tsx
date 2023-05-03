import { render, act, screen, renderHook } from '@testing-library/react';
import { useMemo } from 'react';

import {
  mockResizeObserver,
  mockElementBoundingClientRect,
  configMocks,
} from '../../../../dist';

import MeasureParent from './measure-parent/MeasureParent';
import PrintMySize from './print-my-size/PrintMySize';
import useResizeObserver from './useResizeObserver';

const { resize, mockElementSize } = mockResizeObserver();

configMocks({ act });

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
      mockElementSize(parent1, {
        contentBoxSize: [{ inlineSize: 400, blockSize: 200 }],
      });

      mockElementBoundingClientRect(child1, { width: 200, height: 100 });

      // the child is larger than the parent, so it should not fit
      mockElementBoundingClientRect(child2, { width: 500, height: 300 });

      mockElementSize(parent2, {
        contentBoxSize: [{ inlineSize: 400, blockSize: 200 }],
      });

      resize();

      expect(
        screen.getAllByTestId('result').map((node) => node.textContent)
      ).toEqual(['fit', "doesn't fit"]);

      // make the first parent smaller
      mockElementSize(parent1, {
        contentBoxSize: [{ inlineSize: 400, blockSize: 90 }],
      });

      // make the second parent bigger
      mockElementSize(parent2, {
        contentBoxSize: [{ inlineSize: 600, blockSize: 400 }],
      });

      resize([parent1, parent2]);

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
      ).toEqual(['', '', '']);

      const elements = screen.getAllByTestId('element');

      mockElementBoundingClientRect(elements[0], { width: 400, height: 200 });
      mockElementBoundingClientRect(elements[2], { width: 100, height: 200 });

      resize();

      expect(
        screen.getAllByTestId('element').map((node) => node.textContent)
      ).toEqual(['400x200', '', '100x200']);
    });
  });

  describe('useResizeObserver', () => {
    it("shouldn't fire the callback if size isn't mocked", async () => {
      const callback = runner.fn();
      const { result } = renderHook(() =>
        useResizeObserver(useMemo(() => ({ callback }), []))
      );

      expect(result.current).toBeInstanceOf(ResizeObserver);

      if (!result.current) {
        return;
      }

      const element = document.createElement('div');
      const element2 = document.createElement('div');

      result.current.observe(element);
      result.current.observe(element2);

      resize();

      expect(callback).toHaveBeenCalledTimes(0);
    });

    it("shouldn't fire the callback if size is 0", async () => {
      const callback = runner.fn();
      const { result } = renderHook(() =>
        useResizeObserver(useMemo(() => ({ callback }), []))
      );

      expect(result.current).toBeInstanceOf(ResizeObserver);

      if (!result.current) {
        return;
      }

      const element = document.createElement('div');
      const element2 = document.createElement('div');

      result.current.observe(element);
      result.current.observe(element2);

      mockElementSize(element, {
        contentBoxSize: [{ inlineSize: 0, blockSize: 0 }],
      });

      mockElementSize(element2, {
        contentBoxSize: [{ inlineSize: 0, blockSize: 0 }],
      });

      resize();

      expect(callback).toHaveBeenCalledTimes(0);
    });

    it('should fire the callback once if size is mocked', async () => {
      const callback = runner.fn();
      const { result } = renderHook(() =>
        useResizeObserver(useMemo(() => ({ callback }), []))
      );

      expect(result.current).toBeInstanceOf(ResizeObserver);

      if (!result.current) {
        return;
      }

      const element = document.createElement('div');
      const element2 = document.createElement('div');

      result.current.observe(element);
      result.current.observe(element2);

      mockElementSize(element, {
        contentBoxSize: [{ inlineSize: 400, blockSize: 200 }],
      });

      mockElementSize(element2, {
        contentBoxSize: [{ inlineSize: 100, blockSize: 200 }],
      });

      resize();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('mockElementSize accepts arrays for borderBoxSize and contentBoxSize', () => {
      const callback = runner.fn();
      const { result } = renderHook(() =>
        useResizeObserver(useMemo(() => ({ callback }), []))
      );

      if (!result.current) {
        return;
      }

      const element = document.createElement('div');

      result.current.observe(element);

      mockElementSize(element, {
        borderBoxSize: [{ inlineSize: 450, blockSize: 250 }],
        contentBoxSize: [{ inlineSize: 400, blockSize: 200 }],
      });

      resize();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith([
        {
          target: element,
          borderBoxSize: [{ inlineSize: 450, blockSize: 250 }],
          contentBoxSize: [{ inlineSize: 400, blockSize: 200 }],
          contentRect: expect.objectContaining({
            x: 0,
            y: 0,
            width: 400,
            height: 200,
            top: 0,
            right: 400,
            bottom: 200,
            left: 0,
          }),
          devicePixelContentBoxSize: [{ inlineSize: 400, blockSize: 200 }],
        },
      ]);
    });

    test('mockElementSize also accepts a plain object for borderBoxSize and contentBoxSize', async () => {
      const callback = runner.fn();
      const { result } = renderHook(() =>
        useResizeObserver(useMemo(() => ({ callback }), []))
      );

      if (!result.current) {
        return;
      }

      const element = document.createElement('div');

      result.current.observe(element);

      mockElementSize(element, {
        borderBoxSize: { inlineSize: 450, blockSize: 250 },
        contentBoxSize: { inlineSize: 400, blockSize: 200 },
      });

      resize();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith([
        {
          target: element,
          borderBoxSize: [{ inlineSize: 450, blockSize: 250 }],
          contentBoxSize: [{ inlineSize: 400, blockSize: 200 }],
          contentRect: expect.objectContaining({
            x: 0,
            y: 0,
            width: 400,
            height: 200,
            top: 0,
            right: 400,
            bottom: 200,
            left: 0,
          }),
          devicePixelContentBoxSize: [{ inlineSize: 400, blockSize: 200 }],
        },
      ]);
    });

    it('should be possible to omit either inlineSize or blockSize', async () => {
      const callback = runner.fn();
      const { result } = renderHook(() =>
        useResizeObserver(useMemo(() => ({ callback }), []))
      );

      if (!result.current) {
        return;
      }

      const element = document.createElement('div');

      result.current.observe(element);

      mockElementSize(element, { contentBoxSize: { inlineSize: 400 } });

      resize();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith([
        {
          target: element,
          borderBoxSize: [{ inlineSize: 400, blockSize: 0 }],
          contentBoxSize: [{ inlineSize: 400, blockSize: 0 }],
          contentRect: expect.objectContaining({
            x: 0,
            y: 0,
            width: 400,
            height: 0,
            top: 0,
            right: 400,
            bottom: 0,
            left: 0,
          }),
          devicePixelContentBoxSize: [{ inlineSize: 400, blockSize: 0 }],
        },
      ]);

      mockElementSize(element, { contentBoxSize: { blockSize: 200 } });

      resize(element);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith([
        {
          target: element,
          borderBoxSize: [{ inlineSize: 0, blockSize: 200 }],
          contentBoxSize: [{ inlineSize: 0, blockSize: 200 }],
          contentRect: expect.objectContaining({
            x: 0,
            y: 0,
            width: 0,
            height: 200,
            top: 0,
            right: 0,
            bottom: 200,
            left: 0,
          }),
          devicePixelContentBoxSize: [{ inlineSize: 0, blockSize: 200 }],
        },
      ]);
    });

    test('Remocking the size', () => {
      const callback = runner.fn();
      const { result } = renderHook(() =>
        useResizeObserver(useMemo(() => ({ callback }), []))
      );

      if (!result.current) {
        return;
      }

      const element = document.createElement('div');

      result.current.observe(element);

      mockElementSize(element, {
        contentBoxSize: { inlineSize: 400, blockSize: 200 },
      });

      resize();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith([
        {
          target: element,
          borderBoxSize: [{ inlineSize: 400, blockSize: 200 }],
          contentBoxSize: [{ inlineSize: 400, blockSize: 200 }],
          contentRect: expect.objectContaining({
            x: 0,
            y: 0,
            width: 400,
            height: 200,
            top: 0,
            right: 400,
            bottom: 200,
            left: 0,
          }),
          devicePixelContentBoxSize: [{ inlineSize: 400, blockSize: 200 }],
        },
      ]);

      mockElementSize(element, {
        contentBoxSize: { inlineSize: 500, blockSize: 300 },
      });

      resize(element);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith([
        {
          target: element,
          borderBoxSize: [{ inlineSize: 500, blockSize: 300 }],
          contentBoxSize: [{ inlineSize: 500, blockSize: 300 }],
          contentRect: expect.objectContaining({
            x: 0,
            y: 0,
            width: 500,
            height: 300,
            top: 0,
            right: 500,
            bottom: 300,
            left: 0,
          }),
          devicePixelContentBoxSize: [{ inlineSize: 500, blockSize: 300 }],
        },
      ]);
    });
  });
});
