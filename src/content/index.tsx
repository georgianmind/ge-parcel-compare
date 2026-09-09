import { render } from 'preact';
import { adapterFor } from '../adapters';
import type { ProductInfo } from '../adapters/types';
import { Panel } from './Panel';
import { PANEL_CSS } from './styles';
import { getFx, getRates, getSettings } from './storage';

const HOST_ID = 'ge-parcel-compare-host';

function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

async function main(): Promise<void> {
  const url = new URL(location.href);
  const adapter = adapterFor(url);

  const [fx, rates, settings] = await Promise.all([getFx(), getRates(), getSettings()]);

  let mount: HTMLElement | null = null;
  const ensureMount = (): HTMLElement => {
    if (mount) return mount;
    let host = document.getElementById(HOST_ID);
    if (!host) {
      host = document.createElement('div');
      host.id = HOST_ID;
      document.documentElement.appendChild(host);
    }
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    if (!shadow.querySelector('style')) {
      const style = document.createElement('style');
      style.textContent = PANEL_CSS;
      shadow.appendChild(style);
    }
    mount = document.createElement('div');
    mount.id = 'gpc-root';
    shadow.appendChild(mount);
    return mount;
  };

  // The panel is only injected when a product is detected — never on ordinary
  // pages. The popup's "show on this page" button forces it for manual entry.
  let forceShow = false;
  let lastKey = '';

  const rerender = () => {
    const currentUrl = new URL(location.href);
    const product: ProductInfo | null = adapter.extract(document, currentUrl);

    void chrome.runtime
      .sendMessage({ type: 'badge', detected: product !== null })
      .catch(() => undefined);

    if (product === null && !forceShow) {
      if (mount) render(null, mount); // leave the page untouched
      lastKey = `off|${currentUrl.pathname}`;
      return;
    }

    const key = product
      ? `${product.title}|${product.priceAmount}|${product.priceCurrency}|${product.shipsFromCountry}|${forceShow}`
      : `manual|${currentUrl.pathname}|${forceShow}`;
    if (key === lastKey) return;
    lastKey = key;
    render(<Panel product={product} rates={rates} fx={fx} settings={settings} />, ensureMount());
  };

  chrome.runtime.onMessage.addListener((msg: { type?: string }, _sender, sendResponse) => {
    if (msg?.type === 'toggle-panel') {
      forceShow = !forceShow;
      lastKey = '';
      rerender();
      sendResponse({ ok: true, shown: forceShow });
    }
    return false;
  });

  rerender();
  adapter.observe?.(debounce(rerender, 400));
}

void main();
