# Inventario de Imágenes — Lovelane Meleara

Este documento lista las imágenes actuales del proyecto, su ubicación y un nombre sugerido para reemplazarlas dentro de la carpeta /imagenes. Puedes descargar tus fotos y guardarlas con los nombres sugeridos para mantener el proyecto organizado.

Recomendación: usar assets/js/images.config.js para centralizar la raíz de imágenes. Si incluyes en cada página:

<script src="assets/js/images.config.js"></script>

Puedes cambiar la raíz en tiempo real con:

setImageRoot('imagenes/');

Y usar rutas relativas (por ejemplo productos/rosas_12.jpg) en lugar de URLs largas.

---

## 1) Logo y Favicon

- Archivo actual: imagenes/logo.png
- Usos:
  - Navbar (todas las páginas)
  - Footer (algunas páginas)
  - Favicon (index.html)
- Sugerencia: Sustituir logo.png por tu archivo final (mismo nombre).

---

## 2) Fondo del Hero (portada)

- Ubicación: assets/css/styles.css (clase .hero)
- URL actual:
  - https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop
- Sugerido en /imagenes:
  - hero.jpg
- Cómo cambiar: abre assets/css/styles.css y reemplaza la URL en .hero por url('imagenes/hero.jpg').

---

## 3) Inicio — Promoción de temporada (imagen)

- Página: index.html
- URL actual:
  - https://images.unsplash.com/photo-1502989642968-94fbdc9eace4?q=80&w=1400&auto=format&fit=crop
- Sugerido en /imagenes:
  - promo_temporada.jpg
- Cómo cambiar: edita index.html y reemplaza el src de la imagen por imagenes/promo_temporada.jpg.

---

## 4) Catálogo (render dinámico desde assets/data/products.json)

Edita assets/data/products.json y reemplaza los campos image por rutas locales dentro de /imagenes. Nombres sugeridos:

- flores-personalizadas
  - URL actual: https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/productos/flores_personalizadas.jpg

- ramo-basico (12 rosas + girasol)
  - URL actual: https://images.unsplash.com/photo-1529634850-1084f7a04f0c?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/productos/ramo_basico.jpg

- ramo-premium (24 rosas + moño + tarjeta)
  - URL actual: https://images.unsplash.com/photo-1491557345352-5929e343eb89?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/productos/ramo_premium.jpg

- arreglo-lujo (50 rosas + 3 girasoles + caja de lujo)
  - URL actual: https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/productos/arreglo_lujo.jpg

- lampara-tulipanes-infinitos
  - URL actual: https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/productos/lampara_tulipanes_infinitos.jpg

- rosas-12
  - URL actual: https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/productos/rosas_12.jpg

- rosas-24
  - URL actual: https://images.unsplash.com/photo-1528795259021-d8c86e14354c?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/productos/rosas_24.jpg

- rosas-50
  - URL actual: https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/productos/rosas_50.jpg

- rosas-100
  - URL actual: https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/productos/rosas_100.jpg

---

## 5) Nosotros

- Sección 1 (imagen de trabajo)
  - Página: nosotros.html
  - URL actual: https://images.unsplash.com/photo-1521577352947-9bb58764b69a?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/nosotros/trabajo.jpg

- Tarjeta: Misión
  - URL actual: https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/nosotros/mision.jpg

- Tarjeta: Visión
  - URL actual: https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/nosotros/vision.jpg

- Tarjeta: Valores
  - URL actual: https://images.unsplash.com/photo-1528795259021-d8c86e14354c?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/nosotros/valores.jpg

---

## 6) Blog / Inspiración

- Artículo: Cómo elegir el ramo perfecto
  - Página: blog.html
  - URL actual: https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/blog/ramo_perfecto.jpg

- Artículo: Ideas de recuerdos únicos
  - Página: blog.html
  - URL actual: https://images.unsplash.com/photo-1529634850-1084f7a04f0c?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/blog/recuerdos_unicos.jpg

- Artículo: Historias con luz y flores
  - Página: blog.html
  - URL actual: https://images.unsplash.com/photo-1491557345352-5929e343eb89?q=80&w=1400&auto=format&fit=crop
  - Sugerido: imagenes/blog/historias_luz_flores.jpg

---

## 7) Notas y pasos de reemplazo

1. Crea las carpetas sugeridas dentro de /imagenes:
   - /imagenes/productos
   - /imagenes/nosotros
   - /imagenes/blog

2. Descarga y coloca tus fotos con los nombres sugeridos.

3. Reemplaza rutas:
   - CSS (hero): edita assets/css/styles.css y cambia la URL a imagenes/hero.jpg
   - HTML sueltos (index.html, nosotros.html, blog.html): reemplaza src="https://..." por rutas relativas, por ejemplo imagenes/blog/ramo_perfecto.jpg
   - Catálogo (products.json): cambia cada "image" por rutas como imagenes/productos/ramo_basico.jpg

4. (Opcional) Si incluyes assets/js/images.config.js en cada página, puedes usar rutas sin la raíz (p.ej. productos/ramo_basico.jpg) y controlar la raíz con setImageRoot('imagenes/').

---

## 8) Verificación

- Abre index.html y recorre todas las páginas.
- Presiona F12 (Consola) para verificar que no haya errores de carga 404 en imágenes.
- Ajusta nombres si es necesario.
