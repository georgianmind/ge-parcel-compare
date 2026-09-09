import { refreshFx } from './fx';
import type { CarrierCorridorRate } from '../engine/types';

const FX_ALARM = 'fx-refresh';
const SETTINGS_KEY = 'settings';
const REMOTE_RATES_KEY = 'remoteRates';

interface Settings {
  language: 'ka' | 'en';
  manualFxOverride?: { USD?: number; EUR?: number; GBP?: number };
  disabledCarriers?: string[];
  remoteRatesUrl?: string;
  remoteRatesEnabled?: boolean;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(FX_ALARM, { periodInMinutes: 6 * 60 });
  void refreshFx();
  void syncAnySiteRegistration();
});

/**
 * "Any site" mode: when the optional <all_urls> host permission is granted,
 * register the content script everywhere; unregister when revoked.
 */
const ANY_SITE_SCRIPT_ID = 'gpc-any-site';

async function syncAnySiteRegistration(): Promise<void> {
  try {
    const granted = await chrome.permissions.contains({ origins: ['<all_urls>'] });
    const existing = await chrome.scripting.getRegisteredContentScripts({
      ids: [ANY_SITE_SCRIPT_ID],
    });
    if (granted && existing.length === 0) {
      // Reuse the built content script file emitted for the Zara match.
      const manifest = chrome.runtime.getManifest();
      const js = manifest.content_scripts?.[0]?.js ?? [];
      if (js.length === 0) return;
      await chrome.scripting.registerContentScripts([
        {
          id: ANY_SITE_SCRIPT_ID,
          matches: ['<all_urls>'],
          excludeMatches: ['https://www.zara.com/*', 'https://zara.com/*'],
          js,
          runAt: 'document_idle',
          persistAcrossSessions: true,
        },
      ]);
    } else if (!granted && existing.length > 0) {
      await chrome.scripting.unregisterContentScripts({ ids: [ANY_SITE_SCRIPT_ID] });
    }
  } catch (e) {
    console.error('[gpc] any-site registration failed:', e);
  }
}

chrome.permissions.onAdded.addListener(() => void syncAnySiteRegistration());
chrome.permissions.onRemoved.addListener(() => void syncAnySiteRegistration());

// Registrations are wiped on every extension reload/update and onInstalled is
// not always enough (e.g. a failed earlier attempt) — re-sync on every service
// worker wake so "any site" mode self-heals.
void syncAnySiteRegistration();

chrome.runtime.onStartup.addListener(() => {
  void refreshFx();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === FX_ALARM) {
    void refreshFx(true);
    void refreshRemoteRates();
  }
});

/** Opt-in remote rates.json override (serializable subset — no tier functions). */
async function refreshRemoteRates(): Promise<void> {
  const { [SETTINGS_KEY]: settings } = (await chrome.storage.local.get(SETTINGS_KEY)) as {
    [SETTINGS_KEY]?: Settings;
  };
  if (!settings?.remoteRatesEnabled || !settings.remoteRatesUrl) return;
  try {
    const url = new URL(settings.remoteRatesUrl);
    if (url.protocol !== 'https:') return;
    const res = await fetch(url.toString());
    if (!res.ok) return;
    const json = (await res.json()) as { version?: string; rates?: unknown[] };
    if (!Array.isArray(json.rates)) return;
    // Defense in depth: the fetched JSON is remote content — accept only
    // whitelisted enum values and finite numbers, field by field.
    const CARRIERS = new Set(['camex', 'inex', 'usa2georgia', 'kiwipost']);
    const CORRIDORS = new Set([
      'usa', 'turkey', 'china-air', 'china-sea', 'uk',
      'germany', 'greece', 'italy', 'spain', 'cyprus',
    ]);
    const CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'GEL']);
    const num = (v: unknown, min: number, max: number): number | undefined =>
      typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : undefined;
    const sanitized: CarrierCorridorRate[] = [];
    for (const raw of json.rates.slice(0, 200)) {
      const r = raw as Record<string, unknown>;
      const ratePerKg = num(r.ratePerKg, 0, 1000);
      if (
        !CARRIERS.has(r.carrier as string) ||
        !CORRIDORS.has(r.corridor as string) ||
        !CURRENCIES.has(r.currency as string) ||
        ratePerKg === undefined
      ) {
        continue;
      }
      sanitized.push({
        carrier: r.carrier as CarrierCorridorRate['carrier'],
        corridor: r.corridor as CarrierCorridorRate['corridor'],
        currency: r.currency as CarrierCorridorRate['currency'],
        ratePerKg,
        fixedFeeGEL: num(r.fixedFeeGEL, 0, 1000),
        declarationFeeGEL: num(r.declarationFeeGEL, 0, 1000),
        volumetricDivisor: num(r.volumetricDivisor, 1000, 10000),
        minBillableKg: num(r.minBillableKg, 0, 10) ?? 0.1,
        volumetricWaiverMaxKg: num(r.volumetricWaiverMaxKg, 0, 1000),
        lastVerified: typeof r.lastVerified === 'string' ? r.lastVerified.slice(0, 10) : '',
        deliveryDays: typeof r.deliveryDays === 'string' ? r.deliveryDays.slice(0, 12) : undefined,
      });
    }
    if (sanitized.length === 0) return;
    await chrome.storage.local.set({
      [REMOTE_RATES_KEY]: {
        version: typeof json.version === 'string' ? json.version.slice(0, 32) : undefined,
        rates: sanitized,
        fetchedAt: Date.now(),
      },
    });
  } catch {
    // remote override is best-effort; local seed rates remain authoritative
  }
}

chrome.runtime.onMessage.addListener(
  (msg: { type: string; force?: boolean; detected?: boolean }, sender, sendResponse) => {
    // Toolbar badge: "₾" on tabs where a product was detected.
    if (msg?.type === 'badge' && sender.tab?.id !== undefined) {
      void chrome.action
        .setBadgeText({ tabId: sender.tab.id, text: msg.detected ? '₾' : '' })
        .catch(() => undefined); // tab may already be gone
      void chrome.action
        .setBadgeBackgroundColor({ tabId: sender.tab.id, color: '#0376c9' })
        .catch(() => undefined);
      return false;
    }
    return legacyHandler(msg, sendResponse);
  },
);

function legacyHandler(msg: { type: string; force?: boolean }, sendResponse: (r: unknown) => void) {
  if (msg?.type === 'get-fx') {
    void refreshFx(Boolean(msg.force)).then(({ rates, fetchedAt }) =>
      sendResponse({ ok: true, rates, fetchedAt }),
    );
    return true; // async
  }
  if (msg?.type === 'refresh-remote-rates') {
    void refreshRemoteRates().then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
}
