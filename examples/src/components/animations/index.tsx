import { Link } from 'react-router-dom';

const AnimationsIndex = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Web Animations API Examples</h2>
      <p>
        These examples demonstrate the Web Animations API mocks in action.
        Each example shows both the real browser behavior and our mock implementation.
      </p>
      
      <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
        <div style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>
            <Link to="/animations/in-view" style={{ textDecoration: 'none', color: '#0066cc' }}>
              InView Animations
            </Link>
          </h3>
          <p>
            Demonstrates animations triggered by element visibility using IntersectionObserver.
            Perfect for entrance animations and scroll-triggered effects.
          </p>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>
            <Link to="/animations/animate-presence" style={{ textDecoration: 'none', color: '#0066cc' }}>
              Animate Presence
            </Link>
          </h3>
          <p>
            Shows how to animate elements entering and leaving the DOM.
            Useful for page transitions and dynamic content changes.
          </p>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>
            <Link to="/animations/scroll-timeline" style={{ textDecoration: 'none', color: '#0066cc' }}>
              ScrollTimeline API
            </Link>
          </h3>
          <p>
            Advanced scroll-driven animations using the ScrollTimeline API.
            Create animations that progress based on scroll position instead of time.
          </p>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>
            <Link to="/animations/view-timeline" style={{ textDecoration: 'none', color: '#0066cc' }}>
              ViewTimeline API
            </Link>
          </h3>
          <p>
            View-driven animations using the ViewTimeline API.
            Create animations that progress based on element visibility in the viewport.
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Testing Benefits</h3>
        <ul>
          <li><strong>No Browser Dependency:</strong> Test animations in jsdom/Node.js environments</li>
          <li><strong>Predictable Behavior:</strong> Mock implementations provide consistent results</li>
          <li><strong>Full API Coverage:</strong> Same interface as real browser APIs</li>
          <li><strong>Easy Testing:</strong> Control animation state programmatically in tests</li>
        </ul>
      </div>
    </div>
  );
};

export default AnimationsIndex;
