type State = {
  observers: MockedResizeObserver[];
  nodeObservers: Map<HTMLElement, MockedResizeObserver[]>;
};

const state: State = {
  observers: [],
  nodeObservers: new Map(),
};

class MockedResizeObserver implements ResizeObserver {
  nodes: HTMLElement[] = [];
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    state.observers.push(this);
  }

  observe = (node: HTMLElement) => {
    this.nodes.push(node);

    if (state.nodeObservers.has(node)) {
      state.nodeObservers.get(node)!.push(this);
    } else {
      state.nodeObservers.set(node, [this]);
    }
  };

  unobserve = (node: HTMLElement) => {
    const index = this.nodes.findIndex((value) => value.isSameNode(node));

    this.nodes.splice(index, 1);

    const nodeObservers = state.nodeObservers.get(node);

    if (nodeObservers) {
      const index = nodeObservers.findIndex((mro) => mro === this);

      nodeObservers.splice(index, 1);

      if (nodeObservers.length === 0) {
        state.nodeObservers.delete(node);
      }
    }
  };

  disconnect = () => {
    this.nodes = [];

    for (const node of this.nodes) {
      const nodeObservers = state.nodeObservers.get(node);

      if (nodeObservers) {
        const index = nodeObservers.findIndex((mro) => mro === this);

        nodeObservers.splice(index, 1);

        if (nodeObservers.length === 0) {
          state.nodeObservers.delete(node);
        }
      }
    }
  };
}

function elementToEntry(element: HTMLElement): ResizeObserverEntry {
  const boundingClientRect = element.getBoundingClientRect();

  return {
    borderBoxSize: [
      {
        blockSize: boundingClientRect.width,
        inlineSize: boundingClientRect.height,
      },
    ],
    contentBoxSize: [
      {
        blockSize: boundingClientRect.width,
        inlineSize: boundingClientRect.height,
      },
    ],
    contentRect: boundingClientRect,
    devicePixelContentBoxSize: [
      // assume device pixel ratio of 1
      {
        blockSize: boundingClientRect.width,
        inlineSize: boundingClientRect.height,
      },
    ],
    target: element,
  };
}

function mockResizeObserver() {
  const savedImplementation = window.ResizeObserver;

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockedResizeObserver,
  });

  afterAll(() => {
    window.ResizeObserver = savedImplementation;
  });

  return {
    resize: (elements: HTMLElement | HTMLElement[]) => {
      if (!Array.isArray(elements)) {
        elements = [elements];
      }

      for (const observer of state.observers) {
        const observedSubset = elements.filter((element) =>
          observer.nodes.includes(element)
        );

        if (observedSubset.length > 0) {
          observer.callback(observedSubset.map(elementToEntry), observer);
        }
      }
    },
  };
}

export { mockResizeObserver };
