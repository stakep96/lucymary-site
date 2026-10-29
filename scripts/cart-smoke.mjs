const base = process.env.CART_SMOKE_BASE || "http://127.0.0.1:3001";
const origin = new URL(base).origin;

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
  a = await call("/api/cart", a.cookie, { action: "add", id: 17903, quantity: 1, variation: [] });
  assert(a.data.itemsCount === 1, "A inclusão do produto simples falhou.");
  const simpleKey = a.data.items[0].key;

  const untouched = await call("/api/cart", b.cookie);
  assert(untouched.data.itemsCount === 0, "Os itens foram compartilhados entre sessões.");

  a = await call("/api/cart", a.cookie, { action: "update", key: simpleKey, quantity: 2 });
  assert(a.data.itemsCount === 2, "A atualização de quantidade falhou.");

  a = await call("/api/cart", a.cookie, { action: "updateShipping", postcode: "01001000", city: "São Paulo", state: "SP" });
  assert(a.data.shipping.address.postcode.replace(/\D/g, "") === "01001000", "A atualização de endereço de entrega falhou.");

  a = await call("/api/cart", a.cookie, { action: "remove", key: simpleKey });
  assert(a.data.itemsCount === 0, "A remoção do produto simples falhou.");

  a = await call("/api/cart", a.cookie, {
    action: "add", id: 17518, quantity: 1,
    variation: [
      { attribute: "Ouro 10k", value: "Teor 416" },
      { attribute: "Ouro 18k", value: "Teor 750" },
    ],
  });
  assert(a.data.itemsCount === 1, "A inclusão da variação falhou.");
  a = await call("/api/cart", a.cookie, { action: "remove", key: a.data.items[0].key });
  assert(a.data.itemsCount === 0, "A remoção da variação falhou.");

  console.log("Carrinho OK: sessões separadas, produto simples, quantidade, frete, variação e remoção.");
} finally {
  if (a.data.items?.length) {
    for (const item of a.data.items) {
      a = await call("/api/cart", a.cookie, { action: "remove", key: item.key });
    }
  }
}
