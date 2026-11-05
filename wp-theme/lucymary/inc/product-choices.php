<?php
/** Choices for visible attributes that WooCommerce does not use for variations. */
defined( 'ABSPATH' ) || exit;

function lucymary_product_requires_choices( $product ) {
	if ( ! $product || ! $product->is_type( array( 'simple', 'variable' ) ) ) { return false; }
	foreach ( $product->get_attributes() as $attribute ) {
		if ( $attribute->get_visible() && ! $attribute->get_variation() && $attribute->get_options() ) { return true; }
	}
	return false;
}

function lucymary_product_choice_attributes( $product, $include_variation = false ) {
	$choices = array();
	if ( ! $product || ! $product->is_type( array( 'simple', 'variable' ) ) ) { return $choices; }
	foreach ( $product->get_attributes() as $attribute ) {
		if ( ! $attribute->get_visible() || ( $attribute->get_variation() && ! $include_variation ) ) { continue; }
		$name = $attribute->get_name();
		$options = array();
		foreach ( $attribute->get_options() as $value ) {
			if ( $attribute->is_taxonomy() ) {
				$term = get_term( $value, $name );
				if ( ! $term || is_wp_error( $term ) ) { continue; }
				$options[ $term->slug ] = $term->name;
			} else {
				$label = trim( (string) $value );
				if ( '' !== $label ) { $options[ $label ] = $label; }
			}
		}
		if ( $options ) {
			$choices[ $name ] = array( 'label' => wc_attribute_label( $name ), 'options' => $options );
		}
	}
	return $choices;
}

function lucymary_render_product_choices( $product, $include_variation = false ) {
	$attributes = lucymary_product_choice_attributes( $product, $include_variation );
	if ( ! $attributes ) { return; }
	echo '<div class="lm-descriptive-choices">';
	foreach ( $attributes as $name => $attribute ) {
		$key = sanitize_title( $name );
		$field = 'lm_choice[' . $key . ']';
		echo '<div class="lm-choice-row"><label for="lm-choice-' . esc_attr( $key ) . '">' . esc_html( $attribute['label'] ) . '</label>';
		echo '<select id="lm-choice-' . esc_attr( $key ) . '" name="' . esc_attr( $field ) . '" data-lm-choice required>';
		echo '<option value="">' . esc_html__( 'Selecione uma opção', 'lucymary' ) . '</option>';
		foreach ( $attribute['options'] as $value => $label ) {
			echo '<option value="' . esc_attr( $value ) . '"' . selected( count( $attribute['options'] ), 1, false ) . '>' . esc_html( $label ) . '</option>';
		}
		echo '</select></div>';
	}
	echo '</div>';
}

/** WooCommerce omits the purchase form for an unavailable product; keep its configured choices visible. */
function lucymary_render_unavailable_product_choices( $product ) {
	if ( ! $product->is_purchasable() || ! $product->is_in_stock() ) {
		lucymary_render_product_choices( $product, true );
	}
}

function lucymary_product_choices_before_add_to_cart() {
	global $product;
	if ( $product ) { lucymary_render_product_choices( $product ); }
}
add_action( 'woocommerce_before_add_to_cart_button', 'lucymary_product_choices_before_add_to_cart', 5 );

function lucymary_posted_product_choices( $product ) {
	$posted = isset( $_POST['lm_choice'] ) && is_array( $_POST['lm_choice'] ) ? wp_unslash( $_POST['lm_choice'] ) : array();
	$result = array();
	foreach ( lucymary_product_choice_attributes( $product ) as $name => $attribute ) {
		$key = sanitize_title( $name );
		$value = isset( $posted[ $key ] ) && is_scalar( $posted[ $key ] ) ? sanitize_text_field( $posted[ $key ] ) : '';
		if ( ! array_key_exists( $value, $attribute['options'] ) ) { return false; }
		$result[ $attribute['label'] ] = $attribute['options'][ $value ];
	}
	return $result;
}

function lucymary_validate_product_choices( $passed, $product_id ) {
	if ( ! $passed ) { return false; }
	$product = wc_get_product( $product_id );
	if ( $product && lucymary_product_choice_attributes( $product ) && false === lucymary_posted_product_choices( $product ) ) {
		wc_add_notice( __( 'Selecione as opções da peça antes de adicioná-la à sacola.', 'lucymary' ), 'error' );
		return false;
	}
	return $passed;
}
add_filter( 'woocommerce_add_to_cart_validation', 'lucymary_validate_product_choices', 10, 2 );

function lucymary_save_product_choices_in_cart( $cart_item_data, $product_id ) {
	$product = wc_get_product( $product_id );
	if ( $product ) {
		$choices = lucymary_posted_product_choices( $product );
		if ( $choices ) { $cart_item_data['lm_choices'] = $choices; }
	}
	return $cart_item_data;
}
add_filter( 'woocommerce_add_cart_item_data', 'lucymary_save_product_choices_in_cart', 10, 2 );

function lucymary_display_product_choices_in_cart( $item_data, $cart_item ) {
	foreach ( $cart_item['lm_choices'] ?? array() as $label => $value ) {
		$item_data[] = array( 'key' => $label, 'value' => $value );
	}
	return $item_data;
}
add_filter( 'woocommerce_get_item_data', 'lucymary_display_product_choices_in_cart', 10, 2 );

function lucymary_save_product_choices_in_order( $item, $cart_item_key, $values ) {
	foreach ( $values['lm_choices'] ?? array() as $label => $value ) {
		$item->add_meta_data( $label, $value, true );
	}
}
add_action( 'woocommerce_checkout_create_order_line_item', 'lucymary_save_product_choices_in_order', 10, 3 );
