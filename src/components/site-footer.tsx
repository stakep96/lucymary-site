import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="sobre">
      <div className="shell footer-main">
        <div className="footer-identity">
          <Link href="/" aria-label="LucyMary, início"><Image src="/brand/logo-creme.png" alt="LucyMary" width={210} height={87} /></Link>
          <p>Luxo para quem é livre para brilhar.</p>
        </div>
        <div className="footer-column">
          <h2>Institucional</h2>
          <Link href="/produtos">Todos os produtos</Link>
          <Link href="/#colecoes">Categorias</Link>
          <Link href="/#lojas">Nossas lojas</Link>
        </div>
        <div className="footer-column" id="contato">
          <h2>Fale conosco</h2>
          <a href="mailto:davipereira@lucymary.com.br">davipereira@lucymary.com.br</a>
          <a href="tel:+5588996839350">(88) 9 9683-9350</a>
          <a href="tel:+5588999461753">(88) 9 9946-1753</a>
        </div>
        <div className="footer-column" id="lojas">
          <h2>Nossa loja</h2>
          <p>Rua Frei Damião, nº 750, Lagoa Seca,<br />Juazeiro do Norte – CE, CEP 63040-300.</p>
          <p>Segunda a sexta: 9h às 18h.<br />Sábado: 9h às 14h.</p>
        </div>
      </div>
      <div className="footer-bottom"><div className="shell">As imagens das joias são ampliadas para melhor visualização e não correspondem ao tamanho real.</div></div>
    </footer>
  );
}
