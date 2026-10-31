<?php
/**
 * LucyMary mini cart. WooCommerce template version 11.2.0.
 *
 * @package LucyMary
 */
defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_mini_cart' );
if ( WC()->cart && ! WC()->cart->is_empty() ) : ?>
  <ul class="woocommerce-mini-cart cart_list product_list_widget <?php echo esc_attr( isset( $args['list_class'] ) ? $args['list_class'] : '' ); ?>">
    <?php
    do_action( 'woocommerce_before_mini_cart_contents' );
    foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) :
      $product = apply_filters( 'woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key );
      if ( ! ( $product instanceof WC_Product ) || ! $product->exists() || $cart_item['quantity'] <= 0 || ! apply_filters( 'woocommerce_widget_cart_item_visible', true, $cart_item, $cart_item_key ) ) { continue; }
      $item_name = WC()->cart->get_item_product_name( $cart_item, $product );
      $name = apply_filters( 'woocommerce_cart_item_name', $item_name, $cart_item, $cart_item_key );
      $thumbnail = apply_filters( 'woocommerce_cart_item_thumbnail', $product->get_image( 'woocommerce_thumbnail' ), $cart_item, $cart_item_key );
      $price = apply_filters( 'woocommerce_cart_item_price', WC()->cart->get_product_price( $product ), $cart_item, $cart_item_key );
      $permalink = apply_filters( 'woocommerce_cart_item_permalink', $product->is_visible() ? $product->get_permalink( $cart_item ) : '', $cart_item, $cart_item_key );
      $quantity = (int) $cart_item['quantity'];
      $max_quantity = $product->get_max_purchase_quantity();
      ?>
      <li class="woocommerce-mini-cart-item lm-mini-cart-item <?php echo esc_attr( apply_filters( 'woocommerce_mini_cart_item_class', 'mini_cart_item', $cart_item, $cart_item_key ) ); ?>">
        <div class="lm-mini-cart-image"><?php if ( $permalink ) : ?><a href="<?php echo esc_url( $permalink ); ?>"><?php endif; ?><?php echo wp_kses_post( $thumbnail ); ?><?php if ( $permalink ) : ?></a><?php endif; ?></div>
        <div class="lm-mini-cart-details">
          <div class="lm-mini-cart-title-row">
            <?php if ( $permalink ) : ?><a class="lm-mini-cart-title" href="<?php echo esc_url( $permalink ); ?>"><?php echo wp_kses_post( $name ); ?></a><?php else : ?><span class="lm-mini-cart-title"><?php echo wp_kses_post( $name ); ?></span><?php endif; ?>
            <span class="lm-mini-cart-price"><?php echo wp_kses_post( $price ); ?></span>
          </div>
          <div class="lm-mini-cart-meta"><?php echo wc_get_formatted_cart_item_data( $cart_item, false, $item_name ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
          <div class="lm-mini-cart-controls">
            <div class="lm-mini-cart-stepper" aria-label="<?php esc_attr_e( 'Quantidade', 'woocommerce' ); ?>">
              <button type="button" data-lm-cart-qty="-1" data-cart-key="<?php echo esc_attr( $cart_item_key ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Diminuir quantidade de %s', 'lucymary' ), wp_strip_all_tags( $name ) ) ); ?>" <?php disabled( $quantity <= 1 ); ?>>−</button>
              <span aria-live="polite"><?php echo esc_html( $quantity ); ?></span>
              <button type="button" data-lm-cart-qty="1" data-cart-key="<?php echo esc_attr( $cart_item_key ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Aumentar quantidade de %s', 'lucymary' ), wp_strip_all_tags( $name ) ) ); ?>" <?php disabled( $product->is_sold_individually() || ( $max_quantity > 0 && $quantity >= $max_quantity ) ); ?>>+</button>
            </div>
            <a class="lm-mini-cart-remove" href="<?php echo esc_url( wc_get_cart_remove_url( $cart_item_key ) ); ?>" data-lm-cart-remove data-cart-key="<?php echo esc_attr( $cart_item_key ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Remover %s da sacola', 'lucymary' ), wp_strip_all_tags( $name ) ) ); ?>"><?php echo lucymary_icon( 'trash', 17 ); ?></a>
          </div>
        </div>
      </li>
    <?php endforeach;
    do_action( 'woocommerce_mini_cart_contents' ); ?>
  </ul>
  <div class="lm-mini-cart-summary"><p class="woocommerce-mini-cart__total total"><?php do_action( 'woocommerce_widget_shopping_cart_total' ); ?></p><small><?php esc_html_e( 'Frete e descontos confirmados no carrinho.', 'lucymary' ); ?></small></div>
  <?php do_action( 'woocommerce_widget_shopping_cart_before_buttons' ); ?>
  <p class="woocommerce-mini-cart__buttons buttons" hidden><?php do_action( 'woocommerce_widget_shopping_cart_buttons' ); ?></p>
  <?php do_action( 'woocommerce_widget_shopping_cart_after_buttons' ); ?>
<?php else : ?>
  <p class="woocommerce-mini-cart__empty-message"><?php esc_html_e( 'Sua sacola está vazia.', 'lucymary' ); ?></p>
<?php endif;
do_action( 'woocommerce_after_mini_cart' );
