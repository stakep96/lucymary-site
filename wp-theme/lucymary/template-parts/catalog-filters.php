<?php
/** Sidebar filters backed by WooCommerce product attributes. */
if ( ! defined( 'ABSPATH' ) || ! function_exists( 'WC' ) ) { return; }
global $wpdb;
$lookup_table = $wpdb->prefix . 'wc_product_meta_lookup';
$price_cap = get_transient( 'lucymary_catalog_price_cap' );
if ( false === $price_cap ) {
	$price_cap = max( 100, (int) ceil( (float) $wpdb->get_var( "SELECT MAX(max_price) FROM {$lookup_table}" ) / 100 ) * 100 ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Fixed WooCommerce lookup table.
	set_transient( 'lucymary_catalog_price_cap', $price_cap, HOUR_IN_SECONDS );
}
$min = isset( $_GET['lm_min'] ) ? max( 0, (int) $_GET['lm_min'] ) : 0;
$max = isset( $_GET['lm_max'] ) ? min( (int) $price_cap, max( 0, (int) $_GET['lm_max'] ) ) : (int) $price_cap;
$rating = isset( $_GET['lm_rating'] ) ? min( 5, max( 0, (int) $_GET['lm_rating'] ) ) : 0;
$color_tax = taxonomy_exists( 'pa_cor' ) ? 'pa_cor' : ( taxonomy_exists( 'pa_cores' ) ? 'pa_cores' : '' );
$material_tax = taxonomy_exists( 'pa_material' ) ? 'pa_material' : '';
$base = is_tax( 'product_cat' ) ? get_term_link( get_queried_object() ) : lucymary_shop_url();
?>
<aside class="lm-filters" aria-label="<?php esc_attr_e( 'Filtros do catálogo', 'lucymary' ); ?>"><details open><summary><?php esc_html_e( 'Filtros', 'lucymary' ); ?></summary><form method="get" action="<?php echo esc_url( $base ); ?>"><?php lucymary_keep_language_in_get_forms(); ?>
<?php if ( is_search() ) : ?><input type="hidden" name="s" value="<?php echo esc_attr( get_search_query() ); ?>"><input type="hidden" name="post_type" value="product"><?php endif; ?>
<fieldset><legend><?php esc_html_e( 'Filtrar por preço', 'lucymary' ); ?></legend><div class="lm-price-slider" data-max="<?php echo (int) $price_cap; ?>"><div class="lm-price-track"><span></span></div><input type="range" name="lm_min" min="0" max="<?php echo (int) $price_cap; ?>" step="50" value="<?php echo (int) $min; ?>" aria-label="<?php esc_attr_e( 'Preço mínimo', 'lucymary' ); ?>"><input type="range" name="lm_max" min="0" max="<?php echo (int) $price_cap; ?>" step="50" value="<?php echo (int) $max; ?>" aria-label="<?php esc_attr_e( 'Preço máximo', 'lucymary' ); ?>"></div><div class="lm-price-caption"><span data-lm-price-caption><?php $currency_symbol = html_entity_decode( get_woocommerce_currency_symbol(), ENT_QUOTES, 'UTF-8' ); echo esc_html( $currency_symbol . ' ' . number_format_i18n( $min, 0 ) . ' – ' . $currency_symbol . ' ' . number_format_i18n( $max, 0 ) ); ?></span><a href="<?php echo esc_url( $base ); ?>"><?php esc_html_e( 'Limpar', 'lucymary' ); ?></a></div></fieldset>
<fieldset><legend><?php esc_html_e( 'Filtrar por avaliação', 'lucymary' ); ?></legend><label class="lm-filter-choice"><input type="radio" name="lm_rating" value="0" <?php checked( $rating, 0 ); ?>> <?php esc_html_e( 'Todas as avaliações', 'lucymary' ); ?></label><?php for ( $stars = 5; $stars >= 1; $stars-- ) : ?><label class="lm-filter-choice"><input type="radio" name="lm_rating" value="<?php echo (int) $stars; ?>" <?php checked( $rating, $stars ); ?>><span class="lm-stars" aria-label="<?php echo esc_attr( sprintf( __( '%d estrelas', 'lucymary' ), $stars ) ); ?>"><?php echo esc_html( str_repeat( '★', $stars ) . str_repeat( '☆', 5 - $stars ) ); ?></span></label><?php endfor; ?></fieldset>
<?php foreach ( array( 'lm_color' => array( 'tax' => $color_tax, 'title' => __( 'Cores', 'lucymary' ) ), 'lm_material' => array( 'tax' => $material_tax, 'title' => __( 'Material', 'lucymary' ) ) ) as $field => $group ) :
	$terms = $group['tax'] ? get_terms( array( 'taxonomy' => $group['tax'], 'hide_empty' => true ) ) : array();
	if ( is_wp_error( $terms ) ) { $terms = array(); }
	$selected = isset( $_GET[ $field ] ) ? sanitize_title( wp_unslash( $_GET[ $field ] ) ) : '';
	?><fieldset><legend><?php echo esc_html( $group['title'] ); ?></legend><?php if ( $terms ) : ?><label class="lm-filter-choice"><input type="radio" name="<?php echo esc_attr( $field ); ?>" value="" <?php checked( $selected, '' ); ?>> <?php esc_html_e( 'Todas', 'lucymary' ); ?></label><?php foreach ( $terms as $term ) : ?><label class="lm-filter-choice"><input type="radio" name="<?php echo esc_attr( $field ); ?>" value="<?php echo esc_attr( $term->slug ); ?>" <?php checked( $selected, $term->slug ); ?>><?php if ( 'lm_color' === $field ) : ?><span class="lm-color-dot" style="background:<?php echo esc_attr( lucymary_color_for_term( $term->slug ) ); ?>"></span><?php endif; ?><?php echo esc_html( $term->name ); ?></label><?php endforeach; else : ?><small class="lm-filter-note"><?php esc_html_e( 'Aguardando opções vinculadas aos produtos no WooCommerce.', 'lucymary' ); ?></small><?php endif; ?></fieldset>
<?php endforeach; ?>
<button class="lm-filter-submit" type="submit"><?php esc_html_e( 'Aplicar filtros', 'lucymary' ); ?></button></form></details></aside>
