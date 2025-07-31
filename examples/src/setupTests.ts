// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import failOnConsole from 'jest-fail-on-console';
import { act } from '@testing-library/react';
import { configMocks } from '../../dist';

// Configure mocks with act to avoid wrapping everything in act calls
configMocks({ act });

failOnConsole();

// or with options:
failOnConsole({
  shouldFailOnWarn: false,
});

function useFakeTimers() {
  jest.useFakeTimers();
}

function useRealTimers() {
  jest.useRealTimers();
}

async function advanceTimersByTime(time: number) {
  jest.advanceTimersByTime(time);
}

function fn() {
  return jest.fn();
}

globalThis.runner = {
  name: 'jest',
  useFakeTimers,
  useRealTimers,
  advanceTimersByTime,
  fn,
};
