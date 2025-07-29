/**
 * @jest-environment node
 */

import { WrongEnvironmentError } from '../helper';
import { mockVisualViewport } from './visual-viewport';

describe('mockVisualViewport', () => {
  it('throws an error when used in a non jsdom environment', () => {
    expect(() => {
      mockVisualViewport({
        width: 375,
        height: 667,
        scale: 1,
        offsetLeft: 0,
        offsetTop: 0,
        pageLeft: 0,
        pageTop: 0,
      });
    }).toThrow(WrongEnvironmentError);
  });
}); 