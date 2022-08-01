import styles from './inview.module.css';
import { inView, animate } from 'motion';
import { useEffect, useRef } from 'react';

const AnimationsInView = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const stop = inView('.inview-section', ({ target }) => {
      const span = target.querySelector('span');

      if (span) {
        animate(
          span,
          { opacity: 1, transform: 'none' },
          { delay: 0.2, duration: 0.9, easing: [0.17, 0.55, 0.55, 1] }
        );
      }
    });

    return () => {
      stop();
    };
  }, []);

  return (
    <div className={styles.container} ref={ref}>
      <section className="inview-section" data-testid="section1">
        <span style={{ transform: 'translateX(-100px)', opacity: 0 }}>
          Scroll
        </span>
      </section>
      <section className="inview-section" data-testid="section2">
        <span style={{ transform: 'translateX(-100px)', opacity: 0 }}>to</span>
      </section>
      <section className="inview-section" data-testid="section3">
        <span style={{ transform: 'translateX(-100px)', opacity: 0 }}>
          trigger
        </span>
      </section>
      <section className="inview-section" data-testid="section4">
        <span style={{ transform: 'translateX(-100px)', opacity: 0 }}>
          animations!
        </span>
      </section>
    </div>
  );
};

export default AnimationsInView;
