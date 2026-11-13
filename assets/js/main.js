(function () {
  "use strict";

  const CLAVE_CARRITO = "carrito_entregable_6";
  const formatearCOP = (valor) => `$${Number(valor).toLocaleString("es-CO")} COP`;

  /* ── Estado del carrito (persistido en localStorage) ── */
  let carrito = [];
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
    if (Array.isArray(guardado)) carrito = guardado;
  } catch (e) {
    carrito = [];
  }

  const persistir = () => localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));

  const $badge = document.getElementById("carritoBadge");
  const $lista = document.getElementById("carritoLista");
  const $vacio = document.getElementById("carritoVacio");
  const $pie = document.getElementById("carritoPie");
  const $total = document.getElementById("carritoTotal");

  function pintar() {
    const unidades = carrito.reduce((suma, item) => suma + item.qty, 0);
    $badge.textContent = unidades;
    $badge.hidden = unidades === 0;

    const hayItems = carrito.length > 0;
    $vacio.hidden = hayItems;
    $lista.hidden = !hayItems;
    $pie.hidden = !hayItems;

    $lista.innerHTML = carrito
      .map(
        (item) => `
        <li class="cart-item" data-id="${item.id}">
          <img class="cart-item__img" src="${item.img}" alt="">
          <div class="cart-item__info">
            <p class="cart-item__name">${item.name}</p>
            <p class="cart-item__price">${formatearCOP(item.price)}</p>
            <div class="cart-item__qty">
              <button type="button" class="cart-item__btn" data-accion="restar" aria-label="Restar una unidad de ${item.name}">&minus;</button>
              <span class="cart-item__count">${item.qty}</span>
              <button type="button" class="cart-item__btn" data-accion="sumar" aria-label="Sumar una unidad de ${item.name}">+</button>
            </div>
          </div>
          <button type="button" class="cart-item__remove" data-accion="quitar" aria-label="Eliminar ${item.name}">&times;</button>
        </li>`
      )
      .join("");

    const total = carrito.reduce((suma, item) => suma + item.price * item.qty, 0);
    $total.textContent = formatearCOP(total);
  }

  /* Acciones del panel (delegación de eventos) */
  $lista.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-accion]");
    if (!boton) return;
    const fila = boton.closest("[data-id]");
    const indice = carrito.findIndex((item) => item.id === fila.dataset.id);
    if (indice === -1) return;

    const accion = boton.dataset.accion;
    if (accion === "sumar") carrito[indice].qty += 1;
    if (accion === "restar") {
      carrito[indice].qty -= 1;
      if (carrito[indice].qty <= 0) carrito.splice(indice, 1);
    }
    if (accion === "quitar") carrito.splice(indice, 1);

    persistir();
    pintar();
  });

  document.getElementById("carritoVaciar").addEventListener("click", () => {
    carrito = [];
    persistir();
    pintar();
  });

  /* ── Formulario de compra (checkout) ──
     El botón «Finalizar compra» cierra el offcanvas y abre el modal #modalCompra.
     Al confirmar: validación Bootstrap → mensaje de éxito con el número de pedido,
     correo y dirección registrados → se vacía el carrito. */
  const CLAVE_COMPRA = "ultima_compra_entregable_6";
  const $btnComprar = document.getElementById("carritoComprar");
  const $panelCarrito = document.getElementById("carritoPanel");
  const $modalCompra = document.getElementById("modalCompra");
  const $formCompra = document.getElementById("formCompra");
  const $pasoForm = document.getElementById("compraPasoForm");
  const $pasoExito = document.getElementById("compraPasoExito");
  const $pieForm = document.getElementById("compraPieForm");
  const $pieExito = document.getElementById("compraPieExito");
  const $tituloCompra = document.getElementById("modalCompraTitulo");

  /* Resumen del pedido + apertura del modal (tras cerrar el offcanvas para
     no superponer dos fondos oscurecidos) */
  $btnComprar.addEventListener("click", () => {
    if (carrito.length === 0) return;

    const unidades = carrito.reduce((suma, item) => suma + item.qty, 0);
    const total = carrito.reduce((suma, item) => suma + item.price * item.qty, 0);
    document.getElementById("compraUnidades").textContent = unidades;
    document.getElementById("compraTotal").textContent = formatearCOP(total);

    const abrir = () => bootstrap.Modal.getOrCreateInstance($modalCompra).show();
    const offcanvas = bootstrap.Offcanvas.getInstance($panelCarrito);
    if (offcanvas) {
      const ocultar = () => {
        $panelCarrito.addEventListener("hidden.bs.offcanvas", abrir, { once: true });
        offcanvas.hide();
      };
      // Si el clic llega mientras el panel aún anima su apertura, hide() se
      // ignora (guarda de Bootstrap): esperamos a shown.bs.offcanvas para
      // ocultarlo y así abrir el modal en un solo flujo.
      if (offcanvas._isTransitioning) {
        $panelCarrito.addEventListener("shown.bs.offcanvas", ocultar, { once: true });
      } else {
        ocultar();
      }
    } else {
      abrir();
    }
  });

  /* Envío del formulario: Bootstrap valida (novalidate + was-validated);
     si hay campos inválidos el modal se queda en el paso 1. */
  $formCompra.addEventListener("submit", (evento) => {
    evento.preventDefault();
    evento.stopPropagation();
    $formCompra.classList.add("was-validated");
    if (!$formCompra.checkValidity()) return; // aún hay campos en rojo

    // Número de pedido: PED-AAAA-MMDD-NNNN (aleatorio de 4 dígitos)
    const hoy = new Date();
    const fecha = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, "0")}${String(hoy.getDate()).padStart(2, "0")}`;
    const numeroPedido = `PED-${fecha}-${Math.floor(1000 + Math.random() * 9000)}`;

    const compra = {
      pedido: numeroPedido,
      nombre: document.getElementById("compraNombre").value.trim(),
      correo: document.getElementById("compraCorreo").value.trim(),
      telefono: document.getElementById("compraTelefono").value.trim(),
      direccion: document.getElementById("compraDireccion").value.trim(),
      ciudad: document.getElementById("compraCiudad").value.trim(),
      unidades: carrito.reduce((suma, item) => suma + item.qty, 0),
      total: carrito.reduce((suma, item) => suma + item.price * item.qty, 0),
      fecha: hoy.toISOString()
    };

    // Mensaje de éxito con los datos registrados
    document.getElementById("exitoPedido").textContent = compra.pedido;
    document.getElementById("exitoTotal").textContent = formatearCOP(compra.total);
    document.getElementById("exitoCorreo").textContent = compra.correo;
    document.getElementById("exitoDireccion").textContent = compra.direccion;
    document.getElementById("exitoCiudad").textContent = compra.ciudad;
    document.getElementById("exitoMensaje").textContent =
      `Gracias, ${compra.nombre}. Tu compra fue exitosa: el pedido llegará al correo ` +
      `${compra.correo} y a la dirección ${compra.direccion} (${compra.ciudad}).`;

    try {
      localStorage.setItem(CLAVE_COMPRA, JSON.stringify(compra)); // última compra
    } catch (e) {
      /* almacenamiento no disponible: el mensaje igualmente se muestra */
    }

    // El pedido quedó confirmado: se vacía el carrito y se muestra el éxito
    carrito = [];
    persistir();
    pintar();

    $formCompra.reset();
    $formCompra.classList.remove("was-validated");
    $pasoForm.hidden = true;
    $pasoExito.hidden = false;
    $pieForm.hidden = true;
    $pieExito.hidden = false;
    $tituloCompra.textContent = "Compra confirmada";
  });

  /* Al cerrar el modal se vuelve al paso 1 (listo para una nueva compra) */
  $modalCompra.addEventListener("hidden.bs.modal", () => {
    $pasoForm.hidden = false;
    $pasoExito.hidden = true;
    $pieForm.hidden = false;
    $pieExito.hidden = true;
    $tituloCompra.textContent = "Finalizar compra";
    $formCompra.reset();
    $formCompra.classList.remove("was-validated");
  });

  /* Agregar productos desde los modales de detalle */
  document.querySelectorAll(".product-detail__buy").forEach((boton) => {
    boton.addEventListener("click", () => {
      const { id, name, price, img } = boton.dataset;
      const existente = carrito.find((item) => item.id === id);
      if (existente) {
        existente.qty += 1;
      } else {
        carrito.push({ id, name, price: Number(price), img, qty: 1 });
      }
      persistir();
      pintar();

      const textoOriginal = boton.textContent;
      boton.textContent = "✓ ¡Agregado!";
      boton.disabled = true;
      setTimeout(() => {
        boton.textContent = textoOriginal;
        boton.disabled = false;
      }, 1200);
    });
  });

  /* ── Destacado del hero: se muestra de a un producto y se navega
     con las flechas ← →. Los datos salen de los botones de los modales
     (.modal .product-detail__buy), así el carrusel siempre coincide con
     el catálogo sin duplicar información. El botón #destBuy reutiliza la
     clase .product-detail__buy, por lo que su listener de "agregar al
     carrito" ya está cableado arriba y solo hay que mover sus dataset. */
  const destacados = Array.from(document.querySelectorAll(".modal .product-detail__buy")).map((b) => ({
    id: b.dataset.id,
    name: b.dataset.name,
    price: Number(b.dataset.price),
    img: b.dataset.img
  }));

  if (destacados.length) {
    const $destImg = document.getElementById("destImg");
    const $destName = document.getElementById("destName");
    const $destPrice = document.getElementById("destPrice");
    const $destBuy = document.getElementById("destBuy");
    let destIndice = 0;

    const pintarDestacado = () => {
      const p = destacados[destIndice];
      $destImg.src = p.img;
      $destImg.alt = p.name;
      $destName.textContent = p.name;
      $destPrice.textContent = formatearCOP(p.price);
      $destBuy.dataset.id = p.id;
      $destBuy.dataset.name = p.name;
      $destBuy.dataset.price = String(p.price);
      $destBuy.dataset.img = p.img;
    };

    /* Avance circular: del último vuelve al primero y viceversa */
    const moverDestacado = (paso) => {
      destIndice = (destIndice + paso + destacados.length) % destacados.length;
      pintarDestacado();
    };

    document.getElementById("destPrev").addEventListener("click", () => moverDestacado(-1));
    document.getElementById("destNext").addEventListener("click", () => moverDestacado(1));

    /* Flechas del teclado mientras el foco esté dentro del destacado */
    document.querySelector(".hero-showcase").addEventListener("keydown", (evento) => {
      if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        moverDestacado(-1);
      } else if (evento.key === "ArrowRight") {
        evento.preventDefault();
        moverDestacado(1);
      }
    });
  }

  /* ── Tráiler dentro del modal de detalle ──
     El iframe se inyecta al abrir el modal (carga diferida: no se piden
     4 videos de una) y se elimina al cerrarlo, lo que detiene la
     reproducción al instante. */
  document.querySelectorAll(".modal[data-video]").forEach((modal) => {
    const marco = modal.querySelector(".product-detail__video-frame");

    modal.addEventListener("shown.bs.modal", () => {
      marco.innerHTML =
        `<iframe src="https://www.youtube-nocookie.com/embed/${modal.dataset.video}?rel=0"` +
        ` title="${modal.dataset.videoTitle}"` +
        ` allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"` +
        ` referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    });

    modal.addEventListener("hidden.bs.modal", () => {
      marco.innerHTML = "";
    });
  });

  /* ── Tráiler destacado del hero: selector de estrenos ──
     Respaldo local: los 4 botones fijos del HTML (funcionan sin red).
     Fuentes dinámicas, en orden:
       1. Wikidata + oEmbed de YouTube (sin llave, CORS abierto)
       2. RAWG, solo si hay llave (RAWG_KEY)
     Si ninguna responde, no se toca nada y siguen los trailers locales.
     Los clics usan delegación de eventos en el nav (mismo patrón que
     #apiTabs), así que funcionan también los botones dinámicos. */
  const RAWG_KEY = ""; // ← opcional: llave gratuita en https://rawg.io/apidocs

  const $marcoHero = document.querySelector(".video-hero");
  const $trailerAhora = document.getElementById("trailerAhora");
  const $trailerNav = document.querySelector(".hero-trailer__nav");

  const idYouTube = (texto) => {
    const m = String(texto || "").match(/(?:youtu\.be\/|[?&]v=|embed\/)([\w-]{11})/);
    return m ? m[1] : "";
  };

  /* Pinta el trailer elegido: iframe de YouTube o <video> MP4 (RAWG) */
  function mostrarTrailer(trailer, autoplay) {
    if (trailer.tipo === "mp4") {
      const activar = autoplay ? " autoplay" : "";
      $marcoHero.innerHTML =
        `<video id="trailerFrame" class="hero-trailer__video" controls playsinline${activar}` +
        ` poster="${escaparHTML(trailer.poster || "")}">` +
        `<source src="${escaparHTML(trailer.url)}" type="video/mp4">` +
        `Tu navegador no puede reproducir este video.</video>`;
    } else {
      const activar = autoplay ? "&autoplay=1" : "";
      $marcoHero.innerHTML =
        `<iframe id="trailerFrame" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.id)}?rel=0${activar}"` +
        ` title="${escaparHTML(trailer.titulo)}"` +
        ` allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"` +
        ` referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    }
    $trailerAhora.textContent = trailer.ahora;
  }

  /* Delegación: un solo listener para los botones fijos y los dinámicos */
  $trailerNav.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".hero-trailer__tab");
    if (!boton || boton.classList.contains("is-active")) return; // ya está mostrando ese video

    $trailerNav.querySelectorAll(".hero-trailer__tab").forEach((b) => {
      const activo = b === boton;
      b.classList.toggle("is-active", activo);
      b.setAttribute("aria-pressed", String(activo));
    });

    mostrarTrailer(
      {
        tipo: boton.dataset.tipo || "youtube",
        id: boton.dataset.video,
        url: boton.dataset.src,
        poster: boton.dataset.poster,
        titulo: boton.dataset.title,
        ahora: boton.dataset.now
      },
      true
    );
  });

  /* Agrega una SEGUNDA fila con los estrenos dinámicos: los 4 botones
     originales de Xbox viven en su propia fila (.hero-trailer__set) y
     nunca se tocan. El trailer que ya esté en pantalla se conserva. */
  function pintarTrailers(trailers) {
    const clave = (b) => b.dataset.video || b.dataset.src || "";
    const activo = $trailerNav.querySelector(".hero-trailer__tab.is-active");
    const videoActual = activo ? clave(activo) : "";

    // Quita una fila de estrenos previa (por si se vuelve a pintar) y agrega la nueva
    $trailerNav.querySelectorAll(".hero-trailer__set--estrenos").forEach((f) => f.remove());
    $trailerNav.insertAdjacentHTML(
      "beforeend",
      `<div class="hero-trailer__set hero-trailer__set--estrenos">` +
        trailers
          .map(
            (t) => `
        <button type="button" class="hero-trailer__tab hero-trailer__tab--estreno"
                aria-pressed="false" data-tipo="${t.tipo}"
                title="${escaparHTML(t.nombre)}"
                data-video="${escaparHTML(t.id || "")}" data-src="${escaparHTML(t.url || "")}"
                data-poster="${escaparHTML(t.poster || "")}"
                data-title="${escaparHTML(t.titulo)}" data-now="${escaparHTML(t.ahora)}">
          ${t.miniatura ? `<img src="${escaparHTML(t.miniatura)}" alt="" aria-hidden="true">` : ""}
          <span>${escaparHTML(t.nombre)}</span>
        </button>`
          )
          .join("") +
        `</div>`
    );

    // Restaura el botón activo: sigue siendo el que ya se estaba reproduciendo
    if (videoActual) {
      $trailerNav.querySelectorAll(".hero-trailer__tab").forEach((b) => {
        const esActivo = clave(b) === videoActual;
        b.classList.toggle("is-active", esActivo);
        b.setAttribute("aria-pressed", String(esActivo));
      });
    }
  }

  /* Devuelve la fecha desde hace `meses` meses en formato AAAA-MM-DD */
  const fechaDesde = (meses) => {
    const d = new Date();
    d.setMonth(d.getMonth() - meses);
    return d.toISOString().slice(0, 10);
  };

  /* ── Fuente 1: Wikidata + oEmbed de YouTube (sin llave, CORS abierto) ──
     1) SPARQL: juegos (Q7889) con fecha de estreno reciente y la
        propiedad P1651 (YouTube video ID) de formato válido.
     2) oEmbed de YouTube: título, autor y miniatura de cada video
        (también sin llave) — descarta IDs que ya no existan.
     Devuelve un array de trailers o lanza el error al orquestador. */
  async function cargarTrailersWikidata() {
    const hoy = new Date().toISOString().slice(0, 10);
    const desde = fechaDesde(6);
    const query =
      "SELECT ?juego ?yt ?fecha WHERE { " +
      "?juego wdt:P31 wd:Q7889 ; wdt:P1651 ?yt ; wdt:P577 ?fecha . " +
      `FILTER(?fecha >= "${desde}"^^xsd:dateTime && ?fecha <= "${hoy}"^^xsd:dateTime) ` +
      'FILTER(regex(?yt, "^[A-Za-z0-9_-]{11}$")) ' +
      "} ORDER BY DESC(?fecha) LIMIT 8";

    const resp = await fetch(
      `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`,
      { headers: { Accept: "application/sparql-results+json" } }
    );
    if (!resp.ok) throw new Error(`Wikidata respondió HTTP ${resp.status}`);
    const { results = {} } = await resp.json();
    const candidatos = (results.bindings || [])
      .map((b) => (b.yt && b.yt.value ? b.yt.value : ""))
      .filter((id) => /^[A-Za-z0-9_-]{11}$/.test(id));
    if (!candidatos.length) throw new Error("Wikidata sin estrenos con trailer");

    // Enriquecer en paralelo con oEmbed (Promise.allSettled: un ID caído no rompe el resto)
    const pedidos = candidatos.map((id) =>
      fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(
          `https://www.youtube.com/watch?v=${id}`
        )}&format=json`
      ).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`oEmbed HTTP ${r.status}`))))
    );
    const hechos = await Promise.allSettled(pedidos);

    const trailers = [];
    hechos.forEach((r, i) => {
      if (r.status !== "fulfilled" || trailers.length >= 4) return;
      const meta = r.value;
      const id = candidatos[i];
      // Nombre corto para el botón: primera parte del título antes de " — " o " - "
      const titulo = meta.title || "Tráiler oficial";
      const nombre = titulo.split(" — ")[0].split(" - ")[0].trim() || titulo;
      trailers.push({
        tipo: "youtube",
        id,
        url: "",
        poster: meta.thumbnail_url || "",
        titulo,
        ahora: `🎬 ${titulo} · ${meta.author_name || ""}`.trim(),
        nombre,
        miniatura: meta.thumbnail_url || ""
      });
    });

    if (trailers.length < 2) throw new Error("Wikidata: menos de 2 trailers válidos");
    return trailers;
  }

  /* ── Fuente 2: RAWG (opcional, solo si hay llave) ──
     Estrenos recientes → trailer de cada juego en paralelo
     (Promise.allSettled, mismo patrón del taller de la API REST).
     Devuelve un array de trailers o lanza el error. */
  async function cargarTrailersRAWG() {
    if (!RAWG_KEY) throw new Error("sin llave RAWG"); // el orquestador sigue con el respaldo

    const resp = await fetch(
      `https://api.rawg.io/api/games?dates=${fechaDesde(6)},${new Date()
        .toISOString()
        .slice(0, 10)}` +
        `&ordering=-released&page_size=5&key=${RAWG_KEY}`
    );
    if (!resp.ok) throw new Error(`RAWG listó HTTP ${resp.status}`);
    const { results = [] } = await resp.json();
    if (!results.length) throw new Error("RAWG no devolvió estrenos");

    const pedidos = results.map((juego) =>
      fetch(`https://api.rawg.io/api/games/${juego.id}/movies?key=${RAWG_KEY}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((m) => ({ juego, movies: m.results || [] }))
    );
    const hechos = await Promise.allSettled(pedidos);

    const trailers = [];
    for (const r of hechos) {
      if (r.status !== "fulfilled" || !r.value.movies.length || trailers.length >= 4) continue;
      const { juego, movies } = r.value;
      const m = movies[0];
      const data = m.data || {};
      const yt = idYouTube(data.embedding) || idYouTube(data.source) || idYouTube(m.url);
      const mp4 = data.max || data["480"];
      const tipo = yt ? "youtube" : mp4 ? "mp4" : null;
      if (!tipo) continue; // sin video reproducible: se omite

      trailers.push({
        tipo,
        id: yt,
        url: mp4 || "",
        poster: m.preview || juego.background_image || "",
        titulo: `${juego.name} — ${m.name || "Tráiler"}`,
        ahora: `🎬 ${juego.name} — ${m.name || `estreno ${juego.released || ""}`}`,
        nombre: juego.name,
        miniatura: m.preview || juego.background_image || ""
      });
    }

    if (trailers.length < 2) throw new Error("RAWG: menos de 2 trailers");
    return trailers;
  }

  /* ── Orquestador: Wikidata → RAWG (si hay llave) → trailers locales ──
     Cada fuente que falla se descarta y sigue la siguiente; si ninguna
     responde, no se toca nada y siguen los 4 trailers del catálogo
     (degradación elegante). */
  async function cargarTrailersDestacados() {
    const fuentes = [
      { etiqueta: "Wikidata", fn: cargarTrailersWikidata },
      { etiqueta: "RAWG", fn: cargarTrailersRAWG }
    ];

    for (const fuente of fuentes) {
      try {
        const trailers = await fuente.fn();
        if (!trailers || trailers.length < 2) continue;
        pintarTrailers(trailers);
        console.info(
          `Hero: ${trailers.length} trailers de estrenos cargados desde ${fuente.etiqueta}.`
        );
        return;
      } catch (e) {
        console.info(`Hero: ${fuente.etiqueta} no disponible (${e.message}).`);
      }
    }

    console.info("Hero: se conservan los trailers locales del catálogo.");
  }

  cargarTrailersDestacados(); // pide estrenos al cargar (no bloquea la página)

  /* ══════════════════════════════════════════════════════════
     Taller: Integración full-stack mediante API REST
     Flujo: Bootstrap (interfaz) → JavaScript captura el evento →
     fetch() llama a un endpoint REST → el servidor responde JSON →
     los datos se guardan en datosApi → renderizarJuegos() actualiza
     el DOM de Bootstrap (patrón MVC: vista separada de los datos).
     ══════════════════════════════════════════════════════════ */

  /* Fuentes de datos: cada pestaña consume una API REST distinta.
     CheapShark limita cada petición a 60 ofertas, así que «De pago» pide
     4 páginas y las fusiona en un solo catálogo de 240 juegos. */
  const FUENTES = {
    gratis: ["https://www.freetogame.com/api/games"], // juegos gratuitos (417, una sola página)
    pago: [
      "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60&pageNumber=0",
      "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60&pageNumber=1",
      "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60&pageNumber=2",
      "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60&pageNumber=3"
    ]
  };
  const TASA_FALLBACK = 3250; // USD → COP si fallan las APIs de cambio
  const API_LIMITE = 16; // cuántos juegos se muestran en la sección

  const $apiGrid = document.getElementById("apiGrid");
  const $apiCargando = document.getElementById("apiCargando");
  const $apiError = document.getElementById("apiError");
  const $apiRecargar = document.getElementById("apiRecargar");
  const $apiBuscar = document.getElementById("apiBuscar");
  const $apiSugerencias = document.getElementById("apiSugerencias");
  const $apiLimpiar = document.getElementById("apiLimpiar");
  const $apiResultado = document.getElementById("apiResultado");
  const $apiTabs = document.getElementById("apiTabs");
  const $cuentaGratis = document.getElementById("cuentaGratis");
  const $cuentaPago = document.getElementById("cuentaPago");

  const LIMITE_RESULTADOS = 24; // máximo de tarjetas al filtrar la búsqueda

  /* Estado de las fuentes */
  let fuenteActiva = "gratis"; // pestaña seleccionada
  const cacheFuentes = { gratis: null, pago: null }; // datos ya pedidos (sin re-fetch)
  let tasaCOP = null; // cotización USD → COP (se carga con la pestaña de pago)
  let secuenciaDatos = 0; // contador de ciclos: el último iniciado gobierna la interfaz

  /* 2. PROCESAMIENTO: la respuesta JSON se almacena en una variable */
  let datosApi = [];

  /* Escapa caracteres especiales antes de inyectarlos en el HTML */
  const escaparHTML = (texto = "") =>
    String(texto).replace(/[&<>"']/g, (car) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[car]));

  /* Enlace al detalle del juego: se toma de los campos que provee la API
     (freetogame_profile_url / game_url). Nunca se arma a mano, porque la
     ruta /game/{id} devuelve HTTP 500. Solo se aceptan URLs https válidas. */
  const urlSegura = (url) => (typeof url === "string" && url.startsWith("https://") ? url : "");
  const urlDetalle = (juego) => urlSegura(juego.freetogame_profile_url) || urlSegura(juego.game_url) || "#";

  /* ── Modelo común para ambas fuentes ──
     { id, title, image, description, genre, platform, price | null, url }
     price: { original, sale, discount } en USD (se convierten al pintar). */

  const aModeloFree = (j) => ({
    id: `free-${j.id}`,
    title: j.title,
    image: j.thumbnail,
    description: j.short_description,
    genre: j.genre,
    platform: j.platform,
    price: null, // los gratuitos no tienen precio
    url: urlDetalle(j)
  });

  const describirDeal = (d) => {
    const partes = [];
    if (Number(d.metacriticScore) > 0) partes.push(`Metacritic ${d.metacriticScore}`);
    if (d.steamRatingText) partes.push(`Valoración: ${d.steamRatingText}`);
    if (Number(d.releaseDate) > 0) partes.push(`Lanzamiento: ${new Date(d.releaseDate * 1000).getFullYear()}`);
    return partes.length ? partes.join(" · ") : "Oferta en Steam";
  };

  const aModeloPago = (d) => ({
    id: `deal-${d.dealID}`,
    title: d.title,
    image: d.thumb,
    description: describirDeal(d),
    genre: null,
    platform: "Steam",
    price: {
      original: Number(d.normalPrice),
      sale: Number(d.salePrice),
      discount: Math.round(Number(d.savings))
    },
    // El CTA va a Steam; si no tiene steamAppID, se busca en CheapShark
    url: /^\d+$/.test(String(d.steamAppID ?? ""))
      ? `https://store.steampowered.com/app/${d.steamAppID}`
      : `https://www.cheapshark.com/search?term=${encodeURIComponent(d.title)}`
  });

  /* Cotización USD → COP en vivo (dos fuentes de respaldo + tasa fija) */
  async function obtenerTasaCOP() {
    const apis = [
      "https://open.er-api.com/v6/latest/USD",
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json"
    ];
    for (const url of apis) {
      try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        const tasa = Number(datos?.rates?.COP ?? datos?.usd?.c?.cop ?? datos?.usd?.cop);
        if (Number.isFinite(tasa) && tasa > 0) return tasa;
      } catch (e) {
        // se intenta con la siguiente fuente
      }
    }
    return TASA_FALLBACK;
  }

  function marcarConteo(fuente, total) {
    const $cuenta = fuente === "pago" ? $cuentaPago : $cuentaGratis;
    $cuenta.textContent = total;
    $cuenta.hidden = false;
  }

  /* Selección aleatoria de juegos (mezcla Fisher-Yates sobre una copia).
     Excluye la tanda anterior para que cada recarga muestre juegos distintos. */
  let ultimaTanda = new Set();
  let tandaActual = []; // última tanda aleatoria, para restaurar al limpiar la búsqueda

  function elegirAleatorios(lista, cantidad) {
    const pool = lista.filter((juego) => !ultimaTanda.has(juego.id));
    const copia = [...(pool.length >= cantidad ? pool : lista)];

    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    const elegidos = copia.slice(0, cantidad);
    ultimaTanda = new Set(elegidos.map((juego) => juego.id));
    tandaActual = elegidos;
    return elegidos;
  }

  /* Descarga una URL y devuelve su arreglo JSON validado:
     fase 1 (encabezados HTTP) + fase 2 (cuerpo en JSON) de fetch(). */
  async function descargarPagina(url) {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`El servidor respondió HTTP ${respuesta.status}`);

    const datos = await respuesta.json();
    if (!Array.isArray(datos) || datos.length === 0) {
      throw new Error("La API no devolvió resultados.");
    }
    return datos;
  }

  /* 1. PETICIÓN: función asíncrona que conecta con el servidor vía fetch()
        fuerza=true (botón Recargar) ignora la caché y pide datos frescos.
        • fuente: instantánea de la pestaña al iniciar (evita usar el mapper o
          la caché equivocados si el usuario cambia de pestaña durante la descarga).
        • turno: solo el último ciclo iniciado gobierna la interfaz (DOM, contador
          y spinner); los obsoletos guardan su caché con su fuente y se retiran. */
  async function obtenerDatos(fuerza = false) {
    const fuente = fuenteActiva;
    const turno = ++secuenciaDatos;
    const vigente = () => turno === secuenciaDatos;

    $apiCargando.classList.remove("d-none");
    $apiError.classList.add("d-none");
    $apiGrid.innerHTML = "";
    limpiarBusqueda(); // cada recarga arranca con el buscador limpio

    try {
      let datos = fuerza ? null : cacheFuentes[fuente];

      if (!datos) {
        // Descarga en paralelo todas las páginas de la fuente (1 en Gratis, 4 en De pago)
        const resultados = await Promise.allSettled(FUENTES[fuente].map(descargarPagina));
        const paginas = resultados.filter((r) => r.status === "fulfilled").map((r) => r.value);
        if (paginas.length === 0) throw resultados[0].reason; // ninguna página respondió

        const crudos = paginas.flat(); // catálogo completo fusionado (hasta 240 en pago)
        const convertidos = crudos.map(fuente === "pago" ? aModeloPago : aModeloFree);
        // Solo juegos completos (id + título + imagen) y sin duplicados
        const validos = convertidos.filter((j) => j.id && j.title && j.image);
        datos = [...new Map(validos.map((j) => [j.id, j])).values()];
        if (datos.length === 0) throw new Error("La API no devolvió resultados.");

        if (fuente === "pago") tasaCOP = await obtenerTasaCOP(); // USD → COP al cargar
        cacheFuentes[fuente] = datos; // la caché se guarda SIEMPRE con su fuente correcta
      }

      if (!vigente()) return; // otro ciclo más reciente ya gobierna la interfaz

      datosApi = datos; // la respuesta queda en la variable datosApi
      $apiBuscar.disabled = false; // con datos cargados se puede buscar
      marcarConteo(fuente, datos.length);
      // 3. RENDERIZACIÓN: 16 juegos elegidos al azar del catálogo activo
      renderizarJuegos(elegirAleatorios(datosApi, API_LIMITE));
    } catch (error) {
      if (!vigente()) return; // un ciclo obsoleto no muestra errores en la pestaña activa
      $apiError.textContent = `No fue posible consultar la API REST: ${error.message}. Verifica tu conexión o intenta de nuevo.`;
      $apiError.classList.remove("d-none");
      $apiBuscar.disabled = datosApi.length === 0; // solo busca si hay datos previos
    } finally {
      if (vigente()) $apiCargando.classList.add("d-none"); // solo el ciclo vigente apaga el spinner
    }
  }

  /* 3. RENDERIZACIÓN: procesa datosApi y pinta las tarjetas en el DOM,
        utilizando clases de Bootstrap (grid de columnas, badges, precios).
        Los juegos de pago muestran precio original tachado + precio en COP
        (convertido con la cotización USD → COP). */
  function renderizarJuegos(datos) {
    const tasa = tasaCOP ?? TASA_FALLBACK;
    const cop = (usd) => formatearCOP(Math.round(usd * tasa));

    $apiGrid.innerHTML = datos
      .map(
        (juego) => `
          <div class="col-6 col-md-4 col-xl-3">
            <article class="api-card">
              <img class="api-card__img" src="${escaparHTML(juego.image)}" alt="Portada de ${escaparHTML(juego.title)}" loading="lazy">
              <div class="api-card__body">
                <div class="api-card__tags">
                  <span class="badge ${juego.price ? "text-bg-danger" : "text-bg-success"}">${juego.price ? "OFERTA" : "GRATIS"}</span>
                  <span class="badge text-bg-dark">${escaparHTML(juego.platform)}</span>
                  ${juego.genre ? `<span class="badge text-bg-dark">${escaparHTML(juego.genre)}</span>` : ""}
                </div>
                <h3 class="api-card__title">${escaparHTML(juego.title)}</h3>
                <p class="api-card__desc">${escaparHTML(juego.description)}</p>
                ${
                  juego.price
                    ? `<p class="api-card__price">
                    ${juego.price.discount > 0 ? `<span class="api-card__discount">-${juego.price.discount}%</span>` : ""}
                    ${juego.price.discount > 0 ? `<s class="api-card__price-old">${cop(juego.price.original)}</s>` : ""}
                    <strong class="api-card__price-now">${cop(juego.price.sale)}</strong>
                  </p>`
                    : ""
                }
                <a class="api-card__cta" href="${escaparHTML(juego.url)}" target="_blank" rel="noopener noreferrer">${juego.price ? "Ver en Steam →" : "Ver detalle →"}</a>
              </div>
            </article>
          </div>`
      )
      .join("");
  }

  /* ── Buscador con autocompletado ──
     Filtra datosApi (el catálogo de la pestaña activa) en el cliente: NO genera
     peticiones adicionales a la API. Coincidencias por título, sin distinguir
     mayúsculas ni acentos (normalización NFD). */

  let sugerencias = []; // opciones visibles en el desplegable
  let indiceActivo = -1; // opción resaltada con las teclas ↑ / ↓

  const normalizar = (texto) =>
    String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const contiene = (texto, consulta) => normalizar(texto).includes(normalizar(consulta));

  function limpiarBusqueda() {
    $apiBuscar.value = "";
    $apiLimpiar.hidden = true;
    $apiResultado.hidden = true;
    ocultarSugerencias();
  }

  function restaurarAleatorios() {
    if (tandaActual.length) renderizarJuegos(tandaActual);
    $apiResultado.hidden = true;
  }

  /* Filtra el catálogo y actualiza el grid + el mensaje de resultados */
  function aplicarBusqueda() {
    const consulta = $apiBuscar.value.trim();
    $apiLimpiar.hidden = consulta === "";

    if (!consulta) {
      ocultarSugerencias();
      restaurarAleatorios();
      return;
    }

    const coincidencias = datosApi.filter((juego) => contiene(juego.title, consulta));
    renderizarJuegos(coincidencias.slice(0, LIMITE_RESULTADOS));

    const total = coincidencias.length;
    $apiResultado.textContent =
      total === 0
        ? `No se encontraron juegos que contengan «${consulta}».`
        : `${total} ${total === 1 ? "juego que contiene" : "juegos que contienen"} «${consulta}»` +
          (total > LIMITE_RESULTADOS ? ` — mostrando los primeros ${LIMITE_RESULTADOS}` : "");
    $apiResultado.hidden = false;

    pintarSugerencias(coincidencias.slice(0, 8)); // máx. 8 en el desplegable
  }

  function pintarSugerencias(lista) {
    if (!lista.length) {
      ocultarSugerencias();
      return;
    }
    sugerencias = lista;
    indiceActivo = -1;
    $apiSugerencias.innerHTML = lista
      .map(
        (juego, i) => `
        <li class="api-search__option" role="option" id="api-op-${i}" data-index="${i}" aria-selected="false">
          <span class="api-search__option-name">${escaparHTML(juego.title)}</span>
          <span class="api-search__option-meta">${[juego.genre, juego.platform].filter(Boolean).map(escaparHTML).join(" · ")}</span>
        </li>`
      )
      .join("");
    $apiSugerencias.hidden = false;
    $apiBuscar.setAttribute("aria-expanded", "true");
  }

  function ocultarSugerencias() {
    $apiSugerencias.hidden = true;
    $apiSugerencias.innerHTML = "";
    $apiBuscar.setAttribute("aria-expanded", "false");
    $apiBuscar.removeAttribute("aria-activedescendant");
    sugerencias = [];
    indiceActivo = -1;
  }

  function resaltarSugerencia() {
    $apiSugerencias.querySelectorAll(".api-search__option").forEach((opcion, i) => {
      const activa = i === indiceActivo;
      opcion.classList.toggle("api-search__option--active", activa);
      opcion.setAttribute("aria-selected", String(activa));
      if (activa) opcion.scrollIntoView({ block: "nearest" });
    });
    if (indiceActivo >= 0) $apiBuscar.setAttribute("aria-activedescendant", `api-op-${indiceActivo}`);
  }

  /* ── Eventos del buscador ── */
  $apiBuscar.addEventListener("input", aplicarBusqueda);

  $apiBuscar.addEventListener("keydown", (evento) => {
    const haySugerencias = !$apiSugerencias.hidden && sugerencias.length > 0;

    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      if (!haySugerencias) return;
      evento.preventDefault();
      if (evento.key === "ArrowDown") {
        indiceActivo = (indiceActivo + 1) % sugerencias.length;
      } else {
        indiceActivo = indiceActivo <= 0 ? sugerencias.length - 1 : indiceActivo - 1;
      }
      resaltarSugerencia();
    } else if (evento.key === "Enter") {
      if (haySugerencias && indiceActivo >= 0) {
        evento.preventDefault();
        $apiBuscar.value = sugerencias[indiceActivo].title;
        aplicarBusqueda();
        ocultarSugerencias();
      } else {
        ocultarSugerencias();
      }
    } else if (evento.key === "Escape") {
      ocultarSugerencias();
    }
  });

  /* mousedown evita que el input pierda el foco antes de registrar el clic */
  $apiSugerencias.addEventListener("mousedown", (evento) => evento.preventDefault());

  $apiSugerencias.addEventListener("click", (evento) => {
    const opcion = evento.target.closest("[data-index]");
    if (!opcion) return;
    const juego = sugerencias[Number(opcion.dataset.index)];
    if (!juego) return;
    $apiBuscar.value = juego.title;
    aplicarBusqueda();
    ocultarSugerencias();
    $apiBuscar.focus();
  });

  $apiBuscar.addEventListener("blur", () => setTimeout(ocultarSugerencias, 150));

  $apiLimpiar.addEventListener("click", () => {
    limpiarBusqueda();
    restaurarAleatorios();
    $apiBuscar.focus();
  });

  /* ── Pestañas de fuente: cada una con su propio fetch ── */
  $apiTabs.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-fuente]");
    if (!boton || boton.dataset.fuente === fuenteActiva) return;

    fuenteActiva = boton.dataset.fuente;
    $apiTabs.querySelectorAll("[data-fuente]").forEach((opcion) => {
      const activa = opcion === boton;
      opcion.classList.toggle("active", activa);
      opcion.setAttribute("aria-selected", String(activa));
    });

    obtenerDatos(); // pide (o recupera de caché) la fuente seleccionada
  });

  $apiRecargar.addEventListener("click", () => obtenerDatos(true)); // fuerza datos frescos
  obtenerDatos(); // primera carga al abrir la página

  pintar();
})();
