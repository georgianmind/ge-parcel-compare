/**
 * Injected into the shadow root — never touches page CSS.
 * International Typographic Style, applied as discipline, not costume:
 * one hero number (the landed total — the only number this card knows that
 * the page doesn't), a 6x type scale, one accent used once, one alignment
 * axis, hairline rules, generous whitespace.
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
  --grey: #767676;
  --grey-light: #b4b4b4;
  --rule: #111111;
  --rule-soft: #e6e6e6;
  --red: #e30613;
}
@media (prefers-color-scheme: dark) {
  :host {
    --paper: #161616;
    --ink: #f4f4f2;
    --grey: #9a9a9a;
    --grey-light: #5e5e5e;
    --rule: #f4f4f2;
    --rule-soft: #2e2e2e;
    --red: #ff3340;
  }
}

/* ---------- collapsed pill ---------- */
.gpc-pill {
  position: fixed; right: 20px; bottom: 20px; z-index: 2147483646;
  display: inline-flex; align-items: baseline; gap: 8px;
  padding: 11px 16px; border: none; cursor: pointer;
  background: var(--red); color: #fff;
  font-size: 14px; font-weight: 700;
}
.gpc-pill:hover { background: #111; }
.gpc-pill-icon { font-size: 12px; font-weight: 400; opacity: .85; }
.gpc-pill-total { font-variant-numeric: tabular-nums; }

/* ---------- expanded card ---------- */
.gpc-card {
  position: fixed; right: 20px; bottom: 20px; z-index: 2147483646;
  width: 328px;
  background: var(--paper); color: var(--ink);
  border-top: 5px solid var(--red);
  box-shadow: 0 1px 2px rgba(0,0,0,.14), 0 12px 32px rgba(0,0,0,.18);
  font-size: 13px; line-height: 1.5;
}

.gpc-header {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 22px 0;
  cursor: grab; user-select: none; touch-action: none;
}
.gpc-header:active { cursor: grabbing; }
.gpc-corridor {
  border: none; background: transparent; padding: 0;
  font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
  cursor: pointer; max-width: 170px; color: var(--grey);
}
.gpc-corridor:hover { color: var(--ink); }
.gpc-unsure { color: var(--red); font-weight: 700; cursor: help; font-size: 11px; }
.gpc-arrow {
  color: var(--grey); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
}
.gpc-iconbtn {
  border: none; background: transparent; cursor: pointer;
  color: var(--grey-light); font-size: 13px; padding: 2px 4px; line-height: 1;
}
.gpc-iconbtn:hover { color: var(--ink); }

.gpc-body { padding: 10px 22px 16px; }
.gpc-warn {
  border-left: 3px solid var(--red);
  padding: 3px 0 3px 10px; margin: 8px 0 4px; font-size: 12px;
}

.gpc-title {
  font-size: 10px; font-weight: 400; letter-spacing: .06em; text-transform: uppercase;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--grey);
  margin-top: 10px;
}

/* ---------- hero: the landed total ---------- */
.gpc-hero { padding: 14px 0 18px; }
.gpc-hero-label {
  font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
  color: var(--grey); margin-bottom: 2px;
}
.gpc-hero-total {
  font-size: 52px; font-weight: 700; letter-spacing: -0.035em; line-height: 1.05;
  font-variant-numeric: tabular-nums; color: var(--ink);
}
.gpc-hero-cur { font-size: 30px; font-weight: 400; color: var(--red); letter-spacing: 0; }
.gpc-hero-sub { margin-top: 6px; font-size: 12px; color: var(--grey); }
.gpc-hero-sub strong { color: var(--ink); font-weight: 700; }
.gpc-red { color: var(--red); font-weight: 700; }

/* ---------- carrier table: three flush columns ---------- */
.gpc-quotes { border-top: 1px solid var(--rule); }
.gpc-quote {
  display: flex; align-items: baseline;
  padding: 10px 0; border-bottom: 1px solid var(--rule-soft);
}
.gpc-carrier { font-weight: 700; font-size: 13px; flex: 1; }
.gpc-cheapest .gpc-carrier::after {
  content: '●'; color: var(--red); font-size: 8px; margin-left: 7px; vertical-align: 2px;
}
.gpc-days {
  width: 86px; text-align: right; font-size: 10px; color: var(--grey);
  letter-spacing: .04em; font-variant-numeric: tabular-nums;
}
.gpc-total {
  width: 84px; text-align: right; font-weight: 400; font-size: 14px;
  font-variant-numeric: tabular-nums;
}
.gpc-cheapest .gpc-total { font-weight: 700; }
.gpc-unavail .gpc-carrier { color: var(--grey-light); font-weight: 400; }
.gpc-reason { font-size: 10px; color: var(--grey-light); text-align: right; flex: 1; }

/* ---------- details: label column / value column ---------- */
.gpc-details { padding: 12px 0 0; display: grid; gap: 8px; }
.gpc-drow { display: flex; align-items: baseline; }
.gpc-dlabel {
  width: 86px; flex-shrink: 0;
  font-size: 9.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  color: var(--grey);
}
.gpc-dvalue { font-size: 12.5px; font-variant-numeric: tabular-nums; }
.gpc-est { color: var(--grey-light); font-size: 10.5px; }
.gpc-gel {
  border: none; background: transparent; color: var(--grey); cursor: pointer; padding: 0;
  font-size: 12.5px; font-variant-numeric: tabular-nums;
  border-bottom: 1px dotted var(--grey-light);
}
.gpc-gel:hover { color: var(--red); border-bottom-color: var(--red); }
.gpc-weight-chip {
  border: none; border-bottom: 1px dashed var(--grey-light); background: transparent;
  padding: 0 0 1px; font-size: 12.5px; cursor: pointer; white-space: nowrap;
  color: var(--ink); font-variant-numeric: tabular-nums;
}
.gpc-weight-chip:hover { border-bottom-color: var(--red); color: var(--red); }
.gpc-price-edit { display: inline-flex; gap: 6px; }
.gpc-price-edit input, .gpc-price-edit select {
  padding: 3px 6px; border: 1px solid var(--rule-soft); background: var(--paper); color: var(--ink);
  font-size: 12.5px; border-radius: 0; font-variant-numeric: tabular-nums;
}
.gpc-price-edit input { width: 84px; }
.gpc-price-edit input:focus, .gpc-price-edit select:focus { outline: none; border-color: var(--ink); }

.gpc-fxinfo {
  border-left: 3px solid var(--rule-soft);
  padding: 3px 0 3px 10px; margin: 10px 0 0; font-size: 10.5px; color: var(--grey);
  font-variant-numeric: tabular-nums;
}

.gpc-editor { border: 1px solid var(--rule-soft); padding: 14px; margin: 12px 0 0; display: grid; gap: 10px; }
.gpc-editor label {
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  font-size: 9.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--grey);
}
.gpc-editor input {
  width: 66px; padding: 4px 6px; border: 1px solid var(--rule-soft); border-radius: 0;
  background: var(--paper); color: var(--ink); font-size: 13px; font-variant-numeric: tabular-nums;
}
.gpc-editor input:focus { outline: none; border-color: var(--ink); }
.gpc-dims { display: inline-flex; align-items: center; gap: 4px; color: var(--ink); }
.gpc-dims input { width: 44px; }
.gpc-save {
  justify-self: end; border: none; background: var(--ink); color: var(--paper);
  padding: 8px 22px; cursor: pointer; font-weight: 700; font-size: 10px;
  letter-spacing: .14em; text-transform: uppercase;
}
.gpc-save:hover { background: var(--red); color: #fff; }

.gpc-meta {
  color: var(--grey-light); font-size: 8.5px; margin-top: 16px;
  letter-spacing: .14em; text-transform: uppercase; font-variant-numeric: tabular-nums;
}
.gpc-stale { color: var(--red); }
.gpc-vol { cursor: help; }
`;
