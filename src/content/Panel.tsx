import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ProductInfo } from '../adapters/types';
import { computeQuote } from '../engine';
import type {
  CarrierCorridorRate,
  CorridorKey,
  Currency,
  FxRates,
  Quote,
} from '../engine/types';
import { UNAVAILABLE_REASONS } from '../data/rates';
import { categorize, estimateFor } from '../data/weights';
import { CARRIER_LABELS, CORRIDOR_LABELS, MONTHS, t, type Lang } from './i18n';
import {
  getLearnedWeights,
  getPanelExpanded,
  getPanelPos,
  learnWeight,
  setPanelExpanded,
  setPanelPos,
  type Settings,
} from './storage';

const CARRIERS = ['camex', 'inex', 'usa2georgia', 'kiwipost'] as const;
const RATES_STALE_DAYS = 60;
const VAT_LIMIT = 300;
/** days from ordering until the parcel reaches the forwarder's warehouse (estimate) */
const RETAILER_TO_WAREHOUSE_DAYS = 3;

interface Props {
  product: ProductInfo | null;
  rates: CarrierCorridorRate[];
  fx: FxRates;
  settings: Settings;
}

type CarrierRow =
  | {
      carrier: string;
      available: true;
      quote: Quote;
      shippingGEL: number;
      deliveryDays?: string;
      rate: CarrierCorridorRate;
    }
  | { carrier: string; available: false; reason: string };

const gel = (n: number) => `${(Math.round(n * 100) / 100).toFixed(2)} ₾`;
const sym = (c: Currency) => (c === 'EUR' ? '€' : c === 'USD' ? '$' : c === 'GBP' ? '£' : '₾');

/** "10–14" | "4-7" | "~7" → [min, max] in days, or null */
function parseDays(s: string | undefined): [number, number] | null {
  if (!s) return null;
  const nums = s.match(/\d+/g)?.map(Number);
  if (!nums || nums.length === 0) return null;
  return nums.length === 1 ? [nums[0], nums[0]] : [nums[0], nums[1]];
}

function fmtDate(d: Date, lang: Lang): string {
  return `${d.getDate()} ${MONTHS[lang][d.getMonth()]}`;
}

/** arrival window in Tbilisi, given transit days from the warehouse */
function arrivalRange(
  days: [number, number],
  lang: Lang,
): { range: string; warehouse: string; calMonth: string; calDays: string } {
  const now = Date.now();
  const wh = new Date(now + RETAILER_TO_WAREHOUSE_DAYS * 86400000);
  const a = new Date(wh.getTime() + days[0] * 86400000);
  const b = new Date(wh.getTime() + days[1] * 86400000);
  const range =
    a.getTime() === b.getTime()
      ? `~${fmtDate(a, lang)}`
      : a.getMonth() === b.getMonth()
        ? `${a.getDate()}–${b.getDate()} ${MONTHS[lang][b.getMonth()]}`
        : `${fmtDate(a, lang)} – ${fmtDate(b, lang)}`;
  return {
    range,
    warehouse: `~${fmtDate(wh, lang)}`,
    calMonth: MONTHS[lang][a.getMonth()],
    calDays: a.getTime() === b.getTime() ? `${a.getDate()}` : `${a.getDate()}–${b.getDate()}`,
  };
}

/** animate the hero number toward its value */
function useCountUp(target: number, ms = 450): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / ms, 1);
      const eased = 1 - (1 - p) ** 3;
      setValue(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

export function Panel({ product, rates, fx, settings }: Props) {
  const lang: Lang = settings.language;
  const domain = location.hostname;

  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [editingWeight, setEditingWeight] = useState(false);
  const [showFxInfo, setShowFxInfo] = useState(false);
  const [openCarrier, setOpenCarrier] = useState<string | null>(null);
  const [showSplit, setShowSplit] = useState(false);

  // --- editable state ---
  const category = categorize(product?.category ?? product?.title);
  const baseEst = estimateFor(product?.category ?? product?.title);
  const [kg, setKg] = useState(baseEst.kg);
  const [dims, setDims] = useState(baseEst.dims);
  const [weightLearned, setWeightLearned] = useState(false);
  const [corridor, setCorridor] = useState<CorridorKey>(product?.shipsFromCountry ?? 'usa');
  const [price, setPrice] = useState(product?.priceAmount ?? 0);
  const [currency, setCurrency] = useState<Currency>(product?.priceCurrency ?? 'EUR');
  const [localShipping, setLocalShipping] = useState(0);

  useEffect(() => {
    if (product === null) {
      setExpanded(true);
      setEditingWeight(true);
    } else {
      void getPanelExpanded().then(setExpanded);
    }
    void getPanelPos(domain).then((p) => p && setPos(p));
  }, [domain]);

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && product === null) setEditingWeight(true);
    void setPanelExpanded(next);
  };

  useEffect(() => {
    if (product) {
      setPrice(product.priceAmount);
      setCurrency(product.priceCurrency);
      setCorridor(product.shipsFromCountry);
    }
    const est = estimateFor(product?.category ?? product?.title);
    void getLearnedWeights().then((lw) => {
      const learned = lw[categorize(product?.category ?? product?.title)];
      setKg(learned?.kg ?? est.kg);
      setDims(learned?.dims ?? est.dims);
      setWeightLearned(Boolean(learned));
    });
  }, [product]);

  // --- dragging ---
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const onDragStart = (e: PointerEvent) => {
    const cur = pos ?? { x: window.innerWidth - 392, y: window.innerHeight - 560 };
    dragRef.current = { dx: e.clientX - cur.x, dy: e.clientY - cur.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: PointerEvent) => {
    if (!dragRef.current) return;
    setPos({ x: e.clientX - dragRef.current.dx, y: e.clientY - dragRef.current.dy });
  };
  const onDragEnd = () => {
    if (dragRef.current && pos) void setPanelPos(domain, pos);
    dragRef.current = null;
  };

  // --- quotes ---
  const roles = useMemo(() => {
    const input = {
      actualKg: kg, dims, productPrice: price, productCurrency: currency, localShipping, fx,
    };
    const disabled = new Set(settings.disabledCarriers ?? []);
    const rows: CarrierRow[] = [];
    for (const carrier of CARRIERS) {
      if (disabled.has(carrier)) continue;
      const rate = rates.find((r) => r.carrier === carrier && r.corridor === corridor);
      if (!rate) {
        rows.push({
          carrier, available: false,
          reason: UNAVAILABLE_REASONS[corridor]?.[carrier] ?? t(lang, 'noRate'),
        });
        continue;
      }
      const quote = computeQuote(rate, input);
      rows.push({
        carrier, available: true, quote, rate,
        shippingGEL: quote.transportGEL + quote.fixedFeeGEL + quote.declarationGEL,
        deliveryDays: rate.deliveryDays,
      });
    }
    rows.sort((a, b) => {
      if (a.available && b.available) return a.shippingGEL - b.shippingGEL;
      return a.available ? -1 : b.available ? 1 : 0;
    });
    return rows;
  }, [kg, dims, price, currency, localShipping, corridor, fx, rates, settings, lang]);

  const cheapest = roles.find((r) => r.available);
  const productValueGEL = cheapest?.available ? cheapest.quote.productValueGEL : 0;
  const customsGEL = cheapest?.available ? cheapest.quote.customsGEL : 0;
  const vatDue = customsGEL > 0;
  const grandTotal =
    cheapest?.available ? productValueGEL + cheapest.shippingGEL + customsGEL : null;
  const heroValue = useCountUp(grandTotal ?? 0);

  const cheapestDays = cheapest?.available ? parseDays(cheapest.deliveryDays) : null;
  const arrival = cheapestDays ? arrivalRange(cheapestDays, lang) : null;

  // split advisor: only when VAT is due, the value could fit in two ≤300₾ parcels,
  // and the saving is real (VAT + declaration minus a second declaration-free shipment).
  const splitSaving =
    vatDue && productValueGEL <= 2 * VAT_LIMIT && cheapest?.available
      ? Math.round(customsGEL + cheapest.quote.declarationGEL)
      : null;

  const oldestVerified = useMemo(() => {
    const relevant = rates.filter((r) => r.corridor === corridor);
    return relevant.reduce<string | null>(
      (min, r) => (min === null || r.lastVerified < min ? r.lastVerified : min),
      null,
    );
  }, [rates, corridor]);
  const ratesStale =
    oldestVerified !== null &&
    Date.now() - new Date(oldestVerified).getTime() > RATES_STALE_DAYS * 86400000;

  const saveWeight = () => {
    void learnWeight(category, { kg, dims });
    setWeightLearned(true);
    setEditingWeight(false);
  };

  if (hidden) return null;

  const style: Record<string, string> = pos
    ? { left: `${pos.x}px`, top: `${pos.y}px`, right: 'auto', bottom: 'auto' }
    : {};

  if (!expanded) {
    return (
      <button class="gpc-pill" style={style} onClick={toggleExpanded} title={t(lang, 'openPanel')}>
        <span class={`gpc-pill-dot ${vatDue ? 'red' : ''}`}></span>
        {product && cheapest?.available && grandTotal !== null ? (
          <span class="gpc-pill-total">
            {vatDue ? '' : `${t(lang, 'dutyFreeShort')} · `}≈{Math.round(grandTotal)}
            <span class="gpc-pill-cur"> ₾</span>
          </span>
        ) : (
          <span class="gpc-pill-total">₾</span>
        )}
      </button>
    );
  }

  // meter geometry: scale runs 0 → 2× the limit; the tick sits at the limit (50%)
  const meterPos = Math.min(productValueGEL / (2 * VAT_LIMIT), 1) * 100;

  return (
    <div class="gpc-card" style={style}>
      <div
        class="gpc-header"
        onPointerDown={onDragStart as never}
        onPointerMove={onDragMove as never}
        onPointerUp={onDragEnd as never}
      >
        <span class="gpc-route" onPointerDown={(e) => e.stopPropagation()}>
          <select
            class="gpc-corridor"
            value={corridor}
            onChange={(e) => setCorridor((e.target as HTMLSelectElement).value as CorridorKey)}
            title={t(lang, 'country')}
          >
            {Object.entries(CORRIDOR_LABELS).map(([key, v]) => (
              <option value={key}>{`${v.flag} ${v.code}`}</option>
            ))}
          </select>
          <span class="gpc-route-plane">✈</span>
          <span class="gpc-route-dest">TBS</span>
        </span>
        {product && !product.corridorConfident && (
          <span class="gpc-unsure" title="detected — verify">?</span>
        )}
        <span class="gpc-sp"></span>
        <button
          class="gpc-iconbtn" onClick={toggleExpanded}
          onPointerDown={(e) => e.stopPropagation()} title={t(lang, 'close')}
        >—</button>
        <button
          class="gpc-iconbtn" onClick={() => setHidden(true)}
          onPointerDown={(e) => e.stopPropagation()} title={t(lang, 'close')}
        >✕</button>
      </div>

      <div class="gpc-body">
        {product === null && <div class="gpc-warn">{t(lang, 'detectionFailed')}</div>}

        {product && (
          <div class="gpc-prod">
            {product.imageUrl ? (
              <img class="gpc-prod-img" src={product.imageUrl} alt="" />
            ) : (
              <span class="gpc-prod-img gpc-prod-ph">●</span>
            )}
            <span class="gpc-prod-meta">
              <span class="gpc-prod-name">{product.title}</span>
              <span class="gpc-prod-sub">
                {domain.replace(/^www\./, '').toUpperCase()} · {price.toFixed(2)} {sym(currency)}
              </span>
            </span>
          </div>
        )}

        {grandTotal !== null && cheapest?.available && (
          <div class="gpc-hero">
            <div class="gpc-hero-label">{t(lang, 'totalToTbilisi')}</div>
            <div class="gpc-hero-total">
              ≈{Math.round(heroValue)}<span class="gpc-hero-cur"> ₾</span>
            </div>
            <div class="gpc-hero-sub">
              <strong>{CARRIER_LABELS[cheapest.carrier]}</strong>
              {arrival && ` · ${t(lang, 'arrives')} ${arrival.range}`}
              {' · '}
              {vatDue ? (
                <span class="gpc-red">+{Math.round(customsGEL)} ₾ {t(lang, 'vat')}</span>
              ) : (
                <span class="gpc-green">{t(lang, 'dutyFreeShort')}</span>
              )}
            </div>
          </div>
        )}

        {productValueGEL > 0 && (
          <div class="gpc-meter">
            <div class="gpc-meter-track">
              <div class="gpc-meter-tick"></div>
              <div class="gpc-meter-mask" style={{ left: `${meterPos}%` }}></div>
              <div class={`gpc-meter-knob ${vatDue ? 'over' : ''}`} style={{ left: `${meterPos}%` }}></div>
            </div>
            <div class="gpc-meter-row">
              <span>
                {t(lang, 'itemLimit')} {Math.round(productValueGEL)} ₾ · {t(lang, 'limit')} {VAT_LIMIT} ₾
              </span>
              {vatDue ? (
                <span class="gpc-red">{t(lang, 'vatApplies')}</span>
              ) : (
                <span class="gpc-green">
                  {t(lang, 'headroom', { x: Math.round(VAT_LIMIT - productValueGEL) })}
                </span>
              )}
            </div>
          </div>
        )}

        <div class="gpc-rows">
          {roles.map((r, i) =>
            r.available ? (
              <div
                class={`gpc-row ${i === 0 ? 'gpc-win' : ''} ${openCarrier === r.carrier ? 'gpc-open' : ''}`}
                onClick={() => setOpenCarrier(openCarrier === r.carrier ? null : r.carrier)}
              >
                <div class="gpc-row-top">
                  <span class={`gpc-av gpc-av-${r.carrier}`}>
                    {CARRIER_LABELS[r.carrier].slice(0, 1)}
                  </span>
                  <span class="gpc-row-mid">
                    <span class="gpc-row-name">{CARRIER_LABELS[r.carrier]}</span>
                    <span class="gpc-row-sub">
                      {r.deliveryDays ? `${r.deliveryDays} ${t(lang, 'days')}` : '—'}
                      {r.quote.usedVolumetric &&
                        ` · ${r.quote.billableKg} kg ${t(lang, 'volumetricShort')}`}
                    </span>
                  </span>
                  <span class="gpc-row-price">
                    <span class="gpc-row-v">{Math.round(r.shippingGEL + r.quote.customsGEL)} ₾</span>
                    {i === 0 && <span class="gpc-row-best">{t(lang, 'best')}</span>}
                  </span>
                </div>
                {openCarrier === r.carrier && (
                  <div class="gpc-math" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <span>
                        {r.quote.billableKg} kg ×{' '}
                        {typeof r.rate.ratePerKg === 'function'
                          ? r.rate.ratePerKg(r.quote.billableKg)
                          : r.rate.ratePerKg}
                        {sym(r.rate.currency)} × {fx[r.rate.currency === 'GEL' ? 'USD' : r.rate.currency].toFixed(2)}
                      </span>
                      <span>{gel(r.quote.transportGEL)}</span>
                    </div>
                    {r.quote.declarationGEL > 0 && (
                      <div>
                        <span>{t(lang, 'declaration')} (300₾+)</span>
                        <span>{gel(r.quote.declarationGEL)}</span>
                      </div>
                    )}
                    {r.quote.customsGEL > 0 && (
                      <div>
                        <span>{t(lang, 'vat')} 18% × {Math.round(r.quote.productValueGEL)} ₾</span>
                        <span>{gel(r.quote.customsGEL)}</span>
                      </div>
                    )}
                    <div class="gpc-math-sum">
                      <span>{t(lang, 'deliveryTotal')}</span>
                      <span>{gel(r.shippingGEL + r.quote.customsGEL)}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div class="gpc-row gpc-dim">
                <div class="gpc-row-top">
                  <span class={`gpc-av gpc-av-${r.carrier}`}>
                    {CARRIER_LABELS[r.carrier].slice(0, 1)}
                  </span>
                  <span class="gpc-row-mid">
                    <span class="gpc-row-name">{CARRIER_LABELS[r.carrier]}</span>
                    <span class="gpc-row-sub">{r.reason}</span>
                  </span>
                </div>
              </div>
            ),
          )}
        </div>

        {arrival && cheapestDays && (
          <div class="gpc-arrive">
            <span class="gpc-cal">
              <span class="gpc-cal-m">{arrival.calMonth}</span>
              <span class="gpc-cal-d">{arrival.calDays}</span>
            </span>
            <span class="gpc-arrive-tx">
              <span class="gpc-arrive-a">{t(lang, 'arrivalTitle')}</span>
              <span class="gpc-arrive-b">
                {t(lang, 'warehouseBy')} {arrival.warehouse} · {CARRIER_LABELS[cheapest!.carrier]}
              </span>
            </span>
          </div>
        )}

        {splitSaving !== null && splitSaving > 0 && (
          <div class="gpc-split" onClick={() => setShowSplit((v) => !v)}>
            <span class="gpc-split-ic">◆</span>
            <span class="gpc-split-tx">
              {t(lang, 'splitTip', { x: splitSaving })}
              {showSplit && <span class="gpc-split-ex">{t(lang, 'splitExplain')}</span>}
            </span>
            <span class="gpc-split-go">{showSplit ? '×' : `${t(lang, 'splitHow')} →`}</span>
          </div>
        )}

        {showFxInfo && (
          <div class="gpc-fxinfo">
            {t(lang, 'fxSource')}: {fx.source.toUpperCase()} · {fx.date.slice(0, 10)}
            {(fx.source === 'hardcoded' || fx.source === 'cached') && (
              <span class="gpc-stale"> ({t(lang, 'stale')})</span>
            )}
            <br />1$ = {fx.USD.toFixed(4)}₾ · 1€ = {fx.EUR.toFixed(4)}₾ · 1£ = {fx.GBP.toFixed(4)}₾
          </div>
        )}

        {editingWeight && (
          <div class="gpc-editor">
            <label>
              {t(lang, 'price')}
              <span class="gpc-price-edit">
                <input
                  type="number" min="0" step="0.01" value={price}
                  onInput={(e) => setPrice(parseFloat((e.target as HTMLInputElement).value) || 0)}
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency((e.target as HTMLSelectElement).value as Currency)}
                >
                  <option>EUR</option><option>USD</option><option>GBP</option><option>GEL</option>
                </select>
              </span>
            </label>
            <label>
              {t(lang, 'weight')}
              <input
                type="number" min="0.1" step="0.1" value={kg}
                onInput={(e) => setKg(parseFloat((e.target as HTMLInputElement).value) || 0.1)}
              />
            </label>
            <label>
              {t(lang, 'dims')}
              <span class="gpc-dims">
                <input type="number" min="1" value={dims.l}
                  onInput={(e) => setDims({ ...dims, l: parseFloat((e.target as HTMLInputElement).value) || 1 })} />
                ×
                <input type="number" min="1" value={dims.w}
                  onInput={(e) => setDims({ ...dims, w: parseFloat((e.target as HTMLInputElement).value) || 1 })} />
                ×
                <input type="number" min="1" value={dims.h}
                  onInput={(e) => setDims({ ...dims, h: parseFloat((e.target as HTMLInputElement).value) || 1 })} />
              </span>
            </label>
            <label>
              {t(lang, 'localShipping')}
              <input
                type="number" min="0" step="0.01" value={localShipping}
                onInput={(e) => setLocalShipping(parseFloat((e.target as HTMLInputElement).value) || 0)}
              />
            </label>
            <button class="gpc-save" onClick={saveWeight}>{t(lang, 'save')}</button>
          </div>
        )}

        <div class="gpc-foot">
          <span>
            <button class="gpc-gel" onClick={() => setShowFxInfo((v) => !v)}>
              NBG · 1{sym(currency === 'GEL' ? 'USD' : currency)} ={' '}
              {fx[currency === 'GEL' ? 'USD' : currency].toFixed(4)} ₾
            </button>
          </span>
          <span>
            <button class="gpc-weight-chip" onClick={() => setEditingWeight((v) => !v)}>
              ~{kg} kg{weightLearned ? ' ✓' : ''} ✎
            </button>
          </span>
          <span class={ratesStale ? 'gpc-stale' : ''}>
            {ratesStale ? `⚠ ${t(lang, 'ratesOld')}` : `${t(lang, 'ratesVerified')} ${oldestVerified?.slice(0, 7) ?? '—'}`}
          </span>
        </div>
      </div>
    </div>
  );
}
