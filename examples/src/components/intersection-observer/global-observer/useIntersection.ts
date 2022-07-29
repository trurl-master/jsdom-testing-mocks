import { useState, useEffect, MutableRefObject } from 'react';

const entryCallbacks: {
  [key: string]: (entry: IntersectionObserverEntry) => void;
} = {};
let id = 0;
let observer: IntersectionObserver;

const generateId = () => {
  id++;
  return id;
};

function createObserver() {
  observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        entryCallbacks[(entry.target as HTMLElement).dataset._ioid as string](
          entry
        );
      }),
    {
      rootMargin: '-30% 0% -30% 0%',
    }
  );
}

const useIntersection = (
  ref: MutableRefObject<HTMLElement | null>,
  callback?: IntersectionObserverCallback
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const domId = generateId();

    entryCallbacks[domId.toString()] = (entry) => {
      setIsIntersecting(entry.isIntersecting);
      callback?.([entry], observer);
    };

    node.dataset._ioid = domId.toString();

    if (!observer) {
      createObserver();
    }

    observer.observe(node);

    return () => {
      delete entryCallbacks[domId];
      observer.unobserve(node);
    };
  }, [callback, ref]);

  return isIntersecting;
};

export default useIntersection;
