import { useState, useEffect, MutableRefObject } from 'react';

const entryCallbacks = new Map<string, (entry: IntersectionObserverEntry) => void>();
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
        const callback = entryCallbacks.get((entry.target as HTMLElement).dataset._ioid as string);
        callback?.(entry);
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

    const domId = generateId().toString();

    entryCallbacks.set(domId, (entry) => {
      setIsIntersecting(entry.isIntersecting);
      callback?.([entry], observer);
    });

    node.dataset._ioid = domId;

    if (!observer) {
      createObserver();
    }

    observer.observe(node);

    return () => {
      entryCallbacks.delete(domId);
      observer.unobserve(node);
    };
  }, [callback, ref]);

  return isIntersecting;
};

export default useIntersection;
