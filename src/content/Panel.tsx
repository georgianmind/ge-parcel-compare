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
import { CARRIER_LABELS, CORRIDOR_LABELS, t, type Lang } from './i18n';
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
    }
  | { carrier: string; available: false; reason: string };

const gel = (n: number) => `${(Math.round(n * 100) / 100).toFixed(2)} ₾`;
const gelShort = (n: number) => `≈ ${Math.round(n)} ₾`;
const sym = (c: Currency) => (c === 'EUR' ? '€' : c === 'USD' ? '$' : c === 'GBP' ? '£' : '₾');

export function Panel({ product, rates, fx, settings }: Props) {
  const lang: Lang = settings.language;
  const domain = location.hostname;

  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false); // × — hides until next page load
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [editingWeight, setEditingWeight] = useState(false);
  const [showFxInfo, setShowFxInfo] = useState(false);

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
      // Manual mode is only ever forced open from the popup — show it ready to use.
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

  // re-sync when SPA navigation swaps the product
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
    const cur = pos ?? { x: window.innerWidth - 356, y: window.innerHeight - 420 };
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

  // --- per-carrier shipping (transport + fixed fee); VAT is carrier-independent ---
  const roles = useMemo(() => {
    const input = {
      actualKg: kg,
      dims,
      productPrice: price,
      productCurrency: currency,
      localShipping,
      fx,
    };
    const disabled = new Set(settings.disabledCarriers ?? []);
    const rows: CarrierRow[] = [];
    for (const carrier of CARRIERS) {
      if (disabled.has(carrier)) continue;
      const rate = rates.find((r) => r.carrier === carrier && r.corridor === corridor);
      if (!rate) {
        rows.push({
          carrier,
          available: false,
          reason: UNAVAILABLE_REASONS[corridor]?.[carrier] ?? t(lang, 'noRate'),
        });
        continue;
      }
      const quote = computeQuote(rate, input);
      rows.push({
        carrier,
        available: true,
        quote,
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
  const grandTotal = cheapest?.available
    ? productValueGEL + cheapest.shippingGEL + customsGEL
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

  // --- collapsed pill: unobtrusive, expands on click ---
  if (!expanded) {
    return (
      <button class="gpc-pill" style={style} onClick={toggleExpanded} title={t(lang, 'openPanel')}>
        <span class="gpc-pill-icon">₾</span>
        {product && cheapest?.available ? (
          <span class="gpc-pill-total">+{gelShort(cheapest.shippingGEL + customsGEL).slice(2)}</span>
        ) : (
          <span class="gpc-pill-total">—</span>
        )}
      </button>
    );
  }

  const cl = CORRIDOR_LABELS[corridor];

  return (
    <div class="gpc-card" style={style}>
      <div
        class="gpc-header"
        onPointerDown={onDragStart as never}
        onPointerMove={onDragMove as never}
        onPointerUp={onDragEnd as never}
      >
        <select
          class="gpc-corridor"
          value={corridor}
          onChange={(e) => setCorridor((e.target as HTMLSelectElement).value as CorridorKey)}
          onPointerDown={(e) => e.stopPropagation()}
          title={t(lang, 'country')}
        >
          {Object.entries(CORRIDOR_LABELS).map(([key, v]) => (
            <option value={key}>{`${v.flag} ${v[lang]}`}</option>
          ))}
        </select>
        {product && !product.corridorConfident && (
          <span class="gpc-unsure" title="detected — verify">?</span>
        )}
        <span class="gpc-arrow">→ {t(lang, 'toTbilisi')}</span>
        <button
          class="gpc-iconbtn"
          onClick={toggleExpanded}
          onPointerDown={(e) => e.stopPropagation()}
          title={t(lang, 'close')}
        >
          —
        </button>
        <button
          class="gpc-iconbtn"
          onClick={() => setHidden(true)}
          onPointerDown={(e) => e.stopPropagation()}
          title={t(lang, 'close')}
        >
          ✕
        </button>
      </div>

      <div class="gpc-body">
        {product === null && <div class="gpc-warn">{t(lang, 'detectionFailed')}</div>}

        {product?.title && <div class="gpc-title">{product.title}</div>}

        {/* The hero is the one number only this extension knows. */}
        {grandTotal !== null && cheapest?.available && (
          <div class="gpc-hero">
            <div class="gpc-hero-label">{t(lang, 'totalToTbilisi')}</div>
            <div class="gpc-hero-total">
              ≈{Math.round(grandTotal)}<span class="gpc-hero-cur"> ₾</span>
            </div>
            <div class="gpc-hero-sub">
              <strong>{CARRIER_LABELS[cheapest.carrier]}</strong>
              {cheapest.deliveryDays && ` · ${cheapest.deliveryDays} ${t(lang, 'days')}`}
              {' · '}
              {vatDue ? (
                <span class="gpc-red">+{Math.round(customsGEL)} ₾ {t(lang, 'vat')}</span>
              ) : (
                t(lang, 'dutyFreeShort')
              )}
            </div>
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
        <div class="gpc-quotes">
          {roles.map((r, i) =>
            r.available ? (
              <div
                class={`gpc-quote ${i === 0 ? 'gpc-cheapest' : ''}`}
                title={[
                  `${gel(r.quote.transportGEL)} ${t(lang, 'shipping')}`,
                  r.quote.declarationGEL > 0 &&
                    `+ ${Math.round(r.quote.declarationGEL)}₾ ${t(lang, 'declaration')}`,
                  r.quote.usedVolumetric &&
                    `${t(lang, 'volumetric')} ${r.quote.billableKg} kg`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              >
                <span class="gpc-carrier">{CARRIER_LABELS[r.carrier]}</span>
                <span class="gpc-days">
                  {r.deliveryDays ? `${r.deliveryDays} ${t(lang, 'days')}` : ''}
                </span>
                <span class="gpc-total">{gel(r.shippingGEL)}</span>
              </div>
            ) : (
              <div class="gpc-quote gpc-unavail">
                <span class="gpc-carrier">{CARRIER_LABELS[r.carrier]}</span>
                <span class="gpc-reason">{r.reason}</span>
              </div>
            ),
          )}
        </div>

        <div class="gpc-details">
          <div class="gpc-drow">
            <span class="gpc-dlabel">{t(lang, 'productLabel')}</span>
            {product === null || editingWeight ? (
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
            ) : (
              <span class="gpc-dvalue">
                {price.toFixed(2)} {sym(currency)}{' '}
                <button class="gpc-gel" onClick={() => setShowFxInfo((v) => !v)}>
                  {gelShort(productValueGEL)}
                </button>
              </span>
            )}
          </div>
          <div class="gpc-drow">
            <span class="gpc-dlabel">{t(lang, 'weightShort')}</span>
            <span class="gpc-dvalue">
              <button class="gpc-weight-chip" onClick={() => setEditingWeight((v) => !v)}>
                ~{kg} kg{weightLearned ? ' ✓' : ''}
              </button>
              {!weightLearned && product !== null && (
                <span class="gpc-est"> {t(lang, 'estimated')} · {category}</span>
              )}
            </span>
          </div>
          {vatDue && (
            <div class="gpc-drow">
              <span class="gpc-dlabel">{t(lang, 'vat')} 18%</span>
              <span class="gpc-dvalue gpc-red">+{gel(customsGEL)}</span>
            </div>
          )}
        </div>

        <div class={`gpc-meta ${ratesStale ? 'gpc-stale' : ''}`}>
          {ratesStale
            ? `⚠ ${t(lang, 'ratesOld')}`
            : `${t(lang, 'ratesVerified')} ${oldestVerified ?? '—'}`}{' '}
          · {fx.source === 'nbg' ? 'NBG FX' : `FX: ${fx.source}`} · {cl?.flag}
        </div>
      </div>
    </div>
  );
}
