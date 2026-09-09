import type { CarrierCorridorRate, FxRates } from '../engine/types';
import { HARDCODED_FX } from '../background/fx';
import { RATES } from '../data/rates';

export interface Settings {
  language: 'ka' | 'en';
  manualFxOverride?: { USD?: number; EUR?: number; GBP?: number };
  disabledCarriers?: string[];
  remoteRatesUrl?: string;
  remoteRatesEnabled?: boolean;
}

export const DEFAULT_SETTINGS: Settings = { language: 'ka' };

export async function getSettings(): Promise<Settings> {
  const { settings } = (await chrome.storage.local.get('settings')) as { settings?: Settings };
  return { ...DEFAULT_SETTINGS, ...settings };
}

export async function getFx(): Promise<FxRates> {
  try {
    const resp = (await chrome.runtime.sendMessage({ type: 'get-fx' })) as
      | { ok: boolean; rates: FxRates }
      | undefined;
    if (resp?.ok && resp.rates) {
      const settings = await getSettings();
      const o = settings.manualFxOverride;
      if (o && (o.USD || o.EUR || o.GBP)) {
        return {
          ...resp.rates,
          USD: o.USD ?? resp.rates.USD,
          EUR: o.EUR ?? resp.rates.EUR,
          GBP: o.GBP ?? resp.rates.GBP,
          source: 'manual',
        };
      }
      return resp.rates;
    }
  } catch {
    // service worker asleep or messaging failed — fall through
  }
  return HARDCODED_FX;
}

/** Rates: remote override (if opted-in and fetched) merged over local seed. */
export async function getRates(): Promise<CarrierCorridorRate[]> {
  const { remoteRates } = (await chrome.storage.local.get('remoteRates')) as {
    remoteRates?: { rates: CarrierCorridorRate[] };
  };
  const settings = await getSettings();
  if (settings.remoteRatesEnabled && remoteRates?.rates?.length) {
    const merged = [...RATES];
    for (const r of remoteRates.rates) {
      if (typeof r.ratePerKg !== 'number') continue; // functions don't serialize
      const i = merged.findIndex((m) => m.carrier === r.carrier && m.corridor === r.corridor);
      if (i >= 0) merged[i] = r;
      else merged.push(r);
    }
    return merged;
  }
  return RATES;
}

// --- per-domain overlay position ---
export async function getPanelPos(domain: string): Promise<{ x: number; y: number } | null> {
  const key = `panelPos:${domain}`;
  const obj = await chrome.storage.local.get(key);
  return (obj[key] as { x: number; y: number } | undefined) ?? null;
}
export async function setPanelPos(domain: string, pos: { x: number; y: number }): Promise<void> {
  await chrome.storage.local.set({ [`panelPos:${domain}`]: pos });
}

// --- overlay expanded/collapsed (global; collapsed pill is the default) ---
export async function getPanelExpanded(): Promise<boolean> {
  const { panelExpanded } = (await chrome.storage.local.get('panelExpanded')) as {
    panelExpanded?: boolean;
  };
  return panelExpanded ?? false;
}
export async function setPanelExpanded(v: boolean): Promise<void> {
  await chrome.storage.local.set({ panelExpanded: v });
}

// --- personal forwarder address book (per carrier, per corridor) ---
export interface AddressField {
  label: string;
  value: string;
}
export type AddressBook = Record<string /* `${carrier}:${corridor}` */, AddressField[]>;

export const DEFAULT_ADDRESS_FIELDS: AddressField[] = [
  { label: 'Full name', value: '' },
  { label: 'Address line 1', value: '' },
  { label: 'Address line 2 / Suite', value: '' },
  { label: 'City', value: '' },
  { label: 'State / Region', value: '' },
  { label: 'ZIP / Postcode', value: '' },
  { label: 'Phone', value: '' },
];

export async function getAddressBook(): Promise<AddressBook> {
  const { addressBook } = (await chrome.storage.local.get('addressBook')) as {
    addressBook?: AddressBook;
  };
  return addressBook ?? {};
}
export async function saveAddress(key: string, fields: AddressField[]): Promise<void> {
  const book = await getAddressBook();
  book[key] = fields;
  await chrome.storage.local.set({ addressBook: book });
}

// --- learned weights per category ---
export interface LearnedWeight {
  kg: number;
  dims?: { l: number; w: number; h: number };
}
export async function getLearnedWeights(): Promise<Record<string, LearnedWeight>> {
  const { learnedWeights } = (await chrome.storage.local.get('learnedWeights')) as {
    learnedWeights?: Record<string, LearnedWeight>;
  };
  return learnedWeights ?? {};
}
export async function learnWeight(category: string, w: LearnedWeight): Promise<void> {
  const all = await getLearnedWeights();
  all[category] = w;
  await chrome.storage.local.set({ learnedWeights: all });
}
