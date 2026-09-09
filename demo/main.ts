// Demo-only harness: stub the chrome extension APIs, then run the content script.
const store: Record<string, unknown> = { panelExpanded: true };
(globalThis as Record<string, unknown>).chrome = {
  storage: {
    local: {
      get: async (key?: string | string[]) => {
        if (!key) return { ...store };
        const keys = Array.isArray(key) ? key : [key];
        return Object.fromEntries(keys.map((k) => [k, store[k]]));
      },
      set: async (obj: Record<string, unknown>) => Object.assign(store, obj),
    },
  },
  runtime: {
    onMessage: { addListener: () => undefined },
    sendMessage: async (msg: { type: string }) => {
      if (msg.type === 'get-fx') {
        return {
          ok: true,
          rates: { USD: 2.71, EUR: 3.17, GBP: 3.66, date: '2026-09-03', source: 'nbg' },
        };
      }
      return { ok: false };
    },
  },
};

// Make the adapter see a Zara GR product URL.
history.replaceState(null, '', '/gr/en/ribbed-dress-p01234567.html');

await import('../src/content/index');
