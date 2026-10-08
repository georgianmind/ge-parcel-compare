/**
 * Injected into the shadow root — never touches page CSS.
 * International Typographic Style (Swiss): flat planes, hairline rules,
 * Helvetica, tabular numerals, black/white/red. No gradients, no shadows
 * except a flat print-offset, no rounded corners.
 */
export const PANEL_CSS = `
:host { all: initial; }
* {
  box-sizing: border-box; margin: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, "Noto Sans Georgian", sans-serif;
}

:host {
  --paper: #ffffff;
  --ink: #111111;
  --grey: #6e6e6e;
  --grey-light: #a8a8a8;
  --rule: #111111;
  --rule-soft: #e2e2e2;
  --red: #e30613;
  --offset-shadow: 6px 6px 0 rgba(17,17,17,.14);
}
@media (prefers-color-scheme: dark) {
  :host {
    --paper: #141414;
    --ink: #f4f4f2;
    --grey: #9a9a9a;
    --grey-light: #6e6e6e;
    --rule: #f4f4f2;
    --rule-soft: #333333;
    --red: #ff3340;
    --offset-shadow: 6px 6px 0 rgba(0,0,0,.5);
  }
}

.gpc-label {
  font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  color: var(--grey);
}

/* ---------- collapsed pill: flat red plate ---------- */
.gpc-pill {
  position: fixed; right: 20px; bottom: 20px; z-index: 2147483646;
  display: inline-flex; align-items: baseline; gap: 8px;
  padding: 10px 14px; border: none; cursor: pointer;
  background: var(--red); color: #fff;
  font-size: 13px; font-weight: 700; letter-spacing: .02em;
  box-shadow: var(--offset-shadow);
}
.gpc-pill:hover { transform: translate(-1px,-1px); box-shadow: 7px 7px 0 rgba(17,17,17,.14); }
.gpc-pill-icon { font-size: 12px; font-weight: 400; }
.gpc-pill-total { font-variant-numeric: tabular-nums; }

/* ---------- expanded card ---------- */
.gpc-card {
  position: fixed; right: 20px; bottom: 20px; z-index: 2147483646;
  width: 344px;
  background: var(--paper); color: var(--ink);
  border: 1.5px solid var(--ink);
  border-top: 6px solid var(--red);
  box-shadow: var(--offset-shadow);
  font-size: 13px; line-height: 1.45;
}

.gpc-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px 10px;
  border-bottom: 1px solid var(--rule);
  cursor: grab; user-select: none; touch-action: none;
}
.gpc-header:active { cursor: grabbing; }
.gpc-corridor {
  border: none; background: transparent; padding: 0;
  font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  cursor: pointer; max-width: 170px; color: var(--ink);
}
.gpc-unsure { color: var(--red); font-weight: 700; cursor: help; }
.gpc-arrow {
  color: var(--grey); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
}
.gpc-iconbtn {
  border: none; background: transparent; cursor: pointer;
  color: var(--ink); font-size: 13px; padding: 2px 4px; line-height: 1;
}
.gpc-iconbtn:hover { color: var(--red); }

.gpc-body { padding: 14px 16px 12px; }
.gpc-warn {
  border-left: 3px solid var(--red);
  padding: 4px 0 4px 10px; margin-bottom: 12px; font-size: 12px; color: var(--ink);
}

.gpc-product { display: flex; gap: 12px; margin-bottom: 10px; }
.gpc-product img { width: 44px; height: 58px; object-fit: cover; flex-shrink: 0; filter: grayscale(1) contrast(1.05); }
.gpc-product-info { min-width: 0; flex: 1; }
.gpc-title {
  font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--grey);
  margin-bottom: 4px;
}
.gpc-price { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.gpc-price strong { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.gpc-price-edit { display: inline-flex; gap: 6px; }
.gpc-price-edit input, .gpc-price-edit select {
  padding: 4px 6px; border: 1px solid var(--rule); background: var(--paper); color: var(--ink);
  font-size: 13px; border-radius: 0; font-variant-numeric: tabular-nums;
}
.gpc-price-edit input { width: 88px; }
.gpc-gel {
  border: none; background: transparent; color: var(--red); cursor: pointer; padding: 0;
  font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums;
}
.gpc-gel:hover { border-bottom: 1px solid var(--red); }
.gpc-weight-chip {
  border: none; border-bottom: 1px dashed var(--grey); background: transparent;
  padding: 0 0 1px; font-size: 11px; cursor: pointer; white-space: nowrap;
  color: var(--ink); font-variant-numeric: tabular-nums;
}
.gpc-weight-chip:hover { border-bottom-color: var(--red); color: var(--red); }

.gpc-fxinfo {
  border-left: 3px solid var(--ink);
  padding: 4px 0 4px 10px; margin: 10px 0; font-size: 11px; color: var(--grey);
  font-variant-numeric: tabular-nums;
}

.gpc-editor { border: 1px solid var(--rule); padding: 12px; margin: 10px 0; display: grid; gap: 9px; }
.gpc-editor label {
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--grey);
}
.gpc-editor input {
  width: 66px; padding: 4px 6px; border: 1px solid var(--rule); border-radius: 0;
  background: var(--paper); color: var(--ink); font-size: 13px; font-variant-numeric: tabular-nums;
}
.gpc-dims { display: inline-flex; align-items: center; gap: 4px; color: var(--ink); }
.gpc-dims input { width: 44px; }
.gpc-save {
  justify-self: end; border: none; background: var(--red); color: #fff;
  padding: 7px 20px; cursor: pointer; font-weight: 700; font-size: 10px;
  letter-spacing: .12em; text-transform: uppercase;
}
.gpc-save:hover { background: var(--ink); color: var(--paper); }

.gpc-est-note { color: var(--grey); font-size: 11px; margin: 4px 0 8px; font-variant-numeric: tabular-nums; }

.gpc-quotes { border-top: 1px solid var(--rule); margin: 10px 0 0; }
.gpc-quote {
  display: flex; align-items: baseline; gap: 10px;
  padding: 9px 2px; border-bottom: 1px solid var(--rule-soft);
}
.gpc-cheapest { position: relative; padding-left: 12px; }
.gpc-cheapest::before {
  content: ''; position: absolute; left: 0; top: 6px; bottom: 6px; width: 4px; background: var(--red);
}
.gpc-carrier { font-weight: 700; width: 96px; flex-shrink: 0; font-size: 13px; letter-spacing: -0.01em; }
.gpc-days { display: block; font-weight: 400; font-size: 9.5px; color: var(--grey); letter-spacing: .06em; text-transform: uppercase; }
.gpc-breakdown { color: var(--grey); font-size: 10.5px; flex: 1; min-width: 0; font-variant-numeric: tabular-nums; }
.gpc-total { font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; font-size: 14.5px; }
.gpc-cheapest .gpc-total { color: var(--red); }
.gpc-badge { color: var(--red); font-weight: 700; font-size: 11px; }
.gpc-vol { cursor: help; }
.gpc-unavail .gpc-carrier, .gpc-unavail .gpc-reason { color: var(--grey-light); }
.gpc-reason { font-size: 10.5px; }

.gpc-summary { padding-top: 10px; display: grid; gap: 5px; }
.gpc-sumrow {
  display: flex; justify-content: space-between; align-items: baseline;
  font-size: 11px; color: var(--grey); font-variant-numeric: tabular-nums;
  letter-spacing: .04em;
}
.gpc-sumrow > span:first-child { text-transform: uppercase; font-size: 9.5px; letter-spacing: .1em; font-weight: 700; }
.gpc-vat-free { color: var(--ink); }
.gpc-vat-free > span:first-child { color: var(--grey); }
.gpc-vat-due { color: var(--red); }
.gpc-grand {
  border-top: 3px solid var(--ink); margin-top: 6px; padding-top: 8px;
  color: var(--ink); align-items: baseline;
}
.gpc-grand > span:first-child { font-size: 10px; }
.gpc-grand > span:last-child { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }

.gpc-meta {
  color: var(--grey-light); font-size: 8.5px; margin-top: 12px;
  letter-spacing: .12em; text-transform: uppercase; font-variant-numeric: tabular-nums;
}
.gpc-stale { color: var(--red); }
`;
