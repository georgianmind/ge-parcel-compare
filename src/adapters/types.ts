import type { CorridorKey, Currency } from '../engine/types';

export interface ProductInfo {
  title: string;
  priceAmount: number;
  priceCurrency: Currency;
  shipsFromCountry: CorridorKey;
  /** false when corridor was guessed from TLD/locale with low confidence */
  corridorConfident: boolean;
  category?: string;
  imageUrl?: string;
}

export interface SiteAdapter {
  id: string;
  matches(url: URL): boolean;
  extract(doc: Document, url: URL): ProductInfo | null;
  /** SPA route-change hook; call cb (debounced by caller) when product may have changed */
  observe?(cb: () => void): void;
}
