<?php
/** Product detail: WooCommerce handles variations, stock and cart submission. */
defined( 'ABSPATH' ) || exit;
get_header();
lucymary_product_plugin_content( 'woocommerce_before_main_content', array( 'woocommerce_output_content_wrapper', 'woocommerce_breadcrumb' ) );
while ( have_posts() ) : the_post();
	global $product;
	if ( ! $product ) { $product = wc_get_product( get_the_ID() ); }
	if ( ! $product ) { continue; }
	$categories = get_the_terms( $product->get_id(), 'product_cat' );
	$category = ! is_wp_error( $categories ) && $categories ? $categories[0] : null;
	?>
	<article id="product-<?php the_ID(); ?>" <?php wc_product_class( 'lm-shell lm-product-page', $product ); ?>>
		<nav class="lm-breadcrumb"><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Início', 'lucymary' ); ?></a> / <a href="<?php echo esc_url( lucymary_shop_url() ); ?>"><?php esc_html_e( 'Produtos', 'lucymary' ); ?></a><?php if ( $category ) : ?> / <a href="<?php echo esc_url( get_term_link( $category ) ); ?>"><?php echo esc_html( $category->name ); ?></a><?php endif; ?></nav>
		<?php do_action( 'woocommerce_before_single_product' ); ?>
		<div class="lm-product-detail">
			<div class="lm-product-gallery"><?php woocommerce_show_product_images(); ?></div>
			<div class="lm-product-info">
				<h1><?php the_title(); ?></h1>
				<?php if ( $product->get_short_description() ) : ?><div class="lm-short-description"><?php echo wp_kses_post( wpautop( $product->get_short_description() ) ); ?></div><?php endif; ?>
				<div class="lm-main-price"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
				<p class="lm-stock-label"><?php echo $product->is_in_stock() ? esc_html__( 'Disponível na loja', 'lucymary' ) : esc_html__( 'Indisponível no momento', 'lucymary' ); ?></p>
				<div class="lm-product-purchase"><span class="lm-eyebrow"><?php esc_html_e( 'Sua escolha', 'lucymary' ); ?></span><h2><?php esc_html_e( 'Personalize sua peça', 'lucymary' ); ?></h2><?php woocommerce_template_single_add_to_cart(); ?></div>
				<?php if ( ! $product->is_virtual() ) : ?><div class="lm-product-shipping"><h2><?php echo lucymary_icon( 'truck', 20 ); ?> <?php esc_html_e( 'Calcular frete e prazo', 'lucymary' ); ?></h2><form class="lm-shipping-form" data-product-id="<?php echo (int) $product->get_id(); ?>"><label class="screen-reader-text" for="lm-postcode"><?php esc_html_e( 'CEP', 'lucymary' ); ?></label><input id="lm-postcode" name="postcode" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="9" placeholder="<?php esc_attr_e( 'Digite seu CEP', 'lucymary' ); ?>" required><button type="submit"><?php esc_html_e( 'Calcular', 'lucymary' ); ?></button></form><div class="lm-shipping-response" aria-live="polite"></div><small><?php esc_html_e( 'Valor estimado para consulta. O valor final é confirmado na área de finalização de pagamento.', 'lucymary' ); ?></small></div><?php endif; ?>
				<?php if ( $product->get_sku() ) : ?><p class="lm-product-sku"><?php esc_html_e( 'Referência:', 'lucymary' ); ?> <?php echo esc_html( $product->get_sku() ); ?></p><?php endif; ?>
				<?php lucymary_product_plugin_content( 'woocommerce_single_product_summary', array( 'woocommerce_template_single_title', 'woocommerce_template_single_rating', 'woocommerce_template_single_price', 'woocommerce_template_single_excerpt', 'woocommerce_template_single_add_to_cart', 'woocommerce_template_single_meta', 'woocommerce_template_single_sharing' ) ); ?>
			</div>
		</div>
		<dialog class="lm-selection-dialog" aria-labelledby="lm-selection-title" aria-describedby="lm-selection-copy"><button type="button" class="lm-selection-close" aria-label="<?php esc_attr_e( 'Fechar', 'lucymary' ); ?>" data-lm-selection-close><?php echo lucymary_icon( 'close', 20 ); ?></button><span class="lm-selection-mark" aria-hidden="true">✦</span><h2 id="lm-selection-title"><?php esc_html_e( 'Personalize sua peça', 'lucymary' ); ?></h2><p id="lm-selection-copy"><?php esc_html_e( 'Escolha as opções da peça para continuar.', 'lucymary' ); ?></p><button type="button" class="lm-selection-action" data-lm-selection-close><?php esc_html_e( 'Escolher opções', 'lucymary' ); ?></button></dialog>
		<?php if ( $product->get_description() ) : ?><section class="lm-product-description"><span class="lm-eyebrow"><?php esc_html_e( 'Detalhes da peça', 'lucymary' ); ?></span><h2><?php esc_html_e( 'Descrição', 'lucymary' ); ?></h2><div><?php echo wp_kses_post( wpautop( $product->get_description() ) ); ?></div></section><?php endif; ?>
		<?php if ( $product->has_attributes() ) : ?><section class="lm-product-attributes"><h2><?php esc_html_e( 'Características', 'lucymary' ); ?></h2><?php wc_display_product_attributes( $product ); ?></section><?php endif; ?>
		<?php if ( comments_open() ) : ?><section class="lm-product-reviews"><?php comments_template(); ?></section><?php endif; ?>
		<?php lucymary_product_plugin_content( 'woocommerce_after_single_product_summary', array( 'woocommerce_output_product_data_tabs', 'woocommerce_upsell_display', 'woocommerce_output_related_products' ) ); ?>
	</article>
	<?php do_action( 'woocommerce_after_single_product' ); ?>
	<?php
endwhile;
lucymary_product_plugin_content( 'woocommerce_after_main_content', array( 'woocommerce_output_content_wrapper_end' ) );
get_footer();
