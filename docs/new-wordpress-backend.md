# Novo WordPress e WooCommerce como backend LucyMary

## Decisão

O novo WordPress será uma loja independente. Produtos serão importados pelo proprietário; contas de clientes e pedidos antigos permanecerão no WordPress atual e não serão migrados. O WordPress atual continua atendendo o domínio e o preview do Next.js até a troca controlada da origem WooCommerce. Não instalar nem configurar gateways reais no frontend.

## Preparação da nova loja

1. Disponibilizar hospedagem para um segundo WordPress, com HTTPS e URL pública permanente. No plano Hostinger Single, adicionar um segundo site pelo painel requer mudança de plano ou outra hospedagem. A futura URL do backend pode ser `wp.lucymary.com.br`; manter `lucymary.com.br` no site atual até a publicação do frontend.
2. Instalar WordPress e WooCommerce em banco de dados próprios. Definir BRL, localização, impostos, páginas da loja e políticas de cadastro. Manter a administração em `/wp-admin` do novo backend.
3. Importar produtos, categorias, atributos, variações, imagens, preços e estoque. O importador do WooCommerce gera novos IDs; conferir os produtos variáveis individualmente após a importação. Metadados próprios de plugins podem precisar de importação ou configuração separada.
4. Configurar zonas e modalidades de entrega, cupons e o plugin oficial Mercado Pago no novo WordPress. Usar credenciais de teste do gateway enquanto checkout e notificações são validados. Os dados comerciais ficam somente no WooCommerce.
5. Verificar `GET /wp-json/wc/store/v1/products`, `products/categories` e o carrinho do novo backend. Testar primeiro o Next.js local com `WOOCOMMERCE_STORE_URL` novo. Depois criar um deploy de Preview separado na Vercel e configurar a URL do novo backend somente nesse ambiente; o domínio `lucymary-site.vercel.app` conectado à branch principal não deve ser trocado antes da validação. Executar `scripts/cart-smoke.mjs` com IDs da nova loja. Confirmar catálogo completo, variações, cupons e fretes.
6. Em staging da nova loja, validar se o plugin instalado processa o Checkout Pro pela Store API e retorna redirecionamento externo. Habilitar checkout somente após confirmar o pedido e o estado de pagamento no backend. A URL de retorno não é prova de pagamento.
7. Na publicação, manter o novo WordPress em sua URL permanente e apontar `lucymary.com.br` para a Vercel. Atualizar `WOOCOMMERCE_STORE_URL` de Production, revisar imagens, links, cookies, webhooks e SEO. Guardar backup completo do WordPress antigo antes de removê-lo ou mudar seu domínio.

## Dados que faltam para a conexão

- URL HTTPS do novo WordPress/WooCommerce.
- Confirmação de que produtos e plugins foram importados/instalados.
- Um ID de produto simples, um ID de variação com seus atributos e um cupom válido da nova loja para os testes de carrinho.
- Versão e estado de teste do plugin Mercado Pago Checkout Pro.

Não enviar senhas, chaves REST nem credenciais do Mercado Pago no chat. A conexão pública do catálogo não precisa delas. Se uma auditoria autenticada for necessária, usar chave REST de permissão `Read` somente no servidor/ambiente local e nunca no navegador.
