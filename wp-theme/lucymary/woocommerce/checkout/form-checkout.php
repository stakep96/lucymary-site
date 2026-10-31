<?php
/**
 * LucyMary classic checkout layout. WooCommerce template version 9.4.0.
 *
 * WooCommerce still renders and processes all checkout fields, shipping rates,
 * gateway fields, validation and the place-order button.
 *
 * @package LucyMary
 */
defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_checkout_form', $checkout );
if ( ! $checkout->is_registration_enabled() && $checkout->is_registration_required() && ! is_user_logged_in() ) {
  echo esc_html( apply_filters( 'woocommerce_checkout_must_be_logged_in_message', __( 'You must be logged in to checkout.', 'woocommerce' ) ) );
  return;
}
$lucymary_payment_priority = has_action( 'woocommerce_checkout_order_review', 'woocommerce_checkout_payment' );
if ( false !== $lucymary_payment_priority ) {
  remove_action( 'woocommerce_checkout_order_review', 'woocommerce_checkout_payment', $lucymary_payment_priority );
}
?>
<form name="checkout" method="post" class="checkout woocommerce-checkout lm-checkout-layout" action="<?php echo esc_url( wc_get_checkout_url() ); ?>" enctype="multipart/form-data" aria-label="<?php echo esc_attr__( 'Checkout', 'woocommerce' ); ?>">
  <div class="lm-checkout-fields">
    <?php if ( $checkout->get_checkout_fields() ) : ?>
      <?php do_action( 'woocommerce_checkout_before_customer_details' ); ?>
      <div class="col2-set" id="customer_details">
        <div class="col-1"><?php do_action( 'woocommerce_checkout_billing' ); ?></div>
        <div class="col-2"><?php do_action( 'woocommerce_checkout_shipping' ); ?></div>
      </div>
      <?php do_action( 'woocommerce_checkout_after_customer_details' ); ?>
    <?php endif; ?>
    <?php if ( false !== $lucymary_payment_priority ) : ?><div class="lm-checkout-payment-heading"><h2><?php esc_html_e( 'Pagamento', 'lucymary' ); ?></h2><p><?php esc_html_e( 'Escolha uma das formas disponíveis para concluir sua compra.', 'lucymary' ); ?></p></div><?php endif; ?>
    <?php
    // Keep #payment inside the checkout form so WooCommerce can refresh its AJAX fragment.
    if ( false !== $lucymary_payment_priority ) {
      woocommerce_checkout_payment();
    }
    ?>
  </div>
  <div class="lm-checkout-summary">
    <?php do_action( 'woocommerce_checkout_before_order_review_heading' ); ?>
    <h2 id="order_review_heading"><?php esc_html_e( 'Resumo do pedido', 'lucymary' ); ?></h2>
    <?php do_action( 'woocommerce_checkout_before_order_review' ); ?>
    <div id="order_review" class="woocommerce-checkout-review-order"><?php do_action( 'woocommerce_checkout_order_review' ); ?></div>
    <?php do_action( 'woocommerce_checkout_after_order_review' ); ?>
  </div>
</form>
<?php if ( false !== $lucymary_payment_priority ) { add_action( 'woocommerce_checkout_order_review', 'woocommerce_checkout_payment', $lucymary_payment_priority ); } ?>
<?php do_action( 'woocommerce_after_checkout_form', $checkout ); ?>
