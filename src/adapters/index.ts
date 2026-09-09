import type { SiteAdapter } from './types';
import { zaraAdapter } from './zara';
import { genericAdapter } from './generic';

export * from './types';

/** Ordered registry — first match wins; generic must stay last. */
export const ADAPTERS: SiteAdapter[] = [zaraAdapter, genericAdapter];

export function adapterFor(url: URL): SiteAdapter {
  return ADAPTERS.find((a) => a.matches(url)) ?? genericAdapter;
}
