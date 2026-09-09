import type { CorridorKey } from '../engine/types';
import type { ProductInfo, SiteAdapter } from './types';
import {
  corridorFromCountryCode,
  findJsonLdProduct,
  jsonLdImage,
  jsonLdPrice,
  parseCurrency,
  parsePrice,
} from './shared';

/** zara.com/<locale>/... → corridor */
const ZARA_LOCALE_CORRIDOR: Record<string, CorridorKey> = {
  gr: 'greece',
  tr: 'turkey',
  de: 'germany',
  us: 'usa',
  uk: 'uk',
  it: 'italy',
  es: 'spain',
  cy: 'cyprus',
};

function corridorFromZaraPath(url: URL): CorridorKey | null {
  const seg = url.pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  if (!seg) return null;
  return ZARA_LOCALE_CORRIDOR[seg] ?? corridorFromCountryCode(seg);
}

function categoryFromPage(doc: Document, url: URL): string | undefined {
  // URL slug is the most reliable, e.g. /gr/en/ribbed-jacket-p012345.html
  const slug = url.pathname.split('/').pop() ?? '';
  const breadcrumb = Array.from(
    doc.querySelectorAll('[class*="breadcrumb" i] a, nav[aria-label*="breadcrumb" i] a'),
  )
    .map((a) => a.textContent ?? '')
    .join(' ');
  const combined = `${slug} ${breadcrumb}`.trim();
  return combined || undefined;
}

function extractFromDom(doc: Document): { title: string; amount: number; currency: ReturnType<typeof parseCurrency> } | null {
  const title =
    doc.querySelector('h1[class*="product" i], [data-qa-qualifier="product-detail-info-name"], h1')
      ?.textContent?.trim() ?? '';
  const priceEl = doc.querySelector(
    '[data-qa-qualifier="price-amount-current"], [class*="price__amount" i], [class*="price-current" i], .price__amount-current',
  );
  const raw = priceEl?.textContent ?? '';
  const amount = parsePrice(raw);
  const currency = parseCurrency(raw.match(/[€$£₾]|USD|EUR|GBP|GEL/i)?.[0] ?? null);
  if (!title || amount == null || currency == null) return null;
  return { title, amount, currency };
}

export const zaraAdapter: SiteAdapter = {
  id: 'zara',

  matches(url: URL): boolean {
    return /(^|\.)zara\.com$/.test(url.hostname);
  },

  extract(doc: Document, url: URL): ProductInfo | null {
    const corridor = corridorFromZaraPath(url);
    if (!corridor) return null;

    const category = categoryFromPage(doc, url);

    const ld = findJsonLdProduct(doc);
    if (ld) {
      const price = jsonLdPrice(ld);
      if (price && ld.name) {
        return {
          title: ld.name,
          priceAmount: price.amount,
          priceCurrency: price.currency,
          shipsFromCountry: corridor,
          corridorConfident: true,
          category: category ?? ld.category,
          imageUrl: jsonLdImage(ld),
        };
      }
    }

    const dom = extractFromDom(doc);
    if (dom && dom.currency) {
      return {
        title: dom.title,
        priceAmount: dom.amount,
        priceCurrency: dom.currency,
        shipsFromCountry: corridor,
        corridorConfident: true,
        category,
      };
    }
    return null;
  },

  observe(cb: () => void): void {
    // Zara is a SPA — hook history navigation plus a coarse DOM observer.
    const fire = () => cb();
    const wrap = (fn: typeof history.pushState) =>
      function (this: History, ...args: Parameters<typeof history.pushState>) {
        const r = fn.apply(this, args);
        fire();
        return r;
      };
    history.pushState = wrap(history.pushState);
    history.replaceState = wrap(history.replaceState);
    window.addEventListener('popstate', fire);

    const mo = new MutationObserver(fire);
    mo.observe(document.body, { childList: true, subtree: true });
  },
};
