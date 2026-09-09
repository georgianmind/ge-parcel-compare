# GE Parcel Compare

Chrome extension (MV3) that overlays a Georgian-forwarder landed-cost
comparison on retailer product pages: browse a product on zara.com, see the
total cost to Tbilisi via **Camex**, **Inex**, and **USA2Georgia** — cheapest
first, with the 300 ₾ duty-free/VAT check and honest, editable weight estimates.

## Development

```bash
npm install
npm run dev        # Vite + CRXJS dev build with HMR
npm test           # Vitest: engine + adapter tests
npm run build      # type-check + production build → dist/
npm run zip        # build + Chrome Web Store zip
```

Load `dist/` as an unpacked extension via `chrome://extensions` → Developer
mode → Load unpacked.

## Architecture

```
/src
  /adapters    per-retailer scrapers (zara.ts) + generic fallback; registry in index.ts
  /engine      pure cost engine — no browser APIs, shared with a future web app
  /data        rates.ts (versioned, lastVerified per rate), weights.ts (category heuristics)
  /content     content script + shadow-DOM overlay (Preact)
  /background  service worker: NBG FX fetch + cache, alarms, any-site registration
  /popup       settings: language, FX override, carrier toggles, remote rates opt-in
```

Key invariants:

- **Everything is computed client-side.** The only network calls are NBG /
  frankfurter FX and the opt-in remote `rates.json`. See [PRIVACY.md](PRIVACY.md).
- Billable weight = `max(actual, volumetric)` per carrier divisor, then the
  per-corridor minimum floor, then rounded **up** to 100 g. USA2Georgia's
  Turkey lane bills actual weight when volumetric ≤ 50 kg.
- Weight estimates are heuristics — always labeled "estimated", editable
  inline, and corrections are remembered per category.
- Adding a retailer = one new file in `/src/adapters` registered in
  `adapters/index.ts`. Amazon and Trendyol are sketched in `*.todo.ts`.

## Updating rates

Edit `src/data/rates.ts` (bump `lastVerified`). The UI shows the verification
date and warns when rates are older than 60 days. Users who opt in can point
the extension at a raw GitHub `rates.json` for updates between releases.
