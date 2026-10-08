/**
 * Injected into the shadow root — never touches page CSS.
 * Swiss skeleton, modern-fintech skin: the hierarchy of the International
 * Typographic Style (one hero number, flush columns, micro-labels, a single
 * red accent) rendered as a sleek product surface — glass card, soft layered
 * shadows, pill controls, smooth transitions.
 */
export const PANEL_CSS = `
:host { all: initial; }
* {
  box-sizing: border-box; margin: 0;
  font-family: -apple-system, "SF Pro Text", Inter, "Segoe UI", Roboto, "Noto Sans Georgian", sans-serif;
  -webkit-font-smoothing: antialiased;
}

:host {
  --paper: rgba(255,255,255,.92);
  --solid: #ffffff;
  --surface: #f4f4f6;
  --surface-hover: #ececef;
  --ink: #16181c;
  --grey: #74777d;
  --grey-light: #b0b3b8;
  --rule: rgba(22,24,28,.08);
  --red: #e5484d;
  --red-soft: rgba(229,72,77,.08);
  --shadow: 0 0 0 1px rgba(22,24,28,.06), 0 2px 6px rgba(22,24,28,.06), 0 16px 40px rgba(22,24,28,.16);
}
@media (prefers-color-scheme: dark) {
  :host {
    --paper: rgba(26,27,30,.92);
    --solid: #1a1b1e;
    --surface: #26272b;
    --surface-hover: #2e2f34;
    --ink: #f3f4f6;
    --grey: #9a9da3;
    --grey-light: #5c5f66;
    --rule: rgba(243,244,246,.08);
    --red: #ff5c61;
    --red-soft: rgba(255,92,97,.1);
    --shadow: 0 0 0 1px rgba(255,255,255,.06), 0 2px 6px rgba(0,0,0,.4), 0 16px 48px rgba(0,0,0,.55);
  }
}

button { transition: all .15s ease; }

/* ---------- collapsed pill ---------- */
.gpc-pill {
  position: fixed; right: 20px; bottom: 20px; z-index: 2147483646;
  display: inline-flex; align-items: baseline; gap: 7px;
  padding: 11px 18px; border: none; cursor: pointer; border-radius: 999px;
  background: var(--paper); color: var(--ink);
  backdrop-filter: blur(20px) saturate(1.6); -webkit-backdrop-filter: blur(20px) saturate(1.6);
  font-size: 13.5px; font-weight: 600; letter-spacing: -0.01em;
  box-shadow: var(--shadow);
  transition: transform .15s ease, box-shadow .15s ease;
}
.gpc-pill:hover { transform: translateY(-2px); }
.gpc-pill-icon { color: var(--red); font-weight: 700; font-size: 13px; }
.gpc-pill-total { font-variant-numeric: tabular-nums; }

/* ---------- expanded card ---------- */
.gpc-card {
  position: fixed; right: 20px; bottom: 20px; z-index: 2147483646;
  width: 330px;
  background: var(--paper); color: var(--ink);
  backdrop-filter: blur(24px) saturate(1.6); -webkit-backdrop-filter: blur(24px) saturate(1.6);
  border-radius: 20px;
  box-shadow: var(--shadow);
  font-size: 13px; line-height: 1.5;
  overflow: hidden;
}

.gpc-header {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 18px 0;
  cursor: grab; user-select: none; touch-action: none;
}
.gpc-header:active { cursor: grabbing; }
.gpc-corridor {
  border: none; background: var(--surface); padding: 5px 12px; border-radius: 999px;
  font-size: 11px; font-weight: 600;
  cursor: pointer; max-width: 170px; color: var(--ink);
  transition: background .15s ease;
}
.gpc-corridor:hover { background: var(--surface-hover); }
.gpc-unsure { color: var(--red); font-weight: 700; cursor: help; font-size: 11px; }
.gpc-arrow {
  color: var(--grey-light); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-size: 11px; font-weight: 500;
}
.gpc-iconbtn {
  border: none; background: transparent; cursor: pointer;
  color: var(--grey-light); font-size: 12px; line-height: 1;
  width: 26px; height: 26px; border-radius: 999px;
  display: inline-flex; align-items: center; justify-content: center;
}
.gpc-iconbtn:hover { background: var(--surface); color: var(--ink); }

.gpc-body { padding: 8px 18px 14px; }
.gpc-warn {
  background: var(--red-soft); color: var(--red); border-radius: 12px;
  padding: 8px 12px; margin: 8px 0 4px; font-size: 12px; font-weight: 500;
}

.gpc-title {
  font-size: 11px; font-weight: 500; letter-spacing: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--grey);
  margin-top: 10px;
}

/* ---------- hero: the landed total ---------- */
.gpc-hero { padding: 12px 0 16px; }
.gpc-hero-label {
  font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  color: var(--grey); margin-bottom: 2px;
}
.gpc-hero-total {
  font-size: 46px; font-weight: 700; letter-spacing: -0.04em; line-height: 1.08;
  font-variant-numeric: tabular-nums; color: var(--ink);
}
.gpc-hero-cur { font-size: 28px; font-weight: 600; color: var(--red); letter-spacing: -0.01em; }
.gpc-hero-sub { margin-top: 5px; font-size: 12.5px; color: var(--grey); font-weight: 500; }
.gpc-hero-sub strong { color: var(--ink); font-weight: 650; }
.gpc-red { color: var(--red); font-weight: 650; }

/* ---------- carrier table ---------- */
.gpc-quotes { display: grid; gap: 2px; }
.gpc-quote {
  display: flex; align-items: baseline;
  padding: 9px 12px; border-radius: 12px;
  transition: background .15s ease;
}
.gpc-quote:hover { background: var(--surface); }
.gpc-cheapest { background: var(--red-soft); }
.gpc-cheapest:hover { background: var(--red-soft); }
.gpc-carrier { font-weight: 600; font-size: 13px; flex: 1; letter-spacing: -0.01em; }
.gpc-cheapest .gpc-carrier::after {
  content: '●'; color: var(--red); font-size: 7px; margin-left: 7px; vertical-align: 2px;
}
.gpc-days {
  width: 80px; text-align: right; font-size: 10.5px; color: var(--grey-light);
  font-weight: 500; font-variant-numeric: tabular-nums;
}
.gpc-total {
  width: 82px; text-align: right; font-weight: 500; font-size: 13.5px;
  font-variant-numeric: tabular-nums;
}
.gpc-cheapest .gpc-total { font-weight: 700; color: var(--red); }
.gpc-unavail .gpc-carrier { color: var(--grey-light); font-weight: 500; }
.gpc-reason { font-size: 10.5px; color: var(--grey-light); text-align: right; flex: 1; }

/* ---------- details ledger ---------- */
.gpc-details { border-top: 1px solid var(--rule); margin-top: 10px; padding: 12px 2px 0; display: grid; gap: 9px; }
.gpc-drow { display: flex; align-items: baseline; }
.gpc-dlabel {
  width: 84px; flex-shrink: 0;
  font-size: 9.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  color: var(--grey-light);
}
.gpc-dvalue { font-size: 12.5px; font-weight: 500; font-variant-numeric: tabular-nums; }
.gpc-est { color: var(--grey-light); font-size: 10.5px; font-weight: 400; }
.gpc-gel {
  border: none; background: transparent; color: var(--grey); cursor: pointer; padding: 0;
  font-size: 12.5px; font-weight: 500; font-variant-numeric: tabular-nums;
  border-bottom: 1px dotted var(--grey-light);
}
.gpc-gel:hover { color: var(--red); border-bottom-color: var(--red); }
.gpc-weight-chip {
  border: none; background: var(--surface); border-radius: 999px;
  padding: 2px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer; white-space: nowrap;
  color: var(--ink); font-variant-numeric: tabular-nums;
}
.gpc-weight-chip:hover { background: var(--surface-hover); color: var(--red); }
.gpc-price-edit { display: inline-flex; gap: 6px; }
.gpc-price-edit input, .gpc-price-edit select {
  padding: 4px 10px; border: none; background: var(--surface); color: var(--ink);
  font-size: 12.5px; border-radius: 8px; font-variant-numeric: tabular-nums; font-weight: 500;
}
.gpc-price-edit input { width: 84px; }
.gpc-price-edit input:focus, .gpc-price-edit select:focus { outline: 2px solid var(--red); outline-offset: 0; }

.gpc-fxinfo {
  background: var(--surface); border-radius: 12px;
  padding: 8px 12px; margin: 10px 0 0; font-size: 10.5px; color: var(--grey);
  font-variant-numeric: tabular-nums;
}

.gpc-editor { background: var(--surface); border-radius: 14px; padding: 14px; margin: 12px 0 0; display: grid; gap: 10px; }
.gpc-editor label {
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  font-size: 9.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--grey);
}
.gpc-editor input {
  width: 66px; padding: 5px 8px; border: none; border-radius: 8px;
  background: var(--solid); color: var(--ink); font-size: 13px; font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.gpc-editor input:focus { outline: 2px solid var(--red); outline-offset: 0; }
.gpc-dims { display: inline-flex; align-items: center; gap: 4px; color: var(--ink); }
.gpc-dims input { width: 44px; }
.gpc-save {
  justify-self: end; border: none; background: var(--ink); color: var(--solid);
  padding: 7px 20px; cursor: pointer; font-weight: 600; font-size: 12px; border-radius: 999px;
}
.gpc-save:hover { background: var(--red); color: #fff; }

.gpc-meta {
  color: var(--grey-light); font-size: 9px; margin-top: 14px;
  letter-spacing: .06em; text-transform: uppercase; font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.gpc-stale { color: var(--red); }
.gpc-vol { cursor: help; }
`;
