import { useRef } from 'react';

import useDoIFit from './useDoIFit';

const MeasureParent = () => {
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const iFit1 = useDoIFit(ref1);
  const iFit2 = useDoIFit(ref2);

  return (
    <div>
      <div>
        <div
          style={{
            width: 400,
            height: 200,
            backgroundColor: 'rgba(255,0,0,0.5)',
          }}
          data-testid="parent1"
        >
          <div
            ref={ref1}
            style={{
              width: 200,
              height: 100,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            data-testid="child1"
          />
        </div>
        <div data-testid="result">{iFit1 ? 'fit' : "doesn't fit"}</div>
      </div>
      <div>
        <div
          style={{
            width: 400,
            height: 200,
            backgroundColor: 'rgba(255,0,0,0.5)',
            marginTop: 20,
          }}
          data-testid="parent2"
        >
          <div
            ref={ref2}
            style={{
              width: 500,
              height: 300,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            data-testid="child2"
          />
        </div>
        <div data-testid="result">{iFit2 ? 'fit' : "doesn't fit"}</div>
      </div>
    </div>
  );
};

export default MeasureParent;
