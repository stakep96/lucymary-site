<?php
/** Optional, per-product engraving stored with the WooCommerce cart and order item. */
defined( 'ABSPATH' ) || exit;

function lucymary_engraving_enabled( $product ) {
	return $product && $product->is_type( array( 'simple', 'variable' ) ) && 'yes' === $product->get_meta( '_lucymary_engraving_enabled', true );
}

function lucymary_engraving_product_setting() {
	echo '<div class="options_group">';
	woocommerce_wp_checkbox( array(
		'id'          => '_lucymary_engraving_enabled',
		'wrapper_class' => 'show_if_simple show_if_variable',
		'label'       => __( 'Permitir gravação na peça', 'lucymary' ),
		'description' => __( 'Mostra uma opção de gravação opcional na página do produto. O texto escolhido acompanha o item no carrinho e no pedido.', 'lucymary' ),
		'value'       => get_post_meta( get_the_ID(), '_lucymary_engraving_enabled', true ),
	) );
	echo '</div>';
}
add_action( 'woocommerce_product_options_general_product_data', 'lucymary_engraving_product_setting' );

function lucymary_save_engraving_product_setting( $product ) {
	$product->update_meta_data( '_lucymary_engraving_enabled', isset( $_POST['_lucymary_engraving_enabled'] ) ? 'yes' : 'no' );
}
add_action( 'woocommerce_admin_process_product_object', 'lucymary_save_engraving_product_setting' );

function lucymary_engraving_field() {
	global $product;
	if ( ! lucymary_engraving_enabled( $product ) ) { return; }
	echo '<div class="lm-engraving" data-lm-engraving>';
	echo '<label class="lm-engraving-toggle" for="lm-engrave"><input id="lm-engrave" type="checkbox" name="lm_engrave" value="yes" data-lm-engraving-toggle> <span>' . esc_html__( 'Gravar nome na peça', 'lucymary' ) . '</span></label>';
	echo '<div class="lm-engraving-input" data-lm-engraving-input><label for="lm-engraving-text">' . esc_html__( 'O que deseja gravar?', 'lucymary' ) . '</label>';
	echo '<input id="lm-engraving-text" type="text" name="lm_engraving_text" maxlength="4" autocomplete="off" data-lm-engraving-text aria-describedby="lm-engraving-help">';
	echo '<p id="lm-engraving-help">' . esc_html__( 'Até 4 caracteres: iniciais, letras ou símbolos.', 'lucymary' ) . '</p></div></div>';
}
add_action( 'woocommerce_before_add_to_cart_button', 'lucymary_engraving_field', 8 );

function lucymary_posted_engraving( $product ) {
	if ( ! lucymary_engraving_enabled( $product ) || ! isset( $_POST['lm_engrave'] ) || ! is_scalar( $_POST['lm_engrave'] ) || 'yes' !== sanitize_text_field( wp_unslash( $_POST['lm_engrave'] ) ) ) { return null; }
	if ( ! isset( $_POST['lm_engraving_text'] ) || ! is_scalar( $_POST['lm_engraving_text'] ) ) { return false; }
	$value = trim( (string) wp_unslash( $_POST['lm_engraving_text'] ) );
	if ( ! preg_match( '/\A[\p{L}\p{M}\p{S}\p{P} ]{1,4}\z/u', $value ) || sanitize_text_field( $value ) !== $value ) { return false; }
	return $value;
}

function lucymary_validate_engraving( $passed, $product_id ) {
	if ( ! $passed ) { return false; }
	$product = wc_get_product( $product_id );
	if ( $product && false === lucymary_posted_engraving( $product ) ) {
		wc_add_notice( __( 'Informe até 4 letras ou símbolos para a gravação.', 'lucymary' ), 'error' );
		return false;
	}
	return $passed;
}
add_filter( 'woocommerce_add_to_cart_validation', 'lucymary_validate_engraving', 10, 2 );

function lucymary_save_engraving_in_cart( $cart_item_data, $product_id ) {
	$product = wc_get_product( $product_id );
	$value = $product ? lucymary_posted_engraving( $product ) : null;
	if ( is_string( $value ) && '' !== $value ) { $cart_item_data['lm_engraving'] = $value; }
	return $cart_item_data;
}
add_filter( 'woocommerce_add_cart_item_data', 'lucymary_save_engraving_in_cart', 10, 2 );

function lucymary_display_engraving_in_cart( $item_data, $cart_item ) {
	if ( ! empty( $cart_item['lm_engraving'] ) ) {
		$item_data[] = array( 'key' => __( 'Gravação na peça', 'lucymary' ), 'value' => $cart_item['lm_engraving'] );
	}
	return $item_data;
}
add_filter( 'woocommerce_get_item_data', 'lucymary_display_engraving_in_cart', 10, 2 );

function lucymary_save_engraving_in_order( $item, $cart_item_key, $values ) {
	if ( ! empty( $values['lm_engraving'] ) ) {
		$item->add_meta_data( __( 'Gravação na peça', 'lucymary' ), $values['lm_engraving'], true );
	}
}
add_action( 'woocommerce_checkout_create_order_line_item', 'lucymary_save_engraving_in_order', 10, 3 );
