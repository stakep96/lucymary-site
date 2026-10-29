// Auditoria somente de leitura. Execute localmente com uma chave WooCommerce de permissão Read.
const site = process.env.WOOCOMMERCE_STORE_URL;
const key = process.env.WOOCOMMERCE_READ_KEY;
const secret = process.env.WOOCOMMERCE_READ_SECRET;

if (!site || !key || !secret) {
  console.error("Configure WOOCOMMERCE_STORE_URL, WOOCOMMERCE_READ_KEY e WOOCOMMERCE_READ_SECRET no ambiente local.");
  process.exitCode = 1;
} else {
  const base = new URL(site);
  if (base.protocol !== "https:") {
    console.error("A auditoria autenticada exige HTTPS.");
    process.exitCode = 1;
  } else {
    const url = new URL("/wp-json/wc/v3/payment_gateways", base);
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const gateways = await response.json();
      if (!Array.isArray(gateways)) throw new Error("Resposta inesperada");
      // Nunca imprimir a propriedade settings: alguns gateways devolvem configurações sensíveis.
      console.log(JSON.stringify(gateways.map(({ id, enabled, method_supports }) => ({
        id, enabled: Boolean(enabled), supports: Array.isArray(method_supports) ? method_supports : [],
      })), null, 2));
    } catch (error) {
      console.error(`Não foi possível ler os gateways: ${error instanceof Error ? error.message : "erro desconhecido"}`);
      process.exitCode = 1;
    }
  }
}
