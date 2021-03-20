export type IntersectionDescription = {
  isIntersecting: boolean;
  target?: HTMLElement;
};

export type State = {
  nodes: HTMLElement[];
  nodeStates: IntersectionDescription[];
  callback: (
    entries: IntersectionDescription[] | [IntersectionDescription]
  ) => void;
};

const defaultState: State = {
  nodes: [],
  nodeStates: [],
  callback: () => {},
};

const state = {
  ...defaultState,
};

function setNodeState(index: number, newState: IntersectionDescription) {
  if (newState.target) {
    delete newState.target;
  }

  Object.assign(state.nodeStates[index], newState);
}

function findNodeIndex(node: HTMLElement) {
  const index = state.nodes.findIndex(nodeInArray =>
    node.isSameNode(nodeInArray)
  );

  if (index === -1) {
    throw new Error('IntersectionObserver mock: node not found');
  }

  return index;
}

function trigger(index?: number) {
  if (typeof index === 'undefined') {
    state.callback(state.nodeStates);
    return;
  }

  state.callback([state.nodeStates[index]]);
}

function mockIntersectionObserver() {
  const savedImplementation = window.IntersectionObserver;

  const observe = (node: HTMLElement) => {
    state.nodes.push(node);
    state.nodeStates.push({
      isIntersecting: false,
      target: node,
      // time
      // rootBounds
      // intersectionRect
      // intersectionRatio
      // boundingClientRect
    });
  };

  const unobserve = (node: HTMLElement) => {
    const index = state.nodes.findIndex(value => value.isSameNode(node));

    state.nodes.splice(index, 1);
    state.nodeStates.splice(index, 1);
  };

  const disconnect = () => {
    state.nodes = [];
    state.nodeStates = [];
  };

  window.IntersectionObserver = jest.fn().mockImplementation(callback => {
    state.callback = callback;

    return {
      observe,
      unobserve,
      disconnect,
    };
  });

  afterAll(() => {
    window.IntersectionObserver = savedImplementation;
  });

  return {
    enterAll: (desc?: IntersectionDescription) => {
      state.nodeStates.forEach((_, nodeStateIndex) => {
        setNodeState(nodeStateIndex, { ...desc, isIntersecting: true });
      });

      trigger();
    },
    enterNode: (node: HTMLElement, desc?: IntersectionDescription) => {
      const index = findNodeIndex(node);

      setNodeState(index, { ...desc, isIntersecting: true });

      trigger(index);
    },
    leaveAll: (desc?: IntersectionDescription) => {
      state.nodeStates.forEach((_, nodeStateIndex) => {
        setNodeState(nodeStateIndex, { ...desc, isIntersecting: false });
      });

      trigger();
    },
    leaveNode: (node: HTMLElement, desc?: IntersectionDescription) => {
      const index = findNodeIndex(node);

      setNodeState(index, { ...desc, isIntersecting: false });

      trigger(index);
    },
    cleanup: () => {
      window.IntersectionObserver = savedImplementation;
    },
  };
}

export { mockIntersectionObserver };
