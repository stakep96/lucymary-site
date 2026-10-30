import "server-only";

import type { CatalogFacet } from "@/components/catalog-filters";
import { getAttributeTerms, getProductAttributes } from "@/lib/woocommerce/store-api";

export async function loadCatalogFacets(): Promise<{ color?: CatalogFacet; material?: CatalogFacet }> {
  try {
    const attributes = await getProductAttributes();
    const colorAttribute = attributes.find((attribute) => /^(cor|cores|color|colors)$/i.test(attribute.name.trim()) || /^(pa_)?(cor|cores|color|colors)$/i.test(attribute.taxonomy));
    const materialAttribute = attributes.find((attribute) => /^(material|materiais|materials)$/i.test(attribute.name.trim()) || /^(pa_)?(material|materiais|materials)$/i.test(attribute.taxonomy));
    const [color, material] = await Promise.all([
      colorAttribute ? getAttributeTerms(colorAttribute.id).then((terms) => ({ taxonomy: colorAttribute.taxonomy, terms })).catch(() => undefined) : undefined,
      materialAttribute ? getAttributeTerms(materialAttribute.id).then((terms) => ({ taxonomy: materialAttribute.taxonomy, terms })).catch(() => undefined) : undefined,
    ]);
    return { color: color as CatalogFacet | undefined, material: material as CatalogFacet | undefined };
  } catch {
    return {};
  }
}
