"use client";

import { useEffect, useRef, useState } from "react";
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
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const lastInteraction = useRef(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden && Date.now() - lastInteraction.current >= 5000) {
        setActive((current) => (current + 1) % slides.length);
      }
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  function change(step: number) {
    lastInteraction.current = Date.now();
    setActive((current) => (current + step + slides.length) % slides.length);
  }

  return (
    <section className="brand-hero" aria-label="Destaques LucyMary">
      <div
        className="hero-slides"
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start) return;
          const touch = event.changedTouches[0];
          const deltaX = touch.clientX - start.x;
          const deltaY = touch.clientY - start.y;
          if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
          suppressClick.current = true;
          change(deltaX < 0 ? 1 : -1);
          window.setTimeout(() => { suppressClick.current = false; }, 400);
        }}
        onTouchCancel={() => { touchStart.current = null; }}
        onClickCapture={(event) => {
          if (!suppressClick.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }}
      >
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
          <button className={active === index ? "active" : ""} type="button" key={slide.desktop} aria-label={`Mostrar banner ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => { lastInteraction.current = Date.now(); setActive(index); }} />
        ))}
      </div>
    </section>
  );
}
