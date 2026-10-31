<?php
/**
 * LucyMary theme setup and WooCommerce integration.
 *
 * @package LucyMary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'LUCYMARY_VERSION', '0.2.1' );
require_once __DIR__ . '/inc/language.php';

/** Translate only theme interface strings; catalog content remains in WordPress. */
function lucymary_ui_translation( $translated, $original, $domain ) {
	if ( 'lucymary' !== $domain ) { return $translated; }
	$language = lucymary_language();
	if ( 'en' !== $language ) { return $translated; }
	static $messages = null;
	if ( null === $messages ) { $messages = require get_template_directory() . '/languages/ui.php'; }
	return $messages[ $language ][ $original ] ?? $translated;
}
add_filter( 'gettext', 'lucymary_ui_translation', 1000, 3 );

function lucymary_setup() {
	load_theme_textdomain( 'lucymary', get_template_directory() . '/languages' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo', array( 'height' => 91, 'width' => 220, 'flex-height' => true, 'flex-width' => true ) );
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );
	register_nav_menus( array( 'institutional' => __( 'Links institucionais', 'lucymary' ), 'footer' => __( 'Rodapé', 'lucymary' ) ) );
	add_image_size( 'lucymary-card', 420, 420, false );
}
add_action( 'after_setup_theme', 'lucymary_setup' );

function lucymary_footer_customizer( $customize ) {
	$customize->add_section( 'lucymary_footer_links', array( 'title' => __( 'LucyMary: redes sociais', 'lucymary' ), 'priority' => 160 ) );
	foreach ( array( 'instagram' => 'Instagram', 'facebook' => 'Facebook' ) as $network => $label ) {
		$key = 'lucymary_' . $network . '_url';
		$customize->add_setting( $key, array( 'default' => '', 'sanitize_callback' => 'esc_url_raw' ) );
		$customize->add_control( $key, array( 'label' => sprintf( __( 'URL do %s', 'lucymary' ), $label ), 'section' => 'lucymary_footer_links', 'type' => 'url' ) );
	}
}
add_action( 'customize_register', 'lucymary_footer_customizer' );

function lucymary_assets() {
	$base = get_template_directory_uri();
	wp_enqueue_style( 'lucymary-theme', $base . '/assets/css/theme.css', array(), LUCYMARY_VERSION );
	wp_enqueue_script( 'lucymary-theme', $base . '/assets/js/theme.js', array(), LUCYMARY_VERSION, true );
	wp_localize_script( 'lucymary-theme', 'lucymaryTheme', array(
		'ajaxUrl' => 'en' === lucymary_language() ? add_query_arg( 'lm_lang', 'en', admin_url( 'admin-ajax.php' ) ) : admin_url( 'admin-ajax.php' ),
		'shippingNonce' => wp_create_nonce( 'lucymary_shipping' ),
		'currencySymbol' => function_exists( 'get_woocommerce_currency_symbol' ) ? html_entity_decode( get_woocommerce_currency_symbol(), ENT_QUOTES, 'UTF-8' ) : 'R$',
		'strings' => array(
			'searchMin' => __( 'Digite ao menos duas letras para encontrar produtos.', 'lucymary' ),
			'searchLoading' => __( 'Buscando produtos…', 'lucymary' ),
			'searchResults' => __( 'Produtos', 'lucymary' ),
			'searchEmpty' => __( 'Nenhum produto encontrado.', 'lucymary' ),
			'searchError' => __( 'Não foi possível buscar agora.', 'lucymary' ),
			'option' => __( 'Opção', 'lucymary' ),
			'ringPrevious' => __( 'Aro anterior', 'lucymary' ),
			'ringNext' => __( 'Próximo aro', 'lucymary' ),
			'ringGuide' => __( 'Tabela de medidas', 'lucymary' ),
			'ringClose' => __( 'Fechar', 'lucymary' ),
			'ringDialogText' => __( 'A tabela oficial de aros da LucyMary será adicionada aqui em breve.', 'lucymary' ),
			'shippingInvalidPostcode' => __( 'Informe um CEP com 8 dígitos.', 'lucymary' ),
			'shippingChooseOption' => __( 'Escolha as opções do produto antes de calcular o frete.', 'lucymary' ),
			'shippingLoading' => __( 'Calculando frete…', 'lucymary' ),
			'shippingError' => __( 'Não foi possível calcular o frete.', 'lucymary' ),
			'shippingNoRates' => __( 'Nenhuma modalidade de frete disponível para este CEP.', 'lucymary' ),
			'chooseProductOptions' => __( 'Escolha as opções da peça para continuar.', 'lucymary' ),
			'waitForVariation' => __( 'Aguarde a confirmação da opção selecionada e tente novamente.', 'lucymary' ),
		),
		'rulerIcon' => lucymary_icon( 'ruler', 17 ),
	) );
	if ( function_exists( 'is_product' ) && is_product() ) {
		wp_enqueue_script( 'wc-add-to-cart-variation' );
	}
	if ( function_exists( 'is_woocommerce' ) && ( is_woocommerce() || is_cart() || is_checkout() ) ) {
		wp_enqueue_script( 'wc-cart-fragments' );
	}
}
add_action( 'wp_enqueue_scripts', 'lucymary_assets' );

function lucymary_asset( $path ) {
	return get_template_directory_uri() . '/assets/' . ltrim( $path, '/' );
}

function lucymary_shop_url() {
	return function_exists( 'wc_get_page_id' ) && wc_get_page_id( 'shop' ) > 0 ? get_permalink( wc_get_page_id( 'shop' ) ) : home_url( '/' );
}

function lucymary_category_terms( $hide_empty = true ) {
	if ( ! taxonomy_exists( 'product_cat' ) ) {
		return array();
	}
	$terms = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => $hide_empty, 'parent' => 0 ) );
	return is_wp_error( $terms ) ? array() : $terms;
}

function lucymary_ordered_categories( $hide_empty = true ) {
	$terms = lucymary_category_terms( $hide_empty );
	$order = array( 'relogios', 'perfumes', 'aneis', 'aliancas', 'colares', 'cordoes', 'pingentes', 'pulseiras', 'brincos' );
	usort( $terms, static function ( $a, $b ) use ( $order ) {
		$left = array_search( $a->slug, $order, true );
		$right = array_search( $b->slug, $order, true );
		return ( false === $left ? 99 : $left ) <=> ( false === $right ? 99 : $right );
	} );
	return $terms;
}

function lucymary_category_image( $term ) {
	$images = array( 'aliancas' => 'aliancas.png', 'aneis' => 'aneis.png', 'brincos' => 'brincos.png', 'canetas' => 'canetas.png', 'colares' => 'colares.png', 'cordoes' => 'cordoes.png', 'perfumes' => 'perfumes.png', 'pingentes' => 'pingentes-2.png', 'pulseiras' => 'pulseiras.png', 'relogios' => 'relogios.png' );
	if ( isset( $images[ $term->slug ] ) ) {
		return lucymary_asset( 'brand/categorias/' . $images[ $term->slug ] );
	}
	$thumbnail_id = (int) get_term_meta( $term->term_id, 'thumbnail_id', true );
	return $thumbnail_id ? wp_get_attachment_image_url( $thumbnail_id, 'woocommerce_thumbnail' ) : '';
}

function lucymary_icon( $name, $size = 20 ) {
	$paths = array(
		'menu' => '<path d="M4 7h16M4 12h16M4 17h16"/>',
		'close' => '<path d="M5 5l14 14M19 5L5 19"/>',
		'search' => '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
		'handbag' => '<path d="M5 9h14l1 12H4L5 9Z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>',
		'user' => '<circle cx="12" cy="8" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/>',
		'pin' => '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
		'phone' => '<path d="M7 3H4a2 2 0 0 0-2 2c0 9.4 7.6 17 17 17a2 2 0 0 0 2-2v-3l-5-2-2 2a15 15 0 0 1-7-7l2-2-2-5Z"/>',
		'mail' => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
		'clock' => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
		'instagram' => '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
		'facebook' => '<path d="M15 21v-8h3l.5-4H15V7c0-1.1.5-1.5 1.6-1.5H19V2h-3.3C12.6 2 11 4 11 7v2H8v4h3v8"/>',
		'whatsapp' => '<path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.4 2.9 2.6 5.2 5.5 5.8l1.5-1.4-2-1.1-.9 1a6.2 6.2 0 0 1-2.4-2.4l.9-.9-1.1-2Z"/>',
		'chevron-left' => '<path d="m15 18-6-6 6-6"/>',
		'chevron-right' => '<path d="m9 18 6-6-6-6"/>',
		'chevron-down' => '<path d="m6 9 6 6 6-6"/>',
		'chevron-up' => '<path d="m6 15 6-6 6 6"/>',
		'ruler' => '<path d="m21 7-4-4L3 17l4 4L21 7Z"/><path d="m15 5 2 2m-5 1 2 2m-5 1 2 2m-5 1 2 2"/>',
		'truck' => '<path d="M3 6h11v11H3V6Zm11 4h4l3 3v4h-7v-7Z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
	);
	if ( ! isset( $paths[ $name ] ) ) {
		return '';
	}
	return '<svg width="' . (int) $size . '" height="' . (int) $size . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' . $paths[ $name ] . '</svg>';
}

function lucymary_product_card( $product ) {
	if ( ! $product || ! $product->is_visible() ) {
		return;
	}
	$terms = get_the_terms( $product->get_id(), 'product_cat' );
	$tags = get_the_terms( $product->get_id(), 'product_tag' );
	$category = ! is_wp_error( $terms ) && $terms ? $terms[0]->name : '';
	$tag = ! is_wp_error( $tags ) && $tags ? $tags[0]->name : '';
	$url = get_permalink( $product->get_id() );
	?>
	<article class="lm-product-card">
		<a class="lm-product-image" href="<?php echo esc_url( $url ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Ver %s', 'lucymary' ), $product->get_name() ) ); ?>">
			<?php if ( $product->get_image_id() ) : echo wp_get_attachment_image( $product->get_image_id(), 'woocommerce_thumbnail', false, array( 'loading' => 'lazy', 'alt' => $product->get_name() ) ); else : ?><span class="lm-image-empty" aria-hidden="true">✦</span><?php endif; ?>
			<?php if ( $tag ) : ?><span class="lm-product-badge"><?php echo esc_html( $tag ); ?></span><?php endif; ?>
		</a>
		<div class="lm-product-copy">
			<?php if ( $category ) : ?><span class="lm-product-category"><?php echo esc_html( $category ); ?></span><?php endif; ?>
			<h3><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $product->get_name() ); ?></a></h3>
			<div class="lm-rating" aria-label="<?php echo esc_attr( sprintf( __( 'Avaliação %1$s de 5, %2$s avaliações', 'lucymary' ), $product->get_average_rating(), $product->get_review_count() ) ); ?>"><span aria-hidden="true"><?php echo esc_html( str_repeat( '★', (int) round( (float) $product->get_average_rating() ) ) . str_repeat( '☆', 5 - (int) round( (float) $product->get_average_rating() ) ) ); ?></span> <small>(<?php echo (int) $product->get_review_count(); ?>)</small></div>
			<p class="lm-product-price"><?php echo wp_kses_post( $product->get_price_html() ); ?></p>
			<?php if ( ! $product->is_in_stock() ) : ?><small class="lm-stock-note"><?php esc_html_e( 'Indisponível', 'lucymary' ); ?></small><?php endif; ?>
			<a class="lm-card-action" href="<?php echo esc_url( $url ); ?>"><?php esc_html_e( 'Ver produto', 'lucymary' ); ?></a>
		</div>
	</article>
	<?php
}

function lucymary_catalog_filters() {
	get_template_part( 'template-parts/catalog', 'filters' );
}

function lucymary_color_for_term( $slug ) {
	$colors = array( 'bordo' => '#8a003e', 'dourado' => '#d6ad1b', 'prata' => '#c6c6c6', 'preto' => '#191919', 'branco' => '#ffffff', 'verde' => '#1d835e', 'azul' => '#2460a8', 'rosa' => '#db83a5' );
	return isset( $colors[ $slug ] ) ? $colors[ $slug ] : '#d9d4d7';
}

/** Run third-party product hooks without repeating the WooCommerce content rendered by this theme. */
function lucymary_product_plugin_content( $hook, $core_callbacks ) {
	$removed = array();
	foreach ( $core_callbacks as $callback ) {
		$priority = has_action( $hook, $callback );
		if ( false !== $priority ) {
			remove_action( $hook, $callback, $priority );
			$removed[] = array( $callback, $priority );
		}
	}
	do_action( $hook );
	foreach ( $removed as $entry ) {
		add_action( $hook, $entry[0], $entry[1] );
	}
}

function lucymary_catalog_query( $query ) {
	if ( is_admin() || ! $query->is_main_query() || ! function_exists( 'wc_get_product' ) ) {
		return;
	}
	if ( ! $query->is_post_type_archive( 'product' ) && ! $query->is_tax( 'product_cat' ) && ! ( $query->is_search() && 'product' === $query->get( 'post_type' ) ) ) {
		return;
	}
	$query->set( 'posts_per_page', 16 );
	$min = isset( $_GET['lm_min'] ) ? max( 0, (float) wc_clean( wp_unslash( $_GET['lm_min'] ) ) ) : 0;
	$max = isset( $_GET['lm_max'] ) ? max( 0, (float) wc_clean( wp_unslash( $_GET['lm_max'] ) ) ) : 0;
	$rating = isset( $_GET['lm_rating'] ) ? min( 5, max( 0, (int) $_GET['lm_rating'] ) ) : 0;
	$meta = (array) $query->get( 'meta_query' );
	if ( $min > 0 || $max > 0 ) {
		$meta[] = array( 'key' => '_price', 'value' => array( $min, $max > 0 ? max( $min, $max ) : 999999999 ), 'compare' => 'BETWEEN', 'type' => 'DECIMAL(12,2)' );
	}
	if ( $rating ) {
		$meta[] = array( 'key' => '_wc_average_rating', 'value' => $rating, 'compare' => '>=', 'type' => 'DECIMAL(3,2)' );
	}
	if ( $meta ) {
		$query->set( 'meta_query', $meta );
	}
	$tax = (array) $query->get( 'tax_query' );
	foreach ( array( 'lm_color' => array( 'pa_cor', 'pa_cores' ), 'lm_material' => array( 'pa_material' ) ) as $field => $candidates ) {
		$taxonomy = '';
		foreach ( $candidates as $candidate ) {
			if ( taxonomy_exists( $candidate ) ) { $taxonomy = $candidate; break; }
		}
		$value = isset( $_GET[ $field ] ) ? sanitize_title( wp_unslash( $_GET[ $field ] ) ) : '';
		if ( $taxonomy && $value && term_exists( $value, $taxonomy ) ) {
			$tax[] = array( 'taxonomy' => $taxonomy, 'field' => 'slug', 'terms' => $value );
		}
	}
	if ( $tax ) {
		$query->set( 'tax_query', $tax );
	}
}
add_action( 'pre_get_posts', 'lucymary_catalog_query', 30 );

function lucymary_default_catalog_order() {
	return 'date';
}
add_filter( 'woocommerce_default_catalog_orderby', 'lucymary_default_catalog_order' );

function lucymary_product_button_text() {
	return __( 'Adicionar à sacola', 'lucymary' );
}
add_filter( 'woocommerce_product_single_add_to_cart_text', 'lucymary_product_button_text' );

function lucymary_buy_now_button() {
	echo '<button type="submit" class="button lm-buy-now" name="add-to-cart" value="' . (int) get_the_ID() . '" formaction="' . esc_url( add_query_arg( 'lucymary_buy_now', '1', get_permalink() ) ) . '">' . esc_html__( 'Comprar agora', 'lucymary' ) . '</button>';
}
add_action( 'woocommerce_after_add_to_cart_button', 'lucymary_buy_now_button' );

function lucymary_buy_now_redirect( $url ) {
	if ( ! empty( $_REQUEST['lucymary_buy_now'] ) && function_exists( 'wc_get_checkout_url' ) && WC()->cart && ! WC()->cart->is_empty() ) {
		return wc_get_checkout_url();
	}
	return $url;
}
add_filter( 'woocommerce_add_to_cart_redirect', 'lucymary_buy_now_redirect' );

function lucymary_cart_fragments( $fragments ) {
	if ( ! function_exists( 'woocommerce_mini_cart' ) || ! WC()->cart ) { return $fragments; }
	ob_start();
	echo '<span class="lm-cart-count">' . (int) WC()->cart->get_cart_contents_count() . '</span>';
	$fragments['span.lm-cart-count'] = ob_get_clean();
	ob_start();
	echo '<div class="lm-mini-cart-content">';
	woocommerce_mini_cart();
	echo '</div>';
	$fragments['div.lm-mini-cart-content'] = ob_get_clean();
	return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'lucymary_cart_fragments' );

function lucymary_product_search() {
	$query = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';
	if ( strlen( $query ) < 2 ) { wp_send_json_success( array() ); }
	$search = new WP_Query( array( 'post_type' => 'product', 'post_status' => 'publish', 's' => $query, 'posts_per_page' => 8, 'fields' => 'ids', 'no_found_rows' => true ) );
	$ids = $search->posts;
	$items = array();
	foreach ( $ids as $id ) {
		$product = wc_get_product( $id );
		if ( ! $product || ! $product->is_visible() ) { continue; }
		$items[] = array( 'name' => $product->get_name(), 'url' => get_permalink( $id ), 'image' => wp_get_attachment_image_url( $product->get_image_id(), 'woocommerce_thumbnail' ) ?: '', 'price' => wp_strip_all_tags( $product->get_price_html() ) );
	}
	wp_send_json_success( $items );
}
add_action( 'wp_ajax_lucymary_search', 'lucymary_product_search' );
add_action( 'wp_ajax_nopriv_lucymary_search', 'lucymary_product_search' );

function lucymary_shipping_quote() {
	check_ajax_referer( 'lucymary_shipping', 'nonce' );
	if ( ! function_exists( 'WC' ) || ! WC()->shipping() || ! WC()->cart ) { wp_send_json_error( array( 'message' => __( 'Frete indisponível no momento.', 'lucymary' ) ), 503 ); }
	$id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
	$quantity = isset( $_POST['quantity'] ) ? min( 20, max( 1, absint( $_POST['quantity'] ) ) ) : 1;
	$postcode = isset( $_POST['postcode'] ) ? preg_replace( '/\D/', '', wp_unslash( $_POST['postcode'] ) ) : '';
	if ( strlen( $postcode ) !== 8 ) { wp_send_json_error( array( 'message' => __( 'Informe um CEP com 8 dígitos.', 'lucymary' ) ), 400 ); }
	$product = wc_get_product( $id );
	if ( ! $product || ! $product->is_purchasable() || ! $product->is_in_stock() || $product->is_virtual() || $product->is_type( 'variable' ) ) { wp_send_json_error( array( 'message' => __( 'Escolha uma opção disponível para calcular o frete.', 'lucymary' ) ), 400 ); }
	$price = (float) wc_get_price_to_display( $product );
	$package = array( 'contents' => array( 'lucymary_quote' => array( 'data' => $product, 'quantity' => $quantity, 'line_total' => $price * $quantity, 'line_subtotal' => $price * $quantity, 'line_tax' => 0, 'line_subtotal_tax' => 0 ) ), 'contents_cost' => $price * $quantity, 'applied_coupons' => array(), 'user' => array( 'ID' => get_current_user_id() ), 'destination' => array( 'country' => 'BR', 'state' => '', 'postcode' => $postcode, 'city' => '', 'address' => '', 'address_1' => '', 'address_2' => '' ), 'cart_subtotal' => $price * $quantity );
	$shipping = WC()->shipping()->calculate_shipping_for_package( $package, 99999 );
	if ( WC()->session ) { WC()->session->__unset( 'shipping_for_package_99999' ); }
	$rates = array();
	foreach ( $shipping['rates'] ?? array() as $rate ) {
		$rates[] = array( 'label' => $rate->get_label(), 'cost' => wp_strip_all_tags( wc_price( (float) $rate->get_cost() ) ) );
	}
	wp_send_json_success( array( 'rates' => $rates ) );
}
add_action( 'wp_ajax_lucymary_shipping', 'lucymary_shipping_quote' );
add_action( 'wp_ajax_nopriv_lucymary_shipping', 'lucymary_shipping_quote' );
