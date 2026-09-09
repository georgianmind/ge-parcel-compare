/**
 * TODO: Trendyol (Turkey) adapter — NOT SHIPPED YET.
 *
 * Sketch:
 * - matches: hostname trendyol.com → corridor 'turkey' (always; corridorConfident true).
 * - Trendyol embeds product JSON in `window.__PRODUCT_DETAIL_APP_INITIAL_STATE__`
 *   (needs a page-world script or parsing the inline <script> text) and also
 *   JSON-LD Product on most PDPs — prefer JSON-LD via shared.findJsonLdProduct.
 * - Title: 'h1.pr-new-br' or 'h1[data-testid]'.
 * - Price: '.prc-dsc' (discounted) else '.prc-slg'; currency TRY — NOTE: TRY is
 *   not in our Currency union; add TRY to FX fetch (NBG publishes TRY) before shipping.
 * - Category: breadcrumb '.breadcrumb-wrapper a'.
 * - SPA: partial — hook history like the Zara adapter.
 */
export {};
