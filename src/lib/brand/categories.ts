import type { StoreCategory } from "@/lib/woocommerce/types";

export const HEADER_CATEGORY_ORDER = [
  "relogios", "perfumes", "aneis", "aliancas", "colares",
  "cordoes", "pingentes", "pulseiras", "brincos",
];

const HOME_CATEGORY_ORDER = [
  "aliancas", "aneis", "relogios", "colares", "cordoes",
  "pingentes", "pulseiras", "brincos", "perfumes",
];

const CATEGORY_IMAGES: Record<string, string> = {
  aliancas: "/brand/categorias/aliancas.png",
  aneis: "/brand/categorias/aneis.png",
  relogios: "/brand/categorias/relogios.png",
  colares: "/brand/categorias/colares.png",
  cordoes: "/brand/categorias/cordoes.png",
  pingentes: "/brand/categorias/pingentes-2.png",
  pulseiras: "/brand/categorias/pulseiras.png",
  brincos: "/brand/categorias/brincos.png",
  perfumes: "/brand/categorias/perfumes.png",
};

export function categoryImage(category: StoreCategory): string | null {
  return CATEGORY_IMAGES[category.slug] || category.image?.src || null;
}

export function homeCategories(categories: StoreCategory[]): StoreCategory[] {
  return categories
    .filter((category) => category.parent === 0 && category.slug !== "sem-categoria")
    .sort((a, b) => {
      const aRank = HOME_CATEGORY_ORDER.indexOf(a.slug);
      const bRank = HOME_CATEGORY_ORDER.indexOf(b.slug);
      if (aRank !== bRank) return (aRank < 0 ? 100 : aRank) - (bRank < 0 ? 100 : bRank);
      return a.name.localeCompare(b.name, "pt-BR");
    });
}
