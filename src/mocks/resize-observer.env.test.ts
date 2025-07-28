/**
 * @jest-environment node
 */

import { WrongEnvironmentError } from '../helper';
import { mockResizeObserver } from './resize-observer';

describe('mockResizeObserver', () => {
  it('throws an error when used in a non jsdom environment', () => {
    expect(() => {
      mockResizeObserver();
    }).toThrow(WrongEnvironmentError);
  });
});
