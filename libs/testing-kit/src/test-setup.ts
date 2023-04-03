import 'jest-preset-angular/setup-jest';
import { GlobalMocks } from './lib/utils/global-mocks.spec-utils';
import { clearDom } from './lib/utils/utils.spec-utils';

/** global mocks for jsdom **/
const mock = () => {
  let storage: { [key: string]: string } = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
  };
};

Object.defineProperty(window, 'localStorage', { value: mock() });
Object.defineProperty(window, 'sessionStorage', { value: mock() });

Object.defineProperty(console, 'log', {
  value: jest.fn(),
});

Object.defineProperty(console, 'warn', {
  value: jest.fn(),
});

Object.defineProperty(console, 'error', {
  value: jest.fn(),
});

global.IntersectionObserver = jest
  .fn<IntersectionObserver, [IntersectionObserverCallback]>()
  .mockImplementation(() => {
    return {
      root: null,
      rootMargin: '',
      thresholds: [],
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn(),
    };
  });

global.IntersectionObserverEntry = jest
  .fn<IntersectionObserverEntry, [IntersectionObserverEntryInit]>()
  .mockImplementation(data => {
    return {
      isIntersecting: true,
      target: data.target,
      boundingClientRect: null as never,
      intersectionRatio: null as never,
      intersectionRect: null as never,
      rootBounds: null as never,
      time: null as never,
    };
  });

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  GlobalMocks.clearAll();
  jest.useRealTimers();
  // Reset JSDom after each test to avoid side effects
  clearDom();
  GlobalMocks.mockInnerWidth(1200);
});
