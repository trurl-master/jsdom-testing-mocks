import { useState, useEffect } from 'react'

const entryCallbacks = {}
let id = 0
let observer

const generateId = () => {
  id++
  return id
}

function createObserver() {
  observer = new IntersectionObserver(
    entries =>
      entries.forEach(entry =>
        entryCallbacks[entry.target.dataset._ioid](entry)
      ),
    {
      rootMargin: '-30% 0% -30% 0%'
    }
  )
}

const useIntersection = ref => {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const node = ref.current

    if (!node) {
      return
    }

    const domId = generateId()

    entryCallbacks[domId] = entry => {
      setIsIntersecting(entry.isIntersecting)
    }

    node.dataset._ioid = domId

    if (!observer) {
      createObserver()
    }

    observer.observe(node)

    return () => {
      delete entryCallbacks[domId]
      observer.unobserve(node)
    }
  }, [ref])

  return isIntersecting
}

export default useIntersection
