import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import {
  DEFAULT_ADDRESS_FIELDS,
  DEFAULT_SETTINGS,
  getAddressBook,
  saveAddress,
  type AddressBook,
  type AddressField,
  type Settings,
} from '../content/storage';
import { CORRIDOR_LABELS } from '../content/i18n';
import type { FxRates } from '../engine/types';

const CARRIERS = [
  ['camex', 'Camex'],
  ['inex', 'Inex'],
  ['usa2georgia', 'USA2Georgia'],
  ['kiwipost', 'Kiwi Post'],
] as const;

const CARRIER_SITES: Record<string, string> = {
  camex: 'https://camex.ge',
  inex: 'https://inex.ge',
  usa2georgia: 'https://usa2georgia.com',
  kiwipost: 'https://kiwipost.ge',
};

const L = {
  ka: {
    settingsTab: 'პარამეტრები', addressesTab: 'მისამართები',
    addrHint: 'ჩააკოპირეთ თქვენი პირადი საწყობის მისამართი გადამზიდის საიტიდან ერთხელ — შემდეგ ველების კოპირება აქედან ერთი დაჭერით შეგიძლიათ',
    copyAll: 'ყველას კოპირება', saved: 'შენახულია ✓', copied: 'დაკოპირდა ✓',
    openSite: 'გახსენით', addrSave: 'შენახვა',
    fxDateHint: 'თარიღი = კურსის მოქმედების დღე. ეროვნული ბანკი კურსს აქვეყნებს სამუშაო დღეს ~17:00-ზე, მომდევნო დღისთვის — ✓ აჩვენებს ბოლო შემოწმების დროს',
    showHere: 'პანელის ჩვენება ამ გვერდზე',
    shown: 'პანელი გამოჩნდა — შეიყვანეთ ფასი ხელით',
    notInjected: 'ამ გვერდზე გაფართოება არ მუშაობს — ჩართეთ „ნებისმიერი საიტი" ქვემოთ და განაახლეთ გვერდი',
    language: 'ენა', carriers: 'გადამზიდები', fx: 'ვალუტის კურსი',
    manualFx: 'ხელით კურსი (ცარიელი = ავტომატური)', anySite: '„ნებისმიერი საიტის" რეჟიმი',
    anySiteHint: 'ოვერლეი გამოჩნდება ნებისმიერ მაღაზიაზე, სადაც პროდუქტს ამოიცნობს',
    remoteRates: 'ტარიფების დისტანციური განახლება',
    refresh: 'განახლება', enabled: 'ჩართული',
  },
  en: {
    settingsTab: 'Settings', addressesTab: 'Addresses',
    addrHint: 'Paste your personal warehouse address from the carrier site once — then copy any field from here with one click',
    copyAll: 'Copy all', saved: 'Saved ✓', copied: 'Copied ✓',
    openSite: 'open', addrSave: 'Save',
    fxDateHint: 'Date = the day the rate is valid for. NBG publishes once per business day at ~17:00, effective the next day — ✓ shows when it was last checked',
    showHere: 'Show panel on this page',
    shown: 'Panel shown — enter the price manually',
    notInjected: 'Extension is not active on this page — enable "any site" mode below and reload',
    language: 'Language', carriers: 'Carriers', fx: 'Exchange rates',
    manualFx: 'Manual FX override (empty = automatic)', anySite: '"Any site" mode',
    anySiteHint: 'Overlay appears on any store where a product is detected',
    remoteRates: 'Remote rates update',
    refresh: 'Refresh', enabled: 'Enabled',
  },
};

function Addresses({ lang }: { lang: 'ka' | 'en' }) {
  const s = L[lang];
  const [carrier, setCarrier] = useState('camex');
  const [corridor, setCorridor] = useState('usa');
  const [book, setBook] = useState<AddressBook>({});
  const [fields, setFields] = useState<AddressField[]>(DEFAULT_ADDRESS_FIELDS);
  const [note, setNote] = useState('');
  const key = `${carrier}:${corridor}`;

  useEffect(() => {
    void getAddressBook().then((b) => {
      setBook(b);
      setFields(b[key] ?? DEFAULT_ADDRESS_FIELDS.map((f) => ({ ...f })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFields(book[key] ?? DEFAULT_ADDRESS_FIELDS.map((f) => ({ ...f })));
    setNote('');
  }, [key, book]);

  const flash = (msg: string) => {
    setNote(msg);
    setTimeout(() => setNote(''), 1500);
  };

  const copy = (v: string) => {
    if (!v) return;
    void navigator.clipboard.writeText(v).then(() => flash(s.copied));
  };
  const copyAll = () => {
    const text = fields.filter((f) => f.value.trim()).map((f) => f.value.trim()).join('\n');
    if (text) void navigator.clipboard.writeText(text).then(() => flash(s.copied));
  };
  const save = () => {
    void saveAddress(key, fields).then(() => {
      setBook({ ...book, [key]: fields });
      flash(s.saved);
    });
  };

  const filled = (c: string, cor: string) => (book[`${c}:${cor}`] ?? []).some((f) => f.value.trim());

  return (
    <>
      <div class="hint">{s.addrHint}</div>
      <div class="chips">
        {CARRIERS.map(([ckey, label]) => (
          <button class={carrier === ckey ? 'active' : ''} onClick={() => setCarrier(ckey)}>
            {label}
          </button>
        ))}
      </div>
      <div class="row">
        <select value={corridor} onChange={(e) => setCorridor((e.target as HTMLSelectElement).value)}>
          {Object.entries(CORRIDOR_LABELS).map(([ckey, v]) => (
            <option value={ckey}>
              {v.flag} {v[lang]} {filled(carrier, ckey) ? '✓' : ''}
            </option>
          ))}
        </select>
        <a
          class="sitelink"
          href={CARRIER_SITES[carrier]}
          target="_blank" rel="noreferrer"
        >
          {CARRIER_SITES[carrier].replace('https://', '')} ↗
        </a>
      </div>

      <div class="section">
        {fields.map((f, i) => (
          <div class="field">
            <span class="lbl" title={f.label}>{f.label}</span>
            <input
              value={f.value}
              placeholder="—"
              onInput={(e) => {
                const next = fields.slice();
                next[i] = { ...f, value: (e.target as HTMLInputElement).value };
                setFields(next);
              }}
            />
            <button class="copybtn" title={f.label} onClick={() => copy(f.value)}>⧉</button>
          </div>
        ))}
        <div class="row" style="margin-top:4px;">
          <button class="ghost" onClick={copyAll}>⧉ {s.copyAll}</button>
          <span class="status">{note}</span>
          <button class="ghost" onClick={save}>{s.addrSave}</button>
        </div>
      </div>
    </>
  );
}

function Popup() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [fx, setFx] = useState<FxRates | null>(null);
  const [fxCheckedAt, setFxCheckedAt] = useState<number>(0);
  const [anySite, setAnySite] = useState(false);
  const [status, setStatus] = useState('');
  const [tab, setTab] = useState<'settings' | 'addresses'>('settings');
  const lang = settings.language;
  const s = L[lang];

  useEffect(() => {
    void chrome.storage.local.get('settings').then((o) => {
      setSettings({ ...DEFAULT_SETTINGS, ...(o.settings as Settings | undefined) });
    });
    void chrome.runtime
      .sendMessage({ type: 'get-fx' })
      .then((r: { ok: boolean; rates: FxRates; fetchedAt?: number }) => {
        if (r?.ok) {
          setFx(r.rates);
          setFxCheckedAt(r.fetchedAt ?? 0);
        }
      });
    void chrome.permissions.contains({ origins: ['<all_urls>'] }).then(setAnySite);
  }, []);

  const save = (next: Settings) => {
    setSettings(next);
    void chrome.storage.local.set({ settings: next });
  };

  const showOnPage = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'toggle-panel' });
      setStatus(s.shown);
      return;
    } catch {
      // Content script not on this page — inject it now, then toggle.
    }
    try {
      const files = chrome.runtime.getManifest().content_scripts?.[0]?.js ?? [];
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files });
      await new Promise((r) => setTimeout(r, 150));
      await chrome.tabs.sendMessage(tab.id, { type: 'toggle-panel' });
      setStatus(s.shown);
    } catch {
      setStatus(s.notInjected);
    }
  };

  const toggleCarrier = (c: string) => {
    const disabled = new Set(settings.disabledCarriers ?? []);
    if (disabled.has(c)) disabled.delete(c);
    else disabled.add(c);
    save({ ...settings, disabledCarriers: [...disabled] });
  };

  const toggleAnySite = async () => {
    if (anySite) {
      await chrome.permissions.remove({ origins: ['<all_urls>'] });
      setAnySite(false);
    } else {
      const granted = await chrome.permissions.request({ origins: ['<all_urls>'] });
      setAnySite(granted);
    }
  };

  const setManualFx = (code: 'USD' | 'EUR' | 'GBP', raw: string) => {
    const v = parseFloat(raw);
    const o = { ...settings.manualFxOverride };
    if (Number.isFinite(v) && v > 0) o[code] = v;
    else delete o[code];
    save({ ...settings, manualFxOverride: o });
  };

  return (
    <div class="wrap">
      <div class="brand">
        <img src="../../icons/icon48.png" alt="" />
        Amanati
        <span style="flex:1"></span>
        <select
          value={lang}
          onChange={(e) => save({ ...settings, language: (e.target as HTMLSelectElement).value as 'ka' | 'en' })}
        >
          <option value="ka">ქართ</option>
          <option value="en">EN</option>
        </select>
      </div>

      <div class="tabs">
        <button class={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
          {s.settingsTab}
        </button>
        <button class={tab === 'addresses' ? 'active' : ''} onClick={() => setTab('addresses')}>
          {s.addressesTab}
        </button>
      </div>

      {tab === 'addresses' && <Addresses lang={lang} />}

      {tab === 'settings' && <>
      <button class="primary" onClick={() => void showOnPage()}>{s.showHere}</button>
      <div class="status">{status}</div>

      <div class="section">
        <div class="section-title">{s.carriers}</div>
        {CARRIERS.map(([key, label]) => (
          <label class="check">
            <input
              type="checkbox"
              checked={!(settings.disabledCarriers ?? []).includes(key)}
              onChange={() => toggleCarrier(key)}
            />
            {label}
          </label>
        ))}
      </div>

      <div class="section">
        <div class="section-title">{s.fx}</div>
        {fx ? (
          <>
            <div class="row fx">
              <span>
                1$ = {fx.USD.toFixed(4)}₾ · 1€ = {fx.EUR.toFixed(4)}₾ · 1£ = {fx.GBP.toFixed(4)}₾
                <br />
                {fx.source.toUpperCase()} · {fx.date.slice(0, 10)}
                {fxCheckedAt > 0 &&
                  ` · ✓ ${new Date(fxCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </span>
              <button
                class="ghost"
                onClick={() =>
                  void chrome.runtime
                    .sendMessage({ type: 'get-fx', force: true })
                    .then((r: { ok: boolean; rates: FxRates; fetchedAt?: number }) => {
                      if (r?.ok) {
                        setFx(r.rates);
                        setFxCheckedAt(r.fetchedAt ?? Date.now());
                      }
                    })
                }
              >
                {s.refresh}
              </button>
            </div>
            <div class="hint">{s.fxDateHint}</div>
          </>
        ) : (
          '…'
        )}
        <div class="hint">{s.manualFx}</div>
        <div class="row">
          {(['USD', 'EUR', 'GBP'] as const).map((code) => (
            <label style="display:inline-flex; align-items:center; gap:4px; font-size:12px;">
              {code}
              <input
                type="number" step="0.0001" min="0"
                value={settings.manualFxOverride?.[code] ?? ''}
                onChange={(e) => setManualFx(code, (e.target as HTMLInputElement).value)}
              />
            </label>
          ))}
        </div>
      </div>

      <div class="section">
        <label class="check" title={s.anySiteHint}>
          <input type="checkbox" checked={anySite} onChange={() => void toggleAnySite()} />
          {s.anySite}
        </label>
        <div class="hint">{s.anySiteHint}</div>
      </div>

      <div class="section">
        <div class="section-title">{s.remoteRates}</div>
        <label class="check">
          <input
            type="checkbox"
            checked={Boolean(settings.remoteRatesEnabled)}
            onChange={(e) =>
              save({ ...settings, remoteRatesEnabled: (e.target as HTMLInputElement).checked })
            }
          />
          {s.enabled}
        </label>
        <input
          type="url" placeholder="https://raw.githubusercontent.com/.../rates.json"
          value={settings.remoteRatesUrl ?? ''}
          onChange={(e) => {
            save({ ...settings, remoteRatesUrl: (e.target as HTMLInputElement).value });
            void chrome.runtime.sendMessage({ type: 'refresh-remote-rates' });
          }}
        />
      </div>
      </>}
    </div>
  );
}

render(<Popup />, document.getElementById('app')!);
