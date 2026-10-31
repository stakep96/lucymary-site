<?php
/** LucyMary home. */
get_header();
$slides = array(
	array( 'desktop' => 'banner-casais.png', 'mobile' => 'banner-mobile.png', 'alt' => 'Noivados para sempre, sim. Confira as alianças LucyMary.', 'slug' => 'aliancas' ),
	array( 'desktop' => 'banner-relogios.png', 'mobile' => 'banner-relogios-mobile.png', 'alt' => 'Relógios exclusivos LucyMary.', 'slug' => 'relogios' ),
	array( 'desktop' => 'banner-b2b.png', 'mobile' => 'banner-b2b-mobile.png', 'alt' => 'Condições exclusivas para lojistas em compras B2B.', 'slug' => '' ),
);
?>
<section class="lm-hero" aria-label="Destaques LucyMary"><div class="lm-hero-slides">
<?php foreach ( $slides as $index => $slide ) :
	$term = $slide['slug'] ? get_term_by( 'slug', $slide['slug'], 'product_cat' ) : false;
	$link = $term ? get_term_link( $term ) : home_url( '/#contato' );
	?>
	<a class="lm-hero-slide<?php echo 0 === $index ? ' is-active' : ''; ?>" href="<?php echo esc_url( $link ); ?>" <?php echo $index ? 'aria-hidden="true" tabindex="-1"' : ''; ?>><picture><source media="(max-width: 640px)" srcset="<?php echo esc_url( lucymary_asset( 'brand/' . $slide['mobile'] ) ); ?>"><img src="<?php echo esc_url( lucymary_asset( 'brand/' . $slide['desktop'] ) ); ?>" alt="<?php echo esc_attr( $slide['alt'] ); ?>" width="1600" height="286" <?php echo $index ? 'loading="lazy"' : 'fetchpriority="high"'; ?>></picture></a>
<?php endforeach; ?>
<button type="button" class="lm-hero-arrow lm-hero-prev" aria-label="Banner anterior"><?php echo lucymary_icon( 'chevron-left', 24 ); ?></button><button type="button" class="lm-hero-arrow lm-hero-next" aria-label="Próximo banner"><?php echo lucymary_icon( 'chevron-right', 24 ); ?></button></div><div class="lm-hero-dots" aria-label="Escolher banner"><?php foreach ( $slides as $index => $slide ) : ?><button type="button" class="<?php echo 0 === $index ? 'is-active' : ''; ?>" aria-label="Mostrar banner <?php echo (int) $index + 1; ?>" <?php echo 0 === $index ? 'aria-current="true"' : ''; ?>></button><?php endforeach; ?></div></section>

<section class="lm-shell lm-collections" id="colecoes" aria-label="Categorias LucyMary"><div class="lm-collection-carousel"><button type="button" class="lm-collection-arrow lm-collection-prev" aria-label="Categorias anteriores"><?php echo lucymary_icon( 'chevron-left', 18 ); ?></button><div class="lm-collection-track">
<?php foreach ( lucymary_ordered_categories() as $category ) : ?><a class="lm-collection-tile" href="<?php echo esc_url( get_term_link( $category ) ); ?>"><span class="lm-collection-art"><?php $image = lucymary_category_image( $category ); if ( $image ) : ?><img src="<?php echo esc_url( $image ); ?>" alt="" width="160" height="160" loading="lazy"><?php else : ?>✦<?php endif; ?></span><span><?php echo esc_html( $category->name ); ?></span></a><?php endforeach; ?>
</div><button type="button" class="lm-collection-arrow lm-collection-next" aria-label="Próximas categorias"><?php echo lucymary_icon( 'chevron-right', 18 ); ?></button><div class="lm-collection-dots" aria-hidden="true"></div></div></section>

<section class="lm-home-products" id="novidades"><div class="lm-shell"><h1>Luxo para quem é livre para brilhar.</h1>
<?php if ( ! function_exists( 'wc_get_products' ) ) : ?><div class="lm-state"><h2>Catálogo em preparação</h2><p>Ative o WooCommerce para exibir os produtos.</p></div><?php else :
	$products = wc_get_products( array( 'status' => 'publish', 'limit' => 12, 'orderby' => 'date', 'order' => 'DESC', 'visibility' => 'visible' ) );
	if ( $products ) : ?><div class="lm-product-grid"><?php foreach ( $products as $product ) { lucymary_product_card( $product ); } ?></div><div class="lm-all-products"><a href="<?php echo esc_url( lucymary_shop_url() ); ?>">Ver todos os produtos</a></div><?php else : ?><div class="lm-state"><h2>Novidades em breve</h2><p>Ainda não há produtos publicados para mostrar.</p></div><?php endif;
endif; ?></div></section>
<?php get_footer(); ?>
