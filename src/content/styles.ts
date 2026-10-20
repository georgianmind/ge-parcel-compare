/**
 * Injected into the shadow root — never touches page CSS.
 * Night / Porcelain: Swiss hierarchy rendered as a luxe product surface.
 * Light as material — gradient hero, glowing accents, branded carrier tiles,
 * a signal-colored threshold meter. Porcelain by day, Night after dark.
 */
export const PANEL_CSS = `
:host { all: initial; }
* {
  box-sizing: border-box; margin: 0;
  font-family: -apple-system, "SF Pro Display", "SF Pro Text", Inter, "Segoe UI", Roboto, "Noto Sans Georgian", sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ---------- Porcelain (light, default) ---------- */
:host {
  --solid: #ffffff;
  --card-bg: rgba(255,255,255,.82);
  --card-border: linear-gradient(165deg, rgba(255,255,255,.95), rgba(22,24,28,.07) 40%, rgba(229,72,77,.18));
  --card-glow: radial-gradient(420px 200px at 85% -30px, rgba(229,72,77,.07), transparent 70%);
  --tile: #ffffff;
  --tile-border: rgba(22,24,28,.07);
  --tile-shadow: 0 2px 8px rgba(22,24,28,.05);
  --surface: #f3f3f5;
  --ink: #16181c;
  --ink-grad: linear-gradient(180deg, #16181c 40%, #4e5158 100%);
  --grey: #74777d;
  --grey-light: #a9acb2;
  --red: #e5484d;
  --red-bright: #e5484d;
  --red-glow: rgba(229,72,77,.3);
  --green: #1d9e5a;
  --green-soft: rgba(29,158,90,.09);
  --green-border: rgba(29,158,90,.28);
  --win-bg: linear-gradient(90deg, #fff1f1, #ffffff);
  --win-border: rgba(229,72,77,.3);
  --win-shadow: 0 6px 20px rgba(229,72,77,.14);
  --shadow: 0 1px 0 rgba(255,255,255,.9) inset, 0 0 0 1px rgba(22,24,28,.05), 0 24px 60px rgba(60,30,35,.2), 0 6px 18px rgba(22,24,28,.07);
}
/* ---------- Night (dark) ---------- */
@media (prefers-color-scheme: dark) {
  :host {
    --solid: #101114;
    --card-bg: linear-gradient(180deg, #17181d 0%, #101114 100%);
    --card-border: linear-gradient(165deg, rgba(255,255,255,.22), rgba(255,255,255,.05) 30%, rgba(229,72,77,.3) 90%);
    --card-glow: radial-gradient(420px 220px at 85% -40px, rgba(229,72,77,.15), transparent 70%);
    --tile: rgba(255,255,255,.035);
    --tile-border: rgba(255,255,255,.055);
    --tile-shadow: none;
    --surface: rgba(255,255,255,.06);
    --ink: #f4f5f7;
    --ink-grad: linear-gradient(180deg, #ffffff 30%, #b9bcc4 100%);
    --grey: #999da4;
    --grey-light: #6a6d74;
    --red: #ff6b70;
    --red-bright: #ff8a8e;
    --red-glow: rgba(229,72,77,.5);
    --green: #4ade80;
    --green-soft: rgba(52,199,123,.1);
    --green-border: rgba(52,199,123,.3);
    --win-bg: linear-gradient(90deg, rgba(229,72,77,.16), rgba(229,72,77,.05) 70%);
    --win-border: rgba(229,72,77,.35);
    --win-shadow: 0 0 24px rgba(229,72,77,.14), inset 0 1px 0 rgba(255,255,255,.08);
    --shadow: 0 30px 80px rgba(0,0,0,.7), 0 10px 30px rgba(229,72,77,.12);
  }
}

button { transition: all .16s ease; }

/* ---------- collapsed pill ---------- */
.gpc-pill {
  position: fixed; right: 20px; bottom: 20px; z-index: 2147483646;
  display: inline-flex; align-items: center; gap: 9px;
  padding: 12px 18px; border: 1px solid var(--tile-border); cursor: pointer; border-radius: 999px;
  background: var(--card-bg); color: var(--ink);
  backdrop-filter: blur(22px) saturate(1.6); -webkit-backdrop-filter: blur(22px) saturate(1.6);
  font-size: 13.5px; font-weight: 650; letter-spacing: -0.01em;
  box-shadow: var(--shadow);
  transition: transform .16s ease;
  font-variant-numeric: tabular-nums;
}
.gpc-pill:hover { transform: translateY(-2px); }
.gpc-pill-dot { width: 8px; height: 8px; border-radius: 99px; background: var(--green); box-shadow: 0 0 10px var(--green); }
.gpc-pill-dot.red { background: var(--red); box-shadow: 0 0 10px var(--red-glow); }
.gpc-pill-cur { color: var(--red-bright); font-weight: 750; }

/* ---------- card ---------- */
@keyframes gpc-in { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
.gpc-card {
  position: fixed; right: 20px; bottom: 20px; z-index: 2147483646;
  width: 356px; border-radius: 26px; padding: 1px;
  background: var(--card-border);
  box-shadow: var(--shadow);
  animation: gpc-in .28s cubic-bezier(.2,.9,.3,1);
}
.gpc-card::before {
  content: ''; position: absolute; inset: 1px; border-radius: 25px;
  background: var(--card-bg); z-index: 0;
  backdrop-filter: blur(28px) saturate(1.6); -webkit-backdrop-filter: blur(28px) saturate(1.6);
}
.gpc-card::after {
  content: ''; position: absolute; inset: 1px; border-radius: 25px;
  background: var(--card-glow); z-index: 0; pointer-events: none;
}
.gpc-header, .gpc-body { position: relative; z-index: 1; color: var(--ink); }

.gpc-header {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 18px 0;
  cursor: grab; user-select: none; touch-action: none;
}
.gpc-header:active { cursor: grabbing; }
.gpc-route {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--surface); border: 1px solid var(--tile-border);
  padding: 5px 12px 5px 6px; border-radius: 999px;
}
.gpc-corridor {
  border: none; background: transparent; padding: 2px 0 2px 6px;
  font-size: 11.5px; font-weight: 650; cursor: pointer; color: var(--ink);
  max-width: 110px;
}
.gpc-route-plane { color: var(--grey-light); font-size: 10px; }
.gpc-route-dest { color: var(--red); font-size: 11.5px; font-weight: 750; letter-spacing: .04em; }
.gpc-unsure { color: var(--red); font-weight: 700; cursor: help; font-size: 11px; }
.gpc-sp { flex: 1; }
.gpc-iconbtn {
  border: none; background: var(--surface); cursor: pointer;
  color: var(--grey); font-size: 11px; line-height: 1;
  width: 26px; height: 26px; border-radius: 999px;
  display: inline-flex; align-items: center; justify-content: center;
}
.gpc-iconbtn:hover { color: var(--ink); }

.gpc-body { padding: 10px 18px 16px; }
.gpc-warn {
  background: var(--surface); color: var(--red); border-radius: 12px;
  padding: 8px 12px; margin: 6px 0; font-size: 12px; font-weight: 550;
}

/* product strip */
.gpc-prod { display: flex; gap: 12px; align-items: center; margin-top: 10px; }
.gpc-prod-img {
  width: 48px; height: 48px; border-radius: 13px; flex-shrink: 0; object-fit: cover;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 6px 16px rgba(0,0,0,.25);
  background: linear-gradient(140deg, #3b2f3f 0%, #6b4a52 45%, #c99a8c 100%);
}
.gpc-prod-ph { display: grid; place-items: center; color: rgba(255,255,255,.6); font-size: 10px; }
.gpc-prod-meta { min-width: 0; }
.gpc-prod-name {
  display: block; font-size: 12.5px; font-weight: 650; letter-spacing: -0.01em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.gpc-prod-sub { display: block; font-size: 10.5px; color: var(--grey); font-weight: 500; margin-top: 1px; }

/* cart bar */
.gpc-cartbar { display: flex; align-items: center; gap: 6px; margin-top: 12px; }
.gpc-cart-add {
  border: 1px dashed var(--grey-light); background: transparent; color: var(--grey);
  border-radius: 999px; padding: 4px 12px; font-size: 10.5px; font-weight: 650; cursor: pointer;
}
.gpc-cart-add:hover { border-color: var(--red); color: var(--red); border-style: solid; }
.gpc-cart-chip {
  border: 1px solid var(--tile-border); background: var(--surface); color: var(--grey);
  border-radius: 999px; padding: 4px 12px; font-size: 10.5px; font-weight: 650; cursor: pointer;
  font-variant-numeric: tabular-nums;
}
.gpc-cart-chip.on {
  background: var(--win-bg); border-color: var(--win-border); color: var(--red);
  box-shadow: 0 0 14px rgba(229,72,77,.12);
}
.gpc-cart-clear {
  border: none; background: transparent; color: var(--grey-light); cursor: pointer;
  font-size: 10px; padding: 2px 4px;
}
.gpc-cart-clear:hover { color: var(--red); }

/* hero */
.gpc-hero { margin-top: 14px; }
.gpc-hero-total { cursor: pointer; }
.gpc-hero-label { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--grey); }
.gpc-hero-total {
  font-size: 54px; font-weight: 750; letter-spacing: -0.045em; line-height: 1.05;
  font-variant-numeric: tabular-nums;
  background: var(--ink-grad);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.gpc-hero-cur {
  font-size: 32px; font-weight: 650;
  background: linear-gradient(180deg, var(--red-bright), var(--red));
  -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 0 12px var(--red-glow));
}
.gpc-hero-sub { margin-top: 5px; font-size: 12.5px; color: var(--grey); font-weight: 500; }
.gpc-hero-sub strong { color: var(--ink); font-weight: 650; }
.gpc-red { color: var(--red); font-weight: 650; }
.gpc-green { color: var(--green); font-weight: 650; }

/* threshold meter */
.gpc-meter { margin: 16px 0 4px; }
.gpc-meter-track {
  height: 6px; border-radius: 999px; position: relative;
  background: linear-gradient(90deg, #22c55e 0%, #eab308 42%, #e5484d 62%, #e5484d 100%);
}
.gpc-meter-mask { position: absolute; top: 0; bottom: 0; right: 0; background: var(--surface); border-radius: 0 999px 999px 0; }
.gpc-meter-tick { position: absolute; left: 50%; top: -4px; bottom: -4px; width: 2px; background: var(--grey-light); border-radius: 2px; opacity: .7; }
.gpc-meter-knob {
  position: absolute; top: 50%; width: 14px; height: 14px; border-radius: 999px;
  transform: translate(-50%,-50%); background: #fff;
  box-shadow: 0 0 0 4px rgba(34,197,94,.25), 0 0 14px rgba(34,197,94,.55), 0 2px 6px rgba(0,0,0,.35);
  transition: left .3s ease;
}
.gpc-meter-knob.over { box-shadow: 0 0 0 4px rgba(229,72,77,.3), 0 0 18px var(--red-glow), 0 2px 6px rgba(0,0,0,.45); }
.gpc-meter-row {
  display: flex; justify-content: space-between; margin-top: 8px;
  font-size: 10.5px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--grey);
}

/* carrier tiles — staggered entrance */
.gpc-rows { margin-top: 12px; display: grid; gap: 6px; }
@keyframes gpc-tile-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.gpc-row {
  border-radius: 14px; padding: 10px 13px; cursor: pointer;
  background: var(--tile); border: 1px solid var(--tile-border); box-shadow: var(--tile-shadow);
  transition: transform .14s ease, border-color .14s ease;
  animation: gpc-tile-in .32s cubic-bezier(.2,.9,.3,1) both;
}
.gpc-row:nth-child(1) { animation-delay: .04s; }
.gpc-row:nth-child(2) { animation-delay: .09s; }
.gpc-row:nth-child(3) { animation-delay: .14s; }
.gpc-row:nth-child(4) { animation-delay: .19s; }
.gpc-row:hover { transform: translateY(-1px); }
.gpc-win { background: var(--win-bg); border-color: var(--win-border); box-shadow: var(--win-shadow); }
.gpc-dim { opacity: .45; cursor: default; }
.gpc-row-top { display: flex; align-items: center; gap: 11px; }
.gpc-av {
  width: 30px; height: 30px; border-radius: 10px; display: grid; place-items: center;
  font-size: 12px; font-weight: 750; color: #fff; flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 3px 8px rgba(0,0,0,.3);
}
.gpc-av-camex { background: linear-gradient(145deg, #ff6b5e, #c62828); }
.gpc-av-usa2georgia { background: linear-gradient(145deg, #5b8def, #2b4ea2); }
.gpc-av-kiwipost { background: linear-gradient(145deg, #34c77b, #1d7a4a); }
.gpc-av-inex { background: linear-gradient(145deg, #a78bfa, #6d4bd0); }
.gpc-row-mid { flex: 1; min-width: 0; }
.gpc-row-name { display: block; font-size: 13px; font-weight: 650; letter-spacing: -0.01em; }
.gpc-row-sub { display: block; font-size: 10px; color: var(--grey); font-weight: 500; margin-top: 1px; }
.gpc-row-price { text-align: right; }
.gpc-row-v { display: block; font-size: 14.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
.gpc-win .gpc-row-v { color: var(--red-bright); text-shadow: 0 0 16px var(--red-glow); }
.gpc-row-best { display: block; font-size: 9px; font-weight: 750; letter-spacing: .1em; text-transform: uppercase; color: var(--red); }

.gpc-math { margin-top: 10px; padding-top: 9px; border-top: 1px solid var(--tile-border); display: grid; gap: 4px; cursor: default; }
.gpc-math div { display: flex; justify-content: space-between; font-size: 11px; color: var(--grey); font-variant-numeric: tabular-nums; }
.gpc-math-sum { border-top: 1px solid var(--tile-border); padding-top: 5px; }
.gpc-math .gpc-math-sum span { color: var(--ink); font-weight: 650; }

/* arrival tile */
.gpc-arrive {
  margin-top: 10px; border-radius: 14px; padding: 11px 13px;
  background: var(--tile); border: 1px solid var(--tile-border); box-shadow: var(--tile-shadow);
  display: flex; align-items: center; gap: 12px;
}
.gpc-cal {
  width: 40px; height: 40px; border-radius: 11px; background: var(--surface);
  border: 1px solid var(--tile-border);
  display: grid; place-items: center; align-content: center; flex-shrink: 0;
}
.gpc-cal-m { font-size: 7.5px; font-weight: 800; letter-spacing: .1em; color: var(--red); text-transform: uppercase; }
.gpc-cal-d { font-size: 12px; font-weight: 750; line-height: 1.1; font-variant-numeric: tabular-nums; }
.gpc-arrive-tx { min-width: 0; }
.gpc-arrive-a { display: block; font-size: 12px; font-weight: 650; }
.gpc-arrive-b { display: block; font-size: 10.5px; color: var(--grey); font-weight: 500; }

/* split advisor */
.gpc-split {
  margin-top: 8px; border-radius: 14px; padding: 11px 13px; cursor: pointer;
  background: var(--green-soft); border: 1px solid var(--green-border);
  display: flex; align-items: center; gap: 11px;
  box-shadow: 0 0 20px rgba(52,199,123,.08);
}
.gpc-split-ic {
  width: 28px; height: 28px; border-radius: 9px; background: linear-gradient(145deg,#34c77b,#1d7a4a);
  display: grid; place-items: center; font-size: 12px; color: #fff; flex-shrink: 0;
  box-shadow: 0 0 14px rgba(52,199,123,.35);
}
.gpc-split-tx { flex: 1; font-size: 11.5px; font-weight: 550; color: var(--ink); }
.gpc-split-ex { display: block; margin-top: 5px; font-size: 10.5px; font-weight: 450; color: var(--grey); }
.gpc-split-go { font-size: 10.5px; font-weight: 750; color: var(--green); white-space: nowrap; }

.gpc-fxinfo {
  background: var(--surface); border-radius: 12px;
  padding: 8px 12px; margin-top: 10px; font-size: 10.5px; color: var(--grey);
  font-variant-numeric: tabular-nums;
}

.gpc-editor { background: var(--surface); border-radius: 14px; padding: 14px; margin-top: 10px; display: grid; gap: 10px; }
.gpc-editor label {
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  font-size: 9.5px; font-weight: 650; letter-spacing: .08em; text-transform: uppercase; color: var(--grey);
}
.gpc-editor input, .gpc-price-edit input, .gpc-price-edit select {
  padding: 5px 9px; border: none; border-radius: 9px;
  background: var(--solid); color: var(--ink); font-size: 13px; font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.gpc-editor input { width: 64px; }
.gpc-editor input:focus, .gpc-price-edit input:focus, .gpc-price-edit select:focus { outline: 2px solid var(--red); }
.gpc-price-edit { display: inline-flex; gap: 5px; }
.gpc-price-edit input { width: 76px; }
.gpc-dims { display: inline-flex; align-items: center; gap: 4px; color: var(--ink); }
.gpc-dims input { width: 42px; }
.gpc-kg-wrap { display: inline-flex; align-items: center; gap: 6px; }
.gpc-presets { display: inline-flex; gap: 3px; }
.gpc-preset {
  border: none; background: var(--solid); color: var(--grey); border-radius: 7px;
  padding: 3px 8px; font-size: 10.5px; font-weight: 650; cursor: pointer;
  font-variant-numeric: tabular-nums;
}
.gpc-preset.on { background: var(--red); color: #fff; }
.gpc-save {
  justify-self: end; border: none; background: var(--red); color: #fff;
  padding: 7px 20px; cursor: pointer; font-weight: 650; font-size: 12px; border-radius: 999px;
  box-shadow: 0 4px 14px var(--red-glow);
}
.gpc-save:hover { filter: brightness(1.1); }

/* footer */
.gpc-foot {
  margin-top: 14px; display: flex; justify-content: space-between; align-items: baseline; gap: 8px;
  font-size: 9px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--grey-light);
  font-variant-numeric: tabular-nums;
}
.gpc-gel {
  border: none; background: transparent; color: var(--grey-light); cursor: pointer; padding: 0;
  font-size: 9px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}
.gpc-gel:hover { color: var(--red); }
.gpc-weight-chip {
  border: none; background: var(--surface); border-radius: 999px;
  padding: 2px 10px; font-size: 10px; font-weight: 650; cursor: pointer; white-space: nowrap;
  color: var(--grey); font-variant-numeric: tabular-nums; text-transform: none; letter-spacing: 0;
}
.gpc-weight-chip:hover { color: var(--red); }
.gpc-stale { color: var(--red); }
`;
