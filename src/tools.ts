import { UndefinedHookError } from './helper';

type JTMConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeAll: (callback: () => any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterAll: (callback: () => any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeEach: (callback: () => any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterEach: (callback: () => any) => void;
  act: (trigger: () => void) => void;
};

const getThrowHookError = (hookName: string) => () => {
  throw new UndefinedHookError(hookName);
};

const config: JTMConfig = {
  beforeAll:
    typeof beforeAll !== 'undefined'
      ? beforeAll
      : getThrowHookError('beforeAll'),
  afterAll:
    typeof afterAll !== 'undefined' ? afterAll : getThrowHookError('afterAll'),
  beforeEach:
    typeof beforeEach !== 'undefined'
      ? beforeEach
      : getThrowHookError('beforeEach'),
  afterEach:
    typeof afterEach !== 'undefined'
      ? afterEach
      : getThrowHookError('afterEach'),
  act: (trigger) => trigger(),
};

export const getConfig = () => config;
export const configMocks = ({
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  act,
}: Partial<JTMConfig>) => {
  if (beforeAll) config.beforeAll = beforeAll;
  if (afterAll) config.afterAll = afterAll;
  if (beforeEach) config.beforeEach = beforeEach;
  if (afterEach) config.afterEach = afterEach;
  if (act) config.act = act;
};
