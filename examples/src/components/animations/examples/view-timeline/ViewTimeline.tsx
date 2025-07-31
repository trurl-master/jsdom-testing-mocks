import { useEffect, useRef, useState } from 'react';
import styles from './view-timeline.module.css';

/**
 * ViewTimeline Example Component
 * 
 * This component demonstrates ViewTimeline API usage and compares:
 * 1. Real browser ViewTimeline behavior (if supported)
 * 2. Our jsdom-testing-mocks ViewTimeline implementation
 * 
 * The example shows how view-driven animations can be created and tested.
 */
export function ViewTimelineExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !subjectRef.current) {
      return;
    }

    const subject = subjectRef.current;

    // Check if ViewTimeline is available
    if (typeof ViewTimeline === 'undefined') {
      console.warn('ViewTimeline not supported in this browser. This example demonstrates the API but requires a browser with ViewTimeline support or a testing environment with mocks.');
      setIsSupported(false);
      return;
    }

    try {
      // Create ViewTimeline (works with native browser support or mocks)
      const viewTimeline = new ViewTimeline({
        subject: subject,
        axis: 'block'
      });

      // Create animation using ViewTimeline
      const animation = subject.animate(
        [
          { 
            opacity: '0', 
            transform: 'scale(0.5)', 
            backgroundColor: 'red' 
          },
          { 
            opacity: '1', 
            transform: 'scale(1)', 
            backgroundColor: 'hsl(120, 70%, 50%)' 
          }
        ],
        {
          duration: "auto",
          timeline: viewTimeline
        }
      );

      animation.play();

      // Listen to scroll events on the container to update animations
      const container = containerRef.current;
      const handleScroll = () => {
        // Trigger timeline updates by accessing currentTime
        void viewTimeline.currentTime;
      };
      
      container.addEventListener('scroll', handleScroll);

      return () => {
        container.removeEventListener('scroll', handleScroll);
        animation.cancel();
      };
    } catch (error) {
      console.error('ViewTimeline error:', error);
    }
  }, []);

  return (
    <div className={styles['view-timeline-example']}>
      <h2>ViewTimeline API Example</h2>
      
      {!isSupported && (
        <div className={styles['info-panel']} style={{ backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }}>
          <p><strong>⚠️ ViewTimeline Not Supported</strong></p>
          <p>This browser doesn't support the ViewTimeline API. To see this example working:</p>
          <ul>
            <li>Use a browser with ViewTimeline support (Chrome 115+)</li>
            <li>Or run this in a testing environment with jsdom-testing-mocks</li>
          </ul>
        </div>
      )}

      <div className={styles['demo-container']}>
        <div 
          ref={containerRef}
          className={styles['scrollable-container']}
          data-testid="scrollable-container"
        >
          <div className={styles['scroll-content']}>
            <h3>Scroll down to see the ViewTimeline animation</h3>
            <p>The colored box below will animate based on its visibility in the viewport.</p>
            
            {/* Fill content before the subject */}
            {Array.from({ length: 5 }, (_, i) => (
              <div key={`before-${i}`} className={styles['content-section']}>
                <p>Content section {i + 1}</p>
                <p>Keep scrolling to see the ViewTimeline animation...</p>
              </div>
            ))}
            
            {/* The subject element that will be animated */}
            <div 
              ref={subjectRef}
              className={styles['subject-element']}
              data-testid="subject-element"
            >
              📦 Animated Subject
            </div>
            
            {/* Fill content after the subject */}
            {Array.from({ length: 10 }, (_, i) => (
              <div key={`after-${i}`} className={styles['content-section']}>
                <p>Content section {i + 6}</p>
                <p>The animation progresses as the subject enters and exits the viewport.</p>
              </div>
            ))}
            
            <p>🎉 You've reached the end! The subject should have animated as it moved through the viewport.</p>
          </div>
        </div>
      </div>

      <div className={styles['explanation']}>
        <h3>How ViewTimeline works:</h3>
        <ul>
          <li><strong>Subject Element:</strong> The element being observed for visibility changes</li>
          <li><strong>View Progress:</strong> Animation progress matches the element's visibility (0-100%)</li>
          <li><strong>Intersection-Based:</strong> Animation runs when the subject intersects with the viewport</li>
          <li><strong>Mock vs Real:</strong> Our mock provides the same API as the real browser implementation</li>
        </ul>
      </div>
    </div>
  );
}