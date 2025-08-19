// Render dinámico de catálogo e inicio desde assets/data/products.json
(async function() {
  const DATA_URL = 'assets/data/products.json';
  let data;
  try {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    data = await res.json();
  } catch (e) {
    console.error('No se pudo cargar el catálogo', e);
    return;
  }
  const products = data.products || [];

  function fmtCurrency(v) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v); }

  function productCard(p) {
    const action = p.customLink
      ? `<a class="btn btn--gold" href="${p.link || 'cotizacion.html'}" ${p.link?.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>Cotizar</a>`
      : `<button class="btn btn--primary" data-add="${p.id}">Agregar</button>`;
    return `
    <article class="card">
      <div class="card__media">
        <img src="${p.image}" alt="${p.name}" />
        ${p.badge ? `<span class="card__badge">${p.badge}</span>` : ''}
      </div>
      <div class="card__body">
        <h3 class="card__title">${p.name}</h3>
        <p class="card__desc">${p.desc}</p>
        <div class="card__actions">
          <span class="card__price">${fmtCurrency(p.price)}</span>
          ${action}
        </div>
      </div>
    </article>`;
  }

  function mountGrid(el, items) {
    if (!el) return;
    el.innerHTML = items.map(productCard).join('');
    el.querySelectorAll('[data-add]').forEach(btn => {
      const id = btn.getAttribute('data-add');
      const item = products.find(p => p.id === id);
      btn.addEventListener('click', () => addToCart(item.name, item.price, 1));
    });
  }

  // Inicio: destacados
  const featuredEl = document.getElementById('featured-products');
  if (featuredEl) {
    const featured = products.filter(p => p.featured).slice(0, 6);
    mountGrid(featuredEl, featured);
  }

  // Catálogo por categorías
  const floresEl = document.getElementById('cat-flores');
  const lamparasEl = document.getElementById('cat-lamparas');
  const paquetesEl = document.getElementById('cat-paquetes');
  if (floresEl || lamparasEl || paquetesEl) {
    mountGrid(floresEl, products.filter(p => p.category === 'flores'));
    mountGrid(lamparasEl, products.filter(p => p.category === 'lamparas'));
    mountGrid(paquetesEl, products.filter(p => p.category === 'paquetes'));
  }
})();
