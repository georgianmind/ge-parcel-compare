import type { CorridorKey } from '../engine/types';
import type { ProductInfo, SiteAdapter } from './types';
import {
  corridorFromCountryCode,
  corridorFromTld,
  findJsonLdProduct,
  jsonLdImage,
  jsonLdPrice,
  parseCurrency,
  parsePrice,
} from './shared';

function fromOpenGraph(doc: Document): Omit<ProductInfo, 'shipsFromCountry' | 'corridorConfident'> | null {
  const meta = (prop: string) =>
    doc.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`)?.getAttribute('content');
  const amount = parsePrice(meta('product:price:amount') ?? meta('og:price:amount'));
  const currency = parseCurrency(meta('product:price:currency') ?? meta('og:price:currency'));
  const title = meta('og:title') ?? doc.title;
  if (amount == null || currency == null || !title) return null;
  return { title, priceAmount: amount, priceCurrency: currency, imageUrl: meta('og:image') ?? undefined };
}

function fromMicrodata(doc: Document): Omit<ProductInfo, 'shipsFromCountry' | 'corridorConfident'> | null {
  const scope = doc.querySelector('[itemtype*="schema.org/Product" i]');
  if (!scope) return null;
  const prop = (name: string) => {
    const el = scope.querySelector(`[itemprop="${name}"]`);
    return el?.getAttribute('content') ?? el?.textContent ?? null;
  };
  const title = prop('name')?.trim();
  const amount = parsePrice(prop('price'));
  const currency = parseCurrency(prop('priceCurrency'));
  if (!title || amount == null || currency == null) return null;
  return { title, priceAmount: amount, priceCurrency: currency };
}

function inferCorridor(doc: Document, url: URL): { corridor: CorridorKey; confident: boolean } {
  // 1. explicit locale in path (/de/, /gr-en/, ...)
  const firstSeg = url.pathname.split('/').filter(Boolean)[0]?.slice(0, 2);
  const fromPath = corridorFromCountryCode(firstSeg);
  if (fromPath) return { corridor: fromPath, confident: true };

  // 2. html lang region (en-GB, de-DE)
  const lang = doc.documentElement.lang;
  const region = lang?.split('-')[1];
  const fromLang = corridorFromCountryCode(region);
  if (fromLang) return { corridor: fromLang, confident: false };

  // 3. TLD
  const fromTld = corridorFromTld(url.hostname);
  if (fromTld) return { corridor: fromTld, confident: false };

  // 4. currency-based low-confidence default happens at the UI layer; fall back to USA
  return { corridor: 'usa', confident: false };
}

export const genericAdapter: SiteAdapter = {
  id: 'generic',

  matches(): boolean {
    return true; // fallback — always matches, registered last
  },

  extract(doc: Document, url: URL): ProductInfo | null {
    const { corridor, confident } = inferCorridor(doc, url);

    const ld = findJsonLdProduct(doc);
    if (ld?.name) {
      const price = jsonLdPrice(ld);
      if (price) {
        return {
          title: ld.name,
          priceAmount: price.amount,
          priceCurrency: price.currency,
          shipsFromCountry: corridor,
          corridorConfident: confident,
          category: ld.category ?? url.pathname,
          imageUrl: jsonLdImage(ld),
        };
      }
    }

    const og = fromOpenGraph(doc) ?? fromMicrodata(doc);
    if (og) {
      return { ...og, shipsFromCountry: corridor, corridorConfident: confident, category: url.pathname };
    }
    return null;
  },
};
