# Entregable 6 — Tienda de Software y Videojuegos

Sitio estático de una tienda de software y videojuegos, construido con **HTML**, **SCSS (Sass)** y **Bootstrap 5**. Los estilos se escriben en SCSS siguiendo la arquitectura *7-1* y se compilan a CSS con Dart Sass.

El catálogo **Destacados** muestra **8 productos** en tarjetas con imagen, nombre y **precio en COP**; al hacer clic en una tarjeta se abre un **modal** con el detalle individual del producto (imagen grande, descripción, precio, **tráiler de YouTube** y botón *Agregar al carrito*). El **hero** incluye un **destacado navegable**: las flechas **← →** muestran de a un producto con su precio y botón de compra, y debajo el **selector de tráilers**, que cambia el video principal entre los títulos del catálogo y puede cargar **trailers de estrenos reales desde Wikidata** (sin llave ni registro), con respaldo en RAWG y en los trailers locales del catálogo.

El sitio incluye además un **carrito de compras** persistente (guardado en `localStorage`) con botón flotante, contador de unidades, cantidades +/-, subtotales, total en COP y opción de vaciar; un **formulario de compra** que, al confirmar, muestra un **mensaje de compra exitosa** con el número de pedido y la confirmación de que el pedido llegará al **correo y a la dirección registrados**; y una sección **«Novedades en vivo»** con **dos pestañas** que consumen **dos APIs REST externas** (FreeToGame y CheapShark) con `fetch()` + `async/await` y renderizan el JSON dinámicamente con clases de Bootstrap (Taller: *Integración full-stack mediante API REST*).

---

## 📁 Estructura del proyecto

```
Entregable_6/
│
├── assets/                    # Recursos estáticos del sitio
│   ├── img/                   # Ilustraciones SVG de los productos + favicon
│   └── js/                    # JavaScript: main.js (carrito, checkout,
│                              # destacado, tráilers y API REST) +
│                              # bootstrap.bundle.min.js (copiado por postinstall)
│
├── css/                       # ⚙️ Generado por Sass — no editar a mano
│   ├── main.css               # CSS compilado que carga el index.html
│   ├── main.css.map           # Source map para depurar en el navegador
│   └── main.min.css           # Versión comprimida (`npm run build:prod`, para despliegue)
│
├── scss/                      # ✏️ Fuente de los estilos
│   ├── base/                  # Fundamentos y configuración
│   │   ├── _variables.scss    # Colores, tipografía y breakpoints (antes de Bootstrap)
│   │   ├── _mixins.scss       # Mixins y funciones reutilizables
│   │   └── _typography.scss   # Estilos base de encabezados
│   │
│   ├── layout/                # Secciones de la página
│   │   ├── _hero.scss         # Hero: título, destacado navegable y tarjeta de tráiler
│   │   └── _footer.scss       # Pie de página
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── _product-card.scss # Tarjeta de producto (imagen, precio, CTA)
│   │   ├── _api-card.scss     # Tarjeta de la sección que consume la API REST
│   │   ├── _api-search.scss   # Buscador con autocompletado de esa sección
│   │   ├── _product-modal.scss # Modal de detalle de producto
│   │   ├── _cart.scss         # Carrito: botón flotante y panel lateral
│   │   ├── _checkout.scss     # Formulario de compra y mensaje de éxito
│   │   └── _buttons.scss      # Botón de marca (.btn-brand)
│   │
│   ├── utilities/             # Utilidades y helpers
│   │   └── _helpers.scss      # Clases auxiliares (.text-accent, .bg-soft)
│   │
│   └── main.scss              # Punto de entrada: importa Bootstrap y todos los parciales
│
├── index.html                 # Página principal (entrada del sitio)
├── iniciar.bat                # Inicio rápido en Windows (compila, abre y activa watch)
├── package.json               # Scripts npm y dependencias
├── package-lock.json          # Versiones exactas de dependencias
├── Eliel_Rueda_Entregable_6.pdf # Documento PDF del entregable
├── .gitignore                 # Archivos ignorados por Git
└── README.md                  # Este archivo
```

---

## 🧰 Tecnologías

| Tecnología | Uso |
| --- | --- |
| HTML5 | Estructura del sitio |
| SCSS (Dart Sass) | Estilos con variables, mixins y parciales |
| Bootstrap 5.3 | Grid, utilidades y componentes base (importado desde SCSS, no por CDN) |
| JavaScript | `fetch()` + `async/await`, manipulación del DOM y `localStorage` |
| npm | Gestión de dependencias y scripts de compilación |

---

## 🎯 Paleta de colores (tema Xbox)

Definida en `scss/base/_variables.scss`:

| Color | Hex | Uso |
| --- | --- | --- |
| Xbox Green | `#107C10` | Botones, enlaces y acentos de marca |
| Verde hover | `#0C6B0C` | Estado hover del botón principal |
| Verde claro | `#63D663` | Textos de acento sobre fondo oscuro |
| Fondo de página | `#101010` | Fondo general (casi negro) |
| Superficie | `#1A1A1A` | Tarjetas de producto |
| Negro | `#000000` | Hero y footer |
| Texto principal | `#F2F2F2` | Títulos y párrafos |
| Texto secundario | `#9AA5B1` | Precios y etiquetas |

---

## 🎬 Funcionalidades

### Tráiler en el modal de detalle

Las tarjetas muestran únicamente la ilustración del producto. El tráiler se embebe dentro del **modal de detalle** («Ver detalle»): el iframe de `youtube-nocookie.com` se inyecta **al abrir el modal** (carga diferida — no se piden 8 videos de una vez) y se **elimina al cerrarlo**, lo que detiene la reproducción al instante.

| Producto | Tráiler | Canal oficial |
| --- | --- | --- |
| Halo 5: Guardians | *Tráiler Master Chief* (`66BiL6KwVEs`) | XBOX México |
| Xbox 360 — Halo: Reach | *Halo: Reach E3 2010 Official Trailer* (`EyHwnTKO7JU`) | HALO |
| Control inalámbrico Series X | *Elevate Your Game – Xbox Wireless Controllers* (`i8t5peTKSu0`) | XBOX |
| Cyberpunk 2077 (PC) | *Tráiler de lanzamiento — V* (`VhM3NRu23Sk`) | Cyberpunk 2077 |
| Consola Xbox Series X 1TB | *World Premiere – 4K Trailer* (`0tUqIHwHDEc`) | XBOX |
| Consola Xbox Series S 512GB | *World Premiere Reveal Trailer* (`KHLfCFMKxPg`) | XBOX |
| Halo Infinite | *Official Launch Trailer* (`pzlCxADSx0U`) | XBOX |
| Forza Horizon 5 | *Official Launch Trailer* (`Rv7xLt5yNsM`) | XBOX |

### Destacado del hero con flechas ← → (`assets/js/main.js`)

Arriba del hero hay un **carrusel de un solo producto** (`.hero-showcase`) que reemplaza al antiguo botón *Comprar*: muestra imagen, nombre, precio en COP y su botón *Agregar al carrito*, con una flecha a cada costado.

- **Sin duplicar datos**: el listado se arma en JS desde los botones `.product-detail__buy` de los 8 modales (`dataset.id/name/price/img`), así el carrusel siempre coincide con el catálogo.
- **Ciclo circular**: del último vuelve al primero y viceversa (`(índice + paso + total) % total`).
- **Reutiliza la lógica del carrito**: el botón lleva la clase `.product-detail__buy`, por lo que dispara el mismo listener (contador, total, persistencia y el feedback «✓ ¡Agregado!»); al navegar solo se actualizan sus `dataset`.
- **Accesibilidad**: `aria-label` en cada flecha, `aria-live="polite"` en el nombre y **flechas del teclado** (`←`/`→`) mientras el foco esté dentro del destacado.
- **Responsivo**: en pantallas ≤ 480px las flechas y la imagen se encogen para caber en una fila.

### Selector de tráilers del hero (`assets/js/main.js`)

El video del hero **no está fijo**: debajo hay dos filas de botones-selector (miniatura + nombre) que recargan el iframe con `autoplay` y actualizan el rótulo 🎬 del video en curso.

Como el destacado, el bloque del tráiler (`.hero-trailer`) se presenta en **tarjeta** con el mismo fondo, borde y radio de `.hero-showcase__body`, de modo que hero y tráiler se ven como un mismo sistema visual (padding `.75rem 1rem`, para conservar el ancho útil de las filas de chips):

- **Fila 1 — `.hero-trailer__set`**: los **4 trailers fijos del catálogo** (Halo 5, Halo: Reach, Control X|S, Cyberpunk), escritos a mano en el HTML. **Nunca se borran** ni se sustituyen.
- **Fila 2 — `.hero-trailer__set--estrenos`**: los **estrenos dinámicos** (máx. 4), que `main.js` agrega debajo. Su `.hero-trailer__tab--estreno` usa `flex: 1 1 0` + `max-width: 8.25rem` para que los 4 crezcan a partes iguales y la cuadrícula quede pareja (sin partirse en dos filas); los nombres largos se cortan con «…» y el nombre completo se ve en el `title` al pasar el mouse y en el rótulo 🎬 al seleccionarlos.

- **Delegación de eventos**: un solo listener en `.hero-trailer__nav` (event delegation), por lo que funciona igual para los botones fijos del HTML y para los dinámicos.
- **Accesibilidad**: `aria-pressed` en cada botón (solo uno en `true` a la vez), `aria-live="polite"` en el rótulo del video actual y `role="group"` con etiqueta en el nav.
- **Privacidad**: el video usa `youtube-nocookie.com` con `?rel=0` (sin videos relacionados al terminar).

#### Trailers dinámicos de estrenos (sin llave, con doble respaldo)

Al cargar la página, un **orquestador** intenta cargar los **estrenos de los últimos 6 meses** y los agrega en una **segunda fila** debajo de los del catálogo, sin ningún rótulo extra en la interfaz (si el usuario ya cambió de trailer, se conserva el que está sonando):

1. **`Wikidata` (fuente principal — sin llave, sin registro):**
   - Consulta **SPARQL** en `query.wikidata.org` → juegos (`wd:Q7889`) con fecha de estreno en los últimos 6 meses y la propiedad **`P1651`** (*YouTube video ID*) de formato válido (`^[A-Za-z0-9_-]{11}$`), ordenados por fecha.
   - Cada ID se enriquece en paralelo con el **oEmbed de YouTube** (`Promise.allSettled()`) para obtener **título, canal y miniatura**; un ID caído no rompe el resto.
   - Si hay **2 o más trailers válidos**, se pintan.
2. **`RAWG` (opcional, solo si hay llave):** si se pega una llave gratuita en la constante `RAWG_KEY` (`main.js`), se piden estrenos (`GET /api/games?dates=…&ordering=-released`) y el trailer de cada juego (`GET /api/games/{id}/movies`) en paralelo. Soporta además trailers **MP4** (etiqueta `<video>`, estilo `.hero-trailer__video`). ⚠️ El plan gratuito de RAWG exige **atribución con backlink**: si algún día activas la llave, vuelve a mostrarla (el elemento `#trailerFuente` y la clase `.hero-trailer__source` ya no existen, habría que recrearlos).
3. **Respaldos locales:** los 4 trailers del catálogo **siempre están** (fila 1), así que si ambas APIs fallan la única diferencia es que no aparece la fila de estrenos.

**Degradación elegante**: cada fuente que falla se descarta y sigue la siguiente; el fallo solo se reporta con `console.info()` y **no genera errores** en la consola. Todo el HTML dinámico pasa por `escaparHTML()`.

> **Nota**: ambos endpoints (`query.wikidata.org` y `youtube.com/oembed`) responden con CORS abierto (`Access-Control-Allow-Origin: *`), por eso funcionan desde un sitio 100% estático sin backend.

### Carrito de compras (`assets/js/main.js`)

- **Botón flotante** (esquina superior derecha) con **contador de unidades**; abre un panel lateral (offcanvas de Bootstrap).
- **Agregar**: desde el modal de cada producto, con feedback visual («✓ ¡Agregado!»).
- **Cantidades**: controles **+ / −** por ítem; bajar a 0 lo elimina.
- **Subtotales y total en COP** calculados en vivo (formateo `es-CO`, ej. `$282.000 COP`).
- **Eliminar ítem** (✕) y **Vaciar carrito** completo.
- **Persistencia en `localStorage`** (clave `carrito_entregable_6`): el carrito sobrevive a recargar o cerrar el navegador.
- Estado vacío amigable cuando no hay productos.

### Formulario de compra — checkout (`assets/js/main.js`)

Botón **«Finalizar compra →»** dentro del carrito (junto a *Vaciar carrito*) que abre el modal `#modalCompra` con dos pasos:

| Paso | Contenido |
| --- | --- |
| 1. **Formulario** | Resumen del pedido (unidades + total) y campos **nombre completo, correo, teléfono, dirección y ciudad**, con validación de Bootstrap (`novalidate` + `was-validated` + `invalid-feedback`); el patrón del teléfono (`[0-9+\(\) \-]{7,20}`) está escapado para la semántica `v` de las expresiones regulares de HTML |
| 2. **Éxito** | Mensaje **«¡Tu compra fue exitosa!»** con número de pedido (`PED-AAAAMMDD-NNNN`), total pagado, correo y dirección registrados, más el aviso de que el pedido llegará a ese correo/dirección |

- **Flujo**: clic en *Finalizar* → se cierra el offcanvas y se abre el modal (con defensa para clics durante la animación de apertura) → al confirmar se valida, se genera el número de pedido, se muestra el éxito, **se vacía el carrito** y se persiste el cambio.
- **Persistencia**: la última compra se guarda en `localStorage` (clave `ultima_compra_entregable_6`); el carrito queda en `[]`.
- **Reinicio**: al cerrar el modal se vuelve al paso 1 (título, formulario y footers restaurados) listo para una nueva compra.
- **Estilos**: `scss/components/_checkout.scss` (resumen, inputs en tema oscuro, check verde y tarjeta de datos del pedido).

### Novedades en vivo — integración con API REST (`assets/js/main.js`)

Sección **«Novedades en vivo»** (`#api-rest`) con **dos pestañas de fuente** (pills de Bootstrap), cada una con su(s) propio(s) `fetch`:

| Pestaña | API | Contenido | Sin key |
| --- | --- | --- | --- |
| 🎮 **Gratis** | [FreeToGame](https://www.freetogame.com/api/games) | 416 juegos free-to-play (una sola petición) | ✅ CORS `*` |
| 💰 **De pago** | [CheapShark](https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60) | **240 juegos de Steam en oferta** (4 páginas × 60, fusionadas; con precios) | ✅ CORS `*` |

> CheapShark limita cada petición a 60 ofertas, así que la pestaña de pago descarga en paralelo las páginas `pageNumber=0..3` con `Promise.allSettled()` y las concatena; si una página falla, se usan las que sí respondieron (degradación elegante).

Flujo del taller por cada fuente: interfaz Bootstrap → evento → `fetch()` → JSON en `datosApi` → `renderizarJuegos()` actualiza el DOM.

| Paso | Función | Qué hace |
| --- | --- | --- |
| 1. Petición | `obtenerDatos(fuerza)` (`async`) | Descarga **todas las páginas** de la fuente en paralelo (`descargarPagina()` valida `respuesta.ok` y el JSON por página); usa una **instantánea de la pestaña** (`fuente`) y un **contador de turno** para que cambiar rápidamente de pestaña no mezcle mapper, caché ni contador (sin condiciones de carrera); la caché (`cacheFuentes`) evita re-pedir y el botón *Recargar* pasa `fuerza=true` para datos frescos |
| 2. Procesamiento | `datosApi` + mappers `aModeloFree` / `aModeloPago` | El JSON se almacena en `datosApi` normalizado a un modelo común `{ title, image, description, genre, platform, price, url }`, sin duplicados (mapa por `id`) |
| 3. Renderización | `renderizarJuegos(datosApi)` | Genera las tarjetas en `#apiGrid` (grid `row g-3` + `col-6 col-md-4 col-xl-3`, badges y spinner de Bootstrap) |

- **Selección aleatoria**: cada carga muestra **16 juegos** elegidos al azar del catálogo activo (mezcla Fisher‑Yates que excluye la tanda anterior), por lo que el botón *↻ Recargar datos* siempre presenta juegos distintos.

- **Precios en COP**: los precios de CheapShark llegan en USD y se convierten con una **cotización en vivo** (`open.er-api.com`, respaldo `jsdelivr currency-api`, último recurso tasa fija `TASA_FALLBACK`), sin mostrar la tasa en pantalla. Cada tarjeta muestra el ahorro (`-80%`), el precio original tachado y el precio final en COP.
- **Enlaces**: los gratuitos usan `freetogame_profile_url` (validados con `urlSegura()`); los de pago abren la tienda de Steam (`store.steampowered.com/app/{steamAppID}`) con respaldo a la búsqueda de CheapShark.
- **Buscador con autocompletado** (`#apiBuscar`): filtra el catálogo de la pestaña activa **en el cliente** (sin peticiones adicionales), insensible a mayúsculas y acentos (normalización NFD). Al escribir muestra un desplegable con hasta **8 sugerencias** (título + género/plataforma) y actualiza el grid con todos los coincidentes (máx. 24) más un contador de resultados.
  - **Teclado**: `↑` / `↓` recorren las sugerencias (resaltado visual + `aria-activedescendant`), `Enter` selecciona, `Escape` cierra.
  - **Clic** en una sugerencia → el grid muestra ese juego; botón **✕** → limpia y restaura la tanda aleatoria.
  - Sin coincidencias → mensaje «No se encontraron juegos…» con el grid vacío.
  - Accesibilidad: `role="combobox"/"listbox"/"option"`, etiqueta `visually-hidden` y `aria-expanded` sincronizado.
- **Estados de interfaz**: spinner de carga (`#apiCargando`), alerta de error (`#apiError`, se muestra si la API falla o no responde) y contadores por pestaña («416», «240»).
- **Seguridad**: los textos externos se escapan con `escaparHTML()` antes de inyectarlos en el HTML (evita inyección de código).
- **Estilo**: las tarjetas usan el componente propio `api-card` (BEM) definido en `scss/components/_api-card.scss`, coherente con el tema oscuro del sitio.

---

## 🚀 Optimización

Medidas aplicadas al sitio (Entregable: *Optimización, despliegue y proyecto final*):

| Área | Medida | Dónde |
| --- | --- | --- |
| **SEO** | `<meta name="description">` con palabras clave del catálogo | `index.html` `<head>` |
| **Redes sociales** | Open Graph (`og:title`, `og:description`, `og:type`, `og:locale`) para que los enlaces tengan vista previa | `index.html` `<head>` |
| **Marca** | `theme-color` verde Xbox + **favicon SVG** propio (`assets/img/favicon.svg`) | `index.html` `<head>` |
| **Rendimiento** | `loading="lazy"` en el iframe del YouTube del hero (no carga hasta estar cerca del viewport) | `index.html` |
| **CSS producción** | `npm run build:prod` → `css/main.min.css` comprimido sin source map (**290 KB → 243 KB**, ~16% menos) | `package.json` |
| **Carga diferida** | Los tráilers de los modales se inyectan al abrirlos (no se piden 8 videos de una vez) y se destruyen al cerrar | `assets/js/main.js` |
| **API** | `Promise.allSettled()` para pedir trailers en paralelo sin romper si alguno falla + degradación elegante al respaldo local | `assets/js/main.js` |
| **Accesibilidad** | `aria-pressed`, `aria-live`, `aria-label`, foco visible y contraste alto en tema oscuro | `index.html` + SCSS |

---

## ⚙️ Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (incluye `npm`)

## 🚀 Instalación y uso

### Opción rápida (Windows) — doble clic en `iniciar.bat`

| Comando | Qué hace |
| --- | --- |
| `iniciar.bat` | Instala dependencias si faltan → compila los estilos → levanta el servidor local en `http://localhost:8080` (abre el navegador) → activa el modo desarrollo (`watch`) |
| `iniciar.bat no-watch` | Solo compila y levanta el servidor, sin observar cambios (ideal para verlo rápido) |

### Opción manual (cualquier sistema)

```bash
npm install        # 1. Instala las dependencias (Sass y Bootstrap)
npm run build      # 2. Compila scss/ → css/main.css (una sola vez)
npm run watch      # 3. Compila y observa cambios en scss/ (modo desarrollo)
npm run build:prod # 4. (Despliegue) Genera css/main.min.css comprimido
```

| Script | Descripción |
| --- | --- |
| `npm run build` | Compila `scss/main.scss` a `css/main.css` una sola vez |
| `npm run build:prod` | Compila a `css/main.min.css` con `--style=compressed --no-source-map` (~16% más ligero, para despliegue) |
| `npm run watch` | Compila y vuelve a compilar automáticamente al guardar un archivo SCSS |
| `npm run serve` | Sirve el sitio en `http://localhost:8080` y abre el navegador |
| `npm run dev` | Alias de `npm run watch` |

Para ver el sitio, usa **`npm run serve`** (o `iniciar.bat`) y abre `http://localhost:8080`. Usar un servidor local es obligatorio para que el **video de YouTube se reproduzca**: al abrir `index.html` con doble clic (`file://`) no se envía *referrer* y el reproductor muestra **Error 153**.

---

## 🎨 Arquitectura SCSS (patrón 7-1)

Los estilos se dividen en **parciales** (archivos que empiezan con `_`) importados desde un único punto de entrada, `scss/main.scss`:

| Carpeta | Contenido |
| --- | --- |
| `base/` | Variables, mixins, funciones y estilos tipográficos globales |
| `layout/` | Estilos de las grandes secciones de la página (hero, footer) |
| `components/` | Componentes reutilizables y aislados (tarjetas, botones) |
| `utilities/` | Clases auxiliares pequeñas y de uso general |

**Orden de importación en `main.scss`** (el orden importa):

1. `base/variables` — definir primero para que Bootstrap los use al compilar.
2. `bootstrap` — se importa desde `node_modules` para poder personalizarlo.
3. `base/mixins` y `base/typography` — disponibles para el resto de los archivos.
4. `layout/`, `components/`, `utilities/`.

## ✍️ Convenciones

- **BEM** para nombrar clases: `bloque__elemento--modificador`, por ejemplo `product-card__title`.
- Los **parciales** llevan guion bajo inicial y sin extensión (`_buttons.scss`) y se importan con `@import "components/buttons"`.
- **Un solo punto de entrada**: el HTML solo carga `css/main.css`; nunca se importan parciales SCSS desde el HTML.
- Los archivos de `css/` son **generados**: cualquier cambio de estilo se hace en `scss/` y se recompila con `npm run build` (o con `watch`).

## 📌 Notas

- `css/` se mantiene en el repositorio (aunque es un artefacto de compilación) para poder abrir `index.html` directamente sin necesidad de instalar nada.
- Las advertencias de deprecación de Sass (`@import`) se silencian en los scripts porque Bootstrap 5 todavía se importa con `@import`.
- `.gitignore` excluye `node_modules/`, logs y archivos de sistema/editores.
