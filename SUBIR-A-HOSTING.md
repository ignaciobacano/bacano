# Subir Bacano.cl a tu hosting

## 1 · Armar el paquete

Ejecutá (clic derecho → *Ejecutar con PowerShell*):

```bash
powershell -ExecutionPolicy Bypass -File preparar-hosting.ps1
```

Deja dos cosas listas:

- `_publicar/` — la carpeta con el sitio limpio (22 archivos, 2,8 MB)
- `bacano-sitio.zip` — lo mismo comprimido (2,7 MB)

Quedan afuera los archivos de desarrollo: `.git`, `.claude`, los `.ps1`, los `.md` y la configuración de git. Al hosting solo va lo que el navegador necesita.

Si no querés que el panel quede accesible desde internet:

```bash
powershell -ExecutionPolicy Bypass -File preparar-hosting.ps1 -SinPanel
```

## 2 · Subirlo

**Opción rápida (cPanel / Plesk):** Administrador de archivos → entrá a `public_html` → *Cargar* → subí `bacano-sitio.zip` → clic derecho → *Extraer*. Borrá el zip después.

**Opción FTP (FileZilla):** conectate con los datos del hosting, entrá a `public_html` y arrastrá **el contenido** de `_publicar/` (no la carpeta, lo de adentro).

> ⚠️ El `.htaccess` es un archivo oculto. En FileZilla: *Servidor → Forzar mostrar archivos ocultos*. Sin él no tenés compresión ni caché, y el catálogo puede quedar cacheado.

Al terminar, en `public_html` tenés que ver: `index.html`, `productos.html`, `nosotros.html`, `contacto.html`, `carrito.html`, `admin.html`, `.htaccess` y la carpeta `assets`.

## 3 · Revisar

Abrí `https://bacano.cl` y comprobá:

- [ ] Se ven las fotos y los estilos (si el sitio se ve sin diseño, `assets` no subió completa)
- [ ] El carrito suma productos y el total se calcula
- [ ] El botón de WhatsApp abre el chat con el número correcto
- [ ] Se ve bien en el celular
- [ ] Con el SSL ya activo, descomentá las 3 líneas de *Forzar HTTPS* en `.htaccess`

## 4 · Cómo actualizar de ahí en adelante

En un hosting común no hay forma de que el panel escriba archivos por sí solo: el navegador no puede subir por FTP. El circuito es:

1. Abrí `admin.html` (desde tu PC o desde `bacano.cl/admin.html`)
2. Editá productos, precios, fotos o textos
3. **Vista previa** para revisar
4. **Descargar data.js**
5. Subí ese archivo por FTP a `assets/js/data.js`, reemplazando el que está

Los cambios se ven al instante: el `.htaccess` le pide al navegador que nunca cachee `data.js`.

**Fotos nuevas:** en la pestaña *Fotos* el panel te las descarga optimizadas; subilas a `assets/img/fotos/` por FTP.

**Cambios de diseño** (páginas, `style.css`, `app.js`): volvé a correr `preparar-hosting.ps1` y subí de nuevo, o solo los archivos que tocaste.

### Publicar directo desde el panel (con base de datos)

Si tu hosting tiene **PHP y MySQL** —lo tienen casi todos— podés saltearte el FTP por completo. Ver la sección siguiente.

---

## Instalar la base de datos

Con la base instalada, el panel guarda todo en MySQL, publica el sitio con un botón y además **recibe los pedidos del carrito**.

### Antes de empezar

En cPanel → **MySQL Databases**:

1. Creá una base de datos, por ejemplo `bacano`
2. Creá un usuario con contraseña
3. Asignale el usuario a la base con **All Privileges**

Anotá los tres datos: nombre de la base, usuario y contraseña.

### El asistente

Abrí `https://bacano.cl/instalar.php` y seguí los 5 pasos:

| Paso | Qué hace |
|---|---|
| 1 · Requisitos | Verifica PHP 7.4+, PDO MySQL y permisos de escritura. Te dice exactamente qué falta |
| 2 · Base de datos | Probás la conexión y se crean las 7 tablas |
| 3 · Usuario | Creás tu usuario y contraseña del panel (se guarda cifrada) |
| 4 · Catálogo | Pasa a la base los productos, categorías, testimonios y textos que ya tiene el sitio |
| 5 · Listo | Escribe `config.php` con la conexión |

**Al terminar, borrá `instalar.php` del servidor.** El propio asistente te lo recuerda, y si lo dejás, se bloquea solo al detectar que ya hay instalación.

### El circuito de trabajo

1. Entrás al panel → pestaña **🗄 Base de datos** → iniciás sesión
2. Editás lo que quieras
3. **Guardar y publicar** → guarda en MySQL y regenera `data.js` en el servidor

Sin FTP, sin descargar archivos. El sitio público sigue siendo estático y rápido: la base es la fuente de la verdad, `data.js` es la copia que lee el visitante.

### Pedidos

Con la base instalada, la tabla `pedidos` guarda cada compra del carrito con su número, datos de contacto, productos y total. Los ves en la misma pestaña, con el botón **Ver pedidos**, y podés marcarlos como listos.

### Archivos que agrega la base de datos

| Archivo | Para qué |
|---|---|
| `instalar.php` | El asistente. **Borralo al terminar** |
| `api.php` | El que habla con MySQL y regenera `data.js` |
| `config.php` | Lo crea el instalador con la contraseña de la base. Bloqueado en el `.htaccess`, nunca lo compartas |

### Si no querés base de datos

No pasa nada: todo lo anterior es opcional. El panel funciona igual generando `data.js` para subir por FTP o publicando en GitHub.

## Catálogo desde Bacano Core

El sitio muestra el catálogo que se trabaja en **bacanocore.cl** (módulo Catálogo). Lo lee
**una vez al día** desde `https://bacanocore.cl/api/catalogo-publico`, de solo lectura.

| Archivo | Para qué |
|---|---|
| `catalogo-sync.php` | Lee Core y escribe los dos archivos de abajo. Lo copia el despliegue de cPanel |
| `catalogo-core.js` | El catálogo que carga el navegador. **Lo genera el servidor**, no está en GitHub |
| `catalogo-core.json` | Los precios con que cobra Mercado Pago. Bloqueado desde internet |

**Activarlo (una sola vez):** cPanel → **Cron Jobs** → *Add New Cron Job*:

- Frecuencia: una vez al día (por ejemplo, minuto `0`, hora `6`).
- Comando: `php /home1/bacanoc1/public_html/catalogo-sync.php`

Para la primera lectura sin esperar al día siguiente: en cPanel → **Terminal**, ejecutá ese
mismo comando. Tiene que responder `OK · … · 30 familias y 63 variantes`.

**Qué pasa si algo falla:** si Core no responde, manda un catálogo vacío o pide iniciar sesión,
`catalogo-sync.php` **no toca nada** y el sitio sigue con la copia del día anterior. Sin ninguna
copia (antes de la primera lectura), el sitio muestra los productos de `data.js`.

**Actualizar al momento (opcional):** copiá `catalogo-config.ejemplo.php` como
`catalogo-config.php` en el hosting, poné una `clave` larga y abrí
`https://bacano.cl/catalogo-sync.php?clave=TU_CLAVE`.

**Cómo se ve:** cada familia del catálogo es un producto; sus variantes son las opciones que el
cliente elige en la ficha (medida, formato, plan). El menú *Productos impresos* sale de las
categorías de productos y servicios, y *Servicios digitales* de logotipo y web. Mientras Core
no tenga fotos de producto, se usa una foto por categoría.

## 5 · Sobre el panel en internet

`admin.html` no tiene contraseña: cualquiera que sepa la dirección puede abrirlo y ver el catálogo, aunque **no puede publicar nada** en GitHub sin tu token. Tres formas de cerrarlo, de menos a más segura:

1. No subirlo (`-SinPanel`) y usarlo desde tu PC con `servidor-local.ps1`
2. Renombrarlo a algo difícil de adivinar, por ejemplo `panel-9f3k2.html`
3. **Recomendado:** cPanel → *Directory Privacy* → protegé el archivo o una carpeta `/panel` con usuario y contraseña. En `.htaccess` está el bloque listo para descomentar.

## 6 · Dominio

Si comprás `bacano.cl` aparte del hosting, en el panel de tu proveedor de dominios apuntá los DNS a los que te dio el hosting (suelen ser dos `ns1.` y `ns2.`). Tarda entre 15 minutos y 24 horas. Después activá el certificado SSL gratuito (*Let's Encrypt* / *AutoSSL*) desde cPanel.
