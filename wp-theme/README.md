# Tema LucyMary para WordPress + WooCommerce

O diretório [`lucymary/`](lucymary/) é um **tema clássico WordPress** criado a partir da identidade visual do frontend Next.js deste repositório. Produtos, preços, estoque, categorias, cupons, carrinho, clientes, pedidos e pagamentos continuam no WooCommerce. O tema não precisa de chaves de API nem mantém outro banco de dados.

## Páginas e recursos incluídos

- Home com os três banners da marca, carrossel de categorias e produtos recentes.
- Cabeçalho desktop e mobile com a faixa da logo fixa ao rolar, menu lateral animado, busca de produtos, sacola lateral, botão de voltar ao topo e rodapé.
- Loja e categorias com produtos, ordenação, paginação e filtros de preço, avaliação e atributos **globais** `pa_cor`/`pa_cores` e `pa_material`, quando existirem.
- Produto com galeria, descrição curta abaixo do título, preço/estoque do WooCommerce, atributos e variações, seletor visual de aro, botão **Adicionar à sacola**, **Comprar agora** e estimativa de frete por CEP.
- Busca, páginas gerais, carrinho, checkout e minha conta. As páginas comerciais mantêm os formulários, validações, totais e métodos de pagamento do WooCommerce.

## Idiomas: português, inglês e espanhol

O tema inclui um seletor compacto no cabeçalho desktop e outro no menu mobile. Eles usam as URLs da página atual fornecidas pelo TranslatePress e só aparecem quando o plugin estiver ativo com pelo menos dois idiomas publicados. A partir da versão 0.1.3, os textos fixos dos templates e os avisos gerados pelo JavaScript do tema têm traduções próprias para inglês e espanhol em `lucymary/languages/ui.php`. O idioma é o da página selecionada. O tema **não traduz produtos sozinho** nem cria cópias do catálogo.

1. No WordPress de teste, instale o TranslatePress e configure **Português (Brasil)** como idioma original, além de **English** e **Español**. Para publicar os três ao mesmo tempo, o complemento **Multiple Languages** de uma licença premium é necessário; a versão gratuita permite somente o idioma original e mais um.
2. Desative o seletor flutuante do plugin para não duplicar o seletor integrado ao tema. No editor do TranslatePress, traduza títulos e descrições dos produtos, nomes de categorias, atributos, páginas institucionais, textos de plugins de frete e pagamento e e-mails. A tradução automática exige configuração própria no plugin; somente adicionar o idioma ao seletor não traduz esse conteúdo. Textos presentes dentro das imagens dos banners exigem imagens alternativas ou outra arte por idioma.
3. Teste a troca de idioma em produto simples e variável, categoria, busca, sacola e checkout. Confirme o carrinho e o Mercado Pago em cada idioma. O seletor troca o idioma da página atual; preços e estoque continuam no mesmo WooCommerce e a moeda permanece a configurada na loja.
4. Configure o cache público por idioma e mantenha carrinho, conta e checkout fora do cache compartilhado. Limpe o cache do WordPress/Hostinger após instalar ou atualizar o tema e as traduções.

Revise os resultados da busca e as respostas de plugins via AJAX em cada idioma, porque podem trazer conteúdo do WooCommerce fora dos templates do tema. O tema traduz sua interface própria, mas, sem configurar e revisar as traduções do conteúdo no WordPress, a loja ainda não está totalmente trilíngue. Se uma tradução antiga ficar visível depois da atualização, limpe o cache do WordPress e da Hostinger.

## Instalação segura

1. Faça um backup de arquivos e banco do WordPress. Não substitua a instalação de produção como primeiro teste.
2. Instale o WooCommerce e confirme que as páginas **Loja**, **Carrinho**, **Finalizar compra** e **Minha conta** estão atribuídas em WooCommerce → Configurações → Avançado.
3. Gere o ZIP com `powershell -ExecutionPolicy Bypass -File scripts/package-wp-theme.ps1` na raiz deste repositório. O arquivo gerado usa a versão indicada em `style.css` (atualmente `wp-theme/lucymary-0.1.5.zip`).
4. Em um ambiente de teste, vá a Aparência → Temas → Adicionar novo → Enviar tema e instale esse ZIP. Ele contém a pasta `lucymary/` no nível correto.
5. Com ShopEngine ainda ativo, templates do próprio ShopEngine podem continuar sobrepondo os do tema. Desative **somente o ShopEngine no ambiente de teste** após conferir suas seis páginas ativas. Teste home, loja, categoria, produto simples e variável, busca, carrinho, cupom, CEP, checkout e minha conta.
6. Valide o plugin Mercado Pago Checkout Pro no checkout real do WooCommerce com o procedimento de teste autorizado da loja. O botão **Comprar agora** adiciona o produto e redireciona para o checkout do WooCommerce; o tema não confirma pagamento por URL de retorno nem cria pedidos diretamente.
7. Depois de validar o tema e seus plugins no ambiente de teste, planeje a troca em produção com backup e janela de reversão.

O tema tem fallback para os shortcodes clássicos `[woocommerce_cart]`, `[woocommerce_checkout]` e `[woocommerce_my_account]` quando a página correspondente estiver vazia. Se a loja usa blocos WooCommerce ou conteúdo personalizado, o conteúdo da página é preservado. Para máxima compatibilidade com um gateway que já funciona no checkout clássico da loja, confira qual modalidade está atribuída à página antes da troca.

## Dependências e limites

- **WooCommerce permanece obrigatório.** Plugins de pagamento, frete, emissão fiscal e outras funções comerciais continuam conforme a loja.
- O tema substitui a apresentação das seis telas do ShopEngine mostradas no painel, mas não substitui funções de outros plugins sem auditoria. Elementor, JetEngine, Code Snippets e Loco Translate só devem ser desativados após revisar onde são usados.
- O cálculo de frete na página de produto é uma **estimativa** feita com os métodos de envio do WooCommerce para produto, quantidade e CEP escolhidos, sem criar pedido nem alterar a sacola. Plugins que exigem endereço completo, outros produtos do carrinho ou campos próprios podem apresentar valores diferentes; o checkout sempre recalcula o valor final.
- O seletor de aro usa os atributos de variação cadastrados no produto. Ele não inventa tamanhos. A tabela de medidas é um popup provisório, como solicitado.
- As imagens de categoria incluídas pertencem às categorias com slugs conhecidos. Demais categorias usam a imagem de categoria cadastrada no WooCommerce, quando existir.
- O tema usa arquivos de fonte e marca locais. Não carrega imagens de produtos de outro servidor: elas vêm da biblioteca de mídia do WordPress.
- Uma hospedagem que já atingiu o limite de recursos pode continuar lenta mesmo com o tema. Meça o consumo após a migração.

## Verificação local

`node --check wp-theme/lucymary/assets/js/theme.js` verifica a sintaxe do JavaScript. Um teste completo requer PHP, WordPress e WooCommerce locais. Este repositório não inclui uma cópia do WordPress de produção nem credenciais; nenhum pedido ou pagamento de teste é criado pela preparação do tema.
