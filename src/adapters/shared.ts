import type { CorridorKey, Currency } from '../engine/types';

export function parseCurrency(code: string | undefined | null): Currency | null {
  if (!code) return null;
  const c = code.trim().toUpperCase();
  if (c === 'USD' || c === '$') return 'USD';
  if (c === 'EUR' || c === '€') return 'EUR';
  if (c === 'GBP' || c === '£') return 'GBP';
  if (c === 'GEL' || c === '₾') return 'GEL';
  return null;
}

export function parsePrice(raw: string | number | undefined | null): number | null {
  if (raw == null) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  // strip everything but digits, separators
  const cleaned = raw.replace(/[^\d.,]/g, '');
  if (!cleaned) return null;
  // European format "1.234,56" vs US "1,234.56"
  let normalized: string;
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = cleaned.replace(/,/g, '');
  }
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

/** country/locale code → corridor */
const COUNTRY_CORRIDOR: Record<string, CorridorKey> = {
  us: 'usa', tr: 'turkey', cn: 'china-air', gb: 'uk', uk: 'uk',
  de: 'germany', gr: 'greece', it: 'italy', es: 'spain', cy: 'cyprus',
};

export function corridorFromCountryCode(code: string | undefined | null): CorridorKey | null {
  if (!code) return null;
  return COUNTRY_CORRIDOR[code.trim().toLowerCase()] ?? null;
}

export function corridorFromTld(hostname: string): CorridorKey | null {
  const tld = hostname.split('.').pop()?.toLowerCase();
  if (!tld) return null;
  if (tld === 'com') return null; // ambiguous — needs path/locale evidence
  return corridorFromCountryCode(tld === 'co' ? null : tld);
}

interface JsonLdProduct {
  name?: string;
  image?: string | string[] | { url?: string };
  category?: string;
  offers?: JsonLdOffer | JsonLdOffer[];
}
interface JsonLdOffer {
  price?: string | number;
  priceCurrency?: string;
  lowPrice?: string | number;
}

function isProductNode(node: unknown): node is JsonLdProduct {
  if (typeof node !== 'object' || node === null) return false;
  const t = (node as { '@type'?: unknown })['@type'];
  return t === 'Product' || (Array.isArray(t) && t.includes('Product'));
}

/** Find a JSON-LD Product node anywhere in the document. */
export function findJsonLdProduct(doc: Document): JsonLdProduct | null {
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  for (const s of scripts) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(s.textContent ?? '');
    } catch {
      continue;
    }
    const candidates: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
    for (const c of candidates) {
      if (isProductNode(c)) return c;
      const graph = (c as { '@graph'?: unknown[] })?.['@graph'];
      if (Array.isArray(graph)) {
        const p = graph.find(isProductNode);
        if (p) return p as JsonLdProduct;
      }
    }
  }
  return null;
}

export function jsonLdPrice(p: JsonLdProduct): { amount: number; currency: Currency } | null {
  const offers = Array.isArray(p.offers) ? p.offers[0] : p.offers;
  if (!offers) return null;
  const amount = parsePrice(offers.price ?? offers.lowPrice);
  const currency = parseCurrency(offers.priceCurrency);
  if (amount == null || currency == null) return null;
  return { amount, currency };
}

export function jsonLdImage(p: JsonLdProduct): string | undefined {
  const img = p.image;
  if (typeof img === 'string') return img;
  if (Array.isArray(img)) return typeof img[0] === 'string' ? img[0] : undefined;
  if (img && typeof img === 'object') return img.url;
  return undefined;
}

export type { JsonLdProduct };
