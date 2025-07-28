/**
 * @jest-environment node
 */

import { WrongEnvironmentError } from '../helper';
import { mockIntersectionObserver } from './intersection-observer';

describe('mockIntersectionObserver', () => {
  it('throws an error when used in a non jsdom environment', () => {
    expect(() => {
      mockIntersectionObserver();
    }).toThrow(WrongEnvironmentError);
  });
});
