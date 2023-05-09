export class UndefinedHookError extends Error {
  constructor(hook: string) {
    let message = '';

    // @ts-ignore
    if (typeof global?.['vi'] !== 'undefined') {
      message = `Jsdom Testing Mocks: ${hook} is not defined. You can enable globals in your config or pass the hook manually to the configMocks function`;
    } else {
      message = `Jsdom Testing Mocks: ${hook} is not defined. If you need to pass it manually, please use the configMocks function`;
    }

    super(message);
  }
}
