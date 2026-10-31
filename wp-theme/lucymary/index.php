<?php get_header(); ?>
<div class="lm-shell lm-content-page"><h1><?php echo esc_html( is_home() ? get_the_title( get_option( 'page_for_posts' ) ) : wp_get_document_title() ); ?></h1><div class="lm-post-grid">
<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?><article><h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2><?php the_excerpt(); ?></article><?php endwhile; the_posts_pagination(); else : ?><p>Nenhum conteúdo encontrado.</p><?php endif; ?></div></div>
<?php get_footer(); ?>
