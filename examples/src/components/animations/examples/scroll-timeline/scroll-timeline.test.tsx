import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockAnimationsApi } from '../../../../../src/mocks/web-animations-api';
import { ScrollTimelineExample } from './ScrollTimeline';

// Mock the ScrollTimeline API before tests
beforeAll(() => {
  mockAnimationsApi();
});

describe('ScrollTimeline Example', () => {
  it('should render the example component', () => {
    render(<ScrollTimelineExample />);
    
    expect(screen.getByText('ScrollTimeline API Example')).toBeInTheDocument();
    expect(screen.getByText(/Environment:/)).toBeInTheDocument();
    expect(screen.getByText(/Scroll Progress:/)).toBeInTheDocument();
  });

  it('should show jsdom environment info', () => {
    render(<ScrollTimelineExample />);
    
    expect(screen.getByText(/jsdom with Mock/)).toBeInTheDocument();
  });

  it('should render scrollable content', () => {
    render(<ScrollTimelineExample />);
    
    expect(screen.getByText('Scroll down to see the animation')).toBeInTheDocument();
    expect(screen.getByText(/Keep scrolling to see the ScrollTimeline animation/)).toBeInTheDocument();
  });

  it('should render animated element', () => {
    render(<ScrollTimelineExample />);
    
    const animatedElement = screen.getByText('📦');
    expect(animatedElement).toBeInTheDocument();
    expect(animatedElement).toHaveClass('animated-element');
  });

  it('should render progress bar', () => {
    const { container } = render(<ScrollTimelineExample />);
    
    const progressBar = container.querySelector('.progress-bar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should render explanation section', () => {
    render(<ScrollTimelineExample />);
    
    expect(screen.getByText('How it works:')).toBeInTheDocument();
    expect(screen.getByText('Testing Benefits:')).toBeInTheDocument();
    expect(screen.getByText(/Test scroll-driven animations in jsdom/)).toBeInTheDocument();
  });
});