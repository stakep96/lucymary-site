<?php
/** LucyMary home. */
get_header();
$slides = array(
	array( 'desktop' => 'banner-casais.png', 'mobile' => 'banner-mobile.png', 'alt' => __( 'Noivados para sempre, sim. Confira as alianças LucyMary.', 'lucymary' ), 'slug' => 'aliancas' ),
	array( 'desktop' => 'banner-relogios.png', 'mobile' => 'banner-relogios-mobile.png', 'alt' => __( 'Relógios exclusivos LucyMary.', 'lucymary' ), 'slug' => 'relogios' ),
	array( 'desktop' => 'banner-b2b.png', 'mobile' => 'banner-b2b-mobile.png', 'alt' => __( 'Condições exclusivas para lojistas em compras B2B.', 'lucymary' ), 'slug' => '' ),
);
?>
<section class="lm-hero" data-interval="<?php echo esc_attr( lucymary_hero_interval( get_theme_mod( 'lucymary_hero_interval', 7 ) ) ); ?>" aria-label="<?php esc_attr_e( 'Destaques LucyMary', 'lucymary' ); ?>"><div class="lm-hero-slides">
<?php foreach ( $slides as $index => $slide ) :
	$term = $slide['slug'] ? get_term_by( 'slug', $slide['slug'], 'product_cat' ) : false;
	$default_link = $term ? get_term_link( $term ) : home_url( '/#contato' );
	$slot = $index + 1;
	$desktop_custom = get_theme_mod( 'lucymary_home_banner_' . $slot . '_desktop', '' );
	$desktop = $desktop_custom ?: lucymary_asset( 'brand/' . $slide['desktop'] );
	$mobile = get_theme_mod( 'lucymary_home_banner_' . $slot . '_mobile', '' );
	if ( ! $mobile ) { $mobile = $desktop_custom ? $desktop : lucymary_asset( 'brand/' . $slide['mobile'] ); }
	$link = get_theme_mod( 'lucymary_home_banner_' . $slot . '_link', '' ) ?: ( is_wp_error( $default_link ) ? home_url( '/' ) : $default_link );
	$alt = get_theme_mod( 'lucymary_home_banner_' . $slot . '_alt', '' ) ?: $slide['alt'];
	?>
	<a class="lm-hero-slide<?php echo 0 === $index ? ' is-active' : ''; ?>" href="<?php echo esc_url( $link ); ?>" <?php echo $index ? 'aria-hidden="true" tabindex="-1"' : ''; ?>><picture><source media="(max-width: 640px)" srcset="<?php echo esc_url( $mobile ); ?>"><img src="<?php echo esc_url( $desktop ); ?>" alt="<?php echo esc_attr( $alt ); ?>" width="1600" height="286" <?php echo $index ? 'loading="lazy"' : 'fetchpriority="high"'; ?>></picture></a>
<?php endforeach; ?>
<button type="button" class="lm-hero-arrow lm-hero-prev" aria-label="<?php esc_attr_e( 'Banner anterior', 'lucymary' ); ?>"><?php echo lucymary_icon( 'chevron-left', 24 ); ?></button><button type="button" class="lm-hero-arrow lm-hero-next" aria-label="<?php esc_attr_e( 'Próximo banner', 'lucymary' ); ?>"><?php echo lucymary_icon( 'chevron-right', 24 ); ?></button></div><div class="lm-hero-dots" aria-label="<?php esc_attr_e( 'Escolher banner', 'lucymary' ); ?>"><?php foreach ( $slides as $index => $slide ) : ?><button type="button" class="<?php echo 0 === $index ? 'is-active' : ''; ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Mostrar banner %d', 'lucymary' ), $index + 1 ) ); ?>" <?php echo 0 === $index ? 'aria-current="true"' : ''; ?>></button><?php endforeach; ?></div></section>

<section class="lm-shell lm-collections" id="colecoes" aria-label="<?php esc_attr_e( 'Categorias LucyMary', 'lucymary' ); ?>"><div class="lm-collection-carousel"><button type="button" class="lm-collection-arrow lm-collection-prev" aria-label="<?php esc_attr_e( 'Categorias anteriores', 'lucymary' ); ?>"><?php echo lucymary_icon( 'chevron-left', 18 ); ?></button><div class="lm-collection-track">
<?php foreach ( lucymary_category_navigation_items() as $category ) : ?><a class="lm-collection-tile" href="<?php echo esc_url( $category['url'] ); ?>"><span class="lm-collection-art"><?php $image = $category['term'] ? lucymary_category_image( $category['term'] ) : ''; if ( $image ) : ?><img src="<?php echo esc_url( $image ); ?>" alt="" width="160" height="160" loading="lazy"><?php else : ?>✦<?php endif; ?></span><span><?php echo esc_html( $category['title'] ); ?></span></a><?php endforeach; ?>
</div><button type="button" class="lm-collection-arrow lm-collection-next" aria-label="<?php esc_attr_e( 'Próximas categorias', 'lucymary' ); ?>"><?php echo lucymary_icon( 'chevron-right', 18 ); ?></button><div class="lm-collection-dots" aria-hidden="true"></div></div></section>

<section class="lm-home-products" id="novidades"><div class="lm-shell"><h1><?php esc_html_e( 'Luxo para quem é livre para brilhar.', 'lucymary' ); ?></h1>
<?php if ( ! function_exists( 'wc_get_products' ) ) : ?><div class="lm-state"><h2><?php esc_html_e( 'Catálogo em preparação', 'lucymary' ); ?></h2><p><?php esc_html_e( 'Ative o WooCommerce para exibir os produtos.', 'lucymary' ); ?></p></div><?php else :
	$products = wc_get_products( array( 'status' => 'publish', 'limit' => 12, 'orderby' => 'date', 'order' => 'DESC', 'visibility' => 'visible' ) );
	if ( $products ) : ?><div class="lm-product-grid"><?php foreach ( $products as $product ) { lucymary_product_card( $product ); } ?></div><div class="lm-all-products"><a href="<?php echo esc_url( lucymary_shop_url() ); ?>"><?php esc_html_e( 'Ver todos os produtos', 'lucymary' ); ?></a></div><?php else : ?><div class="lm-state"><h2><?php esc_html_e( 'Novidades em breve', 'lucymary' ); ?></h2><p><?php esc_html_e( 'Ainda não há produtos publicados para mostrar.', 'lucymary' ); ?></p></div><?php endif;
endif; ?></div></section>
<?php get_footer(); ?>
