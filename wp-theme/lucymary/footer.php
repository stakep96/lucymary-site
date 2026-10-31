<?php
/** Shared footer for the LucyMary storefront. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$about_page = get_page_by_path( 'sobre' );
$about_url = $about_page ? get_permalink( $about_page ) : home_url( '/#sobre' );
$faq_page = get_page_by_path( 'perguntas-frequentes' );
$faq_url = $faq_page ? get_permalink( $faq_page ) : home_url( '/#contato' );
$instagram_url = get_theme_mod( 'lucymary_instagram_url', '' );
$facebook_url = get_theme_mod( 'lucymary_facebook_url', '' );
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
        <a href="mailto:davipereira@lucymary.com.br"><?php echo lucymary_icon( 'mail', 17 ); ?> <span>davipereira@lucymary.com.br</span></a>
        <a href="tel:+5588996839350"><?php echo lucymary_icon( 'phone', 17 ); ?> <span>(88) 9 9683-9350</span></a>
        <a href="tel:+5588999461753"><?php echo lucymary_icon( 'phone', 17 ); ?> <span>(88) 9 9946-1753</span></a>
        <p><?php echo lucymary_icon( 'clock', 17 ); ?> <span><?php esc_html_e( 'Horário de atendimento:', 'lucymary' ); ?><br><?php esc_html_e( 'Segunda a sexta: 9h às 18h.', 'lucymary' ); ?><br><?php esc_html_e( 'Sábado: 9h às 14h.', 'lucymary' ); ?></span></p>
        <address id="lojas"><?php echo lucymary_icon( 'pin', 17 ); ?> <span><?php esc_html_e( 'Rua Frei Damião, nº 750, Lagoa Seca,', 'lucymary' ); ?><br><?php esc_html_e( 'Juazeiro do Norte – CE, CEP 63040-300.', 'lucymary' ); ?></span></address>
      </div>
      <div class="lm-footer-column lm-footer-social">
        <h2><?php esc_html_e( 'Nossas redes sociais', 'lucymary' ); ?></h2>
        <div class="lm-footer-social-links">
          <?php if ( $instagram_url ) : ?><a href="<?php echo esc_url( $instagram_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><?php echo lucymary_icon( 'instagram', 22 ); ?></a><?php endif; ?>
          <?php if ( $facebook_url ) : ?><a href="<?php echo esc_url( $facebook_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><?php echo lucymary_icon( 'facebook', 22 ); ?></a><?php endif; ?>
          <a href="https://wa.me/5588996839350" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><?php echo lucymary_icon( 'whatsapp', 23 ); ?></a>
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
<?php wp_footer(); ?>
</body></html>
