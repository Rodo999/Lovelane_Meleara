// Configuración de raíz de imágenes para todo el sitio
// Cómo usarlo:
// 1) Ajusta IMG_ROOT a tu carpeta base de imágenes (por defecto 'imagenes/')
// 2) Incluye este archivo en tus páginas ANTES de otros scripts que creen <img> dinámicamente
//    <script src="assets/js/images.config.js"></script>
// 3) Usa rutas relativas simples para tus imágenes (p.ej. 'productos/ramo.jpg')
//    Este script las convertirá a `${IMG_ROOT}/productos/ramo.jpg` automáticamente.
// 4) Si necesitas cambiar la raíz en runtime, llama a setImageRoot('nueva/carpeta/')
(function(){
  // Raíz de imágenes (EDITA AQUÍ)
  window.IMG_ROOT = 'imagenes/';

  function trimSlashesStart(s){ return String(s||'').replace(/^\/+/, ''); }
  function trimSlashesEnd(s){ return String(s||'').replace(/\/+$/, ''); }
  function isAbsolute(src){
    if (!src) return false;
    return /^(?:[a-z]+:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('/');
  }

  // Resolver ruta de imagen con base en IMG_ROOT
  window.resolveImg = function(src){
    if (!src) return src;
    const root = window.IMG_ROOT || '';
    if (!root) return src;
    if (isAbsolute(src)) return src;
    if (src.startsWith(trimSlashesEnd(root) + '/')) return src; // ya contiene la raíz
    return trimSlashesEnd(root) + '/' + trimSlashesStart(src);
  };

  // Aplicar resolución a un <img>
  function applyToImg(img){
    if (!(img instanceof HTMLImageElement)) return;
    const raw = img.getAttribute('src');
    if (!raw) return;
    const resolved = window.resolveImg(raw);
    if (resolved && resolved !== raw) {
      img.setAttribute('src', resolved);
    }
  }

  // Reprocesar todas las imágenes del documento
  window.reprocessImages = function(){
    document.querySelectorAll('img[src]').forEach(applyToImg);
  };

  // Cambiar raíz en runtime y re-procesar
  window.setImageRoot = function(newRoot){
    window.IMG_ROOT = String(newRoot || '');
    window.reprocessImages();
  };

  // Observar cambios dinámicos en el DOM para ajustar imágenes insertadas después
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        m.addedNodes.forEach(node => {
          if (node instanceof HTMLImageElement) applyToImg(node);
          if (node.querySelectorAll) node.querySelectorAll('img[src]').forEach(applyToImg);
        });
      }
      if (m.type === 'attributes' && m.target instanceof HTMLImageElement && m.attributeName === 'src') {
        applyToImg(m.target);
      }
    }
  });

  // Inicializar en carga
  window.addEventListener('DOMContentLoaded', () => {
    try { window.reprocessImages(); } catch {}
    try { mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] }); } catch {}
  });
})();
