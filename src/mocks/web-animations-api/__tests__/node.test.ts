/**
 * @jest-environment node
 */

import '../../../index';


test('the library can be imported in a node environment', () => {
    expect(() => { window }).toThrowError('window is not defined');
});