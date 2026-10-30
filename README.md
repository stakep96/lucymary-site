# LucyMary Headless Storefront

Base da nova vitrine LucyMary, com **Next.js App Router, TypeScript e Tailwind CSS**. O WordPress/WooCommerce é a fonte oficial de produtos, preços, estoque, carrinho e cupons; clientes, pedidos e pagamentos continuam no plano das próximas etapas. O catálogo usa leituras públicas da Store API e o carrinho usa os endpoints de sessão da mesma API. Nenhum checkout, pedido ou pagamento foi implementado.

## Estrutura

```text
src/
  app/                 Páginas, layout e estados do App Router
  components/          Componentes reutilizáveis da vitrine
  features/
    cart/               Estado, tipos e formatação do carrinho por visitante
    auth/               Contrato inicial para sessão de cliente
    checkout/           Estados planejados do checkout
  lib/brand/           Ordem e imagens da navegação visual
  lib/woocommerce/     Cliente público, tipos e formatação de preços
docs/catalog-audit.md  Auditoria de leitura do catálogo público
public/brand/          Logo, banners e imagens de categorias da LucyMary
```

## Páginas do catálogo

- `/`: 12 produtos recentes e categorias publicadas.
- `/produtos`: todos os produtos publicados e visíveis, em páginas de 12 itens.
- `/categoria/[slug]`: produtos de uma categoria do WooCommerce.
- `/produto/[slug]`: fotos, descrições, referência, preço, disponibilidade, marca, etiquetas, atributos e medidas públicos de um produto. Para produtos variáveis, a opção selecionada consulta o preço e o estoque da variação real.
- `/buscar?q=termo`: busca na Store API, com paginação.

Somente produtos **publicados e visíveis** pela Store API aparecem no frontend. A home é uma seleção recente; a rota `/produtos` usa a paginação da API para alcançar o catálogo inteiro. O nome, as imagens, as descrições, a referência, o preço, a disponibilidade e as características mostradas são lidos da loja; nenhuma ficha comercial é simulada. Descrições HTML são convertidas em texto para evitar renderizar código vindo da API. Produtos e variações podem compartilhar um slug; o cliente seleciona o produto pai para montar a página e consulta a variação por ID quando escolhida. Campos administrativos e metadados de plugins que não são expostos pela Store API exigem uma integração específica antes de aparecerem no frontend.

A navegação mostra as categorias cadastradas no WooCommerce, inclusive as vazias (`hide_empty=false`). A página de uma categoria vazia exibe o estado sem produtos. A ordem e as imagens da vitrine acompanham a identidade visual do site atual; os nomes e links das categorias vêm da Store API.

## Carrinho

- A página `/produto/[slug]` permite adicionar produtos simples ou uma variação selecionada. O WooCommerce valida a disponibilidade e o preço atuais.
- A sacola do header e a página `/carrinho` mostram os itens reais, permitem alterar quantidades, remover itens, aplicar/remover cupons e consultar frete após informar CEP, cidade e estado.
- O Next.js é um intermediário para a Store API em `/api/cart`: usa o `Cart-Token` exclusivo do visitante em cookie `HttpOnly` e `SameSite=Lax`, com `Secure` em HTTPS. O navegador não recebe esse token no JSON nem envia um token arbitrário em cabeçalho. As respostas e chamadas do carrinho usam `no-store`.
- O checkout permanece desativado. Não foram criados pedidos na loja. O carrinho pode ser testado no Preview sem concluir compras.
- A auditoria pública de 29/10/2026 está em [docs/catalog-audit.md](docs/catalog-audit.md). Ela não substitui a comparação com rascunhos e produtos privados no painel WordPress.
- O acompanhamento do checkout real e das validações pendentes está em [docs/checkout-readiness.md](docs/checkout-readiness.md).
- A preparação do novo WordPress independente está em [docs/new-wordpress-backend.md](docs/new-wordpress-backend.md).

## Identidade visual

O frontend usa o logo, os banners e as imagens de categorias públicos do site LucyMary em `public/brand/`, com a cor vinho `#73063D` e as fontes Jost/Poppins. Os banners levam a páginas do catálogo; o banner B2B leva ao contato enquanto não houver um fluxo B2B próprio. Imagens, nomes, etiquetas, avaliações e preços de produtos continuam vindo do WooCommerce. Atualizações dos arquivos visuais exigem nova publicação do frontend; alterações comerciais são feitas no WordPress.

## Configuração local

Requer Node.js 20.9 ou superior e npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abra `http://127.0.0.1:3000` no mesmo computador. O preview usa a interface local para evitar o endereço de rede `172.21.x.x`, que pode ser bloqueado pelo navegador ou firewall. Em `.env.local`, configure `WOOCOMMERCE_STORE_URL` com a URL pública do WordPress (por exemplo `https://lucymary.com.br`, sem `/wp-json`). A URL deve responder aos endpoints públicos:

- `GET /wp-json/wc/store/v1/products`
- `GET /wp-json/wc/store/v1/products/categories`

Sem a variável, a página mostra o estado de catálogo em preparação. Se a API falhar, a vitrine mostra um erro sem revelar detalhes internos. Se a API responder com uma lista vazia, mostra o estado sem produtos. Categorias são opcionais na vitrine; a falha delas não impede a exibição de produtos.

### Diagnóstico da conexão com a Store API

Configure `STORE_DIAGNOSTIC_TOKEN` em `.env.local` com um segredo aleatório de pelo menos 32 caracteres e reinicie o servidor. O endpoint `GET /api/diagnostics/store` só responde quando recebe esse valor no cabeçalho `x-store-diagnostic-token`; sem ele, retorna 404. O segredo nunca deve ser enviado ao código do navegador nem salvo no repositório.

O diagnóstico faz três consultas públicas **sem cache**: produtos, categorias e busca por `anel`. Retorna apenas estado, código HTTP, quantidade de itens e duração; não mostra produtos, tokens de carrinho ou detalhes de configuração. `itemCount: 0` com `ok: true` significa consulta válida sem resultados. Falha `network` no computador local não prova indisponibilidade da loja: compare com o mesmo diagnóstico no Preview da Vercel.

No Preview da Vercel, configure `WOOCOMMERCE_STORE_URL` e `STORE_DIAGNOSTIC_TOKEN` nas variáveis de ambiente de **Preview**. Consulte `https://SEU-PREVIEW.vercel.app/api/diagnostics/store` com o cabeçalho `x-store-diagnostic-token`. HTTP 200 indica que as três leituras funcionam a partir da Vercel; HTTP 503 mostra qual leitura falhou. Remova ou gire o segredo após o diagnóstico.

### Domínio do WordPress antes da produção

Hoje o WordPress e a futura vitrine usam `lucymary.com.br`. Antes de apontar esse domínio para a Vercel, o WordPress precisa de uma origem HTTPS permanente, por exemplo `wp.lucymary.com.br`, para manter `/wp-admin`, `/wp-json`, imagens, checkout hospedado e notificações de pagamento acessíveis. A viabilidade do subdomínio e de um ambiente de staging deve ser confirmada no hPanel do plano Single. Nenhum DNS ou WordPress de produção é alterado nesta etapa.

### Preview no celular

No mesmo Wi-Fi do computador, consulte o endereço IPv4 do adaptador Wi-Fi com `ipconfig`, coloque esse endereço em `DEV_LAN_HOST` no `.env.local` e execute `npm run dev:lan`. No celular, abra `http://IP_DO_WIFI:3000` (não use o endereço de VPN `172.21.x.x`). O computador precisa ficar ligado com o servidor rodando. O modo LAN também mantém `http://127.0.0.1:3000` disponível no computador. Se o endereço Wi-Fi mudar, atualize `DEV_LAN_HOST` e reinicie o servidor.

Se o celular não conectar, verifique primeiro se os dois aparelhos estão na mesma rede e se o firewall/antivírus permite conexões de entrada para o Node.js na porta 3000. Este projeto não altera regras do firewall; se a rede bloquear conexões locais, use um deploy de preview na Vercel para testar de outro dispositivo.

## Verificações

```powershell
npm run lint
npm run typecheck
npm run build
```

Com o build iniciado em `npm run start -- -H 127.0.0.1 -p 3001` e acesso à Store API configurado, `node scripts/cart-smoke.mjs` exercita duas sessões isoladas, inclusão e remoção de produto simples e variação, atualização de quantidade e endereço de entrega. O teste usa apenas um carrinho temporário e não acessa o checkout. Os IDs padrão pertencem à loja antiga; substitua-os por variáveis de ambiente ao testar o novo WordPress.
Para a nova loja, informe os IDs importados em `CART_SMOKE_SIMPLE_ID` e `CART_SMOKE_VARIATION_ID`. Se os atributos da variação forem diferentes, informe `CART_SMOKE_VARIATION_ATTRIBUTES` como JSON no ambiente da execução. Esses valores são apenas dados de teste; não precisam ser adicionados à configuração do frontend.
O teste também informa quantas modalidades de frete a loja retorna para dois CEPs e seleciona uma modalidade disponível. Para testar um cupom válido, configure `CART_SMOKE_COUPON` somente no ambiente da execução; o script aplica e remove o cupom no mesmo carrinho temporário.

## Arquitetura e cache

- A leitura de produtos, categorias e variações usa a Store API pública no servidor, sem chave de API. Os recursos públicos têm revalidação de 60 segundos. Por isso, alterações de preço ou estoque podem levar até aproximadamente um minuto para aparecer na vitrine. O checkout futuro deverá sempre pedir os totais e a disponibilidade atuais ao WooCommerce.
- O cliente está isolado em `src/lib/woocommerce/store-api.ts`. A REST API autenticada fica reservada para casos que realmente a exijam, em código de servidor e com credenciais de menor privilégio. Não há credenciais REST neste projeto nesta etapa.
- O carrinho usa `cache: "no-store"` e sessão exclusiva por visitante. Autenticação, cliente, pedido e checkout ainda não são chamados pelo frontend e exigirão a mesma separação de cache.
- O `Cart-Token` é obtido pelo servidor Next.js da Store API e enviado ao WooCommerce somente nas chamadas da sessão. O proxy ignora qualquer cabeçalho `Cart-Token` fornecido pelo navegador.
- O frontend não mantém banco de dados comercial paralelo.

## Checkout e pagamentos: próxima etapa

O plugin oficial Mercado Pago for WooCommerce informa compatibilidade com os blocos de carrinho e checkout, mas isso **não comprova** que o Checkout Pro possa ser disparado diretamente por um frontend Next.js independente. Antes de escrever o fluxo, verificar em uma cópia de staging, sem cobranças reais, se a Store API expõe o método e se o processamento produz um redirecionamento válido pelo plugin instalado. Se não houver suporte adequado, desenhar uma transição para o checkout hospedado no WooCommerce, preservando sessão, cupons, frete e plugins. Não criar pedidos de teste na produção.

A confirmação de pagamento deverá vir do backend WooCommerce/Mercado Pago (webhook ou consulta autenticada), nunca apenas da URL de retorno do navegador. InfinitePay continua como integração futura sujeita à mesma validação. Autenticação de clientes também requer desenho de sessão, autorização e integração com WordPress antes de ser ativada.

## Deploy na Vercel

1. Importe este projeto na Vercel como aplicação Next.js.
2. Configure `WOOCOMMERCE_STORE_URL` nas variáveis de ambiente do projeto.
3. Execute o build e abra a URL de preview para verificar a leitura pública dos dois endpoints.
4. Antes de substituir o site atual, valide em staging catálogo, variações, preço, estoque, carrinho, frete, cupons, autenticação, checkout e confirmação de pagamento. Não é necessário modificar o WordPress de produção nesta etapa.

## Referências técnicas

- [WooCommerce Store API](https://developer.woocommerce.com/docs/apis/store-api/)
- [Produtos](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/) e [categorias](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/product-categories/)
- [Cart Tokens](https://developer.woocommerce.com/docs/apis/store-api/cart-tokens/) e [Nonce Tokens](https://developer.woocommerce.com/docs/apis/store-api/nonce-tokens)
- [Mercado Pago for WooCommerce](https://woocommerce.com/products/mercado-pago-checkout/)
