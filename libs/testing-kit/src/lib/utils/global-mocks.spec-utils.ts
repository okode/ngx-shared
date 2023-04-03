interface GlobalMock {
  clearMock: () => void;
}

export abstract class GlobalMocks {
  private static readonly MOCKS: Map<string, GlobalMock> = new Map();
  private static readonly INTERNAL_MOCK_ID_PREFIX = 'global';
  /*
   ** Mock IDs
   */
  private static readonly INNER_WIDTH_MOCK_ID = this.buildInternalId('innerWidth');
  private static readonly USER_AGENT_MOCK_ID = this.buildInternalId('userAgent');
  private static readonly W_LOCATION_MOCK_ID = this.buildInternalId('wLocation');
  private static readonly CYPRESS_MOCK_ID = this.buildInternalId('cypress');
  private static readonly INTERSECTION_OBSERVER_MOCK_ID = this.buildInternalId('intersectionObs');
  private static readonly MUTATION_OBSERVER_MOCK_ID = this.buildInternalId('mutationObserver');

  static mockInnerWidth(value: number) {
    this.clearMockById(this.INNER_WIDTH_MOCK_ID);
    const original = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value,
    });
    const mock = {
      clearMock: () => {
        Object.defineProperty(window, 'innerWidth', {
          configurable: true,
          value: original,
          writable: true,
        });
      },
    };
    this.MOCKS.set(this.INNER_WIDTH_MOCK_ID, mock);
    return mock;
  }

  static mockUserAgent(value: string) {
    this.clearMockById(this.USER_AGENT_MOCK_ID);
    const original = window.navigator.userAgent;
    const defineUserAgent = (innerValue: string) => {
      Object.defineProperty(window.navigator, 'userAgent', {
        get: () => innerValue,
      });
    };
    defineUserAgent(value);
    const mock = {
      clearMock: () => {
        defineUserAgent(original);
      },
    };
    this.MOCKS.set(this.USER_AGENT_MOCK_ID, mock);
    return mock;
  }

  static mockLocation(location: Partial<Location>) {
    this.clearMockById(this.W_LOCATION_MOCK_ID);
    const original = window.location;
    const defineLocation = (innerValue: Partial<Location>) =>
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: innerValue,
      });
    defineLocation(location);
    const mock = {
      clearMock: () => {
        defineLocation(original);
      },
    };
    this.MOCKS.set(this.USER_AGENT_MOCK_ID, mock);
    return mock;
  }

  static mockCypress(isRunning: boolean) {
    this.clearMockById(this.CYPRESS_MOCK_ID);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const original = (window as any).Cypress;
    Object.defineProperty(window, 'Cypress', {
      configurable: true,
      value: isRunning,
      writable: true,
    });
    const mock = {
      clearMock: () => {
        Object.defineProperty(window, 'Cypress', {
          configurable: true,
          value: original,
          writable: true,
        });
      },
    };
    this.MOCKS.set(this.CYPRESS_MOCK_ID, mock);
    return mock;
  }

  static mockIntersectionObserver(cb: (intersectionCb: IntersectionObserverCallback) => void) {
    this.clearMockById(this.INTERSECTION_OBSERVER_MOCK_ID);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const original = window.IntersectionObserver;
    const originalEntry = window.IntersectionObserverEntry;
    const observe = jest.fn();
    const unobserve = jest.fn();
    const disconnect = jest.fn();
    const takeRecords = jest.fn();
    const intersectionObsMock = jest
      .fn<IntersectionObserver, [IntersectionObserverCallback]>()
      .mockImplementation(intersectionCb => {
        cb(intersectionCb);
        return {
          root: null,
          rootMargin: '',
          thresholds: [],
          observe,
          unobserve,
          disconnect,
          takeRecords,
        };
      });
    window.IntersectionObserver = intersectionObsMock;
    window.IntersectionObserverEntry = jest
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
    const mock = {
      observe,
      disconnect,
      takeRecords,
      mock: intersectionObsMock,
      clearMock: () => {
        window.IntersectionObserver = original;
        window.IntersectionObserverEntry = originalEntry;
      },
    };
    this.MOCKS.set(this.CYPRESS_MOCK_ID, mock);
    return mock;
  }

  static mockMutationObserver(cb: (mutationCb: MutationCallback) => void) {
    this.clearMockById(this.MUTATION_OBSERVER_MOCK_ID);
    const original = window.MutationObserver;
    const observe = jest.fn();
    const disconnect = jest.fn();
    const takeRecords = jest.fn();
    const mutationMock = jest
      .fn<MutationObserver, [MutationCallback]>()
      .mockImplementation(mutationCb => {
        cb(mutationCb);
        return { observe, disconnect, takeRecords };
      });
    window.MutationObserver = mutationMock;
    const mock = {
      observe,
      disconnect,
      takeRecords,
      mock: mutationMock,
      clearMock: () => {
        window.MutationObserver = original;
      },
    };
    this.MOCKS.set(this.CYPRESS_MOCK_ID, mock);
    return mock;
  }

  static addMock(id: string, mock: () => GlobalMock) {
    if (id.startsWith(this.INTERNAL_MOCK_ID_PREFIX)) {
      throw new Error(
        `INVALID GLOBAL MOCK ID. Do not use ${this.INTERNAL_MOCK_ID_PREFIX} as preffix`
      );
    }
    this.clearMockById(id);
    this.MOCKS.set(id, mock());
  }

  static clearAll() {
    this.MOCKS.forEach(value => value.clearMock());
  }

  private static clearMockById(id: string) {
    this.MOCKS.get(id)?.clearMock();
  }

  private static buildInternalId(id: string) {
    return `${this.INTERNAL_MOCK_ID_PREFIX}_${id}`;
  }
}
