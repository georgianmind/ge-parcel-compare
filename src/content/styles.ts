/**
 * Injected into the shadow root — never touches page CSS.
 * Visual language modeled on MetaMask: white surfaces, #0376c9 primary blue,
 * #d6d9dc hairline borders, 16px card radius, pill-shaped controls.
 */
export const PANEL_CSS = `
:host { all: initial; }
* { box-sizing: border-box; font-family: "Euclid Circular B", -apple-system, "Segoe UI", Roboto, "Noto Sans Georgian", sans-serif; }

/* ---------- design tokens ---------- */
:host {
  --bg: #ffffff;
  --bg-alt: #f2f4f6;
  --bg-hover: #f5f6f7;
  --border: #d6d9dc;
  --text: #24272a;
  --text-alt: #535a61;
  --text-muted: #9fa6ae;
  --primary: #0376c9;
  --primary-soft: #eaf6ff;
  --success: #28a745;
  --success-soft: #ebf9ee;
  --warn: #bf5208;
  --warn-soft: #fef5ef;
  --shadow: 0 2px 16px rgba(3, 118, 201, .1), 0 8px 40px rgba(0,0,0,.12);
}

/* ---------- collapsed pill ---------- */
.gpc-pill {
  position: fixed; right: 16px; bottom: 16px; z-index: 2147483646;
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 14px; border: 1px solid var(--border); border-radius: 999px; cursor: pointer;
  background: var(--bg); color: var(--primary); font-size: 13px; font-weight: 700;
  box-shadow: var(--shadow);
  transition: transform .12s ease, box-shadow .12s ease;
}
.gpc-pill:hover { transform: translateY(-1px); }
.gpc-pill-icon { font-size: 14px; }
.gpc-pill-total { font-variant-numeric: tabular-nums; }

/* ---------- expanded card ---------- */
.gpc-card {
  position: fixed; right: 16px; bottom: 16px; z-index: 2147483646;
  width: 340px;
  background: var(--bg); color: var(--text);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow);
  font-size: 13px; line-height: 1.5; overflow: hidden;
}

.gpc-header {
  display: flex; align-items: center; gap: 6px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  cursor: grab; user-select: none; touch-action: none;
  background: var(--bg);
}
.gpc-header:active { cursor: grabbing; }
.gpc-corridor {
  border: 1px solid var(--border); background: var(--bg-alt);
  border-radius: 999px; padding: 3px 10px;
  font-size: 12.5px; font-weight: 600; cursor: pointer; max-width: 160px; color: var(--text);
}
.gpc-unsure { color: var(--warn); font-weight: 700; cursor: help; }
.gpc-arrow { color: var(--text-alt); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; }
.gpc-iconbtn {
  border: none; background: transparent; cursor: pointer;
  color: var(--text-muted); font-size: 13px; padding: 3px 6px; border-radius: 8px; line-height: 1;
}
.gpc-iconbtn:hover { background: var(--bg-hover); color: var(--text); }

.gpc-body { padding: 14px; }
.gpc-warn {
  background: var(--warn-soft); color: var(--warn); border-radius: 10px;
  padding: 7px 10px; margin-bottom: 10px; font-size: 12px;
}

.gpc-product { display: flex; gap: 10px; margin-bottom: 8px; }
.gpc-product img { width: 44px; height: 58px; object-fit: cover; border-radius: 10px; flex-shrink: 0; border: 1px solid var(--border); }
.gpc-product-info { min-width: 0; flex: 1; }
.gpc-title {
  font-weight: 600; font-size: 12.5px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  color: var(--text-alt);
}
.gpc-price { margin-top: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.gpc-price strong { font-size: 16px; font-weight: 700; }
.gpc-price-edit { display: inline-flex; gap: 4px; }
.gpc-price-edit input, .gpc-price-edit select {
  padding: 4px 8px; border: 1px solid var(--border); border-radius: 8px;
  background: var(--bg); color: var(--text); font-size: 13px;
}
.gpc-price-edit input { width: 88px; }
.gpc-gel { border: none; background: transparent; color: var(--primary); cursor: pointer; padding: 0; font-size: 13px; font-weight: 600; }
.gpc-gel:hover { text-decoration: underline; }
.gpc-weight-chip {
  border: 1px solid var(--border); background: var(--bg-alt); border-radius: 999px;
  padding: 3px 10px; font-size: 11.5px; cursor: pointer; white-space: nowrap; color: var(--text-alt); font-weight: 600;
}
.gpc-weight-chip:hover { border-color: var(--primary); color: var(--primary); }

.gpc-fxinfo { background: var(--primary-soft); border-radius: 10px; padding: 7px 10px; margin: 8px 0; font-size: 11.5px; color: var(--primary); }

.gpc-editor {
  background: var(--bg-alt); border-radius: 12px;
  padding: 12px; margin: 8px 0; display: grid; gap: 8px;
}
.gpc-editor label { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; color: var(--text-alt); }
.gpc-editor input {
  width: 66px; padding: 4px 8px; border: 1px solid var(--border); border-radius: 8px;
  background: var(--bg); color: var(--text);
}
.gpc-dims { display: inline-flex; align-items: center; gap: 3px; }
.gpc-dims input { width: 46px; }
.gpc-save {
  justify-self: end; border: none; background: var(--primary); color: #fff;
  border-radius: 999px; padding: 6px 20px; cursor: pointer; font-weight: 700; font-size: 12.5px;
}
.gpc-save:hover { filter: brightness(1.08); }

.gpc-est-note { color: var(--text-muted); font-size: 11.5px; margin: 2px 0 6px; }

.gpc-quotes { margin: 10px 0; display: grid; gap: 3px; }
.gpc-quote {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 10px;
}
.gpc-quote:hover { background: var(--bg-hover); }
.gpc-cheapest { background: var(--success-soft); }
.gpc-cheapest:hover { background: var(--success-soft); }
.gpc-carrier { font-weight: 700; width: 94px; flex-shrink: 0; font-size: 12.5px; }
.gpc-days { display: block; font-weight: 500; font-size: 10px; color: var(--text-muted); white-space: nowrap; }
.gpc-breakdown { color: var(--text-muted); font-size: 11px; flex: 1; min-width: 0; }
.gpc-total { font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; font-size: 13.5px; }
.gpc-badge { color: var(--success); font-weight: 700; }
.gpc-vol { cursor: help; }
.gpc-unavail { color: var(--text-muted); }
.gpc-unavail .gpc-carrier { color: var(--text-muted); }
.gpc-reason { font-size: 11.5px; font-style: italic; }

.gpc-summary { border-top: 1px solid var(--border); padding-top: 10px; display: grid; gap: 4px; }
.gpc-sumrow { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-alt); font-variant-numeric: tabular-nums; }
.gpc-vat-free { color: var(--success); }
.gpc-vat-due { color: var(--warn); }
.gpc-grand { font-weight: 700; font-size: 15px; color: var(--text); margin-top: 4px; }

.gpc-meta { color: var(--text-muted); font-size: 10.5px; margin-top: 10px; }
.gpc-stale { color: var(--warn); }

@media (prefers-color-scheme: dark) {
  :host {
    --bg: #24272a;
    --bg-alt: #141618;
    --bg-hover: #2e3235;
    --border: #3b4046;
    --text: #f2f4f6;
    --text-alt: #bbc0c5;
    --text-muted: #747c85;
    --primary: #43aefc;
    --primary-soft: #14263a;
    --success: #4cd964;
    --success-soft: #16281a;
    --warn: #f8993b;
    --warn-soft: #33220f;
    --shadow: 0 2px 16px rgba(0,0,0,.4), 0 8px 40px rgba(0,0,0,.5);
  }
  .gpc-save { color: #141618; }
}
`;
