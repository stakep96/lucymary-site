<?php
/** Account favorites stored as product IDs in WordPress user meta. */
defined( 'ABSPATH' ) || exit;

function lucymary_favorite_ids( $user_id ) {
	$stored = get_user_meta( $user_id, '_lucymary_favorite_ids', true );
	return is_array( $stored ) ? array_slice( array_values( array_unique( array_filter( array_map( 'absint', $stored ) ) ) ), 0, 100 ) : array();
}

function lucymary_favorites_payload( $user_id ) {
	$items = array();
	if ( ! function_exists( 'wc_get_product' ) ) { return $items; }
	foreach ( lucymary_favorite_ids( $user_id ) as $id ) {
		$product = wc_get_product( $id );
		if ( ! $product || 'publish' !== $product->get_status() || ! $product->is_visible() ) { continue; }
		$items[] = array(
			'id' => (string) $id,
			'name' => $product->get_name(),
			'url' => get_permalink( $id ),
			'image' => $product->get_image_id() ? wp_get_attachment_image_url( $product->get_image_id(), 'woocommerce_thumbnail' ) : '',
		);
	}
	return $items;
}

function lucymary_favorites_auth_error() {
	wp_send_json_error( array( 'message' => __( 'Entre na sua conta para salvar peças nos favoritos.', 'lucymary' ) ), 401 );
}
add_action( 'wp_ajax_nopriv_lucymary_favorites_list', 'lucymary_favorites_auth_error' );
add_action( 'wp_ajax_nopriv_lucymary_favorites_update', 'lucymary_favorites_auth_error' );

function lucymary_favorites_list() {
	if ( ! is_user_logged_in() ) { lucymary_favorites_auth_error(); }
	nocache_headers();
	wp_send_json_success( array(
		'items' => lucymary_favorites_payload( get_current_user_id() ),
		'nonce' => wp_create_nonce( 'lucymary_favorites' ),
	) );
}
add_action( 'wp_ajax_lucymary_favorites_list', 'lucymary_favorites_list' );

function lucymary_favorites_update() {
	if ( ! is_user_logged_in() ) { lucymary_favorites_auth_error(); }
	if ( ! check_ajax_referer( 'lucymary_favorites', 'nonce', false ) ) {
		wp_send_json_error( array( 'message' => __( 'Sua sessão expirou. Atualize a página e tente novamente.', 'lucymary' ) ), 403 );
	}
	$id = isset( $_POST['product_id'] ) && is_scalar( $_POST['product_id'] ) ? absint( wp_unslash( $_POST['product_id'] ) ) : 0;
	$operation = isset( $_POST['operation'] ) && is_scalar( $_POST['operation'] ) ? sanitize_key( wp_unslash( $_POST['operation'] ) ) : '';
	if ( ! $id || ! in_array( $operation, array( 'add', 'remove' ), true ) ) {
		wp_send_json_error( array( 'message' => __( 'Produto inválido.', 'lucymary' ) ), 400 );
	}
	if ( 'add' === $operation ) {
		$product = function_exists( 'wc_get_product' ) ? wc_get_product( $id ) : false;
		if ( ! $product || 'publish' !== $product->get_status() || ! $product->is_visible() ) {
			wp_send_json_error( array( 'message' => __( 'Este produto não está disponível.', 'lucymary' ) ), 400 );
		}
	}
	$user_id = get_current_user_id();
	$ids = lucymary_favorite_ids( $user_id );
	if ( 'add' === $operation ) { array_unshift( $ids, $id ); }
	else { $ids = array_values( array_diff( $ids, array( $id ) ) ); }
	$ids = array_slice( array_values( array_unique( $ids ) ), 0, 100 );
	update_user_meta( $user_id, '_lucymary_favorite_ids', $ids );
	nocache_headers();
	wp_send_json_success( array( 'items' => lucymary_favorites_payload( $user_id ) ) );
}
add_action( 'wp_ajax_lucymary_favorites_update', 'lucymary_favorites_update' );
