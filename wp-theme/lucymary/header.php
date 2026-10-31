<?php
/** Site header and shared overlays. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$shop_url = lucymary_shop_url();
$account_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : wp_login_url();
$cart_url = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : $shop_url;
$checkout_url = function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : $cart_url;
$categories = lucymary_ordered_categories( false );
?><!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo( 'charset' ); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="lm-skip-link" href="#conteudo"><?php esc_html_e( 'Ir para o conteúdo', 'lucymary' ); ?></a>
<header class="lm-header">
  <div class="lm-shell lm-header-main">
    <nav class="lm-institutional" aria-label="<?php esc_attr_e( 'Institucional', 'lucymary' ); ?>">
      <a href="<?php echo esc_url( home_url( '/#sobre' ) ); ?>"><span class="lm-letter">L</span> Sobre</a>
      <a href="<?php echo esc_url( home_url( '/#lojas' ) ); ?>"><?php echo lucymary_icon( 'pin', 17 ); ?> Lojas</a>
      <a href="<?php echo esc_url( home_url( '/#contato' ) ); ?>"><?php echo lucymary_icon( 'phone', 17 ); ?> Contato</a>
    </nav>
    <button class="lm-icon-button lm-mobile-menu-button" type="button" data-lm-open="menu" aria-label="<?php esc_attr_e( 'Abrir menu', 'lucymary' ); ?>" aria-controls="lm-mobile-menu" aria-expanded="false"><?php echo lucymary_icon( 'menu', 24 ); ?></button>
    <a class="lm-header-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="LucyMary, início"><img src="<?php echo esc_url( lucymary_asset( 'brand/logo-vinho.png' ) ); ?>" alt="LucyMary" width="220" height="91"></a>
    <div class="lm-header-actions">
	  <?php lucymary_language_switcher( 'header' ); ?>
      <button class="lm-icon-button" type="button" data-lm-open="search" aria-label="<?php esc_attr_e( 'Pesquisar', 'lucymary' ); ?>" aria-controls="lm-search-dialog" aria-expanded="false"><?php echo lucymary_icon( 'search', 22 ); ?></button>
      <a class="lm-icon-button lm-account-button" href="<?php echo esc_url( $account_url ); ?>" aria-label="<?php esc_attr_e( 'Minha conta', 'lucymary' ); ?>"><?php echo lucymary_icon( 'user', 22 ); ?></a>
      <button class="lm-icon-button lm-bag-button" type="button" data-lm-open="cart" aria-label="<?php esc_attr_e( 'Abrir sacola', 'lucymary' ); ?>" aria-controls="lm-cart-drawer" aria-expanded="false"><?php echo lucymary_icon( 'handbag', 22 ); ?><span class="lm-cart-count"><?php echo function_exists( 'WC' ) && WC()->cart ? (int) WC()->cart->get_cart_contents_count() : 0; ?></span></button>
    </div>
  </div>
  <nav class="lm-shell lm-category-nav" aria-label="<?php esc_attr_e( 'Categorias principais', 'lucymary' ); ?>">
    <?php foreach ( $categories as $category ) : ?><a href="<?php echo esc_url( get_term_link( $category ) ); ?>"><?php echo esc_html( $category->name ); ?></a><?php endforeach; ?>
    <a href="<?php echo esc_url( $shop_url ); ?>"><?php esc_html_e( 'Todos', 'lucymary' ); ?></a>
  </nav>
</header>

<div class="lm-overlay lm-menu-overlay" id="lm-mobile-menu" data-lm-overlay="menu" aria-hidden="true">
  <button type="button" class="lm-overlay-backdrop" data-lm-close aria-label="<?php esc_attr_e( 'Fechar menu', 'lucymary' ); ?>"></button>
  <aside class="lm-drawer lm-menu-drawer" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Menu LucyMary', 'lucymary' ); ?>">
    <div class="lm-menu-brand"><img src="<?php echo esc_url( lucymary_asset( 'brand/logo-vinho.png' ) ); ?>" alt="LucyMary" width="190" height="79"><button type="button" class="lm-icon-button" data-lm-close aria-label="<?php esc_attr_e( 'Fechar menu', 'lucymary' ); ?>"><?php echo lucymary_icon( 'close', 22 ); ?></button></div>
    <div class="lm-drawer-scroll">
      <div class="lm-menu-account"><a href="<?php echo esc_url( $account_url ); ?>"><?php esc_html_e( 'Entre ou cadastre-se', 'lucymary' ); ?> <?php echo lucymary_icon( 'chevron-right', 20 ); ?></a><div><a href="<?php echo esc_url( $account_url ); ?>"><?php echo lucymary_icon( 'user', 17 ); ?> Minha conta</a><a href="<?php echo esc_url( function_exists( 'wc_get_account_endpoint_url' ) ? wc_get_account_endpoint_url( 'orders' ) : $account_url ); ?>"><?php esc_html_e( 'Meus pedidos', 'lucymary' ); ?></a></div></div>
      <nav class="lm-menu-links" aria-label="<?php esc_attr_e( 'Links úteis', 'lucymary' ); ?>"><a href="<?php echo esc_url( home_url( '/#lojas' ) ); ?>"><?php echo lucymary_icon( 'pin', 17 ); ?> Loja</a><a href="<?php echo esc_url( home_url( '/#contato' ) ); ?>"><?php echo lucymary_icon( 'phone', 17 ); ?> Contato</a><a href="<?php echo esc_url( home_url( '/#sobre' ) ); ?>"><span class="lm-letter">L</span> Sobre</a></nav>
	  <?php lucymary_language_switcher( 'menu' ); ?>
      <details class="lm-menu-categories" open><summary><?php esc_html_e( 'Ver categorias', 'lucymary' ); ?> <span aria-hidden="true">⌃</span></summary><nav aria-label="<?php esc_attr_e( 'Categorias', 'lucymary' ); ?>"><?php foreach ( $categories as $category ) : ?><a href="<?php echo esc_url( get_term_link( $category ) ); ?>"><?php echo esc_html( $category->name ); ?></a><?php endforeach; ?><a href="<?php echo esc_url( $shop_url ); ?>"><?php esc_html_e( 'Todos os produtos', 'lucymary' ); ?></a></nav></details>
    </div>
  </aside>
</div>

<div class="lm-overlay lm-cart-overlay" id="lm-cart-drawer" data-lm-overlay="cart" aria-hidden="true">
  <button type="button" class="lm-overlay-backdrop" data-lm-close aria-label="<?php esc_attr_e( 'Fechar sacola', 'lucymary' ); ?>"></button>
  <aside class="lm-drawer lm-cart-drawer" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Sua sacola', 'lucymary' ); ?>">
    <div class="lm-drawer-heading"><h2><?php esc_html_e( 'Sua sacola', 'lucymary' ); ?></h2><button type="button" class="lm-icon-button" data-lm-close aria-label="<?php esc_attr_e( 'Fechar sacola', 'lucymary' ); ?>"><?php echo lucymary_icon( 'close', 22 ); ?></button></div>
    <div class="lm-mini-cart-content"><?php if ( function_exists( 'woocommerce_mini_cart' ) ) { woocommerce_mini_cart(); } else { echo '<p>' . esc_html__( 'A loja está indisponível.', 'lucymary' ) . '</p>'; } ?></div>
    <div class="lm-cart-links"><a href="<?php echo esc_url( $cart_url ); ?>"><?php esc_html_e( 'Ver carrinho', 'lucymary' ); ?></a><a href="<?php echo esc_url( $checkout_url ); ?>"><?php esc_html_e( 'Finalização de compra', 'lucymary' ); ?></a></div>
  </aside>
</div>

<div class="lm-overlay lm-search-overlay" id="lm-search-dialog" data-lm-overlay="search" aria-hidden="true">
  <button type="button" class="lm-overlay-backdrop" data-lm-close aria-label="<?php esc_attr_e( 'Fechar pesquisa', 'lucymary' ); ?>"></button>
  <div class="lm-search-panel" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Pesquisar produtos', 'lucymary' ); ?>">
    <form class="lm-search-form" role="search" action="<?php echo esc_url( home_url( '/' ) ); ?>" method="get"><?php echo lucymary_icon( 'search', 20 ); ?><label class="screen-reader-text" for="lm-search-input"><?php esc_html_e( 'Pesquisar produtos', 'lucymary' ); ?></label><input id="lm-search-input" name="s" type="search" autocomplete="off" placeholder="Pesquisar produtos…"><input type="hidden" name="post_type" value="product"><button type="reset" class="lm-search-clear"><?php esc_html_e( 'Limpar', 'lucymary' ); ?></button><button type="button" class="lm-search-close" data-lm-close aria-label="<?php esc_attr_e( 'Fechar pesquisa', 'lucymary' ); ?>"><?php echo lucymary_icon( 'close', 18 ); ?></button></form>
    <div class="lm-search-body"><p class="lm-search-prompt"><?php esc_html_e( 'Digite ao menos duas letras para encontrar produtos.', 'lucymary' ); ?></p><div class="lm-search-results" aria-live="polite"></div></div>
    <div class="lm-search-footer"><button class="lm-search-submit" type="button"><?php esc_html_e( 'Ver todos os resultados', 'lucymary' ); ?></button></div>
  </div>
</div>
<main id="conteudo">
