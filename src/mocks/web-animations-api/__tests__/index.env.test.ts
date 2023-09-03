/**
 * @jest-environment node
 */

import { WrongEnvironmentError } from '../../../helper';
import { mockAnimationsApi } from '../';

describe('mockAnimationsApi', () => {
  it('throws an error when used in a non jsdom environment', () => {
    expect(() => {
      mockAnimationsApi();
    }).toThrowError(WrongEnvironmentError);
  });
});
