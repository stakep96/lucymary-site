# Tema LucyMary para WordPress + WooCommerce

O diretório [`lucymary/`](lucymary/) é um **tema clássico WordPress** criado a partir da identidade visual do frontend Next.js deste repositório. Produtos, preços, estoque, categorias, cupons, carrinho, clientes, pedidos e pagamentos continuam no WooCommerce. O tema não precisa de chaves de API nem mantém outro banco de dados.

## Páginas e recursos incluídos

- Home com três banners configuráveis, carrossel de categorias e produtos recentes. O carrossel, o menu desktop e o menu mobile seguem a ordem do menu **Menu Categorias Produtos** em Aparência → Menus. Também é possível atribuir outro menu à posição **Categorias de produtos**. Os cards mostram favoritos e sacola ao passar o mouse ou usar o teclado; em telas touch, os ícones ficam visíveis. Produtos simples usam a adição Ajax do WooCommerce e peças com variações abrem a página para escolha das opções. Os favoritos do tema exigem login e salvam IDs de produtos no perfil WordPress do cliente; a lista pode ser consultada em qualquer dispositivo conectado à mesma conta. O aviso de login e as confirmações seguem o idioma escolhido.

## Banners e imagens das categorias

- Em **Aparência → Personalizar → LucyMary: banners da home**, configure cada uma das três posições com imagem desktop, imagem mobile, link e descrição da imagem. Campos vazios usam os banners originais do tema. Se trocar apenas a imagem desktop, ela também será exibida no celular até cadastrar uma imagem mobile. Nesse mesmo painel, ajuste a troca automática entre **3 e 30 segundos** (padrão: 7 segundos). A troca pausa enquanto o ponteiro está sobre o banner ou um controle está em foco; a preferência do visitante por movimento reduzido é respeitada.
- As imagens redondas do carrossel de categorias vêm de **Produtos → Categorias → Editar → Miniatura**. Se uma categoria não tiver miniatura, o tema usa a imagem local incluída para os slugs conhecidos. A ordem e quais categorias aparecem são definidos em **Aparência → Menus → Menu Categorias Produtos**.
- As páginas de categoria não têm um banner próprio nesta versão; elas exibem o nome, a descrição e os produtos da categoria. Nome, descrição e miniatura são editados em **Produtos → Categorias**.
- Cabeçalho desktop e mobile com a faixa da logo fixa ao rolar, menu lateral animado, busca de produtos, sacola lateral, botão de voltar ao topo e rodapé com seções de contato, pagamento, entrega e segurança.
- Loja e categorias com produtos, ordenação, paginação e filtros de preço, avaliação e atributos **globais** `pa_cor`/`pa_cores` e `pa_material`, quando existirem.
- Produto com galeria, referência acima do título, descrição curta, preço/estoque do WooCommerce, atributos e variações, seletor visual de aro, botões **Adicionar à sacola** e **Comprar agora**, favorito após a compra e estimativa de frete por CEP.
- Busca, páginas gerais, carrinho, checkout e minha conta. A sacola lateral permite alterar a quantidade e remover itens da sessão WooCommerce. O carrinho clássico exibe cupom, frete e totais; o checkout clássico mostra formulário e pagamento à esquerda e resumo à direita. As páginas comerciais mantêm os formulários, validações, totais e métodos de pagamento do WooCommerce.

## Idiomas: português e inglês

O tema inclui um seletor próprio com bandeiras no cabeçalho e no menu mobile. O inglês usa `?lm_lang=en` na URL da página atual; o português usa a URL original. Assim, o cache público pode distinguir os idiomas sem cookies. Os dois idiomas usam os **mesmos produtos, IDs, preços, estoque, clientes e pedidos** no WooCommerce. A interface do tema usa as traduções em `lucymary/languages/ui.php` e o idioma do WordPress é alterado na página em inglês para aproveitar traduções oficiais instaladas do núcleo e do WooCommerce.

1. Instale o ZIP atualizado no WordPress de teste. Depois **desative o TranslatePress** (ou ao menos seu widget flutuante enquanto prepara a migração); o seletor do tema funciona sem ele. Limpe os caches do site e do navegador.
2. Em **Produtos → editar produto**, preencha a caixa **LucyMary — English** com título, descrição curta e descrição completa em inglês. A mesma caixa aparece em páginas e posts. Em **Produtos → Categorias** e nos termos dos atributos globais, preencha nome e descrição em inglês. Os campos vazios continuam mostrando o original em português.
3. Teste `?lm_lang=en` na home, loja, categoria, busca, produto simples e variável, carrinho, conta e checkout. O inglês não altera a moeda da loja. Revise especialmente rótulos e mensagens dos plugins de frete e pagamento, pois eles podem precisar de traduções próprias. Textos gravados dentro dos banners exigem outra imagem para aparecer em inglês.
4. Configure o cache público para manter as URLs com e sem `lm_lang=en` separadas. **Carrinho, conta e checkout não podem usar cache compartilhado**. Após editar traduções, limpe o cache do WordPress/Hostinger.

Essa implementação não gera tradução automática. Complete os campos em inglês no WordPress antes de divulgar a loja nesse idioma. O catálogo e o checkout continuam sob controle do WooCommerce.

## Instalação segura

1. Faça um backup de arquivos e banco do WordPress. Não substitua a instalação de produção como primeiro teste.
2. Instale o WooCommerce e confirme que as páginas **Loja**, **Carrinho**, **Finalizar compra** e **Minha conta** estão atribuídas em WooCommerce → Configurações → Avançado.
3. Gere o ZIP com `powershell -ExecutionPolicy Bypass -File scripts/package-wp-theme.ps1` na raiz deste repositório. O arquivo gerado usa a versão indicada em `style.css` (atualmente `wp-theme/lucymary-0.2.10.zip`).
4. Em um ambiente de teste, vá a Aparência → Temas → Adicionar novo → Enviar tema e instale esse ZIP. Ele contém a pasta `lucymary/` no nível correto.
5. Com ShopEngine ainda ativo, templates do próprio ShopEngine podem continuar sobrepondo os do tema. Desative **somente o ShopEngine no ambiente de teste** após conferir suas seis páginas ativas. Teste home, loja, categoria, produto simples e variável, busca, carrinho, cupom, CEP, checkout e minha conta.
6. Valide o plugin Mercado Pago Checkout Pro no checkout real do WooCommerce com o procedimento de teste autorizado da loja. O botão **Comprar agora** adiciona o produto e redireciona para o checkout do WooCommerce; o tema não confirma pagamento por URL de retorno nem cria pedidos diretamente.
7. Depois de validar o tema e seus plugins no ambiente de teste, planeje a troca em produção com backup e janela de reversão.

O tema tem fallback para os shortcodes clássicos `[woocommerce_cart]`, `[woocommerce_checkout]` e `[woocommerce_my_account]` quando a página correspondente estiver vazia. Se a loja usa blocos WooCommerce ou conteúdo personalizado, o conteúdo da página é preservado. Para máxima compatibilidade com um gateway que já funciona no checkout clássico da loja, confira qual modalidade está atribuída à página antes da troca.

O novo desenho do carrinho e do checkout usa os **shortcodes clássicos**. Caso a página atribuída tenha o bloco Carrinho ou Finalizar compra, troque o conteúdo pelo shortcode correspondente no ambiente de teste para aplicar esse layout. Teste no WordPress a alteração de quantidade, remoção, cupom, cálculo e escolha de frete e o gateway ativo antes de publicar. O tema não cria pedidos de teste automaticamente.

O tema inclui overrides dos templates WooCommerce `cart/mini-cart.php` (versão 11.2.0) e `checkout/form-checkout.php` (versão 9.4.0). Após atualizações do WooCommerce, confira em **WooCommerce → Status → Templates** se algum deles ficou desatualizado.

Os favoritos da versão 0.2.9 usam a conta WordPress e não criam uma tabela própria. A lista antiga, salva apenas no navegador pelas versões anteriores do tema, não é importada automaticamente para uma conta.
As consultas e alterações dos favoritos usam Ajax autenticado e resposta sem cache. Configure o cache da hospedagem para não servir HTML de uma sessão autenticada a outros visitantes.

A sacola lateral carrega diretamente o template de mini carrinho do tema, inclusive nas atualizações Ajax, para evitar que um template de widget de outro plugin substitua a lista e duplique os botões. O cálculo de totais, a sessão e as ações de quantidade e remoção seguem no WooCommerce. Depois de instalar a versão nova, limpe o cache do WordPress/Hostinger e verifique a sacola com um produto simples e um produto variável.

## Dependências e limites

- **WooCommerce permanece obrigatório.** Plugins de pagamento, frete, emissão fiscal e outras funções comerciais continuam conforme a loja.
- O tema substitui a apresentação das seis telas do ShopEngine mostradas no painel, mas não substitui funções de outros plugins sem auditoria. Elementor, JetEngine, Code Snippets e Loco Translate só devem ser desativados após revisar onde são usados.
- O cálculo de frete na página de produto é uma **estimativa** feita com os métodos de envio do WooCommerce para produto, quantidade e CEP escolhidos, sem criar pedido nem alterar a sacola. O tema consulta o endereço no ViaCEP, exibe rua/bairro/cidade quando disponíveis e usa cidade/estado para selecionar a área de entrega correta; se o serviço de CEP estiver indisponível, tenta calcular com o CEP informado. Plugins que exigem endereço completo, outros produtos do carrinho ou campos próprios podem apresentar valores diferentes; a finalização da compra sempre recalcula o valor final. Se a estimativa não retornar modalidades, confira o frete no carrinho antes de concluir que não há entrega.
- O seletor de aro usa os atributos de variação cadastrados no produto. Ele não inventa tamanhos. A tabela de medidas é um popup provisório, como solicitado.
- As miniaturas cadastradas em Produtos → Categorias têm prioridade; as imagens locais do tema servem de fallback para slugs conhecidos.
- O tema usa arquivos de fonte e marca locais. Não carrega imagens de produtos de outro servidor: elas vêm da biblioteca de mídia do WordPress.
- Os selos e meios de pagamento do rodapé usam as imagens fornecidas pela LucyMary. Confira se todos os meios exibidos estão ativos antes de publicar a loja. As URLs de Instagram e Facebook podem ser cadastradas em **Aparência → Personalizar → LucyMary: redes sociais**; enquanto vazias, os respectivos ícones não aparecem. O WhatsApp usa o número de atendimento exibido no rodapé.
- Uma hospedagem que já atingiu o limite de recursos pode continuar lenta mesmo com o tema. Meça o consumo após a migração.

## Verificação local

`node --check wp-theme/lucymary/assets/js/theme.js` verifica a sintaxe do JavaScript. Um teste completo requer PHP, WordPress e WooCommerce locais. Este repositório não inclui uma cópia do WordPress de produção nem credenciais; nenhum pedido ou pagamento de teste é criado pela preparação do tema.
