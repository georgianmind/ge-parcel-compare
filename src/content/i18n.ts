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
  totalToTbilisi: { ka: 'სულ, თბილისამდე', en: 'total to Tbilisi' },
  dutyFreeShort: { ka: 'უბაჟო ✓', en: 'duty-free ✓' },
  arrives: { ka: 'ჩამოვა', en: 'arrives' },
  arrivalTitle: { ka: 'სავარაუდო ჩამოსვლა თბილისში', en: 'estimated arrival in Tbilisi' },
  warehouseBy: { ka: 'საწყობში', en: 'at warehouse' },
  itemLimit: { ka: 'ნივთი', en: 'item' },
  limit: { ka: 'ლიმიტი', en: 'limit' },
  headroom: { ka: 'კიდევ {x} ₾ უბაჟოდ', en: '{x} ₾ of duty-free room left' },
  vatApplies: { ka: 'დღგ 18% ვრცელდება', en: 'VAT 18% applies' },
  best: { ka: 'საუკეთესო', en: 'best' },
  splitTip: {
    ka: 'ორ შეკვეთად გაყოფა (≤300 ₾) დაზოგავს ~{x} ₾-ს',
    en: 'splitting into two orders (≤300 ₾) saves ~{x} ₾',
  },
  splitHow: { ka: 'ნახე', en: 'how' },
  splitExplain: {
    ka: 'განბაჟება მოქმედებს თითო ამანათზე: ორი შეკვეთა, თითო 300 ₾-მდე, ჩამოვა უბაჟოდ — მოგიწევთ მხოლოდ ორჯერ ტრანსპორტირების გადახდა.',
    en: 'Customs applies per parcel: two orders, each under 300 ₾, arrive duty-free — you only pay transport twice.',
  },
  deliveryTotal: { ka: 'მიწოდება სულ', en: 'delivery total' },
  volumetricShort: { ka: 'მოცულობითი', en: 'volumetric' },
  items: { ka: 'ნივთი', en: 'items' },
  addToCart: { ka: '+ ამანათში', en: '+ add to parcel' },
  cartLabel: { ka: 'ერთი ამანათი', en: 'one parcel' },
  clearCart: { ka: 'გასუფთავება', en: 'clear' },
  shareCard: { ka: 'ბარათის გაზიარება', en: 'share card' },
  weightShort: { ka: 'წონა', en: 'weight' },
  openPanel: { ka: 'გზავნილის ღირებულება', en: 'shipping cost' },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(lang: Lang, key: StringKey, vars?: Record<string, string | number>): string {
  let s: string = STRINGS[key][lang];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

export const CORRIDOR_LABELS: Record<
  string,
  { ka: string; en: string; flag: string; code: string }
> = {
  usa: { ka: 'აშშ', en: 'USA', flag: '🇺🇸', code: 'JFK' },
  turkey: { ka: 'თურქეთი', en: 'Turkey', flag: '🇹🇷', code: 'IST' },
  'china-air': { ka: 'ჩინეთი (ავია)', en: 'China (air)', flag: '🇨🇳', code: 'PVG' },
  'china-sea': { ka: 'ჩინეთი (საზღვაო)', en: 'China (sea)', flag: '🇨🇳', code: 'SHA' },
  uk: { ka: 'დიდი ბრიტანეთი', en: 'UK', flag: '🇬🇧', code: 'LHR' },
  germany: { ka: 'გერმანია', en: 'Germany', flag: '🇩🇪', code: 'FRA' },
  greece: { ka: 'საბერძნეთი', en: 'Greece', flag: '🇬🇷', code: 'ATH' },
  italy: { ka: 'იტალია', en: 'Italy', flag: '🇮🇹', code: 'MXP' },
  spain: { ka: 'ესპანეთი', en: 'Spain', flag: '🇪🇸', code: 'MAD' },
  cyprus: { ka: 'კვიპროსი', en: 'Cyprus', flag: '🇨🇾', code: 'LCA' },
};

export const MONTHS: Record<Lang, string[]> = {
  ka: ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export const CARRIER_LABELS: Record<string, string> = {
  camex: 'Camex',
  inex: 'Inex',
  usa2georgia: 'USA2Georgia',
  kiwipost: 'Kiwi Post',
};
