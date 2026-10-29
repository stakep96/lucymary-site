import Image from "next/image";
import Link from "next/link";
import { PhoneIcon, PinIcon, UserIcon } from "@/components/header-icons";
import { CartDrawer } from "@/components/cart-drawer";
import { HeaderSearch } from "@/components/header-search";
import { MobileMenu } from "@/components/mobile-menu";
import { HEADER_CATEGORY_ORDER } from "@/lib/brand/categories";
import { getCategories, isStoreConfigured } from "@/lib/woocommerce/store-api";
import type { StoreCategory } from "@/lib/woocommerce/types";

export async function SiteHeader() {
  let categories: StoreCategory[] = [];
  if (isStoreConfigured()) {
    try {
      categories = await getCategories(true);
    } catch {
      // A identidade e a navegação básica continuam disponíveis se a loja falhar.
    }
  }
  const navCategories = HEADER_CATEGORY_ORDER
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is StoreCategory => Boolean(category));

  return (
    <header className="site-header">
      <div className="shell header-main">
        <nav className="header-institutional" aria-label="Links institucionais">
          <Link href="/#sobre"><span className="letter-mark" aria-hidden="true">L</span> Sobre</Link>
          <Link href="/#lojas"><PinIcon /> Lojas</Link>
          <Link href="/#contato"><PhoneIcon /> Contato</Link>
        </nav>

        <MobileMenu categories={navCategories} />

        <Link className="header-logo" href="/" aria-label="LucyMary, início">
          <Image src="/brand/logo-vinho.png" alt="LucyMary" width={220} height={91} priority />
        </Link>

        <div className="header-actions">
          <HeaderSearch />
          <span className="header-action-pending" title="Área do cliente em preparação" aria-label="Área do cliente em preparação"><UserIcon /></span>
          <CartDrawer />
        </div>
        <div className="mobile-header-actions">
          <HeaderSearch mobile />
          <CartDrawer mobile />
        </div>
      </div>
      <nav className="category-nav shell" aria-label="Categorias principais">
        {navCategories.map((category) => (
          <Link href={`/categoria/${encodeURIComponent(category.slug)}`} key={category.id}>{category.name}</Link>
        ))}
        <Link href="/produtos">Todos</Link>
      </nav>
    </header>
  );
}
