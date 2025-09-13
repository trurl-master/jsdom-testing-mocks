// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import failOnConsole from 'jest-fail-on-console';
import { act } from '@testing-library/react';
import { configMocks } from '../../dist';

// Configure mocks with act to avoid wrapping everything in act calls
configMocks({ act });

failOnConsole({
  shouldFailOnWarn: false,
});