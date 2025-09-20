export const Capacitor = {
  isNativePlatform: () => false,
};

export function registerPlugin<T = any>(_name: string, _opts?: any): T {
  // Return a minimal stub that throws if used on web without proper implementation
  const stub: any = new Proxy({}, {
    get() {
      return async () => { throw new Error('Native plugin not available in web build'); };
    }
  });
  return stub as T;
}

export class WebPlugin<T = any> {
  constructor(_opts?: any) {}
  addListener(_eventName: string, _listenerFunc: (...args: any[]) => void): { remove: () => void } {
    return { remove: () => void 0 };
  }
  removeAllListeners(): void { /* no-op */ }
}

export default Capacitor;
