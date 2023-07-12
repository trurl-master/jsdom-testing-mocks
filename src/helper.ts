export class UndefinedHookError extends Error {
  constructor(hook: string) {
    let message = '';

    // @ts-ignore
    if (typeof global?.['vi'] !== 'undefined') {
      message = `jsdom-testing-mocks: ${hook} is not defined. You can enable globals in your config or pass the hook manually to the configMocks function`;
    } else {
      message = `jsdom-testing-mocks: ${hook} is not defined. If you need to pass it manually, please use the configMocks function`;
    }

    super(message);
  }
}

export class WrongEnvironmentError extends Error {
  constructor() {
    super(
      'jsdom-testing-mocks: window is not defined. Please use this library in a browser environment'
    );
  }
}

export const isJsdomEnv = () => {
  return typeof window !== 'undefined';
};
