<?php
/** Shop, category and attribute archives. */
defined( 'ABSPATH' ) || exit;
get_header();
lucymary_product_plugin_content( 'woocommerce_before_main_content', array( 'woocommerce_output_content_wrapper', 'woocommerce_breadcrumb' ) );
$current = get_queried_object();
?>
<div class="lm-shell lm-catalog-page">
  <nav class="lm-breadcrumb"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a> / <a href="<?php echo esc_url( lucymary_shop_url() ); ?>">Produtos</a><?php if ( is_tax( 'product_cat' ) ) : ?> / <?php echo esc_html( $current->name ); ?><?php endif; ?></nav>
  <div class="lm-catalog-intro"><span class="lm-eyebrow">Catálogo LucyMary</span><h1><?php echo esc_html( is_tax( 'product_cat' ) ? $current->name : 'Encontre a sua próxima peça.' ); ?></h1><p>Produtos publicados diretamente pela nossa loja WooCommerce.</p></div>
  <?php if ( ! is_tax( 'product_cat' ) ) : ?><nav class="lm-category-chips" aria-label="Categorias"><?php foreach ( lucymary_ordered_categories() as $category ) : ?><a href="<?php echo esc_url( get_term_link( $category ) ); ?>"><?php echo esc_html( $category->name ); ?></a><?php endforeach; ?></nav><?php endif; ?>
  <div class="lm-catalog-layout">
    <?php lucymary_catalog_filters(); ?>
    <div class="lm-catalog-main">
      <?php wc_setup_loop(); if ( woocommerce_product_loop() ) :
		lucymary_product_plugin_content( 'woocommerce_before_shop_loop', array( 'woocommerce_result_count', 'woocommerce_catalog_ordering' ) );
		?>
        <div class="lm-catalog-toolbar"><div><?php woocommerce_result_count(); ?></div><div><?php woocommerce_catalog_ordering(); ?></div></div>
        <div class="lm-product-grid"><?php while ( have_posts() ) : the_post(); do_action( 'woocommerce_shop_loop' ); $product = wc_get_product( get_the_ID() ); if ( $product ) { lucymary_product_card( $product ); } endwhile; ?></div>
        <div class="lm-pagination"><?php woocommerce_pagination(); ?></div>
      <?php else : ?><div class="lm-state"><h2>Nenhum produto encontrado</h2><p>Ajuste os filtros ou explore outra categoria.</p><a href="<?php echo esc_url( lucymary_shop_url() ); ?>">Ver todos os produtos</a></div><?php endif; ?>
      <?php lucymary_product_plugin_content( 'woocommerce_after_shop_loop', array( 'woocommerce_pagination' ) ); woocommerce_reset_loop(); ?>
    </div>
  </div>
</div>
<?php lucymary_product_plugin_content( 'woocommerce_after_main_content', array( 'woocommerce_output_content_wrapper_end' ) ); ?>
<?php get_footer(); ?>
