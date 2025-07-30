import { MockedViewTimeline, mockViewTimeline } from './ViewTimeline';

// Mock IntersectionObserver for testing
const mockIntersectionObserver = jest.fn().mockImplementation((callback, options) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn()
}));

// Store original IntersectionObserver
const originalIntersectionObserver = global.IntersectionObserver;

describe('ViewTimeline', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = mockIntersectionObserver;
    mockViewTimeline();
  });

  afterEach(() => {
    // Restore original IntersectionObserver
    global.IntersectionObserver = originalIntersectionObserver;
    
    // Clean up any global modifications
    if ('ViewTimeline' in window) {
      delete (window as any).ViewTimeline;
    }
    
    jest.clearAllMocks();
  });

  it('should be available globally after mocking', () => {
    expect(window.ViewTimeline).toBeDefined();
    expect(window.ViewTimeline).toBe(MockedViewTimeline);
  });

  it('should create a ViewTimeline with required subject', () => {
    const mockElement = document.createElement('div');
    const timeline = new ViewTimeline({ subject: mockElement });
    
    expect(timeline).toBeInstanceOf(MockedViewTimeline);
    expect(timeline.subject).toBe(mockElement);
    expect(timeline.axis).toBe('block');
  });

  it('should throw error when subject is missing', () => {
    expect(() => {
      new ViewTimeline({} as any);
    }).toThrow('ViewTimeline requires a valid Element as subject');
  });

  it('should throw error when subject is not an Element', () => {
    expect(() => {
      new ViewTimeline({ subject: 'not an element' as any });
    }).toThrow('ViewTimeline requires a valid Element as subject');
  });

  it('should throw error for invalid axis parameter', () => {
    const mockElement = document.createElement('div');
    expect(() => {
      new ViewTimeline({
        subject: mockElement,
        axis: 'invalid' as any
      });
    }).toThrow('Invalid axis value: invalid');
  });

  it('should create a ViewTimeline with custom options', () => {
    const mockElement = document.createElement('div');
    const timeline = new ViewTimeline({
      subject: mockElement,
      axis: 'inline',
      inset: ['10px', '20px']
    });
    
    expect(timeline.subject).toBe(mockElement);
    expect(timeline.axis).toBe('inline');
  });

  it('should return null currentTime when not intersecting', () => {
    const mockElement = document.createElement('div');
    const timeline = new ViewTimeline({ subject: mockElement });
    
    // By default, not intersecting
    expect(timeline.currentTime).toBe(null);
  });

  it('should set up IntersectionObserver on creation', () => {
    const mockElement = document.createElement('div');
    new ViewTimeline({ subject: mockElement });
    
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.25, 0.5, 0.75, 1.0]
      })
    );
  });

  it('should handle custom inset as string', () => {
    const mockElement = document.createElement('div');
    new ViewTimeline({ 
      subject: mockElement,
      inset: '10px 20px'
    });
    
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '10px 20px'
      })
    );
  });

  it('should handle custom inset as array', () => {
    const mockElement = document.createElement('div');
    new ViewTimeline({ 
      subject: mockElement,
      inset: ['10px', '20px', '30px', '40px']
    });
    
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '10px 20px 30px 40px'
      })
    );
  });

  it('should work when IntersectionObserver is not available', () => {
    // Remove IntersectionObserver
    delete (global as any).IntersectionObserver;
    
    const mockElement = document.createElement('div');
    const timeline = new ViewTimeline({ subject: mockElement });
    
    expect(timeline).toBeInstanceOf(MockedViewTimeline);
    expect(timeline.currentTime).toBe(null);
  });

  it('should support disconnect method to clean up observer', () => {
    const mockElement = document.createElement('div');
    const timeline = new ViewTimeline({ subject: mockElement });

    // Get the mock observer instance
    const observerInstance = mockIntersectionObserver.mock.results[0].value;
    
    // Call disconnect
    timeline.disconnect();
    
    // Should have called disconnect on the observer
    expect(observerInstance.disconnect).toHaveBeenCalled();
  });
});