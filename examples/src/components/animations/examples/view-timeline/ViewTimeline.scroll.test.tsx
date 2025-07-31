import { render } from '@testing-library/react';
import { mockAnimationsApi, setElementScroll, mockElementBoundingClientRect } from '../../../../../../dist';
import { ViewTimelineExample } from './ViewTimeline';

// Mock the CSS Typed OM and animations API before tests
mockAnimationsApi();

describe('ViewTimeline API Integration', () => {
  it('should render ViewTimeline example component', () => {
    const { container } = render(<ViewTimelineExample />);
    
    // Just verify the component renders with basic elements
    const scrollableContainer = container.querySelector('[data-testid="scrollable-container"]') as HTMLElement;
    const subjectElement = container.querySelector('[data-testid="subject-element"]') as HTMLElement;
    
    expect(scrollableContainer).toBeInTheDocument();
    expect(subjectElement).toBeInTheDocument();
  });
  
  it('should work with ViewTimeline API directly', () => {
    // Create test elements
    const container = document.createElement('div');
    // Make container scrollable so ViewTimeline can find it
    container.style.overflow = 'auto';
    container.style.height = '400px';
    document.body.appendChild(container);
    
    const content = document.createElement('div');
    container.appendChild(content);
    
    const subject = document.createElement('div');
    content.appendChild(subject);
    
    // Mock positions
    mockElementBoundingClientRect(container, {
      x: 0,
      y: 0,
      width: 400,
      height: 400
    });
    
    mockElementBoundingClientRect(subject, {
      x: 0,
      y: 500, // Initially below viewport
      width: 400,
      height: 100
    });
    
    // Create ViewTimeline
    const viewTimeline = new ViewTimeline({
      subject: subject,
      axis: 'block'
    });
    
    // Initially not visible (should be negative)
    // With subject.top at 500 and container.bottom at 400:
    // currentDistance = 400 - 500 = -100
    // totalDistance = 400 + 100 = 500
    // progress = ((-100 / 500) * 200) - 100 = -140%
    const initialTime = viewTimeline.currentTime;
    expect(initialTime).toBeInstanceOf(CSSUnitValue);
    if (initialTime instanceof CSSUnitValue) {
      expect(initialTime.value).toBe(-140);
    }
    
    // Move subject into viewport
    mockElementBoundingClientRect(subject, {
      x: 0,
      y: 200, // Now in viewport
      width: 400,
      height: 100
    });
    
    // Trigger scroll
    setElementScroll(container, {
      scrollTop: 300,
      scrollHeight: 1200
    });
    
    // ViewTimeline should now show progress
    // With subject.top at 200 and container.bottom at 400:
    // currentDistance = 400 - 200 = 200
    // totalDistance = 400 + 100 = 500  
    // progress = ((200 / 500) * 200) - 100 = -20%
    const updatedTime = viewTimeline.currentTime;
    expect(updatedTime).toBeInstanceOf(CSSUnitValue);
    if (updatedTime instanceof CSSUnitValue) {
      expect(updatedTime.value).toBe(-20);
    }
  });
});