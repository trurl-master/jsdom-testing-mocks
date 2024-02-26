import { mockIntersectionObserver } from './intersection-observer';

const io = mockIntersectionObserver();

describe('mockIntersectionObserver', () => {
  it("don't call unobserved nodes, enterNode", () => {
    const node = document.createElement('div');
    const callback = runner.fn();

    const observer = new IntersectionObserver(callback);

    observer.observe(node);

    io.enterNode(node);

    expect(callback).toHaveBeenCalledTimes(1);

    observer.unobserve(node);

    io.enterNode(node);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('handles multiple nodes correctly, enterNodes', () => {
    const node1 = document.createElement('div');
    const node2 = document.createElement('div');
    const callback = runner.fn();

    const observer = new IntersectionObserver(callback);

    observer.observe(node1);
    observer.observe(node2);

    io.enterNodes([node1, node2]);

    expect(callback).toHaveBeenCalledTimes(1);

    observer.unobserve(node1);
    observer.unobserve(node2);

    io.enterNodes([node1, node2]);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('handles multiple nodes correctly, enterAll', () => {
    const node1 = document.createElement('div');
    const node2 = document.createElement('div');
    const callback = runner.fn();

    const observer = new IntersectionObserver(callback);

    observer.observe(node1);
    observer.observe(node2);

    io.enterAll();

    expect(callback).toHaveBeenCalledTimes(1);

    observer.unobserve(node1);
    observer.unobserve(node2);

    io.enterAll();

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
