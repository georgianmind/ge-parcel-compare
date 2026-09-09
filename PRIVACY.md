# Privacy Policy — GE Parcel Compare

_Last updated: 2026-09-03_

## The short version

**Nothing you browse leaves your browser.** GE Parcel Compare does all price and
shipping-cost computation locally, on your device.

## What the extension accesses

- **Product page content.** On supported retailer sites (and, only if you opt in
  to "any site" mode, on other sites), the extension reads the visible product
  title, price, and category **on the page you are viewing** in order to display
  the cost comparison overlay. This data is processed in-page and is **never
  transmitted anywhere**.
- **Your settings and corrections** (language, carrier toggles, corrected
  weights, overlay position) are stored in `chrome.storage.local` on your
  device only.

## Network requests the extension makes

The extension makes exactly two kinds of external requests, neither of which
contains any personal data, browsing data, or product data:

1. **Exchange rates** — a request to the National Bank of Georgia
   (`nbg.gov.ge`) roughly every 6 hours to fetch official GEL exchange rates,
   with `api.frankfurter.dev` as a fallback. The request contains only the
   currency codes USD, EUR, GBP.
2. **Rate-table updates (opt-in, off by default)** — if you explicitly enable
   remote rate updates in settings and provide a URL, the extension fetches
   that static JSON file. No data is sent with the request.

## What we do NOT do

- No analytics, telemetry, or crash reporting.
- No transmission of browsing history, product views, or page content.
- No cookies, fingerprinting, or identifiers.
- No accounts; nothing is stored server-side (there is no server).
- No selling or sharing of data with third parties — we never see any data
  in the first place.

## Permissions explained

- `storage` — save your settings and corrected weights locally.
- `alarms` — schedule the 6-hourly exchange-rate refresh.
- `scripting` — used only to enable the overlay on additional sites after you
  explicitly grant "any site" access.
- Host access to `nbg.gov.ge` / `api.frankfurter.dev` — exchange rates only.
- Host access to `zara.com` — display the overlay on product pages.
- Optional `<all_urls>` — requested at runtime **only** if you switch on
  "any site" mode in the popup; revocable there at any time.

## Contact

Questions: open an issue on the project repository.
