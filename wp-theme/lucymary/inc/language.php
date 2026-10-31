<?php
/** First-party Portuguese/English content for the LucyMary theme. */
defined( 'ABSPATH' ) || exit;

function lucymary_language() {
	return isset( $_GET['lm_lang'] ) && 'en' === $_GET['lm_lang'] ? 'en' : 'pt'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
}

function lucymary_english_request() {
	return 'en' === lucymary_language() && ( ! is_admin() || wp_doing_ajax() );
}

function lucymary_request_locale( $locale ) {
	return lucymary_english_request() ? 'en_US' : $locale;
}
add_filter( 'locale', 'lucymary_request_locale' );
add_filter( 'determine_locale', 'lucymary_request_locale' );

function lucymary_switch_frontend_locale() {
	if ( lucymary_english_request() ) {
		switch_to_locale( 'en_US' );
	}
}
add_action( 'after_setup_theme', 'lucymary_switch_frontend_locale', 1 );

function lucymary_language_query_vars( $vars ) {
	$vars[] = 'lm_lang';
	return $vars;
}
add_filter( 'query_vars', 'lucymary_language_query_vars' );

function lucymary_localize_url( $url ) {
	if ( ! lucymary_english_request() || ! is_string( $url ) || ! $url ) { return $url; }
	$site_host = wp_parse_url( get_option( 'home' ), PHP_URL_HOST );
	$url_host = wp_parse_url( $url, PHP_URL_HOST );
	$path = wp_parse_url( $url, PHP_URL_PATH );
	if ( ! $url_host || $url_host !== $site_host || preg_match( '~/(wp-admin|wp-login\.php|wp-json|wp-content|wp-includes)(/|$)~', (string) $path ) ) { return $url; }
	return add_query_arg( 'lm_lang', 'en', $url );
}
add_filter( 'home_url', 'lucymary_localize_url' );
add_filter( 'post_link', 'lucymary_localize_url' );
add_filter( 'post_type_link', 'lucymary_localize_url' );
add_filter( 'page_link', 'lucymary_localize_url' );
add_filter( 'term_link', 'lucymary_localize_url' );

function lucymary_language_url( $language ) {
	$uri = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/';
	$path = wp_parse_url( $uri, PHP_URL_PATH ) ?: '/';
	$url = remove_query_arg( 'lm_lang', home_url( '/' . ltrim( $path, '/' ) ) );
	$query = wp_parse_url( $uri, PHP_URL_QUERY );
	$arguments = array();
	if ( $query ) { wp_parse_str( $query, $arguments ); }
	$allowed = array_intersect_key( $arguments, array_flip( array( 's', 'post_type', 'paged', 'page', 'orderby', 'lm_min', 'lm_max', 'lm_rating', 'lm_color', 'lm_material' ) ) );
	if ( $allowed ) { $url = add_query_arg( $allowed, $url ); }
	return 'en' === $language ? add_query_arg( 'lm_lang', 'en', $url ) : $url;
}

function lucymary_language_switcher( $placement = 'header' ) {
	$current = lucymary_language();
	$mobile = 'menu' === $placement;
	$flag = lucymary_asset( 'flags/' . ( 'en' === $current ? 'us' : 'br' ) . '.svg' );
	?>
	<details class="lm-language-switcher lm-language-switcher--<?php echo esc_attr( $placement ); ?>">
		<?php if ( $mobile ) : ?><span class="lm-language-label"><?php esc_html_e( 'Idioma', 'lucymary' ); ?></span><?php endif; ?>
		<summary aria-label="<?php esc_attr_e( 'Selecionar idioma', 'lucymary' ); ?>"><img src="<?php echo esc_url( $flag ); ?>" alt="" width="20" height="14"><span><?php echo esc_html( $mobile ? ( 'en' === $current ? 'English' : 'Português' ) : strtoupper( $current ) ); ?></span><?php echo lucymary_icon( 'chevron-down', 15 ); ?></summary>
		<div class="lm-language-options">
			<a href="<?php echo esc_url( lucymary_language_url( 'pt' ) ); ?>" lang="pt-BR" hreflang="pt-BR" <?php echo 'pt' === $current ? 'aria-current="true"' : ''; ?>><img src="<?php echo esc_url( lucymary_asset( 'flags/br.svg' ) ); ?>" alt="" width="20" height="14"><span>Português</span></a>
			<a href="<?php echo esc_url( lucymary_language_url( 'en' ) ); ?>" lang="en-US" hreflang="en-US" <?php echo 'en' === $current ? 'aria-current="true"' : ''; ?>><img src="<?php echo esc_url( lucymary_asset( 'flags/us.svg' ) ); ?>" alt="" width="20" height="14"><span>English</span></a>
		</div>
	</details>
	<?php
}

function lucymary_keep_language_in_get_forms() {
	if ( lucymary_english_request() ) { echo '<input type="hidden" name="lm_lang" value="en">'; }
}

function lucymary_preserve_language_canonical( $redirect ) {
	return lucymary_english_request() ? false : $redirect;
}
add_filter( 'redirect_canonical', 'lucymary_preserve_language_canonical' );

function lucymary_language_alternates() {
	if ( is_front_page() || is_singular( array( 'product', 'page', 'post' ) ) || ( function_exists( 'is_shop' ) && is_shop() ) || is_tax( 'product_cat' ) ) {
		echo '<link rel="alternate" hreflang="pt-BR" href="' . esc_url( lucymary_language_url( 'pt' ) ) . '">';
		echo '<link rel="alternate" hreflang="en-US" href="' . esc_url( lucymary_language_url( 'en' ) ) . '">';
	}
}
add_action( 'wp_head', 'lucymary_language_alternates', 2 );

function lucymary_english_post_value( $post_id, $field ) {
	if ( ! lucymary_english_request() || ! $post_id || ! in_array( get_post_type( $post_id ), array( 'product', 'page', 'post' ), true ) ) { return ''; }
	return (string) get_post_meta( $post_id, '_lm_' . $field . '_en', true );
}

function lucymary_translate_post_title( $title, $post_id ) {
	return lucymary_english_post_value( $post_id, 'title' ) ?: $title;
}
add_filter( 'the_title', 'lucymary_translate_post_title', 10, 2 );

function lucymary_translate_product_name( $name, $product ) {
	return lucymary_english_post_value( $product->get_id(), 'title' ) ?: $name;
}
add_filter( 'woocommerce_product_get_name', 'lucymary_translate_product_name', 10, 2 );

function lucymary_translate_variation_name( $name, $variation ) {
	if ( ! lucymary_english_request() ) { return $name; }
	$parent_id = $variation->get_parent_id();
	$translated = lucymary_english_post_value( $parent_id, 'title' );
	$original = get_post_field( 'post_title', $parent_id );
	return $translated && $original ? str_replace( $original, $translated, $name ) : $name;
}
add_filter( 'woocommerce_product_variation_get_name', 'lucymary_translate_variation_name', 10, 2 );

function lucymary_translate_product_short( $value, $product ) {
	return lucymary_english_post_value( $product->get_id(), 'short' ) ?: $value;
}
add_filter( 'woocommerce_product_get_short_description', 'lucymary_translate_product_short', 10, 2 );

function lucymary_translate_product_description( $value, $product ) {
	return lucymary_english_post_value( $product->get_id(), 'content' ) ?: $value;
}
add_filter( 'woocommerce_product_get_description', 'lucymary_translate_product_description', 10, 2 );

function lucymary_translate_page_content( $content ) {
	$post_id = get_the_ID();
	if ( function_exists( 'wc_get_page_id' ) && in_array( $post_id, array( wc_get_page_id( 'cart' ), wc_get_page_id( 'checkout' ), wc_get_page_id( 'myaccount' ) ), true ) ) { return $content; }
	return lucymary_english_post_value( $post_id, 'content' ) ?: $content;
}
add_filter( 'the_content', 'lucymary_translate_page_content', 1 );

function lucymary_translate_term( $term ) {
	if ( ! lucymary_english_request() || ! $term instanceof WP_Term || ( 'product_cat' !== $term->taxonomy && 'product_tag' !== $term->taxonomy && 0 !== strpos( $term->taxonomy, 'pa_' ) ) ) { return $term; }
	$name = get_term_meta( $term->term_id, '_lm_name_en', true );
	$description = get_term_meta( $term->term_id, '_lm_description_en', true );
	if ( ! $name && ! $description ) { return $term; }
	$translated = clone $term;
	if ( $name ) { $translated->name = $name; }
	if ( $description ) { $translated->description = $description; }
	return $translated;
}
add_filter( 'get_term', 'lucymary_translate_term' );

function lucymary_translate_terms( $terms ) {
	if ( ! is_array( $terms ) ) { return $terms; }
	return array_map( 'lucymary_translate_term', $terms );
}
add_filter( 'get_terms', 'lucymary_translate_terms' );
add_filter( 'get_the_terms', 'lucymary_translate_terms' );

function lucymary_translate_attribute_label( $label ) {
	if ( ! lucymary_english_request() ) { return $label; }
	$labels = array( 'Ouro' => 'Gold', 'Aro' => 'Ring size', 'Tamanho do Aro' => 'Ring size', 'Cor' => 'Color', 'Cores' => 'Colors', 'Material' => 'Material' );
	return $labels[ $label ] ?? $label;
}
add_filter( 'woocommerce_attribute_label', 'lucymary_translate_attribute_label' );

function lucymary_translation_meta() {
	foreach ( array( 'product', 'page', 'post' ) as $post_type ) {
		foreach ( array( 'title', 'short', 'content' ) as $field ) {
			register_post_meta( $post_type, '_lm_' . $field . '_en', array( 'type' => 'string', 'single' => true, 'show_in_rest' => false ) );
		}
	}
	foreach ( array_keys( get_taxonomies() ) as $taxonomy ) {
		if ( 'product_cat' !== $taxonomy && 'product_tag' !== $taxonomy && 0 !== strpos( $taxonomy, 'pa_' ) ) { continue; }
		foreach ( array( 'name', 'description' ) as $field ) { register_term_meta( $taxonomy, '_lm_' . $field . '_en', array( 'type' => 'string', 'single' => true, 'show_in_rest' => false ) ); }
		add_action( $taxonomy . '_add_form_fields', 'lucymary_term_translation_add_fields' );
		add_action( $taxonomy . '_edit_form_fields', 'lucymary_term_translation_edit_fields' );
		add_action( 'created_' . $taxonomy, 'lucymary_save_term_translation' );
		add_action( 'edited_' . $taxonomy, 'lucymary_save_term_translation' );
	}
}
add_action( 'init', 'lucymary_translation_meta', 30 );

function lucymary_translation_metaboxes() {
	add_meta_box( 'lm-english', 'LucyMary — English', 'lucymary_translation_metabox', array( 'product', 'page', 'post' ), 'normal', 'default' );
}
add_action( 'add_meta_boxes', 'lucymary_translation_metaboxes' );

function lucymary_translation_metabox( $post ) {
	wp_nonce_field( 'lm_save_english', 'lm_english_nonce' );
	$fields = array( 'title' => 'Título em inglês', 'short' => 'Descrição curta em inglês', 'content' => 'Descrição completa em inglês' );
	foreach ( $fields as $field => $label ) {
		if ( 'short' === $field && 'product' !== $post->post_type ) { continue; }
		$value = get_post_meta( $post->ID, '_lm_' . $field . '_en', true );
		echo '<p><label for="lm-' . esc_attr( $field ) . '-en"><strong>' . esc_html( $label ) . '</strong></label><br>';
		if ( 'title' === $field ) { echo '<input class="widefat" id="lm-' . esc_attr( $field ) . '-en" name="lm_' . esc_attr( $field ) . '_en" value="' . esc_attr( $value ) . '">'; }
		else { echo '<textarea class="widefat" id="lm-' . esc_attr( $field ) . '-en" name="lm_' . esc_attr( $field ) . '_en" rows="' . ( 'short' === $field ? 4 : 8 ) . '">' . esc_textarea( $value ) . '</textarea>'; }
		echo '</p>';
	}
	echo '<p>Deixe em branco para usar o texto em português. Preço, estoque, variações e pedidos continuam no mesmo produto WooCommerce.</p>';
}

function lucymary_save_post_translation( $post_id ) {
	if ( ! isset( $_POST['lm_english_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['lm_english_nonce'] ) ), 'lm_save_english' ) || ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) { return; }
	foreach ( array( 'title', 'short', 'content' ) as $field ) {
		$key = 'lm_' . $field . '_en';
		if ( ! isset( $_POST[ $key ] ) ) { continue; }
		$value = wp_unslash( $_POST[ $key ] );
		$value = 'title' === $field ? sanitize_text_field( $value ) : wp_kses_post( $value );
		if ( $value ) { update_post_meta( $post_id, '_lm_' . $field . '_en', $value ); }
		else { delete_post_meta( $post_id, '_lm_' . $field . '_en' ); }
	}
}
add_action( 'save_post_product', 'lucymary_save_post_translation' );
add_action( 'save_post_page', 'lucymary_save_post_translation' );
add_action( 'save_post_post', 'lucymary_save_post_translation' );

function lucymary_term_translation_add_fields() {
	wp_nonce_field( 'lm_save_term_english', 'lm_term_english_nonce' );
	echo '<div class="form-field"><label for="lm-name-en">Nome em inglês</label><input id="lm-name-en" name="lm_name_en" type="text"></div>';
	echo '<div class="form-field"><label for="lm-description-en">Descrição em inglês</label><textarea id="lm-description-en" name="lm_description_en" rows="4"></textarea></div>';
}

function lucymary_term_translation_edit_fields( $term ) {
	wp_nonce_field( 'lm_save_term_english', 'lm_term_english_nonce' );
	echo '<tr class="form-field"><th><label for="lm-name-en">Nome em inglês</label></th><td><input id="lm-name-en" name="lm_name_en" value="' . esc_attr( get_term_meta( $term->term_id, '_lm_name_en', true ) ) . '"></td></tr>';
	echo '<tr class="form-field"><th><label for="lm-description-en">Descrição em inglês</label></th><td><textarea id="lm-description-en" name="lm_description_en" rows="4">' . esc_textarea( get_term_meta( $term->term_id, '_lm_description_en', true ) ) . '</textarea></td></tr>';
}

function lucymary_save_term_translation( $term_id ) {
	if ( ! isset( $_POST['lm_term_english_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['lm_term_english_nonce'] ) ), 'lm_save_term_english' ) || ! current_user_can( 'edit_term', $term_id ) ) { return; }
	foreach ( array( 'name', 'description' ) as $field ) {
		$key = 'lm_' . $field . '_en';
		if ( ! isset( $_POST[ $key ] ) ) { continue; }
		$value = wp_unslash( $_POST[ $key ] );
		$value = 'name' === $field ? sanitize_text_field( $value ) : wp_kses_post( $value );
		if ( $value ) { update_term_meta( $term_id, '_lm_' . $field . '_en', $value ); }
		else { delete_term_meta( $term_id, '_lm_' . $field . '_en' ); }
	}
}

function lucymary_english_search( $search, $query ) {
	if ( ! lucymary_english_request() || ! $query->is_search() || 'product' !== $query->get( 'post_type' ) || ! $query->get( 's' ) ) { return $search; }
	global $wpdb;
	$like = '%' . $wpdb->esc_like( $query->get( 's' ) ) . '%';
	$search = $wpdb->prepare( " AND ( {$wpdb->posts}.post_title LIKE %s OR {$wpdb->posts}.post_excerpt LIKE %s OR {$wpdb->posts}.post_content LIKE %s OR EXISTS ( SELECT 1 FROM {$wpdb->postmeta} lm_en WHERE lm_en.post_id = {$wpdb->posts}.ID AND lm_en.meta_key IN ('_lm_title_en', '_lm_short_en', '_lm_content_en') AND lm_en.meta_value LIKE %s ) ) ", $like, $like, $like, $like );
	return is_user_logged_in() ? $search : $search . " AND {$wpdb->posts}.post_password = '' ";
}
add_filter( 'posts_search', 'lucymary_english_search', 10, 2 );
