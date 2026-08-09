# Bacano.cl — sitio web

Sitio estático (HTML + CSS + JavaScript, sin frameworks). Se abre con doble clic en `index.html`.

## Páginas

| Archivo | Qué es |
|---|---|
| `index.html` | Home con el layout de la referencia: hero, franja de atributos, carrusel de productos, banda de cifras, testimonio + CTA |
| `productos.html` | Catálogo con buscador, filtros por categoría y precio, orden y vista rápida |
| `carrito.html` | Carrito + checkout en 3 pasos, con confirmación y envío del pedido por WhatsApp |
| `nosotros.html` | Taller, trabajo en terreno, equipamiento y garantías |
| `contacto.html` | Formulario de cotización y datos de contacto |
| `admin.html` | **Panel de administración**: editar productos, fotos y textos, y publicar en GitHub |

## Panel de administración (`admin.html`)

Abrí **`admin.html`** para editar el sitio sin tocar código:

- **Productos** — crear, editar, duplicar, ordenar y eliminar. Los 8 primeros son los que salen en el carrusel de la home.
- **Categorías**, **Testimonios**, **Preguntas** y **Datos del sitio** (teléfono, WhatsApp, correo, dirección, envío gratis).
- **Fotos** — arrastrás tus imágenes, el panel las achica a 1400 px y las convierte a JPG liviano.
- **Vista previa** — abre el sitio real con tus cambios (`index.html?preview=1`) antes de publicar nada.

Los cambios se guardan en tu navegador hasta que publicás. Dos formas de publicar:

**A · Automática.** En la pestaña *Publicar* cargás usuario, repositorio y un token fine-grained de GitHub (permiso *Contents: Read and write*, solo para ese repo). El botón **Publicar** escribe `assets/js/data.js` en tu repositorio y las fotos nuevas se suben solas. El token queda guardado únicamente en tu navegador.

**B · Manual.** Botón **Descargar data.js** → en GitHub entrás a `assets/js/`, *Add file → Upload files*, soltás el archivo y confirmás. Las fotos van igual a `assets/img/fotos/`.

> El panel no protege nada por sí solo: cualquiera que abra la URL puede verlo, pero **no puede publicar** porque necesita tu token. Si preferís que ni se vea, no subas `admin.html` a GitHub y usalo desde tu PC.

## Repositorio

El sitio vive en **https://github.com/ignaciobacano/bacano** (rama `main`).

Para activar la web:

1. En el repo: **Settings → Pages**.
2. *Source*: **Deploy from a branch** · rama `main` · carpeta `/ (root)` → **Save**.
3. En 1–2 minutos queda publicado en **https://ignaciobacano.github.io/bacano/**.
4. Con el dominio comprado: **Settings → Pages → Custom domain** → `bacano.cl`, y en tu proveedor de dominio creás estos registros DNS:
   - `A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` para `www` → `ignaciobacano.github.io`
5. Marcá **Enforce HTTPS** cuando GitHub emita el certificado.

Desde la PC, para subir cambios hechos a mano:

```bash
git add -A && git commit -m "actualizo el sitio" && git push
```

## Dónde se edita cada cosa

Todo el contenido está en **`assets/js/data.js`** (es lo que escribe el panel):

- `SITE` → teléfono, WhatsApp, correo, dirección, horario, monto de envío gratis.
- `FOTOS` → fotos de hero, terreno, plóter, taller.
- `CATEGORIAS` → las 6 categorías del catálogo.
- `PRODUCTOS` → nombre, precio, unidad, foto, descripción, especificaciones y plazo.
- `TESTIMONIOS` y `FAQS` → reseñas y preguntas frecuentes.

Los precios se escriben sin puntos (`24900`) y se formatean solos a `$24.900`.

## Fotos

Las fotos son de **Unsplash** (licencia libre, uso comercial permitido, sin atribución obligatoria).
No se pueden usar imágenes tomadas de una búsqueda de Google: casi todas tienen dueño y su uso en un sitio comercial es infracción de derechos de autor.

**Para poner tus propias fotos** (recomendado: fotos reales de tus trabajos venden mucho más):

1. Guardá las imágenes en `assets/img/fotos/`.
2. En `data.js` reemplazá la URL por la ruta local:

```js
img: "assets/img/fotos/letrero-cafe-raiz.jpg"
```

Tamaño sugerido: 900 × 900 px para productos, 1200 × 900 px para hero y secciones.

## Detalles técnicos

- El carrito se guarda en `localStorage` (clave `bacano_cart_v1`), sobrevive al cierre del navegador.
- El checkout no cobra: genera un número de pedido y arma el mensaje de WhatsApp con el detalle. Para cobrar en línea hay que conectar una pasarela (Transbank/Webpay, Flow, Mercado Pago) desde un servidor.
- El formulario de contacto tampoco envía correo por sí solo: hay que conectarlo a un servicio (Formspree, EmailJS) o a un backend.
- Header, menú móvil, footer, carrito y modal se generan desde `assets/js/app.js`, así que se editan en un solo lugar.
- Los archivos CSS/JS se enlazan con `?v=5`. Si editás el CSS a mano y no ves los cambios, subí ese número en los HTML para saltar la caché del navegador (el panel no lo necesita: publica siempre el archivo completo).
- El panel guarda su borrador en `localStorage` (`bacano_admin_v1`) y la conexión a GitHub en `bacano_github`. Nada de eso viaja al repositorio.

## Antes de publicar

- [ ] Reemplazar teléfono, correo y dirección reales en `data.js`.
- [ ] Cambiar el bloque "Cómo llegar" de `contacto.html` por el iframe real de Google Maps.
- [ ] Enlazar las redes sociales reales (footer, en `app.js`).
- [ ] Conectar formulario y pasarela de pago.
- [ ] Reemplazar las fotos de stock por trabajos propios.
