# Preparação do checkout real

## Confirmado na loja pública

- Catálogo, variações e carrinho funcionam com a Store API; o carrinho usa `Cart-Token` por visitante.
- O cálculo de frete devolveu duas modalidades para o CEP 01001-000 (São Paulo/SP) e quatro para o CEP 63040-300 (Juazeiro do Norte/CE), usando um produto público em um carrinho temporário. A seleção de uma modalidade foi mantida pela API. Esses resultados dependem do produto, endereço e configurações atuais, e não garantem as mesmas opções em todas as compras.
- Aplicar e remover cupons já está implementado, mas ainda não houve teste com um código válido da loja.
- Nenhum endpoint de checkout foi chamado na produção. Nenhum pedido ou pagamento foi criado.

## Dados necessários para a próxima validação

1. URL de uma cópia de staging do WordPress/WooCommerce com plugins de pagamento e entrega equivalentes, mas credenciais de pagamento de teste e notificações de produção desativadas.
2. Um cupom válido criado para teste. O código pode ser informado sem enviar senhas nem chaves; a aplicação e remoção serão feitas em um carrinho temporário.
3. Identificação do plugin e versão instalados para o Mercado Pago, e confirmação de que o Checkout Pro está habilitado no staging. Isso também pode ser visto no painel do WordPress.
4. Opcional: uma chave WooCommerce REST **Read** gerada em WooCommerce → Configurações → Avançado → REST API. Guarde a chave e o segredo somente em `.env.local` como `WOOCOMMERCE_READ_KEY` e `WOOCOMMERCE_READ_SECRET`; não os envie por chat nem configure no navegador. Execute `node --env-file=.env.local scripts/woo-readiness.mjs` localmente. O script lê apenas `/wp-json/wc/v3/payment_gateways`, imprime ID, estado e recursos declarados, descartando `settings` da resposta. A chave não é necessária para o carrinho público.

No plano **Hostinger Single Web Hosting**, a ferramenta automática de staging da Hostinger não está incluída; a documentação atual exige Business ou superior. Uma cópia manual no mesmo espaço (por exemplo com WP STAGING) ou em uma hospedagem separada é uma alternativa, sujeita ao espaço e recursos disponíveis. Nunca publique o banco de dados de staging sobre a loja ativa: pedidos e outras alterações feitos na produção após a cópia seriam perdidos.

## Decisão técnica antes de habilitar o botão de compra

O `GET /wc/store/v1/checkout` cria um pedido em rascunho, e `POST /checkout` processa pedido e pagamento. Por isso, os dois só serão exercitados no staging. A lista de gateways do REST API e a compatibilidade com Checkout Blocks são sinais úteis, mas não comprovam que o plugin instalado aceita o fluxo headless nem qual `payment_data` exige. O teste de staging precisa confirmar o método real, o redirecionamento para Checkout Pro e a atualização de status pelo WooCommerce após notificação do gateway. Se a Store API não suportar o fluxo do plugin, será necessário integrar o checkout hospedado no WordPress preservando o carrinho do visitante; um link simples para `/checkout` não transporta automaticamente a sessão baseada em `Cart-Token`.

O frontend deve mostrar o status do pedido obtido no backend. Uma URL de retorno do Mercado Pago, por si só, não confirma pagamento.

## Referências

- [WooCommerce Store API: carrinho](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/) e [checkout](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/checkout/)
- [WooCommerce: criação de chave REST com permissão Read](https://woocommerce.com/document/woocommerce-rest-api/)
- [Mercado Pago: configuração do Checkout Pro para WooCommerce](https://www.mercadopago.com.br/developers/pt/docs/woocommerce/payments-configuration/checkout-pro)
- [Hostinger: staging automático a partir do plano Business](https://www.hostinger.com/support/5720286-how-to-create-a-wordpress-staging-environment-in-hostinger/)
