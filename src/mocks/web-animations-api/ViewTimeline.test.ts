import { mockIntersectionObserver } from '../intersection-observer';
import { MockedViewTimeline, mockViewTimeline } from './ViewTimeline';

// Mocks need to be at the root of the module
mockIntersectionObserver();
mockViewTimeline();

describe('ViewTimeline', () => {
  it('should be available globally after mocking', () => {
    expect(window.ViewTimeline).toBeDefined();
    expect(window.ViewTimeline).toBe(MockedViewTimeline);
  });

  it('should create ViewTimeline with valid subject', () => {
    const element = document.createElement('div');
    const timeline = new ViewTimeline({ subject: element });
    
    expect(timeline).toBeInstanceOf(MockedViewTimeline);
    expect(timeline.subject).toBe(element);
    expect(timeline.axis).toBe('block'); // default axis
  });

  it('should create ViewTimeline with custom axis', () => {
    const element = document.createElement('div');
    const timeline = new ViewTimeline({ 
      subject: element, 
      axis: 'inline' 
    });
    
    expect(timeline.axis).toBe('inline');
  });

  it('should throw error when subject is missing', () => {
    expect(() => {
      new ViewTimeline({} as { subject: Element });
    }).toThrow('ViewTimeline requires a valid Element as subject');
  });

  it('should throw error when subject is not an Element', () => {
    expect(() => {
      new ViewTimeline({ subject: 'not an element' as unknown as Element });
    }).toThrow('ViewTimeline requires a valid Element as subject');
  });

  it('should throw error for invalid axis parameter', () => {
    const element = document.createElement('div');
    expect(() => {
      new ViewTimeline({ 
        subject: element, 
        axis: 'invalid' as 'block' 
      });
    }).toThrow('Invalid axis value: invalid');
  });

  it('should return CSSUnitValue for currentTime when not intersecting', () => {
    const element = document.createElement('div');
    const timeline = new ViewTimeline({ subject: element });
    
    // By default, element is not intersecting but returns CSS.percent(0) for developer convenience
    const currentTime = timeline.currentTime;
    expect(currentTime).toBeInstanceOf(CSSUnitValue);
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(0);
      expect(currentTime.unit).toBe('percent');
    }
  });

  it('should handle viewport intersection properly', () => {
    const element = document.createElement('div');
    const timeline = new ViewTimeline({ subject: element });
    
    // The current time should return CSSUnitValue for developer convenience
    const currentTime = timeline.currentTime;
    expect(currentTime).toBeInstanceOf(CSSUnitValue);
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(0);
      expect(currentTime.unit).toBe('percent');
    }
  });

  it('should handle inset parameter', () => {
    const element = document.createElement('div');
    const timeline = new ViewTimeline({ 
      subject: element, 
      inset: '10px' 
    });
    
    expect(timeline).toBeInstanceOf(MockedViewTimeline);
  });

  it('should handle array inset parameter', () => {
    const element = document.createElement('div');
    const timeline = new ViewTimeline({ 
      subject: element, 
      inset: ['10px', '20px'] 
    });
    
    expect(timeline).toBeInstanceOf(MockedViewTimeline);
  });

  it('should provide disconnect method', () => {
    const element = document.createElement('div');
    const timeline = new ViewTimeline({ subject: element });
    
    expect(typeof timeline.disconnect).toBe('function');
    expect(() => timeline.disconnect()).not.toThrow();
  });
});