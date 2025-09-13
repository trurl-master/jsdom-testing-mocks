import { useEffect, useRef, useState } from 'react';
import styles from './scroll-timeline.module.css';

/**
 * ScrollTimeline Example Component
 * 
 * This component demonstrates ScrollTimeline API usage and compares:
 * 1. Real browser ScrollTimeline behavior (if supported)
 * 2. Our jsdom-testing-mocks ScrollTimeline implementation
 * 
 * The example shows how scroll-driven animations can be created and tested.
 */
export function ScrollTimelineExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animatedElementRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mockCurrentTime, setMockCurrentTime] = useState<number | null>(null);

  useEffect(() => {

    if (!containerRef.current || !progressBarRef.current || !animatedElementRef.current) {
      return;
    }

    const container = containerRef.current;
    const progressBar = progressBarRef.current;
    const animatedElement = animatedElementRef.current;

    // Check if ScrollTimeline is available
    if (typeof ScrollTimeline === 'undefined') {
      console.warn('ScrollTimeline not available - using fallback scroll behavior');
      
      // Fallback: manual scroll progress tracking
      const updateProgress = () => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight - container.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        setScrollProgress(progress);
        setMockCurrentTime(progress);
        
        // Update progress bar
        progressBar.style.width = `${progress}%`;
        
        // Manual animation based on scroll progress
        // Calculate max translation: container width - element width - padding
        const containerWidth = animatedElement.parentElement?.clientWidth || 400;
        const elementWidth = 50; // Box width
        const padding = 20; // Left + right padding
        const maxTranslateX = containerWidth - elementWidth - padding;
        
        const translateX = (progress / 100) * maxTranslateX;
        const hue = (progress / 100) * 240; // Red (0) to Blue (240)
        animatedElement.style.transform = `translateX(${translateX}px)`;
        animatedElement.style.backgroundColor = `hsl(${240 - hue}, 100%, 50%)`;
      };

      container.addEventListener('scroll', updateProgress);
      updateProgress(); // Initial call

      return () => {
        container.removeEventListener('scroll', updateProgress);
      };
    }

    try {
      // Create ScrollTimeline (works with native browser support or mocks)
      const scrollTimeline = new ScrollTimeline({
        source: container,
        axis: 'block'
      });

      // Create animation using ScrollTimeline
      // Calculate max translation: container width - element width - padding
      const containerWidth = animatedElement.parentElement?.clientWidth || 400;
      const elementWidth = 50; // Box width  
      const padding = 20; // Left + right padding
      const maxTranslateX = containerWidth - elementWidth - padding;
      
      const animation = new Animation(
        new KeyframeEffect(
          animatedElement,
          [
            { transform: 'translateX(0px)', backgroundColor: 'red' },
            { transform: `translateX(${maxTranslateX}px)`, backgroundColor: 'blue' }
          ],
          { duration: 1000 }
        ),
        scrollTimeline
      );

      animation.play();

      // Monitor scroll progress
      const updateProgress = () => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight - container.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        setScrollProgress(progress);
        const currentTime = scrollTimeline.currentTime;
        setMockCurrentTime(typeof currentTime === 'number' ? currentTime : null);
        
        // Update progress bar
        progressBar.style.width = `${progress}%`;
      };

      container.addEventListener('scroll', updateProgress);
      updateProgress(); // Initial call

      return () => {
        container.removeEventListener('scroll', updateProgress);
        animation.cancel();
      };
    } catch (error) {
      console.error('ScrollTimeline error:', error);
    }
  }, []);

  return (
    <div className={styles['scroll-timeline-example']}>
      <h2>ScrollTimeline API Example</h2>
      
      <div className={styles['info-panel']}>
        <p><strong>Scroll Progress:</strong> {scrollProgress.toFixed(1)}%</p>
        <p><strong>Timeline.currentTime:</strong> {typeof mockCurrentTime === 'number' ? mockCurrentTime.toFixed(1) : 'null'}</p>
      </div>

      <div className={styles['demo-container']}>
        <div 
          ref={containerRef}
          className={styles['scrollable-container']}
        >
          <div className={styles['scroll-content']}>
            <h3>Scroll down to see the animation</h3>
            <p>This content is much taller than the container to enable scrolling.</p>
            <p>The red square will move and change color as you scroll...</p>
            
            {/* Fill content to make scrolling possible */}
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className={styles['content-section']}>
                <p>Content section {i + 1}</p>
                <p>Keep scrolling to see the ScrollTimeline animation in action.</p>
              </div>
            ))}
            
            <p>🎉 You've reached the end! The animation should be complete.</p>
          </div>
        </div>

        <div className={styles['animation-display']}>
          <div className={styles['progress-container']}>
            <div className={styles['progress-label']}>Scroll Progress:</div>
            <div className={styles['progress-track']}>
              <div ref={progressBarRef} className={styles['progress-bar']}></div>
            </div>
          </div>
          
          <div className={styles['animated-element-container']}>
            <div ref={animatedElementRef} className={styles['animated-element']}>
              📦
            </div>
          </div>
        </div>
      </div>

      <div className={styles['explanation']}>
        <h3>How it works:</h3>
        <ul>
          <li><strong>ScrollTimeline:</strong> Creates a timeline driven by scroll position</li>
          <li><strong>Animation:</strong> Uses the ScrollTimeline instead of time-based duration</li>
          <li><strong>Progress:</strong> Animation progress matches scroll progress (0-100%)</li>
          <li><strong>Mock vs Real:</strong> Our mock provides the same API as the real browser implementation</li>
        </ul>
        
      </div>
    </div>
  );
}