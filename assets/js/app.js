// Lovelane Meleara - JS básico de carrito y utilidades compartidas
(function () {
  const CART_KEY = 'lovelane.cart.v1';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  }
  function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  function notify(msg) {
    if (!msg) return;
    const n = document.createElement('div');
    n.textContent = msg;
    n.style.position = 'fixed';
    n.style.right = '18px';
    n.style.top = '18px';
    n.style.zIndex = '1000';
    n.style.background = 'rgba(139,30,63,.96)';
    n.style.color = '#fff';
    n.style.padding = '10px 14px';
    n.style.borderRadius = '12px';
    n.style.boxShadow = '0 8px 26px rgba(139,30,63,.35)';
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1800);
  }

  window.addToCart = function (name, price, qty = 1) {
    const cart = getCart();
    const idx = cart.findIndex(i => i.name === name);
    if (idx >= 0) {
      cart[idx].qty += qty;
    } else {
      cart.push({ name, price, qty });
    }
    saveCart(cart);
    notify('Agregado al carrito');
    updateCartBadge();
  };

  window.updateCartBadge = function () {
    const cart = getCart();
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    let el = document.getElementById('cart-badge');
    if (!el) return;
    el.textContent = totalQty > 0 ? String(totalQty) : '';
    el.style.display = totalQty > 0 ? 'inline-flex' : 'none';
  };

  window.getCartItems = getCart;
  window.saveCartItems = saveCart;

  // Inicializar badge y user nav en carga
  function ensureAuthLoaded(cb){
    if (window.Auth && typeof window.Auth.getCurrentUser === 'function') { cb(); return; }
    const s = document.createElement('script');
    s.src = 'assets/js/auth.js';
    s.async = true;
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }
  function renderUserNav(){
    const nav = document.querySelector('nav.nav');
    if (!nav) return;

    // Limpiar contenido actual y construir grupos
    nav.innerHTML = '';

    const groups = document.createElement('div');
    groups.className = 'nav__groups';

    // Grupo Inicio (dropdown por click)
    const gInicio = document.createElement('div');
    gInicio.className = 'nav-group';
    gInicio.innerHTML = `
      <button type="button" class="nav-group__btn" aria-haspopup="true" aria-expanded="false">Inicio</button>
      <div class="nav-dropdown" role="menu">
        <a href="index.html" role="menuitem">Inicio</a>
        <a href="nosotros.html" role="menuitem">Nosotros</a>
        <a href="contacto.html" role="menuitem">Ubicación y Contacto</a>
        <a href="blog.html" role="menuitem">Blog</a>
        <a href="pagos.html" role="menuitem">Pagos</a>
      </div>`;
    gInicio.querySelector('.nav-group__btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const open = gInicio.classList.toggle('open');
      gInicio.querySelector('.nav-group__btn').setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Enlaces directos
    // Botón especial Cotización
    const linkCot = document.createElement('a');
    linkCot.href = 'cotizacion.html';
    linkCot.textContent = 'Cotización';
    linkCot.className = 'btn btn--gold';

    // Grupo Catálogo (dropdown por click)
    const gCat = document.createElement('div');
    gCat.className = 'nav-group';
    gCat.innerHTML = `
      <button type="button" class="nav-group__btn" aria-haspopup="true" aria-expanded="false">Catálogo</button>
      <div class="nav-dropdown" role="menu">
        <a href="catalogo.html" role="menuitem">Ver todo</a>
        <a href="catalogo.html#flores" role="menuitem">Florería</a>
        <a href="catalogo.html#lamparas" role="menuitem">Lámparas y Recuerdos</a>
        <a href="catalogo.html#paquetes" role="menuitem">Paquetes Especiales</a>
      </div>`;
    gCat.querySelector('.nav-group__btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const open = gCat.classList.toggle('open');
      gCat.querySelector('.nav-group__btn').setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    groups.appendChild(gInicio);
    groups.appendChild(linkCot);
    groups.appendChild(gCat);

    // Contenedor de acciones a la derecha
    const rightCta = document.createElement('div');
    rightCta.className = 'nav-cta';
    const user = (window.Auth && Auth.getCurrentUser) ? Auth.getCurrentUser() : null;
    if (user) {
      // Grupo de usuario con dropdown y acción de cerrar sesión
      const userGroup = document.createElement('div');
      userGroup.className = 'nav-group';
      const userLink = document.createElement('a');
      userLink.href = 'ajustes-cuenta.html';
      userLink.textContent = 'Mi Perfil';
      userLink.className = 'btn btn--light';
      const caretBtn = document.createElement('button');
      caretBtn.type = 'button';
      caretBtn.className = 'nav-group__btn';
      caretBtn.setAttribute('aria-haspopup','true');
      caretBtn.setAttribute('aria-expanded','false');
      caretBtn.textContent = '▾';
      const drop = document.createElement('div');
      drop.className = 'nav-dropdown';
      const logoutA = document.createElement('a');
      logoutA.href = '#';
      logoutA.textContent = 'Cerrar sesión';
      drop.appendChild(logoutA);
      userGroup.appendChild(userLink);
      userGroup.appendChild(caretBtn);
      userGroup.appendChild(drop);
      caretBtn.addEventListener('click', (e)=>{ e.stopPropagation(); const open = userGroup.classList.toggle('open'); caretBtn.setAttribute('aria-expanded', open?'true':'false'); });
      logoutA.addEventListener('click', (e)=>{ e.preventDefault(); if (window.Auth && Auth.logout) { Auth.logout(); } window.location.href = 'cuenta.html'; });
      rightCta.appendChild(userGroup);
    } else {
      const authLink = document.createElement('a');
      authLink.href = 'cuenta.html';
      authLink.textContent = 'Entrar / Registrarse';
      authLink.className = 'btn btn--light';
      rightCta.appendChild(authLink);
    }

    // Botón carrito (si existe en la página original)
    let cartLink = document.querySelector('a[href$="carrito.html"]');
    if (!cartLink) {
      cartLink = document.createElement('a');
      cartLink.href = 'carrito.html';
      cartLink.className = 'btn btn--light';
      cartLink.innerHTML = '🛒 <span id="cart-badge" class="nav__badge"></span>';
    } else {
      // Clonar para no perder badge si ya existe
      const cl = cartLink.cloneNode(true);
      cartLink = cl;
    }
    rightCta.appendChild(cartLink);

    nav.appendChild(groups);
    nav.appendChild(rightCta);

    // Cerrar dropdowns al click fuera
    document.addEventListener('click', () => {
      gInicio.classList.remove('open');
      const giBtn = gInicio.querySelector('.nav-group__btn');
      if (giBtn) giBtn.setAttribute('aria-expanded','false');
      gCat.classList.remove('open');
      const gcBtn = gCat.querySelector('.nav-group__btn');
      if (gcBtn) gcBtn.setAttribute('aria-expanded','false');
      const userGrp = nav.querySelector('.nav-cta .nav-group');
      if (userGrp) {
        userGrp.classList.remove('open');
        const caretb = userGrp.querySelector('.nav-group__btn');
        if (caretb) caretb.setAttribute('aria-expanded','false');
      }
    });
  }

  // Render un footer unificado en todas las páginas
  function renderFooter(){
    const foot = document.querySelector('footer.footer');
    if (!foot) return;
    const y = new Date().getFullYear();
    foot.innerHTML = `
      <div class="container footer__grid">
        <div>
          <div class="footer__brand">
            <img class="footer__img" src="imagenes/logo.png" alt="Lovelane Meleara" />
            <div>
              <strong>Lovelane Meleara</strong>
              <p class="m-0">Detalles con flores y luz</p>
            </div>
          </div>
          <p class="footer__copy">© ${y} Lovelane Meleara. Todos los derechos reservados.</p>
        </div>
        <div>
          <h4>Enlaces</h4>
          <ul>
            <li><a href="catalogo.html">Catálogo</a></li>
            <li><a href="cotizacion.html">Cotización</a></li>
            <li><a href="pagos.html">Métodos de Pago</a></li>
            <li><a href="contacto.html">Contacto</a></li>
            <li><a href="nosotros.html">Nosotros</a></li>
            <li><a href="blog.html">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4>Contacto</h4>
          <p class="m-0">WhatsApp: <a href="https://wa.me/527226128347" target="_blank" rel="noopener">+52 722 612 8347</a></p>
<p class="m-0">Correo: <a href="mailto:rodolfoalexis45@gmail.com,danielamore1151@gmail.com?subject=🌸%20Nuevo%20Cliente%20-%20Lovelane%20Meleara&body=👤%20Nombre%20del%20cliente:%0D%0A📞%20Teléfono:%0D%0A📧%20Correo:%0D%0A🎁%20Producto/Servicio%20de%20interés:%0D%0A💰%20Precio%20cotizado:%0D%0A💳%20Anticipo%20(%25):%0D%0A📅%20Fecha%20de%20entrega:%0D%0A📝%20Notas%20adicionales:%0D%0A%0D%0AGracias,%20quedo%20atento%20a%20confirmación%20🌟">✉️ Enviar Presentación de Cliente</a></p>
          <p class="m-0">Pagos: En tarjeta, Depositos, MercadoPago y Transferencia</p>
        </div>
      </div>`;
  }
  function setupUserNav(){
    renderUserNav();
    if (!window.Auth) ensureAuthLoaded(renderUserNav);
  }
  window.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    setupUserNav();
    renderFooter();
  });
})();
