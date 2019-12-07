const defaultState = {
  nodes: [],
  nodeStates: [],
  callback: null
}

const state = {
  ...defaultState
}

function setNodeState(index, newState) {
  if (newState.target) {
    delete newState.target
  }

  Object.assign(state.nodeStates[index], newState)
}

function findNodeIndex(node) {
  const index = state.nodes.findIndex(nodeInArray =>
    node.isSameNode(nodeInArray)
  )

  if (index === -1) {
    throw new Error('IntersectionObserver mock: node not found')
  }

  return index
}

function trigger(index) {
  if (typeof index === 'undefined') {
    state.callback(state.nodeStates)
    return
  }

  state.callback([state.nodeStates[index]])
}

function mockIntersectionObserver() {
  const savedImplementation = window.IntersectionObserver

  const observe = node => {
    state.nodes.push(node)
    state.nodeStates.push({
      isIntersecting: false,
      target: node
      // time
      // rootBounds
      // intersectionRect
      // intersectionRatio
      // boundingClientRect
    })
  }

  const unobserve = node => {
    const index = state.nodes.findIndex(value => value.isSameNode(node))

    state.nodes.splice(index, 1)
    state.nodeStates.splice(index, 1)
  }

  const disconnect = () => {
    state.nodes = []
    state.nodeStates = []
  }

  window.IntersectionObserver = jest.fn().mockImplementation(callback => {
    state.callback = callback

    return {
      observe,
      unobserve,
      disconnect
    }
  })

  afterAll(() => {
    window.IntersectionObserver = savedImplementation
  })

  return {
    enterAll: desc => {
      state.nodeStates.forEach((_, nodeStateIndex) => {
        setNodeState(nodeStateIndex, { ...desc, isIntersecting: true })
      })

      trigger()
    },
    enterNode: (node, desc) => {
      const index = findNodeIndex(node)

      setNodeState(index, { ...desc, isIntersecting: true })

      trigger(index)
    },
    leaveAll: desc => {
      state.nodeStates.forEach((_, nodeStateIndex) => {
        setNodeState(nodeStateIndex, { ...desc, isIntersecting: false })
      })

      trigger()
    },
    leaveNode: (node, desc) => {
      const index = findNodeIndex(node)

      setNodeState(index, { ...desc, isIntersecting: false })

      trigger(index)
    }
  }
}

export default mockIntersectionObserver
