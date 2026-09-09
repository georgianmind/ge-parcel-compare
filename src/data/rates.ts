import type { CarrierCorridorRate, CorridorKey } from '../engine/types';

export const RATES_VERSION = '2026-09-01';

const VERIFIED = '2026-09-01';

// Standard air-freight volumetric divisor (cm³ per kg).
const DIVISOR = 6000;

/**
 * Customs-declaration service fee, charged by every forwarder only when the
 * parcel exceeds the 300 GEL duty-free threshold. 10 GEL verified for Inex;
 * assumed equal for the others until verified against real invoices.
 */
const DECLARATION_GEL = 10;

/** Inex China sea: $5.00/kg, $4.50 at ≥20 kg, $4.00 at ≥50 kg. */
export function inexChinaSeaRate(billableKg: number): number {
  if (billableKg >= 50) return 4.0;
  if (billableKg >= 20) return 4.5;
  return 5.0;
}

const SEED: CarrierCorridorRate[] = [
  // --- USA ---
  { carrier: 'camex', corridor: 'usa', currency: 'USD', ratePerKg: 8.95, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: VERIFIED, deliveryDays: '~7' },
  { carrier: 'inex', corridor: 'usa', currency: 'USD', ratePerKg: 8.5, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: VERIFIED, deliveryDays: '8–10' },
  { carrier: 'usa2georgia', corridor: 'usa', currency: 'USD', ratePerKg: 9.95, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: VERIFIED, deliveryDays: '~7' },

  // --- Turkey ---
  { carrier: 'camex', corridor: 'turkey', currency: 'USD', ratePerKg: 2.2, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: VERIFIED, deliveryDays: '~5' },
  { carrier: 'inex', corridor: 'turkey', currency: 'USD', ratePerKg: 4.0, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: VERIFIED, deliveryDays: '5–7' },
  {
    carrier: 'usa2georgia', corridor: 'turkey', currency: 'USD', ratePerKg: 4.0,
    volumetricDivisor: DIVISOR, minBillableKg: 0.1, volumetricWaiverMaxKg: 50,
    lastVerified: VERIFIED, deliveryDays: '~5', notes: 'Actual weight billed when volumetric ≤ 50 kg',
  },

  // --- China air ---
  { carrier: 'camex', corridor: 'china-air', currency: 'USD', ratePerKg: 11.25, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: VERIFIED, deliveryDays: '~7' },
  { carrier: 'inex', corridor: 'china-air', currency: 'USD', ratePerKg: 12.5, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: VERIFIED },
  { carrier: 'usa2georgia', corridor: 'china-air', currency: 'USD', ratePerKg: 12.5, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: VERIFIED },

  // --- China sea ---
  { carrier: 'camex', corridor: 'china-sea', currency: 'USD', ratePerKg: 4.95, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: VERIFIED },
  { carrier: 'inex', corridor: 'china-sea', currency: 'USD', ratePerKg: inexChinaSeaRate, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: VERIFIED },

  // --- UK ---
  { carrier: 'camex', corridor: 'uk', currency: 'USD', ratePerKg: 10.3, volumetricDivisor: DIVISOR, minBillableKg: 0.2, lastVerified: VERIFIED },
  { carrier: 'inex', corridor: 'uk', currency: 'GBP', ratePerKg: 6.5, volumetricDivisor: DIVISOR, minBillableKg: 0.2, lastVerified: VERIFIED },

  // --- Germany ---
  { carrier: 'camex', corridor: 'germany', currency: 'EUR', ratePerKg: 8.9, volumetricDivisor: DIVISOR, minBillableKg: 0.2, lastVerified: VERIFIED },
  { carrier: 'inex', corridor: 'germany', currency: 'EUR', ratePerKg: 8.0, volumetricDivisor: DIVISOR, minBillableKg: 0.2, lastVerified: VERIFIED },

  // --- Greece ---
  { carrier: 'camex', corridor: 'greece', currency: 'EUR', ratePerKg: 3.5, volumetricDivisor: DIVISOR, minBillableKg: 0.25, lastVerified: VERIFIED, deliveryDays: '10–14' },
  { carrier: 'inex', corridor: 'greece', currency: 'EUR', ratePerKg: 3.5, volumetricDivisor: DIVISOR, minBillableKg: 0.25, lastVerified: VERIFIED },

  // --- Italy ---
  { carrier: 'inex', corridor: 'italy', currency: 'EUR', ratePerKg: 4.5, volumetricDivisor: DIVISOR, minBillableKg: 0.25, lastVerified: VERIFIED },

  // --- Spain ---
  { carrier: 'inex', corridor: 'spain', currency: 'EUR', ratePerKg: 6.0, volumetricDivisor: DIVISOR, minBillableKg: 0.25, lastVerified: VERIFIED },

  // --- Cyprus ---
  { carrier: 'inex', corridor: 'cyprus', currency: 'EUR', ratePerKg: 4.0, volumetricDivisor: DIVISOR, minBillableKg: 0.25, lastVerified: VERIFIED },

  // --- Kiwi Post (kiwipost.ge, site-published per-kg rates 2026-09-03;
  //     volumetric divisor and min weights assumed standard — unverified) ---
  { carrier: 'kiwipost', corridor: 'usa', currency: 'USD', ratePerKg: 10.0, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: '2026-09-03', deliveryDays: '4–7', notes: 'vol/min assumed' },
  { carrier: 'kiwipost', corridor: 'turkey', currency: 'USD', ratePerKg: 4.0, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: '2026-09-03', deliveryDays: '4–6', notes: 'vol/min assumed' },
  { carrier: 'kiwipost', corridor: 'china-air', currency: 'USD', ratePerKg: 10.0, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: '2026-09-03', deliveryDays: '7–10', notes: 'express; vol/min assumed' },
  { carrier: 'kiwipost', corridor: 'china-sea', currency: 'USD', ratePerKg: 2.5, volumetricDivisor: DIVISOR, minBillableKg: 0.1, lastVerified: '2026-09-03', deliveryDays: '30–40', notes: 'ground 30-40d; vol/min assumed' },
  { carrier: 'kiwipost', corridor: 'uk', currency: 'GBP', ratePerKg: 8.0, volumetricDivisor: DIVISOR, minBillableKg: 0.2, lastVerified: '2026-09-03', deliveryDays: '4–7', notes: 'vol/min assumed' },
  { carrier: 'kiwipost', corridor: 'greece', currency: 'EUR', ratePerKg: 4.0, volumetricDivisor: DIVISOR, minBillableKg: 0.25, lastVerified: '2026-09-03', deliveryDays: '5–7', notes: 'vol/min assumed' },
  { carrier: 'kiwipost', corridor: 'spain', currency: 'EUR', ratePerKg: 8.0, volumetricDivisor: DIVISOR, minBillableKg: 0.25, lastVerified: '2026-09-03', deliveryDays: '4–7', notes: 'vol/min assumed' },
];

// Every carrier charges the declaration fee on cleared parcels; entries may
// override with their own amount once verified.
export const RATES: CarrierCorridorRate[] = SEED.map((r) => ({
  declarationFeeGEL: DECLARATION_GEL,
  ...r,
}));

export function ratesForCorridor(corridor: CorridorKey): CarrierCorridorRate[] {
  return RATES.filter((r) => r.corridor === corridor);
}

/** Reasons shown for carriers with no published rate on a corridor. */
export const UNAVAILABLE_REASONS: Partial<Record<CorridorKey, Partial<Record<string, string>>>> = {
  greece: { usa2georgia: 'no published Greece rate' },
  'china-sea': { usa2georgia: 'no China sea service' },
  uk: { usa2georgia: 'no published UK rate' },
  germany: { usa2georgia: 'no published Germany rate', kiwipost: 'no published Germany rate' },
  italy: { camex: 'no published Italy rate', usa2georgia: 'no published Italy rate', kiwipost: 'no published Italy rate' },
  spain: { camex: 'no published Spain rate', usa2georgia: 'no published Spain rate' },
  cyprus: { camex: 'no published Cyprus rate', usa2georgia: 'no published Cyprus rate', kiwipost: 'no published Cyprus rate' },
};
