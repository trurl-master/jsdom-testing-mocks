type State = {
  observers: MockedResizeObserver[];
  targetObservers: Map<HTMLElement, MockedResizeObserver[]>;
};

const defaultState: State = {
  observers: [],
  targetObservers: new Map(),
};

const state: State = { ...defaultState };

function resetState() {
  state.observers = defaultState.observers;
  state.targetObservers = defaultState.targetObservers;
}

class MockedResizeObserver implements ResizeObserver {
  callback: ResizeObserverCallback;
  observationTargets = new Set<HTMLElement>();
  activeTargets = new Set<HTMLElement>();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    state.observers.push(this);
  }

  observe = (node: HTMLElement) => {
    this.observationTargets.add(node);
    this.activeTargets.add(node);

    if (state.targetObservers.has(node)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state.targetObservers.get(node)!.push(this);
    } else {
      state.targetObservers.set(node, [this]);
    }
  };

  unobserve = (node: HTMLElement) => {
    this.observationTargets.delete(node);

    const targetObservers = state.targetObservers.get(node);

    if (targetObservers) {
      const index = targetObservers.findIndex((mro) => mro === this);

      targetObservers.splice(index, 1);

      if (targetObservers.length === 0) {
        state.targetObservers.delete(node);
      }
    }
  };

  disconnect = () => {
    this.observationTargets.clear();

    for (const node of this.observationTargets) {
      const targetObservers = state.targetObservers.get(node);

      if (targetObservers) {
        const index = targetObservers.findIndex((mro) => mro === this);

        targetObservers.splice(index, 1);

        if (targetObservers.length === 0) {
          state.targetObservers.delete(node);
        }
      }
    }
  };
}

function elementToEntry(element: HTMLElement): ResizeObserverEntry | null {
  const boundingClientRect = element.getBoundingClientRect();

  if (boundingClientRect.width === 0 && boundingClientRect.height === 0) {
    return null;
  }

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

  afterEach(() => {
    resetState();
  });

  afterAll(() => {
    window.ResizeObserver = savedImplementation;
  });

  return {
    getObservers: (element?: HTMLElement) => {
      if (element) {
        return [...(state.targetObservers.get(element) ?? [])];
      }

      return [...state.observers];
    },
    getObservedElements: (observer?: ResizeObserver) => {
      if (observer) {
        return [...(observer as MockedResizeObserver).observationTargets];
      }

      return [...state.targetObservers.keys()];
    },
    resize: (
      elements: HTMLElement | HTMLElement[] = [],
      { ignoreImplicit = false } = {}
    ) => {
      if (!Array.isArray(elements)) {
        elements = [elements];
      }

      for (const observer of state.observers) {
        const observedSubset = elements.filter((element) =>
          observer.observationTargets.has(element)
        );

        const observedSubsetAndActive = new Set([
          ...observedSubset,
          ...(ignoreImplicit ? [] : observer.activeTargets),
        ]);

        observer.activeTargets.clear();

        if (observedSubsetAndActive.size > 0) {
          observer.callback(
            Array.from(observedSubsetAndActive)
              .map(elementToEntry)
              .filter(Boolean) as ResizeObserverEntry[],
            observer
          );
        }
      }
    },
  };
}

export { mockResizeObserver };
