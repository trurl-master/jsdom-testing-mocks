/**
 * @jest-environment node
 */

import { WrongEnvironmentError } from '../../helper';
import { mockDOMRect } from './DOMRect';

describe('mockDOMRect', () => {
  it('throws an error when used in a non jsdom environment', () => {
    expect(() => {
      mockDOMRect();
    }).toThrow(WrongEnvironmentError);
  });
});
