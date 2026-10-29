import { formatStorePrice } from "@/lib/woocommerce/format";
import { listProducts } from "@/lib/woocommerce/store-api";

export const dynamic = "force-dynamic";

const responseHeaders = { "Cache-Control": "private, no-store, max-age=0" };

export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 80);
  if (query.length < 2) {
    return Response.json({ total: 0, items: [] }, { headers: responseHeaders });
  }

  try {
    const collection = await listProducts({ search: query, perPage: 8 });
    return Response.json({
      total: collection.total,
      items: collection.items.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || null,
        category: product.categories?.[0]?.name || null,
        price: `${product.type === "variable" ? "A partir de " : ""}${formatStorePrice(product.prices)}`,
        inStock: product.is_in_stock,
      })),
    }, { headers: responseHeaders });
  } catch {
    return Response.json({ error: "Busca indisponível" }, { status: 503, headers: responseHeaders });
  }
}
