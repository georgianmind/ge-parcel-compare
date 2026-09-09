// Demo-only: stub chrome APIs so the real popup renders in a plain page.
const store: Record<string, unknown> = {
  addressBook: {
    'camex:usa': [
      { label: 'Full name', value: 'GIORGI TSURTSUMIA' },
      { label: 'Address line 1', value: '123 Example Warehouse Rd' },
      { label: 'Address line 2 / Suite', value: 'Suite GEO-4521' },
      { label: 'City', value: 'Wilmington' },
      { label: 'State / Region', value: 'DE' },
      { label: 'ZIP / Postcode', value: '19804' },
      { label: 'Phone', value: '+1 302 555 0123' },
    ],
  },
};
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
    sendMessage: async (msg: { type: string }) =>
      msg.type === 'get-fx'
        ? { ok: true, rates: { USD: 2.71, EUR: 3.17, GBP: 3.66, date: '2026-09-04', source: 'nbg' } }
        : { ok: false },
  },
  permissions: { contains: async () => true, request: async () => true, remove: async () => true },
  tabs: { query: async () => [{ id: 1 }], sendMessage: async () => ({ ok: true }) },
};
