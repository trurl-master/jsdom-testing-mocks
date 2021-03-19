import * as React from 'react';
import { useRef, ReactElement } from 'react';
import useIntersection from './useIntersection';

export const Section = ({ number }: { number: number }): ReactElement => {
  const ref = useRef(null);
  const isIntersecting = useIntersection(ref);

  return (
    <section
      ref={ref}
      style={{
        height: '20vh',
        backgroundColor: isIntersecting ? 'SeaGreen' : 'IndianRed',
      }}
    >
      A section {number} -{' '}
      {isIntersecting ? 'intersecting' : 'not intersecting'}
    </section>
  );
};

const App = (): ReactElement => {
  const sections = 10;

  return (
    <>
      {[...new Array(sections)].map((_, index) => (
        <Section number={index} key={index} />
      ))}
      <div
        style={{
          position: 'fixed',
          top: '30vh',
          right: '0',
          bottom: '30vh',
          left: '0',
          outline: '2px dashed white',
          color: 'white',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Intersection zone
      </div>
    </>
  );
};

export default App;
