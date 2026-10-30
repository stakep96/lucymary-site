const base = process.env.CART_SMOKE_BASE || "http://127.0.0.1:3001";
const origin = new URL(base).origin;
const simpleId = Number(process.env.CART_SMOKE_SIMPLE_ID || 17903);
const variationId = Number(process.env.CART_SMOKE_VARIATION_ID || 17518);
const variationAttributes = process.env.CART_SMOKE_VARIATION_ATTRIBUTES
  ? JSON.parse(process.env.CART_SMOKE_VARIATION_ATTRIBUTES)
  : [
      { attribute: "Ouro 10k", value: "Teor 416" },
      { attribute: "Ouro 18k", value: "Teor 750" },
    ];

if (!Number.isSafeInteger(simpleId) || simpleId < 1 || !Number.isSafeInteger(variationId) || variationId < 1 || !Array.isArray(variationAttributes)) {
  throw new Error("Configure IDs de produtos e atributos da variação válidos para esta loja.");
}

async function call(path, cookie = "", action) {
  const response = await fetch(new URL(path, base), {
    method: action ? "POST" : "GET",
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(action ? { Origin: origin, "Content-Type": "application/json" } : {}),
    },
    body: action ? JSON.stringify(action) : undefined,
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status} — ${data.error || "erro desconhecido"}`);
  return { data, cookie: response.headers.get("set-cookie")?.split(";")[0] || cookie };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let a = await call("/api/cart");
const b = await call("/api/cart");
assert(a.cookie && b.cookie && a.cookie !== b.cookie, "As sessões não receberam cookies independentes.");
assert(a.data.itemsCount === 0 && b.data.itemsCount === 0, "Os carrinhos de teste não começaram vazios.");

try {
  a = await call("/api/cart", a.cookie, { action: "add", id: simpleId, quantity: 1, variation: [] });
  assert(a.data.itemsCount === 1, "A inclusão do produto simples falhou.");
  const simpleKey = a.data.items[0].key;

  const untouched = await call("/api/cart", b.cookie);
  assert(untouched.data.itemsCount === 0, "Os itens foram compartilhados entre sessões.");

  a = await call("/api/cart", a.cookie, { action: "update", key: simpleKey, quantity: 2 });
  assert(a.data.itemsCount === 2, "A atualização de quantidade falhou.");

  a = await call("/api/cart", a.cookie, { action: "updateShipping", postcode: "01001000", city: "São Paulo", state: "SP" });
  assert(a.data.shipping.address.postcode.replace(/\D/g, "") === "01001000", "A atualização de endereço de entrega falhou.");
  const spRates = a.data.shipping.packages.flatMap((shippingPackage) => shippingPackage.rates);
  console.log(`Frete São Paulo/SP: ${spRates.length} modalidade(s) retornada(s) pela loja.`);
  const selectablePackage = a.data.shipping.packages.find((shippingPackage) => shippingPackage.rates.length > 0);
  if (selectablePackage) {
    const chosen = selectablePackage.rates[0];
    a = await call("/api/cart", a.cookie, { action: "selectShipping", packageId: selectablePackage.id, rateId: chosen.id });
    assert(a.data.shipping.packages.find((shippingPackage) => shippingPackage.id === selectablePackage.id)?.rates.some((rate) => rate.id === chosen.id && rate.selected), "A seleção de frete não foi mantida.");
  }

  if (process.env.CART_SMOKE_COUPON) {
    const code = process.env.CART_SMOKE_COUPON;
    a = await call("/api/cart", a.cookie, { action: "applyCoupon", code });
    assert(a.data.coupons.some((item) => item.code.toLowerCase() === code.toLowerCase()), "O cupom válido não apareceu no carrinho.");
    a = await call("/api/cart", a.cookie, { action: "removeCoupon", code });
    assert(!a.data.coupons.some((item) => item.code.toLowerCase() === code.toLowerCase()), "A remoção do cupom falhou.");
    console.log("Cupom válido: aplicação e remoção confirmadas.");
  }

  a = await call("/api/cart", a.cookie, { action: "updateShipping", postcode: "63040300", city: "Juazeiro do Norte", state: "CE" });
  const ceRates = a.data.shipping.packages.flatMap((shippingPackage) => shippingPackage.rates);
  console.log(`Frete Juazeiro do Norte/CE: ${ceRates.length} modalidade(s) retornada(s) pela loja.`);

  a = await call("/api/cart", a.cookie, { action: "remove", key: simpleKey });
  assert(a.data.itemsCount === 0, "A remoção do produto simples falhou.");

  a = await call("/api/cart", a.cookie, {
    action: "add", id: variationId, quantity: 1,
    variation: variationAttributes,
  });
  assert(a.data.itemsCount === 1, "A inclusão da variação falhou.");
  a = await call("/api/cart", a.cookie, { action: "remove", key: a.data.items[0].key });
  assert(a.data.itemsCount === 0, "A remoção da variação falhou.");

  console.log("Carrinho OK: sessões separadas, produto simples, quantidade, endereços, variação e remoção.");
} finally {
  if (a.data.items?.length) {
    for (const item of a.data.items) {
      a = await call("/api/cart", a.cookie, { action: "remove", key: item.key });
    }
  }
}
