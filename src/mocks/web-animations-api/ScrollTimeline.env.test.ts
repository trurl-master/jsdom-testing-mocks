/**
 * @jest-environment node
 */

import { WrongEnvironmentError } from '../../helper';
import { mockScrollTimeline } from './ScrollTimeline';

describe('mockScrollTimeline', () => {
  it('throws an error when used in a non jsdom environment', () => {
    expect(() => {
      mockScrollTimeline();
    }).toThrow(WrongEnvironmentError);
  });
});