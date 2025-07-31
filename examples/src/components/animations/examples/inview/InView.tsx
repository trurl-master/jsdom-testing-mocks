import styles from './inview.module.css';
import { inView, animate } from 'motion';
import { useEffect, useRef } from 'react';

const AnimationsInView = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const sections = ref.current.querySelectorAll('.inview-section');
    const cleanupFunctions: (() => void)[] = [];

    sections.forEach((section) => {
      const span = section.querySelector('span');
      if (!span) return;

      const cleanup = inView(section, () => {
        animate(
          span, 
          { opacity: 1, transform: 'translateX(0)' }, 
          { delay: 0.2, duration: 0.9 }
        );
      }, {
        amount: 0.25
      });

      cleanupFunctions.push(cleanup);
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
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
