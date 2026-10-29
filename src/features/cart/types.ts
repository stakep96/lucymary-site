export interface CartCurrency {
  code: string;
  minorUnit: number;
}

export interface CartItem {
  key: string;
  id: number;
  name: string;
  quantity: number;
  quantityLimits: { minimum: number; maximum: number; multiple: number; editable: boolean };
  image: { src: string; alt: string } | null;
  price: string;
  lineTotal: string;
  variation: Array<{ attribute: string; value: string }>;
}

export interface CartShippingRate {
  id: string;
  name: string;
  price: string;
  selected: boolean;
  deliveryTime: string;
}

export interface CartShippingPackage {
  id: number;
  name: string;
  rates: CartShippingRate[];
}

export interface CartView {
  items: CartItem[];
  itemsCount: number;
  coupons: Array<{ code: string; discount: string }>;
  totals: { items: string; discount: string; shipping: string; tax: string; total: string };
  currency: CartCurrency;
  shipping: {
    needed: boolean;
    calculated: boolean;
    address: { postcode: string; city: string; state: string; country: string };
    packages: CartShippingPackage[];
  };
}

export type CartAction =
  | { action: "add"; id: number; quantity: number; variation: Array<{ attribute: string; value: string }> }
  | { action: "update"; key: string; quantity: number }
  | { action: "remove"; key: string }
  | { action: "applyCoupon"; code: string }
  | { action: "removeCoupon"; code: string }
  | { action: "updateShipping"; postcode: string; city: string; state: string }
  | { action: "selectShipping"; packageId: number; rateId: string };
