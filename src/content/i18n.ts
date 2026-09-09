export type Lang = 'ka' | 'en';

const STRINGS = {
  toTbilisi: { ka: 'თბილისში', en: 'to Tbilisi' },
  product: { ka: 'პროდუქტი', en: 'Product' },
  estimated: { ka: 'შეფასებით', en: 'estimated' },
  dutyFree: { ka: '300₾-მდე — განბაჟება არ სჭირდება ✓', en: 'under 300 ₾ — duty-free ✓' },
  vatDue: { ka: '300₾-ზე მეტი → +{x} ₾ დღგ (18%)', en: 'over 300 ₾ → +{x} ₾ VAT (18%)' },
  totalWithCheapest: { ka: 'ჯამი ყველაზე იაფით', en: 'total w/ cheapest' },
  cheapest: { ka: 'ყველაზე იაფი', en: 'cheapest' },
  noRate: { ka: 'ტარიფი არ არის', en: 'no rate' },
  ratesVerified: { ka: 'ტარიფები გადამოწმდა', en: 'rates verified' },
  ratesOld: { ka: 'ტარიფები მოძველებულია — გადაამოწმეთ', en: 'rates may be outdated — verify' },
  weight: { ka: 'წონა (კგ)', en: 'weight (kg)' },
  dims: { ka: 'ზომები (სმ)', en: 'dims (cm)' },
  localShipping: { ka: 'ადგილობრივი მიწოდება საწყობამდე', en: 'local shipping to warehouse' },
  country: { ka: 'ქვეყანა', en: 'country' },
  detectionFailed: {
    ka: 'პროდუქტი ვერ ამოვიცანით — შეიყვანეთ ხელით',
    en: 'Could not detect product — enter manually',
  },
  price: { ka: 'ფასი', en: 'price' },
  volumetric: { ka: 'მოცულობითი', en: 'volumetric' },
  fxSource: { ka: 'კურსი', en: 'FX' },
  stale: { ka: 'მოძველებული', en: 'stale' },
  save: { ka: 'შენახვა', en: 'save' },
  declaration: { ka: 'დეკლარაცია', en: 'declaration' },
  shipping: { ka: 'ტრანსპორტირება', en: 'shipping' },
  vat: { ka: 'დღგ', en: 'VAT' },
  productLabel: { ka: 'ნივთი', en: 'item' },
  close: { ka: 'დამალვა', en: 'hide' },
  days: { ka: 'დღე', en: 'days' },
  openPanel: { ka: 'გზავნილის ღირებულება', en: 'shipping cost' },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(lang: Lang, key: StringKey, vars?: Record<string, string | number>): string {
  let s: string = STRINGS[key][lang];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

export const CORRIDOR_LABELS: Record<string, { ka: string; en: string; flag: string }> = {
  usa: { ka: 'აშშ', en: 'USA', flag: '🇺🇸' },
  turkey: { ka: 'თურქეთი', en: 'Turkey', flag: '🇹🇷' },
  'china-air': { ka: 'ჩინეთი (ავია)', en: 'China (air)', flag: '🇨🇳' },
  'china-sea': { ka: 'ჩინეთი (საზღვაო)', en: 'China (sea)', flag: '🇨🇳' },
  uk: { ka: 'დიდი ბრიტანეთი', en: 'UK', flag: '🇬🇧' },
  germany: { ka: 'გერმანია', en: 'Germany', flag: '🇩🇪' },
  greece: { ka: 'საბერძნეთი', en: 'Greece', flag: '🇬🇷' },
  italy: { ka: 'იტალია', en: 'Italy', flag: '🇮🇹' },
  spain: { ka: 'ესპანეთი', en: 'Spain', flag: '🇪🇸' },
  cyprus: { ka: 'კვიპროსი', en: 'Cyprus', flag: '🇨🇾' },
};

export const CARRIER_LABELS: Record<string, string> = {
  camex: 'Camex',
  inex: 'Inex',
  usa2georgia: 'USA2Georgia',
  kiwipost: 'Kiwi Post',
};
