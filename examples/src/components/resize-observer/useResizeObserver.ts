import { useEffect, useState } from 'react';

type Telementry = {
  callback: (entries: ResizeObserverEntry[]) => void;
};

const useResizeObserver = (telemetry: Telementry) => {
  const [ro, setRo] = useState<ResizeObserver | null>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      telemetry.callback(entries);
    });

    setRo(observer);

    return () => {
      observer.disconnect();
    };
  }, [telemetry]);

  return ro;
};

export default useResizeObserver;
