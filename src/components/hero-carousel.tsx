"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    desktop: "/brand/banner-casais.png",
    mobile: "/brand/banner-mobile.png",
    alt: "Noivados para sempre, sim. Confira as alianças LucyMary.",
    href: "/categoria/aliancas",
  },
  {
    desktop: "/brand/banner-relogios.png",
    mobile: "/brand/banner-relogios-mobile.png",
    alt: "Relógios exclusivos LucyMary. Confira a coleção.",
    href: "/categoria/relogios",
  },
  {
    desktop: "/brand/banner-b2b.png",
    mobile: "/brand/banner-b2b-mobile.png",
    alt: "Condições exclusivas para lojistas em compras B2B.",
    href: "/#contato",
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  function change(step: number) {
    setActive((current) => (current + step + slides.length) % slides.length);
  }

  return (
    <section className="brand-hero" aria-label="Destaques LucyMary">
      <div className="hero-slides">
        {slides.map((slide, index) => (
          <Link className={`hero-slide${active === index ? " active" : ""}`} href={slide.href} key={slide.desktop} aria-hidden={active !== index} tabIndex={active === index ? 0 : -1}>
            <picture>
              <source media="(max-width: 640px)" srcSet={slide.mobile} />
              <img src={slide.desktop} alt={slide.alt} width="1600" height="286" loading={index === 0 ? "eager" : "lazy"} />
            </picture>
          </Link>
        ))}
        <button className="hero-arrow hero-arrow-prev" type="button" aria-label="Banner anterior" onClick={() => change(-1)}>‹</button>
        <button className="hero-arrow hero-arrow-next" type="button" aria-label="Próximo banner" onClick={() => change(1)}>›</button>
      </div>
      <div className="hero-dots" aria-label="Escolher banner">
        {slides.map((slide, index) => (
          <button className={active === index ? "active" : ""} type="button" key={slide.desktop} aria-label={`Mostrar banner ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => setActive(index)} />
        ))}
      </div>
    </section>
  );
}
