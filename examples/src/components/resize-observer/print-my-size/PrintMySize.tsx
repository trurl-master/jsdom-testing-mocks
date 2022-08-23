import { useState, useEffect, useRef } from 'react';

const PrintMySize = () => {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<
    Map<HTMLElement, { width: number; height: number }>
  >(new Map());

  useEffect(() => {
    if (!ref1.current || !ref2.current || !ref3.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      setSizes(
        new Map(
          entries.map((entry) => [
            entry.target as HTMLElement,
            entry.contentRect,
          ])
        )
      );
    });

    observer.observe(ref1.current);
    observer.observe(ref2.current);
    observer.observe(ref3.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const size1 = ref1.current && sizes.get(ref1.current);
  const size2 = ref2.current && sizes.get(ref2.current);
  const size3 = ref3.current && sizes.get(ref3.current);

  return (
    <div>
      <div
        style={{
          width: 400,
          height: 200,
          backgroundColor: 'rgba(255,0,0,0.5)',
        }}
        data-testid="element"
        ref={ref1}
      >
        {size1 && `${size1.width}x${size1.height}`}
      </div>
      <div
        style={{
          width: 230,
          height: 70,
          backgroundColor: 'rgba(255,0,0,0.5)',
          marginTop: 20,
        }}
        data-testid="element"
        ref={ref2}
      >
        {size2 && `${size2.width}x${size2.height}`}
      </div>
      <div
        style={{
          width: 100,
          height: 200,
          backgroundColor: 'rgba(255,0,0,0.5)',
          marginTop: 20,
        }}
        data-testid="element"
        ref={ref3}
      >
        {size3 && `${size3.width}x${size3.height}`}
      </div>
    </div>
  );
};

export default PrintMySize;
