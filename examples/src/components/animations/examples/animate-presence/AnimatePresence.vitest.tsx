import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockAnimationsApi, configMocks } from '../../../../../../dist';

import Readme1 from './AnimatePresence';

mockAnimationsApi();

describe('Animations/Readme1', () => {
  it('adds an element into the dom and fades it in', async () => {
    render(<Readme1 />);

    expect(screen.queryByText('Hehey!')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Show'));

    // assume there's only one animation present in the document at this point
    // in practice it's better to get the running animation from the element itself
    const element = screen.getByText('Hehey!');
    const animation = document.getAnimations()[0];

    // our AnimatePresence implementation has 2 keyframes: opacity: 0 and opacity: 1
    // which allows us to test the visibility of the element, the first keyframe
    // is applied right after the animation is ready
    await animation.ready;

    expect(element).not.toBeVisible();

    // this test will pass right after 50% of the animation is complete
    // because this mock doesn't interpolate keyframes values,
    // but chooses the closest one
    await waitFor(() => {
      expect(element).toBeVisible();
    });

    // AnimatePresence will also add a div with the text 'Done!' after animation is complete
    await waitFor(() => {
      expect(screen.getByText('Done!')).toBeInTheDocument();
    });
  });

  it('should not generate act warnings, if callbacks update state', async () => {
    configMocks({ act });

    render(<Readme1 />);

    expect(screen.queryByText('Hehey!')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Show'));

    // assume there's only one animation present in the document at this point
    // in practice it's better to get the running animation from the element itself
    const element = screen.getByText('Hehey!');
    const animation = document.getAnimations()[0];

    // our AnimatePresence implementation has 2 keyframes: opacity: 0 and opacity: 1
    // which allows us to test the visibility of the element, the first keyframe
    // is applied right after the animation is ready
    await animation.ready;

    expect(element).not.toBeVisible();

    // wait for the animation to complete
    // and check that it doesn't generate a
    // console.error about not being wrapped in act
    await animation.finished;

    configMocks({ act: undefined });
  });
});
