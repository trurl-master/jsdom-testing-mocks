import { RequireAtLeastOne } from 'type-fest';

type Sizes = {
  borderBoxSize: ResizeObserverSize[];
  contentBoxSize: ResizeObserverSize[];
  contentRect: DOMRectReadOnly;
};

type ResizeObserverSizeInput = RequireAtLeastOne<ResizeObserverSize>;
type SizeInput = {
  borderBoxSize: ResizeObserverSizeInput[] | ResizeObserverSizeInput;
  contentBoxSize: ResizeObserverSizeInput[] | ResizeObserverSizeInput;
};

type Size = RequireAtLeastOne<SizeInput>;

type State = {
  observers: MockedResizeObserver[];
  targetObservers: Map<HTMLElement, MockedResizeObserver[]>;
  elementSizes: Map<HTMLElement, Sizes>;
};

const state: State = {
  observers: [],
  targetObservers: new Map(),
  elementSizes: new Map(),
};

function resetState() {
  state.observers = [];
  state.targetObservers = new Map();
  state.elementSizes = new Map();
}

function defineResizeObserverSize(
  input: ResizeObserverSizeInput
): ResizeObserverSize {
  return {
    blockSize: input.blockSize ?? 0,
    inlineSize: input.inlineSize ?? 0,
  };
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
  let sizes = state.elementSizes.get(element);

  if (!sizes) {
    sizes = {
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
    };
  }

  if (sizes.contentRect.width === 0 && sizes.contentRect.height === 0) {
    return null;
  }

  return {
    borderBoxSize: Object.freeze(sizes.borderBoxSize),
    contentBoxSize: Object.freeze(sizes.contentBoxSize),
    contentRect: sizes.contentRect,
    devicePixelContentBoxSize: Object.freeze(
      sizes.contentBoxSize.map((size) => ({
        blockSize: size.blockSize * window.devicePixelRatio,
        inlineSize: size.inlineSize * window.devicePixelRatio,
      }))
    ),
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
    mockElementSize: (element: HTMLElement, size: Size) => {
      let contentBoxSize: ResizeObserverSize[];
      let borderBoxSize: ResizeObserverSize[];

      if (!size.borderBoxSize && size.contentBoxSize) {
        if (!Array.isArray(size.contentBoxSize)) {
          size.contentBoxSize = [size.contentBoxSize];
        }

        contentBoxSize = size.contentBoxSize.map(defineResizeObserverSize);
        borderBoxSize = contentBoxSize;
      } else if (size.borderBoxSize && !size.contentBoxSize) {
        if (!Array.isArray(size.borderBoxSize)) {
          size.borderBoxSize = [size.borderBoxSize];
        }

        contentBoxSize = size.borderBoxSize.map(defineResizeObserverSize);
        borderBoxSize = contentBoxSize;
      } else if (size.borderBoxSize && size.contentBoxSize) {
        if (!Array.isArray(size.borderBoxSize)) {
          size.borderBoxSize = [size.borderBoxSize];
        }

        if (!Array.isArray(size.contentBoxSize)) {
          size.contentBoxSize = [size.contentBoxSize];
        }

        contentBoxSize = size.contentBoxSize.map(defineResizeObserverSize);
        borderBoxSize = size.borderBoxSize.map(defineResizeObserverSize);

        if (borderBoxSize.length !== contentBoxSize.length) {
          throw new Error(
            'Both borderBoxSize and contentBoxSize must have the same amount of elements.'
          );
        }
      } else {
        throw new Error(
          'Neither borderBoxSize nor contentBoxSize was provided.'
        );
      }

      // verify contentBoxSize and borderBoxSize are not negative
      contentBoxSize.forEach((size, index) => {
        if (size.blockSize < 0) {
          throw new Error(
            `contentBoxSize[${index}].blockSize must not be negative.`
          );
        }

        if (size.inlineSize < 0) {
          throw new Error(
            `contentBoxSize[${index}].inlineSize must not be negative.`
          );
        }
      });

      borderBoxSize.forEach((size, index) => {
        if (size.blockSize < 0) {
          throw new Error(
            `borderBoxSize[${index}].blockSize must not be negative.`
          );
        }

        if (size.inlineSize < 0) {
          throw new Error(
            `borderBoxSize[${index}].inlineSize must not be negative.`
          );
        }
      });

      const contentRect = new DOMRect(
        0,
        0,
        contentBoxSize.reduce((acc, size) => acc + size.inlineSize, 0),
        contentBoxSize.reduce((acc, size) => acc + size.blockSize, 0)
      );

      state.elementSizes.set(element, {
        contentBoxSize,
        borderBoxSize,
        contentRect,
      });
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

        const entries = Array.from(observedSubsetAndActive)
          .map(elementToEntry)
          .filter(Boolean) as ResizeObserverEntry[];

        if (entries.length > 0) {
          observer.callback(entries, observer);
        }
      }
    },
  };
}

const { mockElementSize } = mockResizeObserver();

mockElementSize(document.body, {
  contentBoxSize: [{ blockSize: 100, inlineSize: 100 }],
});

export { mockResizeObserver };
