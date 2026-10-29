# Auditoria do catálogo público — 29/10/2026

Fonte: endpoints públicos `GET /wp-json/wc/store/v1/products?per_page=100&page=1` e `GET /wp-json/wc/store/v1/products/categories?per_page=100&hide_empty=false` de `https://lucymary.com.br`. Nenhum dado da loja foi alterado.

| Verificação | Resultado |
| --- | ---: |
| Produtos publicados e visíveis na Store API | 93 |
| IDs únicos | 93 |
| Produtos simples | 85 |
| Produtos variáveis | 8 |
| Variáveis com variações listadas | 8 de 8 |
| Variações listadas nos oito produtos | 557 |
| Variações com ao menos um atributo livre | 341 |
| Sem imagem, preço ou categoria na resposta pública | 0 |
| Slugs duplicados entre os produtos listados | 0 |
| Marcados como indisponíveis | 0 |
| Categorias cadastradas | 15 |
| Categorias sem produtos | 12 |

As categorias com produtos são **Anéis (76)**, **Alianças (6)** e **Brincos (11)**. As demais continuam cadastradas no WooCommerce e aparecem na navegação, mas suas páginas ficam vazias até receberem produtos. A home mostra uma seleção recente; `/produtos` pagina o catálogo público inteiro.

Uma página de produto simples e uma página com variação selecionada responderam HTTP 200 no preview da Vercel. A variação consultada por ID pertencia ao produto pai e retornou preço e estoque. Isso valida o fluxo representativo, não todas as 557 variações listadas nos oito produtos variáveis.

As variações com atributo livre exigem que o cliente escolha o valor antes de adicionar à sacola. A Store API rejeitou uma inclusão com o atributo faltando e aceitou a mesma variação após receber todos os valores. Uma sessão de teste adicionou e removeu um produto simples e uma variação; nenhum pedido ou pagamento foi iniciado.

## Limites desta auditoria

- A Store API não lista rascunhos, produtos privados ou dados administrativos; o total de 93 não deve ser confundido com o total de itens no painel WordPress.
- O teste não inspecionou todas as imagens nem cada combinação de atributos das variações.
- Preços e estoque podem mudar depois desta leitura. O carrinho deve usar os valores atuais calculados pelo WooCommerce, sem copiar preços do catálogo.
- Para decidir se as 12 categorias vazias devem continuar na navegação, é necessário considerar o plano comercial de publicação dessas coleções.
