/**
 * @jest-environment node
 */

import { WrongEnvironmentError } from '../helper';
import { mockViewport } from './viewport';

describe('mockViewport', () => {
  it('throws an error when used in a non jsdom environment', () => {
    expect(() => {
      mockViewport({ width: 0, height: 0 });
    }).toThrowError(WrongEnvironmentError);
  });
});
