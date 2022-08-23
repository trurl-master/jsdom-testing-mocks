import { mockElementBoundingClientRect } from './size';

test('mockElementBoundingClientRect', () => {
  const element = document.createElement('div');

  mockElementBoundingClientRect(element, {
    x: 100,
    y: 100,
    width: 200,
    height: 200,
  });

  const rect = element.getBoundingClientRect();

  expect(rect.x).toBe(100);
  expect(rect.y).toBe(100);
  expect(rect.width).toBe(200);
  expect(rect.height).toBe(200);
  expect(rect.top).toBe(100);
  expect(rect.right).toBe(300);
  expect(rect.bottom).toBe(300);
  expect(rect.left).toBe(100);
});
