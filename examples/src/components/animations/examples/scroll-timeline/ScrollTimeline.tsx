import React, { useEffect, useRef, useState } from 'react';
import './scroll-timeline.module.css';

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
  const [isRealBrowser, setIsRealBrowser] = useState(false);
  const [mockCurrentTime, setMockCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    // Check if we're in a real browser with native ScrollTimeline support
    setIsRealBrowser(typeof window !== 'undefined' && 'ScrollTimeline' in window);

    if (!containerRef.current || !progressBarRef.current || !animatedElementRef.current) {
      return;
    }

    const container = containerRef.current;
    const progressBar = progressBarRef.current;
    const animatedElement = animatedElementRef.current;

    try {
      // Create ScrollTimeline (works with both real browser and our mock)
      const scrollTimeline = new ScrollTimeline({
        source: container,
        axis: 'block'
      });

      // Create animation using ScrollTimeline
      const animation = new Animation(
        new KeyframeEffect(
          animatedElement,
          [
            { transform: 'translateX(0px)', backgroundColor: 'red' },
            { transform: 'translateX(200px)', backgroundColor: 'blue' }
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
        setMockCurrentTime(scrollTimeline.currentTime);
        
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
      console.error('ScrollTimeline not available:', error);
    }
  }, []);

  return (
    <div className="scroll-timeline-example">
      <h2>ScrollTimeline API Example</h2>
      
      <div className="info-panel">
        <p><strong>Environment:</strong> {isRealBrowser ? 'Real Browser' : 'jsdom with Mock'}</p>
        <p><strong>Scroll Progress:</strong> {scrollProgress.toFixed(1)}%</p>
        <p><strong>Timeline.currentTime:</strong> {mockCurrentTime?.toFixed(1) || 'null'}</p>
      </div>

      <div className="demo-container">
        <div 
          ref={containerRef}
          className="scrollable-container"
        >
          <div className="scroll-content">
            <h3>Scroll down to see the animation</h3>
            <p>This content is much taller than the container to enable scrolling.</p>
            <p>The red square will move and change color as you scroll...</p>
            
            {/* Fill content to make scrolling possible */}
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="content-section">
                <p>Content section {i + 1}</p>
                <p>Keep scrolling to see the ScrollTimeline animation in action.</p>
              </div>
            ))}
            
            <p>🎉 You've reached the end! The animation should be complete.</p>
          </div>
        </div>

        <div className="animation-display">
          <div className="progress-container">
            <div className="progress-label">Scroll Progress:</div>
            <div className="progress-track">
              <div ref={progressBarRef} className="progress-bar"></div>
            </div>
          </div>
          
          <div className="animated-element-container">
            <div ref={animatedElementRef} className="animated-element">
              📦
            </div>
          </div>
        </div>
      </div>

      <div className="explanation">
        <h3>How it works:</h3>
        <ul>
          <li><strong>ScrollTimeline:</strong> Creates a timeline driven by scroll position</li>
          <li><strong>Animation:</strong> Uses the ScrollTimeline instead of time-based duration</li>
          <li><strong>Progress:</strong> Animation progress matches scroll progress (0-100%)</li>
          <li><strong>Mock vs Real:</strong> Our mock provides the same API as the real browser implementation</li>
        </ul>
        
        <h3>Testing Benefits:</h3>
        <ul>
          <li>Test scroll-driven animations in jsdom without browser dependency</li>
          <li>Predictable behavior for automated testing</li>
          <li>Same API surface as real browser ScrollTimeline</li>
          <li>Easy to control scroll state programmatically in tests</li>
        </ul>
      </div>
    </div>
  );
}