/* EVEX Crafts: shop, menu, WhatsApp ordering (shared by every page) */
(function () {
  const { WHATSAPP, SITE_URL, PRODUCTS } = window.EVEX;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const intro = $('#intro'), hdr = $('#hdr'), floatWa = $('#floatWa');
  const wa = text => 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
  const orderLink = p => wa("Hello EVEX Crafts, I'd like to order the " + p.n + '. Please share the available sizes and the price.\n\n' + SITE_URL + 'p/' + p.i + '.html');
  $$('.js-wa').forEach(a => { a.href = wa("Hello EVEX Crafts, I'd like to place an order."); });
  if ($('#waText')) $('#waText').textContent = '+' + WHATSAPP;
  if ($('#yr')) $('#yr').textContent = new Date().getFullYear();

  const WA_ICON = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.2.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z"/></svg>';
  function addCards(grid, list) {
    list.forEach((p, k) => {
      const el = document.createElement('article');
      el.className = 'card rv'; el.dataset.c = p.c; el.style.setProperty('--d', (k % 4) * 0.06 + 's');
      el.innerHTML = `<div class="ph" data-full="img/${p.i}.jpg"><img src="img/${p.i}.jpg" alt="${p.n}" loading="lazy"><span class="tagc">${p.c}</span></div>
        <div class="info"><h3>${p.n}</h3><p class="note">${p.d}</p>
        <a class="buy" href="${orderLink(p)}" target="_blank" rel="noopener">${WA_ICON}Order on WhatsApp</a></div>`;
      grid.appendChild(el);
    });
  }
  const grid = $('#grid'), featured = $('#featured');
  if (grid) addCards(grid, PRODUCTS);
  if (featured) addCards(featured, PRODUCTS.filter(p => p.f));
  const chips = $('#chips');
  if (chips) chips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip').forEach(c => c.classList.toggle('on', c === b));
    const f = b.dataset.f.replace('&amp;', '&');
    $$('#grid .card').forEach(c => c.classList.toggle('hide', f !== 'all' && c.dataset.c !== f));
  });
  if ($('#count')) $('#count').textContent = PRODUCTS.length;

  // picture viewer
  const lb = $('#lightbox'), lbImg = lb && lb.querySelector('img');
  function openLb(e) {
    const ph = e.target.closest('.ph'); if (!ph) return;
    lbImg.src = ph.dataset.full; lbImg.alt = ph.querySelector('img').alt; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
  }
  if (lb) { [grid, featured].forEach(g => g && g.addEventListener('click', openLb)); lb.addEventListener('click', () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); }); }

  // header + floating WhatsApp (on the home page once the intro is behind us; always on other pages)
  function onScroll() {
    const end = intro ? intro.offsetHeight - innerHeight * 0.5 : -1;
    if (hdr) hdr.classList.toggle('solid', !intro || scrollY > end);
    if (floatWa) floatWa.classList.toggle('show', !intro ? scrollY > 200 : scrollY > end + innerHeight * 0.4);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // menu
  const burger = $('#burger'), drawer = $('#drawer');
  function setMenu(open) {
    if (!burger) return;
    burger.classList.toggle('open', open); drawer.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open); drawer.setAttribute('aria-hidden', !open); document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) burger.addEventListener('click', () => setMenu(!drawer.classList.contains('open')));
  addEventListener('keydown', e => { if (e.key === 'Escape') { if (lb) lb.classList.remove('open'); setMenu(false); } });

  // in-page links (jump instantly when the target is far away, because the intro lies in between)
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id === '#') { e.preventDefault(); return; }
    const t = id === '#top' ? document.body : $(id); if (!t) return;
    e.preventDefault(); setMenu(false);
    const top = id === '#top' ? 0 : t.getBoundingClientRect().top + scrollY - 64;
    window.scrollTo({ top, behavior: Math.abs(top - scrollY) > innerHeight * 3 ? 'auto' : 'smooth' });
  }));

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.1 });
  $$('.rv').forEach(el => io.observe(el));
})();
