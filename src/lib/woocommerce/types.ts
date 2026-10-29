export interface StoreImage {
  src: string;
  alt: string;
}

export interface StorePrices {
  price: string;
  regular_price: string;
  sale_price: string;
  price_range?: {
    min_amount: string;
    max_amount: string;
  } | null;
  currency_code: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
}

export interface StoreVariationSummary {
  id: number;
  attributes: Array<{ name: string; value: string | null }>;
}

export interface StoreProductAttribute {
  id: number;
  name: string;
  taxonomy: string | null;
  has_variations: boolean;
  terms: Array<{ id: number; name: string; slug: string }>;
}

export interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string;
  parent?: number;
  sku?: string;
  description?: string;
  short_description?: string;
  images: StoreImage[];
  prices: StorePrices;
  is_in_stock: boolean;
  on_sale: boolean;
  categories: Array<{ id: number; name: string; slug: string }>;
  tags?: Array<{ id: number; name: string; slug: string }>;
  brands?: Array<{ id: number; name: string; slug: string }>;
  attributes?: StoreProductAttribute[];
  weight?: string;
  formatted_weight?: string;
  formatted_dimensions?: string;
  average_rating?: string;
  review_count?: number;
  variations?: StoreVariationSummary[];
}

export interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
  image: StoreImage | null;
}
