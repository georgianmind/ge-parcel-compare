import type { FxRates } from '../engine/types';

const NBG_URL =
  'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json/?currencies=USD&currencies=EUR&currencies=GBP';
const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1/latest?base=GEL&symbols=USD,EUR,GBP';

export const FX_STORAGE_KEY = 'fxRates';
export const FX_TTL_MS = 6 * 60 * 60 * 1000;

/** Last-resort hardcoded rates (approximate, Sept 2026) — shown with a "stale" badge. */
export const HARDCODED_FX: FxRates = {
  USD: 2.71,
  EUR: 3.17,
  GBP: 3.66,
  date: '2026-09-01',
  source: 'hardcoded',
};

interface NbgEntry {
  code: string;
  rate: number;
  quantity: number;
  date?: string;
  validFromDate?: string;
}

export async function fetchNbg(): Promise<FxRates> {
  const res = await fetch(NBG_URL);
  if (!res.ok) throw new Error(`NBG HTTP ${res.status}`);
  const json = (await res.json()) as Array<{ date?: string; currencies: NbgEntry[] }>;
  const currencies = json[0]?.currencies ?? [];
  const get = (code: string) => {
    const e = currencies.find((c) => c.code === code);
    if (!e || !e.rate || !e.quantity) throw new Error(`NBG missing ${code}`);
    return e.rate / e.quantity;
  };
  return {
    USD: get('USD'),
    EUR: get('EUR'),
    GBP: get('GBP'),
    date: json[0]?.date ?? currencies[0]?.validFromDate ?? new Date().toISOString().slice(0, 10),
    source: 'nbg',
  };
}

export async function fetchFrankfurter(): Promise<FxRates> {
  const res = await fetch(FRANKFURTER_URL);
  if (!res.ok) throw new Error(`frankfurter HTTP ${res.status}`);
  const json = (await res.json()) as { date: string; rates: Record<string, number> };
  // base=GEL gives foreign units per GEL — invert to GEL per unit.
  const inv = (code: string) => {
    const v = json.rates[code];
    if (!v) throw new Error(`frankfurter missing ${code}`);
    return 1 / v;
  };
  return { USD: inv('USD'), EUR: inv('EUR'), GBP: inv('GBP'), date: json.date, source: 'frankfurter' };
}

interface CachedFx {
  rates: FxRates;
  fetchedAt: number;
}

export async function getCachedFx(): Promise<CachedFx | null> {
  const obj = await chrome.storage.local.get(FX_STORAGE_KEY);
  return (obj[FX_STORAGE_KEY] as CachedFx | undefined) ?? null;
}

export async function refreshFx(force = false): Promise<CachedFx> {
  const cached = await getCachedFx();
  if (!force && cached && Date.now() - cached.fetchedAt < FX_TTL_MS) {
    return cached;
  }
  let rates: FxRates | null = null;
  try {
    rates = await fetchNbg();
  } catch {
    try {
      rates = await fetchFrankfurter();
    } catch {
      rates = null;
    }
  }
  if (rates) {
    const entry: CachedFx = { rates, fetchedAt: Date.now() };
    await chrome.storage.local.set({ [FX_STORAGE_KEY]: entry });
    return entry;
  }
  if (cached) return { rates: { ...cached.rates, source: 'cached' }, fetchedAt: cached.fetchedAt };
  return { rates: HARDCODED_FX, fetchedAt: 0 };
}
