(() => {
  'use strict';
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const overlays = Object.fromEntries(qa('[data-lm-overlay]').map((el) => [el.dataset.lmOverlay, el]));
  let activeOverlay = null;
  let lastTrigger = null;

  function closeOverlay() {
    if (!activeOverlay) return;
    activeOverlay.classList.remove('is-open');
    activeOverlay.setAttribute('aria-hidden', 'true');
    qa('[data-lm-open]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
    document.body.classList.remove('lm-overlay-open');
    activeOverlay = null;
    lastTrigger?.focus();
  }
  function openOverlay(name, trigger) {
    closeOverlay();
    const overlay = overlays[name];
    if (!overlay) return;
    activeOverlay = overlay;
    lastTrigger = trigger;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('lm-overlay-open');
    const focusTarget = name === 'search' ? q('input[type=search]', overlay) : q('[data-lm-close]', overlay);
    window.setTimeout(() => focusTarget?.focus(), 50);
  }
  qa('[data-lm-open]').forEach((button) => button.addEventListener('click', () => openOverlay(button.dataset.lmOpen, button)));
  qa('[data-lm-close]').forEach((button) => button.addEventListener('click', closeOverlay));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeOverlay(); });
  qa('.lm-overlay').forEach((overlay) => overlay.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusables = qa('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])', overlay).filter((el) => !el.disabled && el.getClientRects().length);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }));

  const slides = qa('.lm-hero-slide');
  const dots = qa('.lm-hero-dots button');
  let slideIndex = 0, lastSlideAction = 0;
  function showSlide(index) {
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.classList.toggle('is-active', i === slideIndex); slide.setAttribute('aria-hidden', String(i !== slideIndex)); slide.tabIndex = i === slideIndex ? 0 : -1; });
    dots.forEach((dot, i) => { dot.classList.toggle('is-active', i === slideIndex); if (i === slideIndex) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current'); });
  }
  function moveSlide(step) { lastSlideAction = Date.now(); showSlide(slideIndex + step); }
  q('.lm-hero-prev')?.addEventListener('click', () => moveSlide(-1));
  q('.lm-hero-next')?.addEventListener('click', () => moveSlide(1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => { lastSlideAction = Date.now(); showSlide(i); }));
  if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.setInterval(() => { if (!document.hidden && Date.now() - lastSlideAction > 5000) showSlide(slideIndex + 1); }, 7000);
    let start = null;
    const heroTrack = q('.lm-hero-slides');
    let suppressHeroClick = false;
    heroTrack?.addEventListener('touchstart', (event) => { start = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }, { passive: true });
    heroTrack?.addEventListener('touchend', (event) => {
      if (!start) return;
      const dx = event.changedTouches[0].clientX - start.x, dy = event.changedTouches[0].clientY - start.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) { suppressHeroClick = true; moveSlide(dx < 0 ? 1 : -1); window.setTimeout(() => { suppressHeroClick = false; }, 400); }
      start = null;
    }, { passive: true });
    heroTrack?.addEventListener('click', (event) => { if (suppressHeroClick) { event.preventDefault(); event.stopPropagation(); suppressHeroClick = false; } }, true);
  }

  const collectionTrack = q('.lm-collection-track');
  if (collectionTrack) {
    const tiles = qa('.lm-collection-tile', collectionTrack);
    const indicators = q('.lm-collection-dots');
    const count = Math.max(0, tiles.length - 1);
    if (indicators) for (let i = 0; i < count; i++) { const dot = document.createElement('i'); dot.classList.toggle('is-active', i === 0); indicators.appendChild(dot); }
    function step() { return (tiles[0]?.getBoundingClientRect().width || 0) + (parseFloat(getComputedStyle(collectionTrack).gap) || 0); }
    function scrollCategory(direction) { collectionTrack.scrollBy({ left: step() * direction, behavior: 'smooth' }); }
    q('.lm-collection-prev')?.addEventListener('click', () => scrollCategory(-1));
    q('.lm-collection-next')?.addEventListener('click', () => scrollCategory(1));
    collectionTrack.addEventListener('scroll', () => { const index = Math.min(count - 1, Math.max(0, Math.round(collectionTrack.scrollLeft / step()))); qa('i', indicators).forEach((dot, i) => dot.classList.toggle('is-active', i === index)); }, { passive: true });
    let lastCollectionInteraction = 0;
    collectionTrack.addEventListener('touchstart', () => { lastCollectionInteraction = Date.now(); }, { passive: true });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) window.setInterval(() => {
      if (!window.matchMedia('(max-width: 640px)').matches || document.hidden || !collectionTrack.isConnected || Date.now() - lastCollectionInteraction < 6000) return;
      const end = collectionTrack.scrollWidth - collectionTrack.clientWidth;
      collectionTrack.scrollTo({ left: collectionTrack.scrollLeft + step() >= end - 2 ? 0 : collectionTrack.scrollLeft + step(), behavior: 'smooth' });
    }, 4200);
  }

  const searchInput = q('#lm-search-input');
  if (searchInput && typeof lucymaryTheme !== 'undefined') {
    const resultBox = q('.lm-search-results');
    const prompt = q('.lm-search-prompt');
    let timer, controller;
    function renderResults(items) {
      resultBox.replaceChildren();
      for (const item of items) {
        const link = document.createElement('a'); link.className = 'lm-search-result'; link.href = item.url;
        if (item.image) { const image = document.createElement('img'); image.src = item.image; image.alt = ''; image.loading = 'lazy'; link.appendChild(image); }
        const name = document.createElement('strong'); name.textContent = item.name; link.appendChild(name);
        const price = document.createElement('small'); price.textContent = item.price; link.appendChild(price); resultBox.appendChild(link);
      }
    }
    searchInput.addEventListener('input', () => {
      clearTimeout(timer); controller?.abort(); resultBox.replaceChildren();
      const value = searchInput.value.trim();
      prompt.textContent = value.length < 2 ? 'Digite ao menos duas letras para encontrar produtos.' : 'Buscando produtos…';
      if (value.length < 2) return;
      timer = setTimeout(async () => {
        controller = new AbortController();
        try {
          const url = new URL(lucymaryTheme.ajaxUrl); url.searchParams.set('action', 'lucymary_search'); url.searchParams.set('q', value);
          const response = await fetch(url, { signal: controller.signal, credentials: 'same-origin' });
          const data = await response.json();
          if (searchInput.value.trim() !== value) return;
          const items = data.success && Array.isArray(data.data) ? data.data : [];
          renderResults(items); prompt.textContent = items.length ? 'Produtos' : 'Nenhum produto encontrado.';
        } catch (error) { if (error.name !== 'AbortError') prompt.textContent = 'Não foi possível buscar agora.'; }
      }, 350);
    });
    q('.lm-search-form')?.addEventListener('reset', () => { clearTimeout(timer); controller?.abort(); renderResults([]); prompt.textContent = 'Digite ao menos duas letras para encontrar produtos.'; });
    q('.lm-search-submit')?.addEventListener('click', () => q('.lm-search-form')?.requestSubmit());
  }

  qa('.lm-price-slider').forEach((slider) => {
    const inputs = qa('input[type=range]', slider), fill = q('.lm-price-track span', slider), caption = q('[data-lm-price-caption]', slider.parentElement);
    const maximum = Number(slider.dataset.max) || 1;
    function update(changed) {
      let min = Number(inputs[0].value), max = Number(inputs[1].value);
      if (min > max) { if (changed === inputs[0]) min = max; else max = min; inputs[0].value = min; inputs[1].value = max; }
      fill.style.left = `${100 * min / maximum}%`; fill.style.right = `${100 * (1 - max / maximum)}%`;
      caption.textContent = `R$ ${min.toLocaleString('pt-BR')} – R$ ${max.toLocaleString('pt-BR')}`;
    }
    inputs.forEach((input) => input.addEventListener('input', () => update(input))); update();
  });

  const variationForm = q('form.variations_form');
  if (variationForm) {
    const table = q('.variations', variationForm);
    const rows = qa('tr', table).filter((row) => q('select', row));
    const insertBefore = table;
    rows.forEach((row) => {
      const select = q('select', row), label = q('label', row)?.textContent?.trim() || 'Opção';
      const options = qa('option', select).filter((option) => option.value);
      if (!options.length) return;
      const wrap = document.createElement('div'); wrap.className = 'lm-attribute-choice';
      const heading = document.createElement('strong'); heading.className = 'lm-attribute-label'; heading.textContent = label;
      const chosen = document.createElement('span'); chosen.style.cssText = 'margin-left:8px;color:var(--lm-wine);font-weight:400'; chosen.textContent = select.selectedOptions[0]?.value ? select.selectedOptions[0].textContent : '';
      heading.appendChild(chosen); wrap.appendChild(heading);
      const ring = /aro|tamanho/i.test(label) && options.length > 7;
      function choose(option) { select.value = option.value; select.dispatchEvent(new Event('change', { bubbles: true })); render(); }
      let focusIndex = Math.max(0, options.findIndex((option) => option.value === select.value));
      function render() {
        chosen.textContent = select.selectedOptions[0]?.value ? select.selectedOptions[0].textContent : '';
        if (ring) {
          focusIndex = Math.max(0, options.findIndex((option) => option.value === select.value));
          track.replaceChildren();
          for (let offset = -3; offset <= 3; offset++) {
            const option = options[(focusIndex + offset + options.length) % options.length];
            const button = document.createElement('button'); button.type = 'button'; button.textContent = option.textContent; button.disabled = option.disabled; button.setAttribute('aria-label', `Aro ${option.textContent}`); button.setAttribute('aria-pressed', String(option.value === select.value)); button.addEventListener('click', () => choose(option)); track.appendChild(button);
          }
        } else {
          buttons.replaceChildren();
          for (const option of options) { const button = document.createElement('button'); button.type = 'button'; button.textContent = option.textContent; button.disabled = option.disabled; button.setAttribute('aria-pressed', String(option.value === select.value)); button.addEventListener('click', () => choose(option)); buttons.appendChild(button); }
        }
      }
      let buttons, track;
      if (ring) {
        const selector = document.createElement('div'); selector.className = 'lm-ring-selector';
        const prev = document.createElement('button'); prev.type = 'button'; prev.textContent = '‹'; prev.setAttribute('aria-label', 'Aro anterior');
        const next = document.createElement('button'); next.type = 'button'; next.textContent = '›'; next.setAttribute('aria-label', 'Próximo aro');
        track = document.createElement('div'); track.className = 'lm-ring-track';
        function advance(direction) { for (let i = 1; i <= options.length; i++) { const option = options[(focusIndex + direction * i + options.length * 2) % options.length]; if (!option.disabled) { choose(option); break; } } }
        prev.addEventListener('click', () => advance(-1)); next.addEventListener('click', () => advance(1));
        let touchX = null; track.addEventListener('touchstart', (event) => { touchX = event.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', (event) => { if (touchX === null) return; const dx = event.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 30) advance(dx > 0 ? -1 : 1); touchX = null; }, { passive: true });
        selector.append(prev, track, next); wrap.appendChild(selector);
        const guide = document.createElement('button'); guide.type = 'button'; guide.className = 'lm-ring-guide'; guide.textContent = '♧  Tabela de medidas';
        const dialog = document.createElement('dialog'); dialog.className = 'lm-size-dialog';
        const close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', 'Fechar'); close.addEventListener('click', () => dialog.close());
        const title = document.createElement('h2'); title.textContent = 'Tabela de medidas'; const text = document.createElement('p'); text.textContent = 'A tabela oficial de aros da LucyMary será adicionada aqui em breve.';
        dialog.append(close, title, text); guide.addEventListener('click', () => dialog.showModal()); wrap.append(guide, dialog);
      } else { buttons = document.createElement('div'); buttons.className = 'lm-attribute-buttons'; wrap.appendChild(buttons); }
      insertBefore.parentNode.insertBefore(wrap, insertBefore); row.classList.add('lm-enhanced-row');
      select.addEventListener('change', () => {
        render();
        if (!ring) {
          const ringSelect = rows.map((item) => q('select', item)).find((item) => item && /aro|tamanho/i.test(q('label', item.closest('tr'))?.textContent || ''));
          if (ringSelect && !ringSelect.value) window.setTimeout(() => {
            const first = qa('option', ringSelect).find((option) => option.value && !option.disabled);
            if (first && !ringSelect.value) { ringSelect.value = first.value; ringSelect.dispatchEvent(new Event('change', { bubbles: true })); }
          }, 0);
        }
      });
      if (window.jQuery) window.jQuery(variationForm).on('woocommerce_update_variation_values', render);
      render();
    });
    if (rows.length) variationForm.classList.add('lm-variation-enhanced');
    // Keep the selected ring while changing a material; WooCommerce resolves the variation.
    const initialPrice = q('.lm-main-price')?.innerHTML;
    if (window.jQuery) window.jQuery(variationForm).on('found_variation', (_, variation) => {
      const price = q('.lm-main-price'); if (price && variation?.price_html) price.innerHTML = variation.price_html;
      const shipping = q('.lm-shipping-form'); if (shipping) shipping.dataset.variationId = variation.variation_id;
    }).on('reset_data', () => { const shipping = q('.lm-shipping-form'); if (shipping) shipping.dataset.variationId = ''; const price = q('.lm-main-price'); if (price && initialPrice) price.innerHTML = initialPrice; });
  }
  qa('.lm-product-purchase form.cart').forEach((form) => form.addEventListener('submit', (event) => {
    const button = event.submitter;
    if (button?.matches('button.single_add_to_cart_button, button.lm-buy-now')) button.classList.add('is-loading');
  }));

  qa('.lm-shipping-form').forEach((form) => form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const target = q('.lm-shipping-response', form.parentElement), button = q('button', form);
    const postcode = q('input[name=postcode]', form).value.replace(/\D/g, '');
    if (postcode.length !== 8) { target.textContent = 'Informe um CEP com 8 dígitos.'; return; }
    const productVariationForm = q('form.variations_form');
    const variation = productVariationForm ? q('input.variation_id', productVariationForm)?.value : '';
    if (productVariationForm && Number(variation) < 1) { target.textContent = 'Escolha as opções do produto antes de calcular o frete.'; return; }
    const id = variation || form.dataset.productId;
    const quantity = q('form.cart input.qty')?.value || '1';
    button.disabled = true; target.textContent = 'Calculando frete…';
    try {
      const body = new URLSearchParams({ action: 'lucymary_shipping', nonce: lucymaryTheme.shippingNonce, product_id: id, quantity, postcode });
      const response = await fetch(lucymaryTheme.ajaxUrl, { method: 'POST', body, credentials: 'same-origin' });
      const data = await response.json();
      if (!data.success) throw new Error(data.data?.message || 'Não foi possível calcular o frete.');
      target.replaceChildren();
      if (!data.data.rates.length) { target.textContent = 'Nenhuma modalidade de frete disponível para este CEP.'; return; }
      data.data.rates.forEach((rate) => { const row = document.createElement('div'), name = document.createElement('span'), cost = document.createElement('strong'); name.textContent = rate.label; cost.textContent = rate.cost; row.append(name, cost); target.appendChild(row); });
    } catch (error) { target.textContent = error.message || 'Não foi possível calcular o frete.'; }
    finally { button.disabled = false; }
  }));
})();
