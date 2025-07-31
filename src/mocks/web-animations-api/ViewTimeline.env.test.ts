/**
 * @jest-environment node
 */

import { WrongEnvironmentError } from '../../helper';
import { mockViewTimeline } from './ViewTimeline';

describe('mockViewTimeline', () => {
  it('throws an error when used in a non jsdom environment', () => {
    expect(() => {
      mockViewTimeline();
    }).toThrow(WrongEnvironmentError);
  });
});