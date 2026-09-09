/**
 * TODO: Amazon.de / Amazon.co.uk adapter — NOT SHIPPED YET.
 *
 * Sketch:
 * - matches: hostname amazon.de → corridor 'germany'; amazon.co.uk → 'uk'.
 * - Title: '#productTitle'.
 * - Price: '.a-price .a-offscreen' (first match inside '#corePrice_feature_div'
 *   or '#apex_desktop'), currency from symbol. Beware struck-through list
 *   prices — scope to the buybox.
 * - Category: '#wayfinding-breadcrumbs_feature_div a' text.
 * - Weight: '#productDetails_techSpec_section_1' / '#detailBullets_feature_div'
 *   sometimes lists "Item weight" — prefer real weight over heuristic when present.
 * - Ships-from caveat: marketplace sellers may ship from elsewhere; check
 *   '#merchant-info' and drop corridorConfident to false when not "Dispatched from Amazon".
 * - SPA: not needed, Amazon PDPs are full page loads.
 */
export {};
