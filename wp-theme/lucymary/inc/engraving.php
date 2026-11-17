<?php
/** Optional, per-product engraving stored with the WooCommerce cart and order item. */
defined( 'ABSPATH' ) || exit;

function lucymary_engraving_limit( $value ) {
	if ( '' === $value || null === $value ) { return 5; }
	return max( 1, min( 20, (int) $value ) );
}

function lucymary_engraving_max_characters() {
	return lucymary_engraving_limit( get_theme_mod( 'lucymary_engraving_max_characters', 5 ) );
}

function lucymary_engraving_customizer( $customize ) {
	$customize->add_section( 'lucymary_engraving_settings', array(
		'title'       => __( 'LucyMary: gravação na peça', 'lucymary' ),
		'priority'    => 162,
		'description' => __( 'Defina quantos caracteres o cliente pode informar para gravar na peça. A alteração vale para todos os produtos com gravação.', 'lucymary' ),
	) );
	$customize->add_setting( 'lucymary_engraving_max_characters', array( 'default' => 5, 'sanitize_callback' => 'lucymary_engraving_limit' ) );
	$customize->add_control( 'lucymary_engraving_max_characters', array(
		'label'       => __( 'Limite de caracteres da gravação', 'lucymary' ),
		'section'     => 'lucymary_engraving_settings',
		'type'        => 'number',
		'input_attrs' => array( 'min' => 1, 'max' => 20, 'step' => 1 ),
	) );
}
add_action( 'customize_register', 'lucymary_engraving_customizer' );

function lucymary_engraving_enabled( $product ) {
	return $product && $product->is_type( array( 'simple', 'variable' ) ) && ( 'yes' === $product->get_meta( '_lucymary_engraving_enabled', true ) || lucymary_engraving_variation_choice( $product ) );
}

/** A priced Sim/Não variation may be controlled by the theme checkbox. */
function lucymary_engraving_variation_choice( $product ) {
	if ( ! $product || ! $product->is_type( 'variable' ) ) { return null; }
	foreach ( $product->get_attributes() as $attribute ) {
		$name = $attribute->get_name();
		if ( ! $attribute->get_variation() || 'personalizacao' !== sanitize_title( preg_replace( '/^pa_/', '', $name ) ) ) { continue; }
		$choices = lucymary_product_choice_attributes( $product, true );
		if ( empty( $choices[ $name ]['options'] ) ) { continue; }
		$values = array();
		foreach ( $choices[ $name ]['options'] as $value => $label ) {
			$label_key = sanitize_title( $label );
			if ( in_array( $label_key, array( 'sim', 'yes' ), true ) ) { $values['yes'] = $value; }
			if ( in_array( $label_key, array( 'nao', 'no' ), true ) ) { $values['no'] = $value; }
		}
		if ( isset( $values['yes'], $values['no'] ) ) {
			return array( 'field' => 'attribute_' . sanitize_title( $name ), 'yes' => $values['yes'], 'no' => $values['no'] );
		}
	}
	return null;
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
	$variation_choice = lucymary_engraving_variation_choice( $product );
	$max_characters = lucymary_engraving_max_characters();
	echo '<div class="lm-engraving" data-lm-engraving data-lm-engraving-max="' . esc_attr( $max_characters ) . '"';
	if ( $variation_choice ) {
		echo ' data-lm-engraving-attribute="' . esc_attr( $variation_choice['field'] ) . '" data-lm-engraving-yes="' . esc_attr( $variation_choice['yes'] ) . '" data-lm-engraving-no="' . esc_attr( $variation_choice['no'] ) . '"';
	}
	echo '>';
	echo '<label class="lm-engraving-toggle" for="lm-engrave"><input id="lm-engrave" type="checkbox" name="lm_engrave" value="yes" data-lm-engraving-toggle> <span>' . esc_html__( 'Gravar nome na peça', 'lucymary' ) . '</span></label>';
	echo '<div class="lm-engraving-input" data-lm-engraving-input><label for="lm-engraving-text">' . esc_html__( 'O que deseja gravar?', 'lucymary' ) . '</label>';
	echo '<input id="lm-engraving-text" type="text" name="lm_engraving_text" maxlength="255" autocomplete="off" data-lm-engraving-text aria-describedby="lm-engraving-help">';
	echo '<p id="lm-engraving-help">' . esc_html( sprintf( __( 'Até %d caracteres: iniciais, letras ou símbolos. Espaços entre palavras não contam.', 'lucymary' ), $max_characters ) ) . '</p></div></div>';
}

function lucymary_engraving_simple_field() {
	global $product;
	if ( $product && $product->is_type( 'simple' ) ) { lucymary_engraving_field(); }
}
add_action( 'woocommerce_before_add_to_cart_button', 'lucymary_engraving_simple_field', 8 );

function lucymary_engraving_variable_field() {
	global $product;
	if ( $product && $product->is_type( 'variable' ) ) { lucymary_engraving_field(); }
}
add_action( 'woocommerce_after_variations_table', 'lucymary_engraving_variable_field', 8 );

function lucymary_posted_engraving( $product ) {
	if ( ! lucymary_engraving_enabled( $product ) || ! isset( $_POST['lm_engrave'] ) || ! is_scalar( $_POST['lm_engrave'] ) || 'yes' !== sanitize_text_field( wp_unslash( $_POST['lm_engrave'] ) ) ) { return null; }
	if ( ! isset( $_POST['lm_engraving_text'] ) || ! is_scalar( $_POST['lm_engraving_text'] ) ) { return false; }
	$value = trim( (string) wp_unslash( $_POST['lm_engraving_text'] ) );
	$maximum = lucymary_engraving_max_characters();
	if ( ! preg_match( '/\A[\p{L}\p{M}\p{S}\p{P} ]+\z/u', $value ) || sanitize_text_field( $value ) !== $value || preg_match_all( '/[^ ]/u', $value ) > $maximum || preg_match_all( '/./u', $value ) > 255 ) { return false; }
	return $value;
}

function lucymary_validate_engraving( $passed, $product_id ) {
	if ( ! $passed ) { return false; }
	$product = wc_get_product( $product_id );
	$variation_choice = lucymary_engraving_variation_choice( $product );
	if ( $variation_choice && ( isset( $_POST[ $variation_choice['field'] ] ) || isset( $_POST['lm_engrave'] ) ) ) {
		$field = $variation_choice['field'];
		$posted_value = isset( $_POST[ $field ] ) && is_scalar( $_POST[ $field ] ) ? sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) : '';
		$engrave = isset( $_POST['lm_engrave'] ) && is_scalar( $_POST['lm_engrave'] ) && 'yes' === sanitize_text_field( wp_unslash( $_POST['lm_engrave'] ) );
		if ( $posted_value !== ( $engrave ? $variation_choice['yes'] : $variation_choice['no'] ) ) {
			wc_add_notice( __( 'Confirme a opção de gravação da peça antes de continuar.', 'lucymary' ), 'error' );
			return false;
		}
	}
	if ( $product && false === lucymary_posted_engraving( $product ) ) {
		wc_add_notice( sprintf( __( 'Informe até %d letras ou símbolos para a gravação; espaços não contam.', 'lucymary' ), lucymary_engraving_max_characters() ), 'error' );
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
