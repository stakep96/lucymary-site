<?php get_header(); ?>
<div class="lm-shell lm-content-page"><nav class="lm-breadcrumb"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a> / <?php the_title(); ?></nav><h1><?php the_title(); ?></h1>
<?php while ( have_posts() ) : the_post();
	$content = get_the_content();
	if ( function_exists( 'is_checkout' ) && is_checkout() && ! has_block( 'woocommerce/checkout', get_the_ID() ) && ! has_shortcode( $content, 'woocommerce_checkout' ) ) {
		echo do_shortcode( '[woocommerce_checkout]' );
	} elseif ( function_exists( 'is_cart' ) && is_cart() && ! has_block( 'woocommerce/cart', get_the_ID() ) && ! has_shortcode( $content, 'woocommerce_cart' ) ) {
		echo do_shortcode( '[woocommerce_cart]' );
	} elseif ( function_exists( 'is_account_page' ) && is_account_page() && ! has_block( 'woocommerce/my-account', get_the_ID() ) && ! has_shortcode( $content, 'woocommerce_my_account' ) ) {
		echo do_shortcode( '[woocommerce_my_account]' );
	} else {
		the_content();
	}
endwhile; ?>
</div><?php get_footer(); ?>
