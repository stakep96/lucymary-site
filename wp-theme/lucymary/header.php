<?php
/** Site header and shared overlays. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$shop_url = lucymary_shop_url();
$account_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : wp_login_url();
$cart_url = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : $shop_url;
$checkout_url = function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : $cart_url;
$categories = lucymary_category_navigation_items();
?><!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo( 'charset' ); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="lm-skip-link" href="#conteudo"><?php esc_html_e( 'Ir para o conteúdo', 'lucymary' ); ?></a>
<header class="lm-header">
  <div class="lm-shell lm-header-main">
    <nav class="lm-institutional" aria-label="<?php esc_attr_e( 'Institucional', 'lucymary' ); ?>">
      <a href="<?php echo esc_url( home_url( '/#sobre' ) ); ?>"><span class="lm-letter">L</span> <?php esc_html_e( 'Sobre', 'lucymary' ); ?></a>
      <a href="<?php echo esc_url( home_url( '/#lojas' ) ); ?>"><?php echo lucymary_icon( 'pin', 17 ); ?> <?php esc_html_e( 'Lojas', 'lucymary' ); ?></a>
      <a href="<?php echo esc_url( home_url( '/#contato' ) ); ?>"><?php echo lucymary_icon( 'phone', 17 ); ?> <?php esc_html_e( 'Contato', 'lucymary' ); ?></a>
    </nav>
    <button class="lm-icon-button lm-mobile-menu-button" type="button" data-lm-open="menu" aria-label="<?php esc_attr_e( 'Abrir menu', 'lucymary' ); ?>" aria-controls="lm-mobile-menu" aria-expanded="false"><?php echo lucymary_icon( 'menu', 24 ); ?></button>
    <a class="lm-header-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="LucyMary, início"><img src="<?php echo esc_url( lucymary_asset( 'brand/logo-vinho.png' ) ); ?>" alt="LucyMary" width="220" height="91"></a>
    <div class="lm-header-actions">
	  <?php lucymary_language_switcher( 'header' ); ?>
      <button class="lm-icon-button" type="button" data-lm-open="search" aria-label="<?php esc_attr_e( 'Pesquisar', 'lucymary' ); ?>" aria-controls="lm-search-dialog" aria-expanded="false"><?php echo lucymary_icon( 'search', 22 ); ?></button>
      <a class="lm-icon-button lm-account-button" href="<?php echo esc_url( $account_url ); ?>" aria-label="<?php esc_attr_e( 'Minha conta', 'lucymary' ); ?>"><?php echo lucymary_icon( 'user', 22 ); ?></a>
      <button class="lm-icon-button lm-favorites-button" type="button" data-lm-open="favorites" aria-label="<?php esc_attr_e( 'Abrir favoritos', 'lucymary' ); ?>" aria-controls="lm-favorites-drawer" aria-expanded="false"><?php echo lucymary_icon( 'heart', 22 ); ?></button>
      <button class="lm-icon-button lm-bag-button" type="button" data-lm-open="cart" aria-label="<?php esc_attr_e( 'Abrir sacola', 'lucymary' ); ?>" aria-controls="lm-cart-drawer" aria-expanded="false"><?php echo lucymary_icon( 'handbag', 22 ); ?><span class="lm-cart-count"><?php echo function_exists( 'WC' ) && WC()->cart ? (int) WC()->cart->get_cart_contents_count() : 0; ?></span></button>
    </div>
  </div>
</header>
<nav class="lm-shell lm-category-nav" aria-label="<?php esc_attr_e( 'Categorias principais', 'lucymary' ); ?>">
    <?php foreach ( $categories as $category ) : ?><a href="<?php echo esc_url( $category['url'] ); ?>"><?php echo esc_html( $category['title'] ); ?></a><?php endforeach; ?>
</nav>

<div class="lm-overlay lm-menu-overlay" id="lm-mobile-menu" data-lm-overlay="menu" aria-hidden="true">
  <button type="button" class="lm-overlay-backdrop" data-lm-close aria-label="<?php esc_attr_e( 'Fechar menu', 'lucymary' ); ?>"></button>
  <aside class="lm-drawer lm-menu-drawer" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Menu LucyMary', 'lucymary' ); ?>">
    <div class="lm-menu-brand"><img src="<?php echo esc_url( lucymary_asset( 'brand/logo-vinho.png' ) ); ?>" alt="LucyMary" width="190" height="79"><button type="button" class="lm-icon-button" data-lm-close aria-label="<?php esc_attr_e( 'Fechar menu', 'lucymary' ); ?>"><?php echo lucymary_icon( 'close', 22 ); ?></button></div>
    <div class="lm-drawer-scroll">
      <div class="lm-menu-account"><a href="<?php echo esc_url( $account_url ); ?>"><?php esc_html_e( 'Entre ou cadastre-se', 'lucymary' ); ?> <?php echo lucymary_icon( 'chevron-right', 20 ); ?></a><div><a href="<?php echo esc_url( $account_url ); ?>"><?php echo lucymary_icon( 'user', 17 ); ?> <?php esc_html_e( 'Minha conta', 'lucymary' ); ?></a><a href="<?php echo esc_url( function_exists( 'wc_get_account_endpoint_url' ) ? wc_get_account_endpoint_url( 'orders' ) : $account_url ); ?>"><?php esc_html_e( 'Meus pedidos', 'lucymary' ); ?></a></div></div>
      <nav class="lm-menu-links" aria-label="<?php esc_attr_e( 'Links úteis', 'lucymary' ); ?>"><a href="<?php echo esc_url( home_url( '/#lojas' ) ); ?>"><?php echo lucymary_icon( 'pin', 17 ); ?> <?php esc_html_e( 'Loja', 'lucymary' ); ?></a><a href="<?php echo esc_url( home_url( '/#contato' ) ); ?>"><?php echo lucymary_icon( 'phone', 17 ); ?> <?php esc_html_e( 'Contato', 'lucymary' ); ?></a><a href="<?php echo esc_url( home_url( '/#sobre' ) ); ?>"><span class="lm-letter">L</span> <?php esc_html_e( 'Sobre', 'lucymary' ); ?></a><button type="button" data-lm-open="favorites" aria-controls="lm-favorites-drawer" aria-expanded="false"><?php echo lucymary_icon( 'heart', 17 ); ?> <?php esc_html_e( 'Favoritos', 'lucymary' ); ?></button></nav>
	  <?php lucymary_language_switcher( 'menu' ); ?>
      <details class="lm-menu-categories" open><summary><?php esc_html_e( 'Ver categorias', 'lucymary' ); ?> <?php echo lucymary_icon( 'chevron-down', 18 ); ?></summary><nav aria-label="<?php esc_attr_e( 'Categorias', 'lucymary' ); ?>"><?php foreach ( $categories as $category ) : ?><a href="<?php echo esc_url( $category['url'] ); ?>"><?php echo esc_html( $category['title'] ); ?></a><?php endforeach; ?></nav></details>
    </div>
  </aside>
</div>

<div class="lm-overlay lm-favorites-overlay" id="lm-favorites-drawer" data-lm-overlay="favorites" aria-hidden="true">
  <button type="button" class="lm-overlay-backdrop" data-lm-close aria-label="<?php esc_attr_e( 'Fechar favoritos', 'lucymary' ); ?>"></button>
  <aside class="lm-drawer lm-favorites-drawer" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Favoritos', 'lucymary' ); ?>">
    <div class="lm-drawer-heading"><h2><?php esc_html_e( 'Favoritos', 'lucymary' ); ?></h2><button type="button" class="lm-icon-button" data-lm-close aria-label="<?php esc_attr_e( 'Fechar favoritos', 'lucymary' ); ?>"><?php echo lucymary_icon( 'close', 22 ); ?></button></div>
    <div class="lm-favorites-list" aria-live="polite"></div>
    <p class="lm-favorites-note"><?php esc_html_e( 'Salvos na sua conta LucyMary.', 'lucymary' ); ?></p>
  </aside>
</div>

<div class="lm-overlay lm-cart-overlay" id="lm-cart-drawer" data-lm-overlay="cart" aria-hidden="true">
  <button type="button" class="lm-overlay-backdrop" data-lm-close aria-label="<?php esc_attr_e( 'Fechar sacola', 'lucymary' ); ?>"></button>
  <aside class="lm-drawer lm-cart-drawer" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Sua sacola', 'lucymary' ); ?>">
    <div class="lm-drawer-heading"><h2><?php esc_html_e( 'Sua sacola', 'lucymary' ); ?></h2><button type="button" class="lm-icon-button" data-lm-close aria-label="<?php esc_attr_e( 'Fechar sacola', 'lucymary' ); ?>"><?php echo lucymary_icon( 'close', 22 ); ?></button></div>
    <p class="lm-cart-feedback" role="status" aria-live="polite" hidden></p>
    <div class="lm-mini-cart-content"><?php if ( function_exists( 'WC' ) ) { lucymary_render_mini_cart(); } else { echo '<p>' . esc_html__( 'A loja está indisponível.', 'lucymary' ) . '</p>'; } ?></div>
    <div class="lm-cart-links<?php echo function_exists( 'WC' ) && WC()->cart && WC()->cart->is_empty() ? ' is-empty' : ''; ?>"><a href="<?php echo esc_url( $cart_url ); ?>"><?php esc_html_e( 'Ver carrinho', 'lucymary' ); ?></a><a href="<?php echo esc_url( $checkout_url ); ?>"><?php esc_html_e( 'Finalização de compra', 'lucymary' ); ?></a></div>
  </aside>
</div>

<div class="lm-overlay lm-search-overlay" id="lm-search-dialog" data-lm-overlay="search" aria-hidden="true">
  <button type="button" class="lm-overlay-backdrop" data-lm-close aria-label="<?php esc_attr_e( 'Fechar pesquisa', 'lucymary' ); ?>"></button>
  <div class="lm-search-panel" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Pesquisar produtos', 'lucymary' ); ?>">
    <form class="lm-search-form" role="search" action="<?php echo esc_url( home_url( '/' ) ); ?>" method="get"><?php lucymary_keep_language_in_get_forms(); ?><?php echo lucymary_icon( 'search', 20 ); ?><label class="screen-reader-text" for="lm-search-input"><?php esc_html_e( 'Pesquisar produtos', 'lucymary' ); ?></label><input id="lm-search-input" name="s" type="search" autocomplete="off" placeholder="<?php esc_attr_e( 'Pesquisar produtos…', 'lucymary' ); ?>"><input type="hidden" name="post_type" value="product"><button type="reset" class="lm-search-clear"><?php esc_html_e( 'Limpar', 'lucymary' ); ?></button><button type="button" class="lm-search-close" data-lm-close aria-label="<?php esc_attr_e( 'Fechar pesquisa', 'lucymary' ); ?>"><?php echo lucymary_icon( 'close', 18 ); ?></button></form>
    <div class="lm-search-body"><p class="lm-search-prompt"><?php esc_html_e( 'Digite ao menos duas letras para encontrar produtos.', 'lucymary' ); ?></p><div class="lm-search-results" aria-live="polite"></div></div>
    <div class="lm-search-footer"><button class="lm-search-submit" type="button"><?php esc_html_e( 'Ver todos os resultados', 'lucymary' ); ?></button></div>
  </div>
</div>
<div class="lm-favorite-toast" role="status" aria-live="polite" hidden><span class="lm-favorite-toast-copy"></span><button type="button" data-lm-open="favorites" aria-controls="lm-favorites-drawer" aria-expanded="false"><?php esc_html_e( 'Ver favoritos', 'lucymary' ); ?></button><button type="button" class="lm-favorite-toast-close" aria-label="<?php esc_attr_e( 'Fechar', 'lucymary' ); ?>"><?php echo lucymary_icon( 'close', 16 ); ?></button></div>
<dialog class="lm-favorite-login-dialog" aria-labelledby="lm-favorite-login-title"><button type="button" class="lm-favorite-login-close" aria-label="<?php esc_attr_e( 'Fechar', 'lucymary' ); ?>"><?php echo lucymary_icon( 'close', 20 ); ?></button><span class="lm-eyebrow">LucyMary</span><h2 id="lm-favorite-login-title"><?php esc_html_e( 'Sua lista de desejos', 'lucymary' ); ?></h2><p><?php esc_html_e( 'Entre na sua conta para salvar esta peça e ver seus favoritos em qualquer dispositivo.', 'lucymary' ); ?></p><a href="<?php echo esc_url( $account_url ); ?>"><?php esc_html_e( 'Entrar ou criar conta', 'lucymary' ); ?></a></dialog>
<main id="conteudo">
