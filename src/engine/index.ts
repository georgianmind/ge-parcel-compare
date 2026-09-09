import type {
  CarrierCorridorRate,
  Currency,
  FxRates,
  Quote,
  QuoteInput,
} from './types';

export * from './types';

const VAT_THRESHOLD_GEL = 300;
const VAT_RATE = 0.18;

export function toGEL(amount: number, currency: Currency, fx: FxRates): number {
  if (currency === 'GEL') return amount;
  return amount * fx[currency];
}

export function volumetricKg(l: number, w: number, h: number, divisor: number): number {
  return (l * w * h) / divisor;
}

/** Round billable weight UP to the next 100 g. */
export function roundUp100g(kg: number): number {
  return Math.ceil(kg * 10 - 1e-9) / 10;
}

export function computeBillableKg(rate: CarrierCorridorRate, input: QuoteInput): {
  billableKg: number;
  volumetricKg: number;
  usedVolumetric: boolean;
} {
  const { actualKg, dims } = input;
  let vol = 0;
  let billable = actualKg;
  let usedVolumetric = false;

  if (rate.volumetricDivisor) {
    vol = volumetricKg(dims.l, dims.w, dims.h, rate.volumetricDivisor);
    // U2G Turkey rule: if volumetric weight is within the waiver, bill actual weight only.
    const waived =
      rate.volumetricWaiverMaxKg !== undefined && vol <= rate.volumetricWaiverMaxKg;
    if (!waived && vol > billable) {
      billable = vol;
      usedVolumetric = true;
    }
  }

  if (billable < rate.minBillableKg) {
    billable = rate.minBillableKg;
    usedVolumetric = false;
  }

  return { billableKg: roundUp100g(billable), volumetricKg: vol, usedVolumetric };
}

export function computeQuote(rate: CarrierCorridorRate, input: QuoteInput): Quote {
  const { billableKg, volumetricKg: vol, usedVolumetric } = computeBillableKg(rate, input);

  const perKg =
    typeof rate.ratePerKg === 'function' ? rate.ratePerKg(billableKg) : rate.ratePerKg;
  const transportGEL = toGEL(perKg * billableKg, rate.currency, input.fx);

  const productValueGEL = toGEL(
    input.productPrice + (input.localShipping ?? 0),
    input.productCurrency,
    input.fx,
  );
  const dutyFree = productValueGEL <= VAT_THRESHOLD_GEL;
  const customsGEL = dutyFree ? 0 : productValueGEL * VAT_RATE;
  // Declaration service fee applies only when the parcel needs customs clearance.
  const declarationGEL = dutyFree ? 0 : (rate.declarationFeeGEL ?? 0);

  const fixedFeeGEL = rate.fixedFeeGEL ?? 0;
  const totalGEL = transportGEL + fixedFeeGEL + declarationGEL + customsGEL;

  return {
    carrier: rate.carrier,
    available: true,
    billableKg,
    volumetricKg: vol,
    usedVolumetric,
    transportGEL,
    fixedFeeGEL,
    declarationGEL,
    customsGEL,
    totalGEL,
    productValueGEL,
    dutyFree,
  };
}

export { VAT_RATE, VAT_THRESHOLD_GEL };
