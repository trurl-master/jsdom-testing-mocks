import React, { useState, useEffect } from 'react';

const VisualViewportExample: React.FC = () => {
  const [viewportInfo, setViewportInfo] = useState({
    width: 0,
    height: 0,
    scale: 1,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
  });

  const [resizeCount, setResizeCount] = useState(0);
  const [scrollCount, setScrollCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      const updateViewportInfo = () => {
        setViewportInfo({
          width: window.visualViewport!.width,
          height: window.visualViewport!.height,
          scale: window.visualViewport!.scale,
          offsetLeft: window.visualViewport!.offsetLeft,
          offsetTop: window.visualViewport!.offsetTop,
          pageLeft: window.visualViewport!.pageLeft,
          pageTop: window.visualViewport!.pageTop,
        });
      };

      const handleResize = () => {
        setResizeCount((prev) => prev + 1);
        updateViewportInfo();
      };

      const handleScroll = () => {
        setScrollCount((prev) => prev + 1);
        updateViewportInfo();
      };

      // Initial update
      updateViewportInfo();

      // Add event listeners
      window.visualViewport!.addEventListener('resize', handleResize);
      window.visualViewport!.addEventListener('scroll', handleScroll);

      return () => {
        window.visualViewport!.removeEventListener('resize', handleResize);
        window.visualViewport!.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  if (typeof window === 'undefined' || !window.visualViewport) {
    return (
      <div>
        <h2>VisualViewport API</h2>
        <p>VisualViewport API is not available in this environment.</p>
        <p>This component demonstrates the VisualViewport API for testing pinch-zoom interactions.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>VisualViewport API</h2>
      <p>This component demonstrates the VisualViewport API for testing pinch-zoom interactions.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Viewport Information</h3>
        <div>
          <strong>Width:</strong> {viewportInfo.width}px
        </div>
        <div>
          <strong>Height:</strong> {viewportInfo.height}px
        </div>
        <div>
          <strong>Scale:</strong> {viewportInfo.scale}
        </div>
        <div>
          <strong>Offset Left:</strong> {viewportInfo.offsetLeft}px
        </div>
        <div>
          <strong>Offset Top:</strong> {viewportInfo.offsetTop}px
        </div>
        <div>
          <strong>Page Left:</strong> {viewportInfo.pageLeft}px
        </div>
        <div>
          <strong>Page Top:</strong> {viewportInfo.pageTop}px
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Event Counters</h3>
        <div>
          <strong>Resize Events:</strong> {resizeCount}
        </div>
        <div>
          <strong>Scroll Events:</strong> {scrollCount}
        </div>
      </div>

      <div style={{ 
        border: '2px solid #ccc', 
        padding: '20px', 
        marginTop: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3>Test Instructions</h3>
        <p>In a real browser, you can:</p>
        <ul>
          <li>Pinch to zoom on mobile devices to see scale changes</li>
          <li>Scroll to see page offset changes</li>
          <li>Resize the browser window to see viewport size changes</li>
        </ul>
        <p>In tests, use the mock to simulate these interactions:</p>
        <pre>{`
const visualViewport = mockVisualViewport({
  width: 375,
  height: 667,
  scale: 1,
  offsetLeft: 0,
  offsetTop: 0,
  pageLeft: 0,
  pageTop: 0
});

// Simulate pinch-zoom
visualViewport.set({ scale: 1.5, width: 250, height: 444 });

// Trigger events
visualViewport.triggerResize();
visualViewport.triggerScroll();
        `}</pre>
      </div>
    </div>
  );
};

export default VisualViewportExample; 