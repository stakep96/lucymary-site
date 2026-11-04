<?php
/** Shared footer for the LucyMary storefront. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$about_page = get_page_by_path( 'sobre' );
$about_url = $about_page ? get_permalink( $about_page ) : home_url( '/#sobre' );
$faq_page = get_page_by_path( 'perguntas-frequentes' );
$faq_url = $faq_page ? get_permalink( $faq_page ) : home_url( '/#contato' );
$instagram_url = get_theme_mod( 'lucymary_instagram_url', '' );
$facebook_url = get_theme_mod( 'lucymary_facebook_url', '' );
$whatsapp_url = get_theme_mod( 'lucymary_whatsapp_url', 'https://wa.me/5588996839350' );
$youtube_url = get_theme_mod( 'lucymary_youtube_url', '' );
$floating_whatsapp_url = get_theme_mod( 'lucymary_whatsapp_floating_url', '' ) ?: $whatsapp_url;
$contact_email = get_theme_mod( 'lucymary_contact_email', 'davipereira@lucymary.com.br' );
$contact_phones = array(
	get_theme_mod( 'lucymary_contact_phone_1', '(88) 9 9683-9350' ),
	get_theme_mod( 'lucymary_contact_phone_2', '(88) 9 9946-1753' ),
);
$english = 'en' === lucymary_language();
$contact_hours = get_theme_mod( $english ? 'lucymary_contact_hours_en' : 'lucymary_contact_hours', $english ? "Monday to Friday: 9 am to 6 pm.\nSaturday: 9 am to 2 pm." : "Segunda a sexta: 9h às 18h.\nSábado: 9h às 14h." );
$contact_address = get_theme_mod( $english ? 'lucymary_contact_address_en' : 'lucymary_contact_address', $english ? "Rua Frei Damião, 750, Lagoa Seca,\nJuazeiro do Norte, CE, Brazil, 63040-300." : "Rua Frei Damião, nº 750, Lagoa Seca,\nJuazeiro do Norte – CE, CEP 63040-300." );
?>
</main>
<footer class="lm-footer" id="sobre">
  <div class="lm-footer-primary">
    <div class="lm-shell lm-footer-grid">
      <div class="lm-footer-brand"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="LucyMary"><img src="<?php echo esc_url( lucymary_asset( 'brand/logo-creme.png' ) ); ?>" alt="LucyMary" width="210" height="87" loading="lazy"></a></div>
      <nav class="lm-footer-column" aria-label="<?php esc_attr_e( 'Institucional', 'lucymary' ); ?>">
        <h2><?php esc_html_e( 'Institucional', 'lucymary' ); ?></h2>
        <a href="<?php echo esc_url( $about_url ); ?>"><?php esc_html_e( 'Sobre nós', 'lucymary' ); ?></a>
        <a href="<?php echo esc_url( home_url( '/#lojas' ) ); ?>"><?php esc_html_e( 'Nossas lojas', 'lucymary' ); ?></a>
        <a href="<?php echo esc_url( $faq_url ); ?>"><?php esc_html_e( 'Perguntas frequentes', 'lucymary' ); ?></a>
      </nav>
      <div class="lm-footer-column lm-footer-contact" id="contato">
        <h2><?php esc_html_e( 'Fale conosco', 'lucymary' ); ?></h2>
        <?php if ( $contact_email ) : ?><a href="mailto:<?php echo esc_attr( $contact_email ); ?>"><?php echo lucymary_icon( 'mail', 17 ); ?> <span><?php echo esc_html( $contact_email ); ?></span></a><?php endif; ?>
        <?php foreach ( $contact_phones as $phone ) : ?>
          <?php $phone_digits = preg_replace( '/\D+/', '', $phone ); ?>
          <?php if ( $phone_digits ) : ?><a href="tel:+<?php echo esc_attr( str_starts_with( $phone_digits, '55' ) ? $phone_digits : '55' . $phone_digits ); ?>"><?php echo lucymary_icon( 'phone', 17 ); ?> <span><?php echo esc_html( $phone ); ?></span></a><?php endif; ?>
        <?php endforeach; ?>
        <?php if ( $contact_hours ) : ?><p><?php echo lucymary_icon( 'clock', 17 ); ?> <span><?php esc_html_e( 'Horário de atendimento:', 'lucymary' ); ?><br><?php echo nl2br( esc_html( $contact_hours ) ); ?></span></p><?php endif; ?>
        <?php if ( $contact_address ) : ?><address id="lojas"><?php echo lucymary_icon( 'pin', 17 ); ?> <span><?php echo nl2br( esc_html( $contact_address ) ); ?></span></address><?php endif; ?>
      </div>
      <div class="lm-footer-column lm-footer-social">
        <h2><?php esc_html_e( 'Nossas redes sociais', 'lucymary' ); ?></h2>
        <div class="lm-footer-social-links">
          <?php if ( $instagram_url ) : ?><a href="<?php echo esc_url( $instagram_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><?php echo lucymary_icon( 'instagram', 22 ); ?></a><?php endif; ?>
          <?php if ( $facebook_url ) : ?><a href="<?php echo esc_url( $facebook_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><?php echo lucymary_icon( 'facebook', 22 ); ?></a><?php endif; ?>
          <?php if ( $whatsapp_url ) : ?><a href="<?php echo esc_url( $whatsapp_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><?php echo lucymary_icon( 'whatsapp', 23 ); ?></a><?php endif; ?>
          <?php if ( $youtube_url ) : ?><a href="<?php echo esc_url( $youtube_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><?php echo lucymary_icon( 'youtube', 23 ); ?></a><?php endif; ?>
        </div>
      </div>
    </div>
  </div>
  <div class="lm-footer-secondary">
    <div class="lm-shell">
      <div class="lm-footer-trust">
        <div><h2><?php esc_html_e( 'Formas de pagamento', 'lucymary' ); ?></h2><img src="<?php echo esc_url( lucymary_asset( 'footer/payment-methods.webp' ) ); ?>" alt="<?php esc_attr_e( 'Pix, boleto e bandeiras de cartão', 'lucymary' ); ?>" width="399" height="35" loading="lazy"></div>
        <div><h2><?php esc_html_e( 'Formas de entrega', 'lucymary' ); ?></h2><img src="<?php echo esc_url( lucymary_asset( 'footer/correios.webp' ) ); ?>" alt="Correios" width="117" height="45" loading="lazy"></div>
        <div><h2><?php esc_html_e( 'Loja segura', 'lucymary' ); ?></h2><div class="lm-footer-security"><img src="<?php echo esc_url( lucymary_asset( 'footer/google-safe-browsing.webp' ) ); ?>" alt="Google Safe Browsing" width="117" height="45" loading="lazy"><img src="<?php echo esc_url( lucymary_asset( 'footer/google-consumer-reviews.webp' ) ); ?>" alt="<?php esc_attr_e( 'Google Avaliações do Consumidor', 'lucymary' ); ?>" width="150" height="29" loading="lazy"></div></div>
      </div>
      <div class="lm-footer-legal">
        <p><?php esc_html_e( 'Os preços e as condições de pagamento podem ser alterados sem aviso prévio. As imagens das joias e dos demais produtos são ampliadas para melhor visualização e não correspondem ao tamanho real. As vendas estão sujeitas à análise e confirmação de dados.', 'lucymary' ); ?> <?php esc_html_e( 'As fotos veiculadas neste site, bem como a marca, são de propriedade da LucyMary. É proibida sua reprodução, total ou parcial.', 'lucymary' ); ?></p>
        <p><?php esc_html_e( 'Copyright © LucyMary. Todos os direitos reservados.', 'lucymary' ); ?><br><?php esc_html_e( 'CNPJ 36.680.582/0001-41 – Rua Frei Damião, nº 750, Lagoa Seca, Juazeiro do Norte – CE, CEP 63040-300.', 'lucymary' ); ?></p>
      </div>
    </div>
  </div>
</footer>
<button class="lm-back-to-top" type="button" aria-label="<?php esc_attr_e( 'Voltar ao topo', 'lucymary' ); ?>" title="<?php esc_attr_e( 'Voltar ao topo', 'lucymary' ); ?>"><?php echo lucymary_icon( 'chevron-up', 22 ); ?></button>
<?php if ( $floating_whatsapp_url ) : ?>
<div class="lm-whatsapp-widget">
  <div class="lm-whatsapp-popover" id="lm-whatsapp-popover" role="dialog" aria-modal="false" aria-label="<?php esc_attr_e( 'Converse com a LucyMary', 'lucymary' ); ?>" aria-hidden="true">
    <div class="lm-whatsapp-popover-head">
      <span class="lm-whatsapp-avatar"><img src="<?php echo esc_url( lucymary_asset( 'brand/logo-creme.png' ) ); ?>" alt="" width="74" height="34"><i aria-hidden="true"></i></span>
      <span class="lm-whatsapp-popover-brand"><strong>Lucymary</strong><small><?php esc_html_e( 'Comercial Lucymary Joalheira', 'lucymary' ); ?></small></span>
      <button class="lm-whatsapp-close" type="button" aria-label="<?php esc_attr_e( 'Fechar conversa', 'lucymary' ); ?>"><?php echo lucymary_icon( 'close', 18 ); ?></button>
    </div>
    <div class="lm-whatsapp-popover-body"><div class="lm-whatsapp-message"><strong>Lucymary</strong><span><?php esc_html_e( 'Olá, como podemos te ajudar?', 'lucymary' ); ?></span><time class="lm-whatsapp-time"></time></div></div>
    <div class="lm-whatsapp-popover-foot"><a href="<?php echo esc_url( $floating_whatsapp_url ); ?>" target="_blank" rel="noopener noreferrer"><?php echo lucymary_icon( 'whatsapp', 24 ); ?><?php esc_html_e( 'Falar no WhatsApp', 'lucymary' ); ?></a></div>
  </div>
  <button class="lm-whatsapp-toggle" type="button" aria-controls="lm-whatsapp-popover" aria-expanded="false" aria-label="<?php esc_attr_e( 'Abrir conversa no WhatsApp', 'lucymary' ); ?>"><?php echo lucymary_icon( 'whatsapp', 28 ); ?><span class="lm-whatsapp-unread" aria-hidden="true"></span></button>
</div>
<?php endif; ?>
<?php wp_footer(); ?>
</body></html>
