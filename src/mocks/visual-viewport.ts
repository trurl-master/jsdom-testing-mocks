import { getConfig } from '../tools';
import { isJsdomEnv, WrongEnvironmentError } from '../helper';

const config = getConfig();

/**
 * VisualViewport API mock for testing components that use window.visualViewport
 * 
 * The VisualViewport API provides information about the visual viewport,
 * which is particularly useful for handling pinch-zoom interactions on mobile devices.
 * 
 * @example using react testing library
 * 
 * const visualViewport = mockVisualViewport({
 *   width: 375,
 *   height: 667,
 *   scale: 1,
 *   offsetLeft: 0,
 *   offsetTop: 0,
 *   pageLeft: 0,
 *   pageTop: 0
 * });
 * 
 * render(<TestComponent />);
 * 
 * // Simulate pinch-zoom
 * act(() => {
 *   visualViewport.set({
 *     scale: 1.5,
 *     width: 250,
 *     height: 444
 *   });
 * });
 * 
 * visualViewport.cleanup();
 */

export type VisualViewportDescription = {
  width: number;
  height: number;
  scale: number;
  offsetLeft: number;
  offsetTop: number;
  pageLeft: number;
  pageTop: number;
};

export type MockVisualViewport = {
  cleanup: () => void;
  set: (newDesc: Partial<VisualViewportDescription>) => void;
  triggerResize: () => void;
  triggerScroll: () => void;
  triggerScrollend: () => void;
};

type Listener = (event: Event) => void;
type ListenerOrListenerObject = Listener | { handleEvent: (event: Event) => void };

function isEventListenerObject(listener: ListenerOrListenerObject): listener is { handleEvent: (event: Event) => void } {
  return typeof listener === 'object' && listener !== null && 'handleEvent' in listener;
}

class MockedVisualViewport implements VisualViewport {
  #width: number;
  #height: number;
  #scale: number;
  #offsetLeft: number;
  #offsetTop: number;
  #pageLeft: number;
  #pageTop: number;
  #resizeListeners: ListenerOrListenerObject[] = [];
  #scrollListeners: ListenerOrListenerObject[] = [];
  #scrollendListeners: ListenerOrListenerObject[] = [];
  #onresize: ((this: VisualViewport, ev: Event) => void) | null = null;
  #onscroll: ((this: VisualViewport, ev: Event) => void) | null = null;
  #onscrollend: ((this: VisualViewport, ev: Event) => void) | null = null;
  #segments: readonly DOMRectReadOnly[] = [];

  constructor(desc: VisualViewportDescription) {
    this.#width = desc.width;
    this.#height = desc.height;
    this.#scale = desc.scale;
    this.#offsetLeft = desc.offsetLeft;
    this.#offsetTop = desc.offsetTop;
    this.#pageLeft = desc.pageLeft;
    this.#pageTop = desc.pageTop;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get scale() {
    return this.#scale;
  }

  get offsetLeft() {
    return this.#offsetLeft;
  }

  get offsetTop() {
    return this.#offsetTop;
  }

  get pageLeft() {
    return this.#pageLeft;
  }

  get pageTop() {
    return this.#pageTop;
  }

  get onresize() {
    return this.#onresize;
  }

  set onresize(value: ((this: VisualViewport, ev: Event) => void) | null) {
    this.#onresize = value;
  }

  get onscroll() {
    return this.#onscroll;
  }

  set onscroll(value: ((this: VisualViewport, ev: Event) => void) | null) {
    this.#onscroll = value;
  }

  get onscrollend() {
    return this.#onscrollend;
  }

  set onscrollend(value: ((this: VisualViewport, ev: Event) => void) | null) {
    this.#onscrollend = value;
  }

  get segments() {
    return this.#segments;
  }

  dispatchEvent(event: Event): boolean {
    if (event.type === 'resize') {
      this.#triggerEvent('resize');
      if (this.#onresize) {
        this.#onresize.call(this, event);
      }
    } else if (event.type === 'scroll') {
      this.#triggerEvent('scroll');
      if (this.#onscroll) {
        this.#onscroll.call(this, event);
      }
    } else if (event.type === 'scrollend') {
      this.#triggerEvent('scrollend');
      if (this.#onscrollend) {
        this.#onscrollend.call(this, event);
      }
    }
    return true;
  }

  addEventListener(
    type: 'resize' | 'scroll' | 'scrollend',
    listener: ListenerOrListenerObject,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: boolean | AddEventListenerOptions
  ) {
    if (type === 'resize') {
      this.#resizeListeners.push(listener);
    } else if (type === 'scroll') {
      this.#scrollListeners.push(listener);
    } else if (type === 'scrollend') {
      this.#scrollendListeners.push(listener);
    }
  }

  removeEventListener(
    type: 'resize' | 'scroll' | 'scrollend',
    listener: ListenerOrListenerObject,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: boolean | EventListenerOptions
  ) {
    if (type === 'resize') {
      const index = this.#resizeListeners.indexOf(listener);
      if (index > -1) {
        this.#resizeListeners.splice(index, 1);
      }
    } else if (type === 'scroll') {
      const index = this.#scrollListeners.indexOf(listener);
      if (index > -1) {
        this.#scrollListeners.splice(index, 1);
      }
    } else if (type === 'scrollend') {
      const index = this.#scrollendListeners.indexOf(listener);
      if (index > -1) {
        this.#scrollendListeners.splice(index, 1);
      }
    }
  }

  #triggerEvent(type: 'resize' | 'scroll' | 'scrollend') {
    const event = new Event(type, { bubbles: true, cancelable: false });
    let listeners: ListenerOrListenerObject[];
    
    if (type === 'resize') {
      listeners = this.#resizeListeners;
    } else if (type === 'scroll') {
      listeners = this.#scrollListeners;
    } else {
      listeners = this.#scrollendListeners;
    }
    
    listeners.forEach((listener) => {
      if (isEventListenerObject(listener)) {
        listener.handleEvent(event);
      } else {
        listener.call(this, event);
      }
    });

    // Call the on* handlers
    if (type === 'resize' && this.#onresize) {
      this.#onresize.call(this, event);
    } else if (type === 'scroll' && this.#onscroll) {
      this.#onscroll.call(this, event);
    } else if (type === 'scrollend' && this.#onscrollend) {
      this.#onscrollend.call(this, event);
    }
  }

  triggerResize() {
    this.#triggerEvent('resize');
  }

  triggerScroll() {
    this.#triggerEvent('scroll');
  }

  triggerScrollend() {
    this.#triggerEvent('scrollend');
  }

  update(desc: Partial<VisualViewportDescription>) {
    if (desc.width !== undefined) this.#width = desc.width;
    if (desc.height !== undefined) this.#height = desc.height;
    if (desc.scale !== undefined) {
      // Validate scale: must be positive and finite
      if (desc.scale <= 0 || !Number.isFinite(desc.scale)) {
        throw new Error(`Invalid scale value: ${desc.scale}. Scale must be a positive finite number.`);
      }
      this.#scale = desc.scale;
    }
    if (desc.offsetLeft !== undefined) this.#offsetLeft = desc.offsetLeft;
    if (desc.offsetTop !== undefined) this.#offsetTop = desc.offsetTop;
    if (desc.pageLeft !== undefined) this.#pageLeft = desc.pageLeft;
    if (desc.pageTop !== undefined) this.#pageTop = desc.pageTop;
  }
}

function mockVisualViewport(desc: VisualViewportDescription): MockVisualViewport {
  if (!isJsdomEnv()) {
    throw new WrongEnvironmentError();
  }

  const state = {
    currentDesc: desc,
    instance: new MockedVisualViewport(desc),
  };

  const savedImplementation = (window as { visualViewport?: VisualViewport }).visualViewport;

  Object.defineProperty(window, 'visualViewport', {
    writable: true,
    configurable: true,
    value: state.instance,
  });

  return {
    cleanup: () => {
      (window as { visualViewport?: VisualViewport }).visualViewport = savedImplementation;
    },
    set: (newDesc: Partial<VisualViewportDescription>) => {
      config.act(() => {
        state.currentDesc = { ...state.currentDesc, ...newDesc };
        state.instance.update(newDesc);
      });
    },
    triggerResize: () => {
      config.act(() => {
        state.instance.triggerResize();
      });
    },
    triggerScroll: () => {
      config.act(() => {
        state.instance.triggerScroll();
      });
    },
    triggerScrollend: () => {
      config.act(() => {
        state.instance.triggerScrollend();
      });
    },
  };
}

function mockVisualViewportForTestGroup(desc: VisualViewportDescription) {
  let visualViewport: MockVisualViewport;

  config.beforeAll(() => {
    visualViewport = mockVisualViewport(desc);
  });

  config.afterAll(() => {
    visualViewport.cleanup();
  });
}

export { mockVisualViewport, mockVisualViewportForTestGroup }; 