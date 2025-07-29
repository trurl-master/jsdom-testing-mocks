import { render, act, screen } from '@testing-library/react';
import { mockVisualViewport, configMocks } from '../../../../dist';
import VisualViewportExample from './VisualViewportExample';

configMocks({ act });

describe('VisualViewportExample', () => {
  it('should display viewport information when VisualViewport API is available', () => {
    const visualViewport = mockVisualViewport({
      width: 375,
      height: 667,
      scale: 1,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
    });

    render(<VisualViewportExample />);

    expect(screen.getByText('VisualViewport API')).toBeInTheDocument();
    expect(screen.getByText('Width: 375px')).toBeInTheDocument();
    expect(screen.getByText('Height: 667px')).toBeInTheDocument();
    expect(screen.getByText('Scale: 1')).toBeInTheDocument();

    visualViewport.cleanup();
  });

  it('should update viewport information when properties change', () => {
    const visualViewport = mockVisualViewport({
      width: 375,
      height: 667,
      scale: 1,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
    });

    render(<VisualViewportExample />);

    expect(screen.getByText('Width: 375px')).toBeInTheDocument();
    expect(screen.getByText('Scale: 1')).toBeInTheDocument();

    act(() => {
      visualViewport.set({
        width: 500,
        scale: 1.5,
        offsetLeft: 10,
        offsetTop: 20,
      });
    });

    expect(screen.getByText('Width: 500px')).toBeInTheDocument();
    expect(screen.getByText('Scale: 1.5')).toBeInTheDocument();
    expect(screen.getByText('Offset Left: 10px')).toBeInTheDocument();
    expect(screen.getByText('Offset Top: 20px')).toBeInTheDocument();

    visualViewport.cleanup();
  });

  it('should increment resize counter when resize event is triggered', () => {
    const visualViewport = mockVisualViewport({
      width: 375,
      height: 667,
      scale: 1,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
    });

    render(<VisualViewportExample />);

    expect(screen.getByText('Resize Events: 0')).toBeInTheDocument();

    act(() => {
      visualViewport.triggerResize();
    });

    expect(screen.getByText('Resize Events: 1')).toBeInTheDocument();

    act(() => {
      visualViewport.triggerResize();
    });

    expect(screen.getByText('Resize Events: 2')).toBeInTheDocument();

    visualViewport.cleanup();
  });

  it('should increment scroll counter when scroll event is triggered', () => {
    const visualViewport = mockVisualViewport({
      width: 375,
      height: 667,
      scale: 1,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
    });

    render(<VisualViewportExample />);

    expect(screen.getByText('Scroll Events: 0')).toBeInTheDocument();

    act(() => {
      visualViewport.triggerScroll();
    });

    expect(screen.getByText('Scroll Events: 1')).toBeInTheDocument();

    act(() => {
      visualViewport.triggerScroll();
    });

    expect(screen.getByText('Scroll Events: 2')).toBeInTheDocument();

    visualViewport.cleanup();
  });

  it('should update viewport info when resize event is triggered', () => {
    const visualViewport = mockVisualViewport({
      width: 375,
      height: 667,
      scale: 1,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
    });

    render(<VisualViewportExample />);

    expect(screen.getByText('Width: 375px')).toBeInTheDocument();

    act(() => {
      visualViewport.set({ width: 500, height: 800 });
      visualViewport.triggerResize();
    });

    expect(screen.getByText('Width: 500px')).toBeInTheDocument();
    expect(screen.getByText('Height: 800px')).toBeInTheDocument();

    visualViewport.cleanup();
  });

  it('should update viewport info when scroll event is triggered', () => {
    const visualViewport = mockVisualViewport({
      width: 375,
      height: 667,
      scale: 1,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
    });

    render(<VisualViewportExample />);

    expect(screen.getByText('Page Left: 0px')).toBeInTheDocument();
    expect(screen.getByText('Page Top: 0px')).toBeInTheDocument();

    act(() => {
      visualViewport.set({ pageLeft: 100, pageTop: 200 });
      visualViewport.triggerScroll();
    });

    expect(screen.getByText('Page Left: 100px')).toBeInTheDocument();
    expect(screen.getByText('Page Top: 200px')).toBeInTheDocument();

    visualViewport.cleanup();
  });
}); 