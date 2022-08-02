import { useState, useEffect, useRef } from 'react';

const PrintMySize = () => {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<{ width: number; height: number }[]>([]);

  useEffect(() => {
    if (!ref1.current || !ref2.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      setSizes(entries.map((entry) => entry.contentRect));
    });

    observer.observe(ref1.current);
    observer.observe(ref2.current);

    return () => {
      observer.disconnect();
    };
  }, []);

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
        {sizes[0] && `${sizes[0].width}x${sizes[0].height}`}
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
        {sizes[1] && `${sizes[1].width}x${sizes[1].height}`}
      </div>
    </div>
  );
};

export default PrintMySize;
