import { MockedViewTimeline, mockViewTimeline } from './ViewTimeline';

// Create framework-agnostic mock functions
const createMockFunction = () => {
  const calls: unknown[][] = [];
  const mockFn = (...args: unknown[]) => {
    calls.push(args);
    return undefined;
  };
  mockFn.mock = { calls };
  return mockFn;
};

// Mock IntersectionObserver for testing
const mockObserve = createMockFunction();
const mockDisconnect = createMockFunction();
const mockUnobserve = createMockFunction();

const mockIntersectionObserver = function(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
  // Store callback and options for testing
  const calls = mockIntersectionObserver.mock.calls;
  calls.push([callback, options]);
  
  const instance = {
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: mockUnobserve
  };
  
  mockIntersectionObserver.mock.results.push({ value: instance });
  return instance;
};

mockIntersectionObserver.mock = {
  calls: [] as unknown[][],
  results: [] as { value: { observe: typeof mockObserve; disconnect: typeof mockDisconnect; unobserve: typeof mockUnobserve } }[]
};

// Store original IntersectionObserver
const originalIntersectionObserver = global.IntersectionObserver;

describe('ViewTimeline', () => {
  beforeEach(() => {
    // Reset mock calls
    mockObserve.mock.calls.length = 0;
    mockDisconnect.mock.calls.length = 0;
    mockUnobserve.mock.calls.length = 0;
    mockIntersectionObserver.mock.calls.length = 0;
    mockIntersectionObserver.mock.results.length = 0;
    
    // Mock IntersectionObserver
    global.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;
    mockViewTimeline();
  });

  afterEach(() => {
    // Restore original IntersectionObserver
    global.IntersectionObserver = originalIntersectionObserver;
    
    // Clean up any global modifications
    if ('ViewTimeline' in window) {
      delete (window as Record<string, unknown>).ViewTimeline;
    }
    
    // Clear mock calls
    mockObserve.mock.calls.length = 0;
    mockDisconnect.mock.calls.length = 0;
    mockUnobserve.mock.calls.length = 0;
    mockIntersectionObserver.mock.calls.length = 0;
    mockIntersectionObserver.mock.results.length = 0;
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
      new ViewTimeline({} as { subject: Element; axis?: 'block' | 'inline' | 'x' | 'y'; inset?: string | Array<string>; });
    }).toThrow('ViewTimeline requires a valid Element as subject');
  });

  it('should throw error when subject is not an Element', () => {
    expect(() => {
      new ViewTimeline({ subject: 'not an element' as unknown as Element });
    }).toThrow('ViewTimeline requires a valid Element as subject');
  });

  it('should throw error for invalid axis parameter', () => {
    const mockElement = document.createElement('div');
    expect(() => {
      new ViewTimeline({ 
        subject: mockElement, 
        axis: 'invalid' as 'block' | 'inline' | 'x' | 'y' 
      });
    }).toThrow('Invalid axis value: invalid');
  });

  it('should create ViewTimeline with custom axis', () => {
    const mockElement = document.createElement('div');
    const timeline = new ViewTimeline({ 
      subject: mockElement, 
      axis: 'inline' 
    });
    
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
    
    expect(mockIntersectionObserver.mock.calls.length).toBe(1);
    expect(typeof mockIntersectionObserver.mock.calls[0][0]).toBe('function');
    expect(mockIntersectionObserver.mock.calls[0][1]).toEqual(
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
    
    expect(mockIntersectionObserver.mock.calls.length).toBe(1);
    expect(typeof mockIntersectionObserver.mock.calls[0][0]).toBe('function');
    expect(mockIntersectionObserver.mock.calls[0][1]).toEqual(
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
    
    expect(mockIntersectionObserver.mock.calls.length).toBe(1);
    expect(typeof mockIntersectionObserver.mock.calls[0][0]).toBe('function');
    expect(mockIntersectionObserver.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        rootMargin: '10px 20px 30px 40px'
      })
    );
  });

  it('should work when IntersectionObserver is not available', () => {
    // Remove IntersectionObserver
    delete (global as Record<string, unknown>).IntersectionObserver;
    
    const mockElement = document.createElement('div');
    const timeline = new ViewTimeline({ subject: mockElement });
    
    expect(timeline).toBeInstanceOf(MockedViewTimeline);
    expect(timeline.currentTime).toBe(null);
  });

  it('should support disconnect method to clean up observer', () => {
    const mockElement = document.createElement('div');
    const timeline = new ViewTimeline({ subject: mockElement });
    
    // Call disconnect
    timeline.disconnect();
    
    // Should have called disconnect on the observer
    expect(mockDisconnect.mock.calls.length).toBe(1);
  });
});