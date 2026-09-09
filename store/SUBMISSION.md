# Chrome Web Store submission — copy-paste kit (v1.4.0)

Dashboard: https://chrome.google.com/webstore/devconsole
(One-time developer registration: $5, done in the dashboard on first visit.)

## 1. Package
Upload `ge-parcel-compare.zip` (built from `npm run zip`, manifest v1.4.0).

## 2. Store listing
- **Name / Summary / Description**: copy from `listing-en.md`; add the
  Georgian translation from `listing-ka.md` under "Add language → Georgian".
- **Category**: Shopping
- **Language**: English (default) + Georgian
- **Screenshots** (1280×800): upload the three PNGs in `screenshots/`.
- **Icon**: dashboard takes the 128px icon from the zip automatically;
  `public/icons/icon128.png` is also uploadable directly if asked.

## 3. Privacy tab (the make-or-break section)
- **Single purpose description**:
  "Shows the total landed cost of the product on the current retail page when
  shipped to Georgia via parcel forwarders (Camex, Inex, USA2Georgia,
  Kiwi Post), including transport, declaration fee and 18% import VAT."
- **Privacy policy URL**:
  https://github.com/georgianmind/ge-parcel-compare/blob/master/PRIVACY.md
- **Data usage disclosures**: check NOTHING is collected. The extension
  transmits no user data; the only network requests are exchange-rate fetches.
- **Permission justifications** (paste per permission):
  - `storage` — "Stores the user's settings, corrected weight estimates and
    saved forwarder addresses locally on the device. Nothing is transmitted."
  - `alarms` — "Schedules a 6-hourly refresh of official exchange rates."
  - `scripting` — "Registers the overlay content script on additional sites
    only after the user explicitly enables the optional 'any site' mode."
  - Host `nbg.gov.ge` — "Fetches official GEL exchange rates from the
    National Bank of Georgia (currency codes only, no user data)."
  - Host `api.frankfurter.dev` — "Fallback source for the same exchange
    rates when the National Bank API is unavailable."
  - Host `zara.com` — "Reads the product title, price and category on Zara
    product pages to display the shipping cost overlay. Processed locally."
  - Optional `<all_urls>` — "Requested at runtime only when the user turns on
    'any site' mode so the overlay can work on other stores. Revocable in the
    extension popup at any time."
- **Remote code**: answer "No, I am not using remote code." (The opt-in
  rates.json override is data (JSON), not code.)

## 4. Distribution
- Visibility: Public
- Regions: all (or Georgia-focused if preferred)

## 5. Submit
Save draft → Submit for review. Typical review: hours to a few days.
Updates later: bump `version` in package.json → `npm run zip` → "Package →
Upload new package" → submit.
