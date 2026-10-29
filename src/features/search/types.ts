export interface SearchPreviewItem {
  id: number;
  name: string;
  slug: string;
  image: { src: string; alt: string } | null;
  category: string | null;
  price: string;
  inStock: boolean;
}

export interface SearchPreviewResponse {
  total: number;
  items: SearchPreviewItem[];
}
