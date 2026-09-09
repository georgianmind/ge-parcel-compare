import type { Dimensions } from '../engine/types';

export interface WeightEstimate {
  category: string;
  kg: number;
  dims: Dimensions; // cm, for volumetric
}

export const WEIGHT_TABLE: Record<string, WeightEstimate> = {
  tshirt: { category: 'tshirt', kg: 0.3, dims: { l: 30, w: 25, h: 3 } },
  shirt: { category: 'shirt', kg: 0.35, dims: { l: 32, w: 26, h: 4 } },
  trousers: { category: 'trousers', kg: 0.7, dims: { l: 35, w: 28, h: 6 } },
  dress: { category: 'dress', kg: 0.5, dims: { l: 35, w: 28, h: 5 } },
  jacket: { category: 'jacket', kg: 1.2, dims: { l: 45, w: 35, h: 10 } },
  shoes: { category: 'shoes', kg: 1.3, dims: { l: 34, w: 24, h: 13 } },
  bag: { category: 'bag', kg: 0.9, dims: { l: 40, w: 30, h: 12 } },
  accessories: { category: 'accessories', kg: 0.2, dims: { l: 20, w: 15, h: 4 } },
  default: { category: 'default', kg: 0.6, dims: { l: 35, w: 28, h: 6 } },
};

/** keyword → category, checked in order (more specific first) */
const KEYWORD_MAP: Array<[RegExp, string]> = [
  [/t-?shirt|tee|top|polo|tank|bodysuit|camiseta|μπλουζ/i, 'tshirt'],
  [/shirt|blouse|πουκάμισ/i, 'shirt'],
  [/jean|trouser|pant|chino|legging|short|skirt|παντελόν/i, 'trousers'],
  [/dress|gown|φόρεμα/i, 'dress'],
  [/jacket|jacke|mantel|coat|blazer|parka|puffer|anorak|overshirt|cardigan|sweater|jumper|hoodie|sweatshirt|knit|μπουφάν|παλτό/i, 'jacket'],
  [/shoe|sneaker|trainer|boot|sandal|heel|loafer|footwear|παπούτσι/i, 'shoes'],
  [/bag|backpack|tote|crossbody|handbag|τσάντα/i, 'bag'],
  [/belt|scarf|hat|cap|beanie|glove|sock|jewel|earring|necklace|ring|wallet|sunglass|accessor/i, 'accessories'],
];

export function categorize(text: string | undefined): string {
  if (!text) return 'default';
  for (const [re, cat] of KEYWORD_MAP) {
    if (re.test(text)) return cat;
  }
  return 'default';
}

export function estimateFor(categoryText: string | undefined): WeightEstimate {
  return WEIGHT_TABLE[categorize(categoryText)] ?? WEIGHT_TABLE.default;
}
