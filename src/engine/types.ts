export type Currency = 'USD' | 'EUR' | 'GBP' | 'GEL';

export type CorridorKey =
  | 'usa'
  | 'turkey'
  | 'china-air'
  | 'china-sea'
  | 'uk'
  | 'germany'
  | 'greece'
  | 'italy'
  | 'spain'
  | 'cyprus';

export type CarrierKey = 'camex' | 'inex' | 'usa2georgia' | 'kiwipost';

export interface Dimensions {
  l: number; // cm
  w: number;
  h: number;
}

/**
 * Rate for one carrier on one corridor.
 * `ratePerKg` may be a tier function of billable kg (Inex China sea).
 */
export interface CarrierCorridorRate {
  carrier: CarrierKey;
  corridor: CorridorKey;
  currency: Currency; // currency the per-kg rate is quoted in
  ratePerKg: number | ((billableKg: number) => number);
  /** unconditional flat fee in GEL, charged on every parcel */
  fixedFeeGEL?: number;
  /**
   * Customs-declaration service fee in GEL, charged only when the parcel
   * requires clearance (value over the 300 GEL duty-free threshold).
   */
  declarationFeeGEL?: number;
  /** volumetric divisor; undefined = carrier doesn't apply volumetric on this corridor */
  volumetricDivisor?: number;
  /** minimum billable weight floor, kg */
  minBillableKg: number;
  /**
   * USA2Georgia Turkey rule: volumetric ignored when volumetric weight <= this many kg
   * (billed on actual weight instead).
   */
  volumetricWaiverMaxKg?: number;
  lastVerified: string; // ISO date
  /** published transit estimate in days, e.g. "8–10"; omit when unpublished */
  deliveryDays?: string;
  notes?: string;
}

export interface FxRates {
  /** GEL per 1 unit of currency */
  USD: number;
  EUR: number;
  GBP: number;
  date: string; // rate date
  source: 'nbg' | 'frankfurter' | 'cached' | 'hardcoded' | 'manual';
}

export interface QuoteInput {
  actualKg: number;
  dims: Dimensions;
  productPrice: number;
  productCurrency: Currency;
  /** extra local shipping to warehouse, in product currency */
  localShipping?: number;
  fx: FxRates;
}

export interface Quote {
  carrier: CarrierKey;
  available: true;
  billableKg: number;
  volumetricKg: number;
  usedVolumetric: boolean;
  transportGEL: number;
  fixedFeeGEL: number;
  /** declaration service fee actually charged (0 when duty-free) */
  declarationGEL: number;
  customsGEL: number;
  totalGEL: number;
  productValueGEL: number;
  dutyFree: boolean;
}

export interface QuoteUnavailable {
  carrier: CarrierKey;
  available: false;
  reason: string;
}

export type QuoteResult = Quote | QuoteUnavailable;
