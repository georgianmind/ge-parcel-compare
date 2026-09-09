import { describe, expect, it } from 'vitest';
import { computeBillableKg, computeQuote, roundUp100g, toGEL } from '../src/engine';
import type { CarrierCorridorRate, FxRates, QuoteInput } from '../src/engine/types';
import { inexChinaSeaRate, RATES } from '../src/data/rates';

const fx: FxRates = { USD: 2.7, EUR: 3.0, GBP: 3.5, date: '2026-09-01', source: 'manual' };

const rate = (carrier: string, corridor: string): CarrierCorridorRate => {
  const r = RATES.find((x) => x.carrier === carrier && x.corridor === corridor);
  if (!r) throw new Error(`no rate ${carrier}/${corridor}`);
  return r;
};

const input = (over: Partial<QuoteInput>): QuoteInput => ({
  actualKg: 0.5,
  dims: { l: 30, w: 20, h: 10 },
  productPrice: 50,
  productCurrency: 'EUR',
  fx,
  ...over,
});

describe('roundUp100g', () => {
  it('rounds up to next 100g', () => {
    expect(roundUp100g(0.61)).toBeCloseTo(0.7);
    expect(roundUp100g(1.01)).toBeCloseTo(1.1);
  });
  it('leaves exact 100g multiples alone', () => {
    expect(roundUp100g(0.7)).toBeCloseTo(0.7);
    expect(roundUp100g(2.0)).toBeCloseTo(2.0);
  });
});

describe('billable weight', () => {
  it('volumetric dominates actual for bulky light items (shoes trap)', () => {
    // shoes box 34×24×13 = 10608 cm³ / 6000 = 1.768 kg vol vs 1.3 actual
    const r = rate('camex', 'usa');
    const { billableKg, usedVolumetric } = computeBillableKg(
      r,
      input({ actualKg: 1.3, dims: { l: 34, w: 24, h: 13 } }),
    );
    expect(usedVolumetric).toBe(true);
    expect(billableKg).toBeCloseTo(1.8); // 1.768 → round up
  });

  it('actual dominates for dense small items', () => {
    const r = rate('camex', 'usa');
    const { billableKg, usedVolumetric } = computeBillableKg(
      r,
      input({ actualKg: 2, dims: { l: 20, w: 15, h: 4 } }),
    );
    expect(usedVolumetric).toBe(false);
    expect(billableKg).toBeCloseTo(2);
  });

  it('applies min billable floor (0.1 USA)', () => {
    const r = rate('camex', 'usa');
    const { billableKg } = computeBillableKg(r, input({ actualKg: 0.02, dims: { l: 5, w: 5, h: 1 } }));
    expect(billableKg).toBeCloseTo(0.1);
  });

  it('applies EU min floor (0.25 Greece)', () => {
    const r = rate('camex', 'greece');
    const { billableKg } = computeBillableKg(r, input({ actualKg: 0.05, dims: { l: 5, w: 5, h: 1 } }));
    // 0.25 kg floor, then rounded up to the next 100 g
    expect(billableKg).toBeCloseTo(0.3);
  });

  it('U2G Turkey: volumetric waived when vol ≤ 50 kg', () => {
    const r = rate('usa2georgia', 'turkey');
    // 60×50×40 = 120000/6000 = 20 kg vol, actual 3 kg → billed 3 kg
    const { billableKg, usedVolumetric } = computeBillableKg(
      r,
      input({ actualKg: 3, dims: { l: 60, w: 50, h: 40 } }),
    );
    expect(usedVolumetric).toBe(false);
    expect(billableKg).toBeCloseTo(3);
  });

  it('U2G Turkey: volumetric applies when vol > 50 kg', () => {
    const r = rate('usa2georgia', 'turkey');
    // 100×80×40 = 320000/6000 ≈ 53.33 kg vol > 50 → volumetric billed
    const { billableKg, usedVolumetric } = computeBillableKg(
      r,
      input({ actualKg: 3, dims: { l: 100, w: 80, h: 40 } }),
    );
    expect(usedVolumetric).toBe(true);
    expect(billableKg).toBeCloseTo(53.4);
  });

  it('Camex Turkey has no waiver — volumetric applies normally', () => {
    const r = rate('camex', 'turkey');
    const { usedVolumetric } = computeBillableKg(
      r,
      input({ actualKg: 3, dims: { l: 60, w: 50, h: 40 } }),
    );
    expect(usedVolumetric).toBe(true);
  });
});

describe('Inex China sea tiers', () => {
  it('tiers by billable weight', () => {
    expect(inexChinaSeaRate(10)).toBe(5.0);
    expect(inexChinaSeaRate(19.9)).toBe(5.0);
    expect(inexChinaSeaRate(20)).toBe(4.5);
    expect(inexChinaSeaRate(49.9)).toBe(4.5);
    expect(inexChinaSeaRate(50)).toBe(4.0);
  });

  it('quote uses the tier function', () => {
    const r = rate('inex', 'china-sea');
    const q = computeQuote(r, input({ actualKg: 25, dims: { l: 10, w: 10, h: 10 } }));
    // 25 kg → $4.50/kg → $112.50 → ×2.7 = 303.75 GEL
    expect(q.transportGEL).toBeCloseTo(303.75);
  });
});

describe('VAT threshold (299/300/301 ₾)', () => {
  const r = rate('camex', 'greece');
  const gelPrice = (gelValue: number) => input({ productPrice: gelValue / 3.0, productCurrency: 'EUR' });

  it('299 ₾ — duty-free', () => {
    const q = computeQuote(r, gelPrice(299));
    expect(q.dutyFree).toBe(true);
    expect(q.customsGEL).toBe(0);
  });
  it('300 ₾ exactly — still duty-free (threshold is "over 300")', () => {
    const q = computeQuote(r, gelPrice(300));
    expect(q.dutyFree).toBe(true);
    expect(q.customsGEL).toBe(0);
  });
  it('301 ₾ — VAT 18% on full value', () => {
    const q = computeQuote(r, gelPrice(301));
    expect(q.dutyFree).toBe(false);
    expect(q.customsGEL).toBeCloseTo(301 * 0.18);
  });
  it('declaration fee charged only when clearance is required — all carriers', () => {
    for (const carrier of ['camex', 'inex', 'usa2georgia', 'kiwipost']) {
      const cr = rate(carrier, 'usa');
      const under = computeQuote(cr, gelPrice(299));
      const over = computeQuote(cr, gelPrice(301));
      expect(under.declarationGEL).toBe(0);
      expect(over.declarationGEL).toBe(10);
      expect(over.totalGEL).toBeCloseTo(
        over.transportGEL + over.fixedFeeGEL + 10 + over.customsGEL,
      );
    }
  });
  it('local shipping counts toward customs value', () => {
    // 295 GEL product + 10 GEL-equivalent shipping crosses the threshold
    const q = computeQuote(r, { ...gelPrice(295), localShipping: 10 / 3.0 });
    expect(q.dutyFree).toBe(false);
  });
});

describe('full quote', () => {
  it('Greece jeans example: Camex vs Inex', () => {
    // 0.7 kg jeans, 45.95 €; vol 35×28×6/6000 = 0.98 kg → billable 1.0
    const inp = input({ actualKg: 0.7, dims: { l: 35, w: 28, h: 6 }, productPrice: 45.95 });
    const camex = computeQuote(rate('camex', 'greece'), inp);
    const inex = computeQuote(rate('inex', 'greece'), inp);
    expect(camex.billableKg).toBeCloseTo(1.0);
    expect(camex.transportGEL).toBeCloseTo(3.5 * 1.0 * 3.0); // €3.50 × 1 kg × 3.0
    // same per-kg rate, duty-free → no declaration fee for either
    expect(inex.totalGEL).toBeCloseTo(camex.totalGEL);
    expect(camex.dutyFree).toBe(true); // 45.95 € ≈ 137.85 ₾
  });

  it('GEL product price needs no FX', () => {
    expect(toGEL(100, 'GEL', fx)).toBe(100);
  });
});
