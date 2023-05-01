import { useEffect, useState } from 'react';

const useDoIFit = (ref: React.RefObject<HTMLElement>) => {
  const [iFit, setIFit] = useState(false);

  useEffect(() => {
    if (!ref.current || !ref.current.parentElement) {
      return;
    }

    const parentElement = ref.current.parentElement;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const childElement = parentElement.children[0] as HTMLElement;
      const { width: childWidth, height: childHeight } =
        childElement.getBoundingClientRect();

      setIFit(childWidth < width && childHeight < height);
    });

    observer.observe(parentElement);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return iFit;
};

export default useDoIFit;
