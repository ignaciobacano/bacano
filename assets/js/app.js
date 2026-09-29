/* ============================================================
   BACANO.CL — Lógica del sitio
   Header/footer, slider, catálogo, filtros, carrito y formularios.
   ============================================================ */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const money = n => "$" + Math.round(n).toLocaleString("es-CL");

/* Posición de scroll real: si algún navegador deja al body como contenedor
   de scroll, window.scrollY se queda en 0 y hay que leerlo del body. */
const scrollTop = () =>
  window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

const waLink = (txt = "Hola Bacano, quiero cotizar un trabajo.") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(txt)}`;

/* ---------------- Iconos ---------------- */
const I = {
  cart:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.6 12.4a1.7 1.7 0 0 0 1.7 1.3h8.4a1.7 1.7 0 0 0 1.7-1.3L21.5 7H6"/></svg>`,
  plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  arrowR:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7"/></svg>`,
  arrowL:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H6M12 19l-7-7 7-7"/></svg>`,
  x:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  menu:`<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  shield:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>`,
  truck:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h11v11H2zM13 9h4l4 4v4h-8z"/><circle cx="7" cy="18.5" r="1.6"/><circle cx="17" cy="18.5" r="1.6"/></svg>`,
  clock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>`,
  star:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.6 7 .8-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.8z"/></svg>`,
  phone:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.9 2.1z"/></svg>`,
  mail:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6 9 6 9-6"/></svg>`,
  pin:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.8"/></svg>`,
  wa:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1s-.8 1-.9 1.2c-.2.2-.3.2-.6.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4a3.2 3.2 0 0 0-1 2.3 5.5 5.5 0 0 0 1.2 3 12.6 12.6 0 0 0 4.8 4.2c.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.3-.7.3-1.2.2-1.4zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z"/></svg>`,
  ig:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>`,
  fb:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V7c0-1 .2-1.5 1.6-1.5H17V2.2A22 22 0 0 0 14.7 2C12 2 10.3 3.6 10.3 6.6V9H8v3.5h2.3V22H14v-9.5h2.6l.4-3.5z"/></svg>`,
  tk:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 2h-3v13.2a2.6 2.6 0 1 1-2.2-2.6v-3a5.6 5.6 0 1 0 5.2 5.6V9.4a7 7 0 0 0 4 1.3V7.6a4.1 4.1 0 0 1-4-4z"/></svg>`,
  search:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  filter:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>`,
  eye:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`,
  trash:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>`,
  spark:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>`,
  card:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/></svg>`,
  arrowUpR:`<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>`,
  home:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/></svg>`,
  grid:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>`,
  box:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>`,
  headset:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13.5" width="4.5" height="7" rx="2"/><rect x="17" y="13.5" width="4.5" height="7" rx="2"/></svg>`,
  user:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8.5" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>`,
  bolt:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>`,
  design:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m12 7.5 4 2.2v4.6l-4 2.2-4-2.2V9.7z"/></svg>`,
  wifi:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5a10 10 0 0 1 14 0M8 16a6 6 0 0 1 8 0"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/><path d="M2 9a15 15 0 0 1 20 0"/></svg>`,
  people:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.4"/><path d="M2.6 19a6.4 6.4 0 0 1 12.8 0"/><path d="M16.5 5.2a3.4 3.4 0 0 1 0 6.6M18 19a6.5 6.5 0 0 0-2-4.7"/></svg>`,
  medal:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.8-1.6 7 5.1-2.8 5.1 2.8-1.6-7"/></svg>`
};

const NAV = [
  { href: "index.html",     txt: "Inicio" },
  { href: "productos.html", txt: "Productos" },
  { href: "nosotros.html",  txt: "Nosotros" },
  { href: "contacto.html",  txt: "Contacto" }
];

/* Menú de dos niveles.
   Nivel 1: las dos áreas grandes. Nivel 2: las secciones del área activa.
   Los productos sin página en el catálogo llevan a cotizar (contacto.html?tipo=…). */
const mCat = slug => `productos.html?cat=${slug}`;
const mCotizar = tipo => `contacto.html?tipo=${encodeURIComponent(tipo)}`;
const MENU = {
  prod: {
    nombre: "Productos impresos",
    secciones: [
      { txt:"Letreros",       href:mCat("letreros") },
      { txt:"Gran formato",   href:mCat("granformato") },
      { txt:"Stickers",       href:mCat("stickers") },
      { txt:"Publicitarios",  href:mCotizar("Publicitarios") },
      { txt:"Vehicular",      href:mCat("vehicular") },
      { txt:"Papelería",      href:mCat("papeleria") },
      { txt:"Estampados",     href:mCat("estampados") },
      { txt:"Merchandising",  href:mCotizar("Merchandising") }
    ],
    columnas: [
      [ { titulo:"Letreros y corpóreos", href:mCat("letreros"),
          items:["Letrero luminoso LED","Letras corpóreas","Placa de acrílico","Señalética interior","Tótem publicitario"] },
        { titulo:"Acrílico y sintra", href:mCotizar("Acrílico y sintra"),
          items:["Acrílico 3 a 6 mm","Sintra 3 y 5 mm","Distanciadores"] } ],
      [ { titulo:"Gran formato · por m²", href:mCat("granformato"),
          items:["Vinilo adhesivo","Tela banner (lona)","Tela backlight","Microperforado","Frosted impreso y troquelado","Vinilo de alto tráfico"] },
        { titulo:"Stickers", href:mCat("stickers"),
          items:["Sticker adhesivo · 3×3 a 20×20 cm","Vinilo troquelado"] } ],
      [ { titulo:"Publicitarios", href:mCotizar("Publicitarios"),
          items:["Pendón roller 200×80 cm","Paloma 60×100 cm","Mini pendón A4","Tótem de mesa","Bastidor metálico y de madera"] },
        { titulo:"Rotulación vehicular", href:mCat("vehicular"),
          items:["Ploteo vehicular","Vinilo microperforado"] } ],
      [ { titulo:"Papelería", href:mCat("papeleria"),
          items:["Tarjetas de presentación","Volantes","Calendarios corporativos","Agendas y croqueras","Marca páginas"] },
        { titulo:"Merchandising y estampados", href:mCotizar("Merchandising"),
          items:["Tazas y shoperos","Mousepad y botellas","Llaveros y chapitas","Poleras y polerones","Jockeys y lanyards"] } ]
    ],
    destacado: { eyebrow:"Más pedido", titulo:"Vinilo adhesivo",
      texto:"Impreso en 120 cm de ancho. Desde $15.000 el m² con IVA, con precio especial desde 10 m².",
      cta:"Cotizar por m²", href:mCotizar("Gran formato (vinilo adhesivo)") }
  },
  dig: {
    nombre: "Servicios digitales",
    secciones: [
      { txt:"Planes mensuales",     href:mCotizar("Servicios digitales: plan mensual") },
      { txt:"Logotipo e identidad", href:mCotizar("Logotipo e identidad") },
      { txt:"Diseño web",           href:mCotizar("Diseño web") }
    ],
    mensuales: [
      { titulo:"Planes mensuales", precio:"/ mes", texto:"Servicios digitales con pago mes a mes. Pregúntanos por el plan que necesitas.", href:mCotizar("Servicios digitales: plan mensual") }
    ],
    proyectos: [
      { titulo:"Logotipo e identidad", precio:"desde $120.000", texto:"Diseño de marca listo para imprimir y usar en digital.", href:mCotizar("Logotipo e identidad") },
      { titulo:"Diseño web", precio:"desde $250.000", texto:"Sitio a medida, como el de Bacano.", href:mCotizar("Diseño web") }
    ],
    destacado: { eyebrow:"¿No sabes cuál elegir?", titulo:"Te asesoramos gratis",
      texto:"Cuéntanos qué necesitas y te proponemos un plan mensual o un proyecto cerrado.",
      cta:"Hablar con Bacano", href:mCotizar("Servicios digitales") }
  }
};

const PAGE = (location.pathname.split("/").pop() || "index.html").toLowerCase();

/* ============================================================
   HEADER / FOOTER / DRAWER
   ============================================================ */
function logoHTML(){
  return `<a class="logo" href="index.html" aria-label="Bacano Estudio Creativo, inicio">
    <span class="logo__img" aria-hidden="true"></span>
  </a>`;
}

function buildHeader(){
  const host = $("#site-header");
  if(!host) return;
  const chevron = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m2.5 4.5 3.5 3.5 3.5-3.5"/></svg>`;
  const feat = d => `<div class="mfeat">
      <small>${d.eyebrow}</small><strong>${d.titulo}</strong><p>${d.texto}</p>
      <a class="mfeat__btn" href="${d.href}">${d.cta} →</a>
    </div>`;
  const svc = s => `<a class="msvc" href="${s.href}"><b>${s.titulo}</b><em>${s.precio}</em><span>${s.texto}</span></a>`;
  const P = MENU.prod, D = MENU.dig;

  host.innerHTML = `
  <header class="hdr" id="hdr">
    <div class="hdr__l1">
      <div class="wrap hdr__row1">
        ${logoHTML()}
        <nav class="hdr__nav" aria-label="Principal">
          <button type="button" aria-expanded="false" aria-controls="mega-prod" data-area="prod">${P.nombre} ${chevron}</button>
          <button type="button" aria-expanded="false" aria-controls="mega-dig" data-area="dig">${D.nombre} ${chevron}</button>
          <a href="nosotros.html" class="${PAGE === "nosotros.html" ? "is-active" : ""}">Nosotros</a>
        </nav>
        <div class="hdr__act">
          <a class="hdr__txt ${PAGE === "contacto.html" ? "is-active" : ""}" href="contacto.html">Contacto</a>
          <button class="icon-btn" id="openCart" aria-label="Abrir carrito">
            ${I.cart}<span class="cart-count" id="cartCount">0</span>
          </button>
          <a class="hdr__cta" href="contacto.html">Pedir cotización</a>
          <button class="icon-btn hdr__burger" id="openMenu" aria-label="Abrir menú" aria-expanded="false">${I.menu}</button>
        </div>
      </div>
    </div>

    <div class="hdr__l2">
      <div class="wrap hdr__row2">
        <span class="hdr__area" id="hdrArea"></span>
        <nav class="hdr__sub" id="hdrSub" aria-label="Secciones"></nav>
        <form class="hdr__search" action="productos.html" role="search">
          ${I.search}<input name="q" type="search" placeholder="Buscar productos" aria-label="Buscar productos">
        </form>
      </div>
    </div>

    <div class="mega mega--prod" id="mega-prod" hidden>
      <div class="wrap mega__top"><button class="xclose mega__x" type="button">${I.x}<span>Cerrar</span></button></div>
      <div class="wrap mega__in">
        ${P.columnas.map(col => `<div class="mega__col">${col.map(g => `
          <h4><a href="${g.href}">${g.titulo}</a></h4>
          <ul>${g.items.map(t => `<li><a href="${g.href}">${t}</a></li>`).join("")}</ul>`).join("")}
        </div>`).join("")}
        ${feat(P.destacado)}
      </div>
    </div>

    <div class="mega mega--dig" id="mega-dig" hidden>
      <div class="wrap mega__top"><button class="xclose mega__x" type="button">${I.x}<span>Cerrar</span></button></div>
      <div class="wrap mega__in">
        <div class="mega__col"><h4>Con pago mensual</h4><div class="msvcs">${D.mensuales.map(svc).join("")}</div></div>
        <div class="mega__col"><h4>Proyectos a medida</h4><div class="msvcs">${D.proyectos.map(svc).join("")}</div></div>
        ${feat(D.destacado)}
      </div>
    </div>

    <nav class="mega__foot" aria-label="Más secciones">
      <a href="nosotros.html">Nosotros</a><a href="contacto.html">Contacto</a>
      <a class="hdr__cta" href="contacto.html">Pedir cotización</a>
    </nav>
  </header>`;

  const hdr = $("#hdr");
  const tops = $$(".hdr__nav button", hdr);
  const burger = $("#openMenu");

  /* nivel 2: secciones del área activa */
  const setArea = k => {
    $("#hdrArea").textContent = MENU[k].nombre;
    const actual = location.pathname.split("/").pop() + location.search;
    $("#hdrSub").innerHTML = MENU[k].secciones.map(s =>
      `<a href="${s.href}" class="${actual === s.href ? "is-active" : ""}">${s.txt}</a>`).join("");
  };
  const tipo = new URLSearchParams(location.search).get("tipo") || "";
  setArea(/digital|logotipo|web/i.test(tipo) ? "dig" : "prod");

  const cerrar = () => {
    tops.forEach(b => { b.setAttribute("aria-expanded", "false"); $("#" + b.getAttribute("aria-controls")).hidden = true; });
    burger.setAttribute("aria-expanded", "false");
    burger.innerHTML = I.menu; burger.setAttribute("aria-label", "Abrir menú"); burger.classList.remove("xclose");
    hdr.classList.remove("is-menu");
    document.body.style.overflow = "";
  };
  tops.forEach(b => b.addEventListener("click", e => {
    e.stopPropagation();
    const abierto = b.getAttribute("aria-expanded") === "true";
    cerrar();
    setArea(b.dataset.area);
    if(!abierto){ b.setAttribute("aria-expanded", "true"); $("#" + b.getAttribute("aria-controls")).hidden = false; }
  }));
  burger.addEventListener("click", e => {
    e.stopPropagation();
    const abierto = burger.getAttribute("aria-expanded") === "true";
    cerrar();
    if(!abierto){
      burger.setAttribute("aria-expanded", "true");
      burger.innerHTML = `${I.x}<span>Cerrar</span>`; burger.setAttribute("aria-label", "Cerrar menú"); burger.classList.add("xclose");
      hdr.classList.add("is-menu");
      $("#mega-prod").hidden = false; $("#mega-dig").hidden = false;
      document.body.style.overflow = "hidden";
    }
  });
  document.addEventListener("click", e => { if(!e.target.closest(".mega") && !e.target.closest(".mega__foot")) cerrar(); });
  document.addEventListener("keydown", e => { if(e.key === "Escape") cerrar(); });
  $$(".mega__x", hdr).forEach(b => b.onclick = e => { e.stopPropagation(); cerrar(); });
  $("#openCart").onclick = () => { cerrar(); Cart.open(); };

  /* el header se fija al desplazar y se esconde al bajar */
  let last = scrollTop();
  const onScroll = () => {
    const y = scrollTop();
    hdr.classList.toggle("is-stuck", y > 12);
    const blocked = hdr.classList.contains("is-menu") || tops.some(b => b.getAttribute("aria-expanded") === "true") || $("#drawer")?.classList.contains("is-open");
    hdr.classList.toggle("is-hidden", !blocked && y > 260 && y > last + 4);
    last = y;
  };
  window.addEventListener("scroll", onScroll, { passive:true });
  document.addEventListener("scroll", onScroll, { passive:true, capture:true });
  onScroll();
}

function buildRail(){
  const host = $("#rail");
  if(!host) return;
  const items = [
    { icon:I.home,    href:"index.html",                    label:"Inicio" },
    { icon:I.grid,    href:"productos.html",                label:"Categorías" },
    { icon:I.box,     href:"productos.html?cat=granformato", label:"Gran formato" },
    { icon:I.headset, href:"contacto.html",                 label:"Soporte" },
    { icon:I.user,    href:"carrito.html",                  label:"Mi pedido" }
  ];
  host.className = "rail";
  host.innerHTML = items.map((it, i) =>
    `<a href="${it.href}" class="${i === 0 && PAGE === "index.html" ? "is-active" : ""}" aria-label="${it.label}" title="${it.label}">${it.icon}</a>`
  ).join("");
}

function buildFooter(){
  const host = $("#site-footer");
  if(!host) return;
  const cats = CATEGORIAS.map(c =>
    `<li><a href="productos.html?cat=${c.slug}">${c.nombre}</a></li>`).join("");

  host.innerHTML = `
  <footer class="footer">
    <div class="wrap">
      <div class="footer__grid">
        <div>
          ${logoHTML()}
          <p style="margin-top:16px;max-width:34ch">${SITE.slogan}. Fabricamos, imprimimos e instalamos desde ${2026 - SITE.anios} en Santiago, con despacho a todo Chile.</p>
          <div class="socials">
            <a href="#" aria-label="Instagram">${I.ig}</a>
            <a href="#" aria-label="Facebook">${I.fb}</a>
            <a href="#" aria-label="TikTok">${I.tk}</a>
            <a href="${waLink()}" aria-label="WhatsApp" target="_blank" rel="noopener">${I.wa}</a>
          </div>
        </div>
        <div>
          <h4>Productos</h4>
          <ul>${cats}</ul>
        </div>
        <div>
          <h4>Empresa</h4>
          <ul>
            <li><a href="nosotros.html">Quiénes somos</a></li>
            <li><a href="nosotros.html#terreno">Trabajo en terreno</a></li>
            <li><a href="nosotros.html#garantias">Garantías</a></li>
            <li><a href="index.html#faq">Preguntas frecuentes</a></li>
            <li><a href="contacto.html">Contacto</a></li>
          </ul>
        </div>
        <div>
          <h4>Contacto</h4>
          <ul>
            <li><a href="tel:${SITE.telefonoLink}">${SITE.telefono}</a></li>
            <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
            <li style="color:#b9b9c3;font-size:.9rem">${SITE.direccion}</li>
            <li style="color:#b9b9c3;font-size:.9rem">${SITE.horario}</li>
          </ul>
          <div class="pay-methods" style="margin-top:16px">
            <span class="pay" style="border-color:#2c2c34">Transferencia</span>
            <span class="pay" style="border-color:#2c2c34">Débito</span>
            <span class="pay" style="border-color:#2c2c34">Crédito</span>
            <span class="pay" style="border-color:#2c2c34">Factura</span>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© ${new Date().getFullYear()} ${SITE.nombre} · ${SITE.dominio} · Todos los derechos reservados</span>
        <span>Sitio con compra segura · Datos protegidos</span>
      </div>
    </div>
    <div class="footer__mark"><span class="wordmark">Bacano.</span></div>
  </footer>`;
}

function buildFloating(){
  const el = document.createElement("div");
  el.innerHTML = `
    <a class="wa" href="${waLink()}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">
      ${I.wa}<span>Escríbenos</span>
    </a>
    <div class="overlay" id="overlay"></div>
    <aside class="drawer cd" id="drawer" aria-label="Carrito de compras">
      <div class="cd__ship">
        <button class="cd__close xclose" id="closeCart" type="button">${I.x}<span>Cerrar</span></button>
        <div class="cd__shipTxt" id="cdShip"></div>
        <div class="cd__bar"><i id="cdBar"></i></div>
      </div>
      <div class="cd__body" id="drawerBody"></div>
      <div class="cd__foot" id="drawerFoot"></div>
    </aside>
    <div class="toast-wrap" id="toasts"></div>
    <div class="modal" id="modal" role="dialog" aria-modal="true"><div class="modal__box" id="modalBox"></div></div>`;
  document.body.append(...el.children);

  $("#overlay").onclick  = () => { Cart.close(); closeModal(); };
  $("#closeCart").onclick = () => Cart.close();
  document.addEventListener("keydown", e => {
    if(e.key === "Escape"){ Cart.close(); closeModal(); $("#mobileNav")?.classList.remove("is-open"); }
  });
}

/* ============================================================
   TOAST
   ============================================================ */
function toast(msg, icon = I.check){
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `${icon}<span>${msg}</span>`;
  $("#toasts").append(t);
  setTimeout(() => { t.classList.add("is-out"); setTimeout(() => t.remove(), 320); }, 2800);
}

/* ============================================================
   CARRITO
   ============================================================ */
const Cart = {
  key: "bacano_cart_v1",
  items: [],

  load(){
    try { this.items = JSON.parse(localStorage.getItem(this.key)) || []; }
    catch { this.items = []; }
  },
  save(){
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.render();
  },
  find(id){ return PRODUCTOS.find(p => p.id === id); },

  add(id, qty = 1, silent = false){
    const p = this.find(id);
    if(!p) return;
    const line = this.items.find(i => i.id === id);
    if(line) line.qty += qty;
    else this.items.push({ id, qty });
    if(!silent) this.lastAdded = { id, t: Date.now() };
    this.save();
    /* igual que en las tiendas grandes: al agregar se abre el carrito con la confirmación */
    if(!silent){ closeModal(); this.open(); }
  },
  setQty(id, qty){
    const line = this.items.find(i => i.id === id);
    if(!line) return;
    line.qty = Math.max(1, Math.min(999, qty));
    this.save();
  },
  remove(id){
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    toast("Producto eliminado del carrito", I.trash);
  },
  clear(){ this.items = []; this.save(); },

  count(){ return this.items.reduce((a, i) => a + i.qty, 0); },
  subtotal(){
    return this.items.reduce((a, i) => {
      const p = this.find(i.id);
      return a + (p ? p.precio * i.qty : 0);
    }, 0);
  },
  envio(){
    const s = this.subtotal();
    if(s === 0) return 0;
    return s >= SITE.envioGratisDesde ? 0 : 4990;
  },
  /* códigos de descuento: se definen en data.js como SITE.cupones = { "CODIGO": 10 } (porcentaje) */
  cupon: (() => { try { return localStorage.getItem("bacano_cupon_v1") || ""; } catch { return ""; } })(),
  cupones(){ return (typeof SITE !== "undefined" && SITE.cupones) || {}; },
  descuento(){
    const pct = this.cupones()[this.cupon];
    return pct ? Math.round(this.subtotal() * pct / 100) : 0;
  },
  aplicarCupon(txt){
    const c = (txt || "").trim().toUpperCase();
    if(!c) return "Escribe un código.";
    if(!this.cupones()[c]) return "Ese código no es válido.";
    this.cupon = c;
    try { localStorage.setItem("bacano_cupon_v1", c); } catch {}
    this.render();
    return "";
  },
  total(){ return this.subtotal() - this.descuento() + this.envio(); },

  open(){
    $("#drawer").classList.add("is-open");
    $("#overlay").classList.add("is-on");
    document.body.style.overflow = "hidden";
  },
  close(){
    $("#drawer")?.classList.remove("is-open");
    $("#overlay")?.classList.remove("is-on");
    if(!$("#modal")?.classList.contains("is-open")) document.body.style.overflow = "";
  },

  lineHTML(i, compact = true){
    const p = this.find(i.id);
    if(!p) return "";
    return `<div class="line">
      <div class="line__img"><img src="${p.img}" alt="${p.nombre}" loading="lazy"></div>
      <div class="line__info">
        <h4>${p.nombre}</h4>
        <small>${p.unidad}${compact ? "" : ` · Entrega ${p.plazo}`}</small>
        <div class="line__row">
          <div class="qty">
            <button data-minus="${p.id}" aria-label="Quitar uno">−</button>
            <input type="text" inputmode="numeric" value="${i.qty}" data-qty="${p.id}" aria-label="Cantidad">
            <button data-plus="${p.id}" aria-label="Agregar uno">+</button>
          </div>
          <span class="line__price">${money(p.precio * i.qty)}</span>
        </div>
        <button class="line__del" data-del="${p.id}">Eliminar</button>
      </div>
    </div>`;
  },

  render(){
    const n = this.count();
    const badge = $("#cartCount");
    if(badge){ badge.textContent = n; badge.classList.toggle("is-on", n > 0); }
    $("#drawerCount") && ($("#drawerCount").textContent = n ? `(${n})` : "");

    const body = $("#drawerBody"), foot = $("#drawerFoot");
    if(body){
      /* barra de despacho gratis */
      const sub = this.subtotal(), meta = SITE.envioGratisDesde, falta = meta - sub;
      $("#cdShip").innerHTML = !this.items.length
        ? `Despacho gratis desde <b>${money(meta)}</b>`
        : falta > 0 ? `Agrega <b>${money(falta)}</b> para tener <b>despacho gratis</b>`
                    : `${I.check}<b>¡Tienes despacho gratis!</b>`;
      $("#cdBar").style.width = Math.min(100, sub / meta * 100) + "%";
      $("#cdBar").classList.toggle("is-full", falta <= 0 && sub > 0);

      if(!this.items.length){
        body.innerHTML = `<div class="cd__empty">
          <h3>Tu carrito está vacío</h3>
          <p>Arma tu pedido y te enviamos una prueba digital antes de imprimir.</p>
          <a class="cd__buy" href="productos.html">Ver productos</a>
        </div>
        ${this.sugerenciasHTML("Lo más pedido")}`;
        foot.innerHTML = "";
      } else {
        const la = this.lastAdded && Date.now() - this.lastAdded.t < 4000 ? this.find(this.lastAdded.id) : null;
        body.innerHTML = `
          ${la ? `<div class="cd__ok">${I.check}<span><b>${la.nombre}</b> se agregó al carrito</span></div>` : ""}
          <div class="cd__title"><h3>Tu carrito</h3><span>${n} ${n === 1 ? "producto" : "productos"}</span></div>
          <div class="cd__lines">${this.items.map(i => this.drawerLineHTML(i)).join("")}</div>
          ${this.sugerenciasHTML("Complementa tu pedido")}`;

        const d = this.descuento();
        foot.innerHTML = `
          <details class="cd__code"${this.cupon ? " open" : ""}>
            <summary>¿Tienes un código de descuento?</summary>
            <form class="cd__cupon" id="cdCupon" novalidate>
              <input name="c" placeholder="Código de descuento" aria-label="Código de descuento" value="${this.cupon}" autocomplete="off">
              <button type="submit">Aplicar</button>
            </form>
            <p class="cd__msg" id="cdMsg" role="status"></p>
          </details>
          <div class="cd__sum">
            <div><span>Subtotal</span><b>${money(sub)}</b></div>
            ${d ? `<div><span>Descuento (${this.cupon})</span><b>−${money(d)}</b></div>` : ""}
            <div><span>Despacho</span><b>${this.envio() ? money(this.envio()) : "Gratis"}</b></div>
          </div>
          <div class="cd__total"><span>Total</span><b>${money(this.total())}</b></div>
          <a class="cd__see" href="carrito.html">Ver carrito</a>
          <a class="cd__buy" href="carrito.html">Comprar</a>
          <p class="cd__trust">${I.shield}<span>Prueba digital antes de imprimir · Reimpresión sin costo si la falla es nuestra</span></p>`;

        $("#cdCupon").addEventListener("submit", e => {
          e.preventDefault();
          const err = this.aplicarCupon(e.target.c.value);
          if(err) $("#cdMsg").textContent = err;
        });
      }

      /* flechas del carrusel de sugerencias */
      const rail = $(".cd__rail", body);
      $$(".cd__arrow", body).forEach(b => b.onclick = () =>
        rail.scrollBy({ left: (b.dataset.dir === "prev" ? -1 : 1) * rail.clientWidth * .85, behavior:"smooth" }));
    }
    renderCartPage();
  },

  drawerLineHTML(i){
    const p = this.find(i.id);
    if(!p) return "";
    const c = CATEGORIAS.find(x => x.slug === p.cat);
    return `<div class="cd__line">
      <div class="cd__img"><img src="${p.img}" alt="${p.nombre}" loading="lazy"></div>
      <div class="cd__info">
        <small>${c ? c.nombre : ""}</small>
        <h4>${p.nombre}</h4>
        <span>${p.unidad}</span>
        <b>${money(p.precio * i.qty)}</b>
      </div>
      <div class="cd__side">
        <button class="cd__del" data-del="${p.id}" aria-label="Eliminar ${p.nombre}">${I.trash}</button>
        <div class="cd__qty">
          <button data-minus="${p.id}" aria-label="Quitar uno">−</button>
          <input type="text" inputmode="numeric" value="${i.qty}" data-qty="${p.id}" aria-label="Cantidad">
          <button data-plus="${p.id}" aria-label="Agregar uno">+</button>
        </div>
      </div>
    </div>`;
  },

  /* sugerencias: primero de las mismas categorías que ya están en el carrito */
  sugerenciasHTML(titulo){
    const enCarro = new Set(this.items.map(i => i.id));
    const cats = new Set(this.items.map(i => this.find(i.id)?.cat));
    const lista = PRODUCTOS.filter(p => !enCarro.has(p.id))
      .sort((a, b) => (cats.has(b.cat) - cats.has(a.cat)) || (b.flags.length - a.flags.length))
      .slice(0, 6);
    if(!lista.length) return "";
    return `<div class="cd__sug">
      <div class="cd__sugHead"><h4>${titulo}</h4>
        <span><button class="cd__arrow" data-dir="prev" aria-label="Anterior">${I.arrowR}</button><button class="cd__arrow" data-dir="next" aria-label="Siguiente">${I.arrowR}</button></span>
      </div>
      <div class="cd__rail">${lista.map(p => `
        <div class="cd__card">
          <div class="cd__cimg"><img src="${p.img}" alt="" loading="lazy"></div>
          <div class="cd__cinfo"><h5>${p.nombre}</h5><b>${money(p.precio)}</b><small>${p.unidad}</small>
            <button class="cd__add" data-add="${p.id}">Agregar</button></div>
        </div>`).join("")}
      </div>
    </div>`;
  }
};

/* delegación de eventos del carrito */
document.addEventListener("click", e => {
  const t = e.target.closest("[data-plus],[data-minus],[data-del],[data-add],[data-view]");
  if(!t) return;
  if(t.dataset.plus)  Cart.setQty(t.dataset.plus,  Cart.items.find(i => i.id === t.dataset.plus).qty + 1);
  if(t.dataset.minus) Cart.setQty(t.dataset.minus, Cart.items.find(i => i.id === t.dataset.minus).qty - 1);
  if(t.dataset.del)   Cart.remove(t.dataset.del);
  if(t.dataset.add){
    Cart.add(t.dataset.add);
    t.classList.add("is-done");
    t.innerHTML = I.check;
    setTimeout(() => { t.classList.remove("is-done"); t.innerHTML = I.plus; }, 1300);
  }
  if(t.dataset.view) openQuickView(t.dataset.view);
});
document.addEventListener("change", e => {
  const q = e.target.closest("[data-qty]");
  if(q) Cart.setQty(q.dataset.qty, parseInt(q.value.replace(/\D/g, ""), 10) || 1);
});

/* ============================================================
   TARJETA DE PRODUCTO
   ============================================================ */
function stars(r){
  const full = Math.round(r);
  return `<span class="stars">${"★".repeat(full)}${"☆".repeat(5 - full)}</span>`;
}

function cardHTML(p){
  const cat = CATEGORIAS.find(c => c.slug === p.cat);
  return `<article class="card reveal">
    <div class="card__media">
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
      <div class="card__flags">
        ${p.flags.map(f => `<span class="tag tag--red">${f}</span>`).join("")}
        ${p.antes ? `<span class="tag">-${Math.round((1 - p.precio / p.antes) * 100)}%</span>` : ""}
      </div>
      <button class="btn btn--light btn--sm card__quick" data-view="${p.id}">${I.eye} Ver detalle</button>
    </div>
    <div class="card__body">
      <span class="card__cat">${cat ? cat.nombre : ""}</span>
      <h3 class="card__title">${p.nombre}</h3>
      <span class="card__meta">${p.unidad}</span>
      <div class="card__rating">${stars(p.rating)}<span>${p.rating} (${p.reviews})</span></div>
      <div class="card__foot">
        <div class="price"><small>Desde</small>${money(p.precio)}${p.antes ? `<s>${money(p.antes)}</s>` : ""}</div>
        <button class="add-btn" data-add="${p.id}" aria-label="Agregar ${p.nombre} al carrito">${I.plus}</button>
      </div>
    </div>
  </article>`;
}

/* tarjeta compacta (carrusel de la home) */
function pcardHTML(p){
  return `<article class="pcard">
    ${p.flags.length ? `<span class="pcard__tag">${p.flags[0]}</span>` : ""}
    <div class="pcard__img"><img src="${p.img}" alt="${p.nombre}" loading="lazy"></div>
    <div class="pcard__bot">
      <div>
        <h3>${p.nombre}</h3>
        <b>${money(p.precio)}</b>
        <small>${p.unidad}</small>
      </div>
      <button class="pcard__add" data-add="${p.id}" aria-label="Agregar ${p.nombre} al carrito">${I.plus}</button>
    </div>
  </article>`;
}

/* ============================================================
   QUICK VIEW
   ============================================================ */
function openQuickView(id){
  const p = PRODUCTOS.find(x => x.id === id);
  if(!p) return;
  const cat = CATEGORIAS.find(c => c.slug === p.cat);
  $("#modalBox").innerHTML = `
    <button class="modal__close xclose" id="modalClose" type="button">${I.x}<span>Cerrar</span></button>
    <div class="modal__grid">
      <div class="modal__media"><img src="${p.img}" alt="${p.nombre}"></div>
      <div class="modal__body">
        <span class="card__cat">${cat ? cat.nombre : ""}</span>
        <h3 class="display" style="margin:8px 0 10px">${p.nombre}</h3>
        <div class="card__rating" style="margin-bottom:14px">${stars(p.rating)}<span>${p.rating} · ${p.reviews} opiniones</span></div>
        <p style="color:var(--gray);font-size:.94rem">${p.desc}</p>
        <div class="spec">${p.specs.map(s => `<div>${I.check}<span>${s}</span></div>`).join("")}</div>
        <div class="qv__eta">
          ${I.clock}<span>Entrega estimada: <b style="color:var(--black)">${p.plazo}</b></span>
        </div>
        <div class="price" style="font-size:2rem;margin-bottom:16px"><small>${p.unidad}</small>${money(p.precio)}${p.antes ? `<s>${money(p.antes)}</s>` : ""}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn--red" data-add="${p.id}">Agregar al carrito ${I.cart}</button>
          <a class="btn btn--ghost" href="${waLink(`Hola Bacano, quiero cotizar: ${p.nombre}`)}" target="_blank" rel="noopener">Consultar</a>
        </div>
        <div class="secure-note" style="margin-top:16px">${I.shield}<span>Prueba digital antes de imprimir · Garantía de reimpresión por falla nuestra</span></div>
      </div>
    </div>`;
  $("#modal").classList.add("is-open");
  $("#overlay").classList.add("is-on");
  document.body.style.overflow = "hidden";
  $("#modalClose").onclick = closeModal;
}
function closeModal(){
  $("#modal")?.classList.remove("is-open");
  if(!$("#drawer")?.classList.contains("is-open")){
    $("#overlay")?.classList.remove("is-on");
    document.body.style.overflow = "";
  }
}

/* ============================================================
   SLIDER
   ============================================================ */
function initSlider(root){
  const track  = $(".slides", root);
  const slides = $$(".slide", root);
  const dots   = $$(".dot", root);
  let idx = 0, timer = null;
  const DELAY = 6000;

  function go(n){
    idx = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    dots.forEach((d, i) => {
      d.classList.remove("is-active");
      d.querySelector("span").style.width = "0";
    });
    void dots[idx]?.offsetWidth;
    dots[idx]?.classList.add("is-active");
    restart();
  }
  function restart(){ clearInterval(timer); timer = setInterval(() => go(idx + 1), DELAY); }

  $(".slider__btn--next", root).onclick = () => go(idx + 1);
  $(".slider__btn--prev", root).onclick = () => go(idx - 1);
  dots.forEach((d, i) => d.onclick = () => go(i));

  root.addEventListener("mouseenter", () => clearInterval(timer));
  root.addEventListener("mouseleave", restart);

  /* swipe táctil */
  let x0 = null;
  root.addEventListener("touchstart", e => x0 = e.touches[0].clientX, { passive:true });
  root.addEventListener("touchend", e => {
    if(x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 45) go(dx < 0 ? idx + 1 : idx - 1);
    x0 = null;
  });

  go(0);
}

/* ============================================================
   HOME
   ============================================================ */
function buildHome(){
  const catHost = $("#catsHost");
  if(catHost){
    catHost.innerHTML = CATEGORIAS.map(c => {
      const n = PRODUCTOS.filter(p => p.cat === c.slug).length;
      return `<a class="cat reveal" href="productos.html?cat=${c.slug}">
        <div class="cat__img"><img src="${c.img}" alt="${c.nombre}" loading="lazy"></div>
        <span class="cat__count">${n} productos</span>
        <div class="cat__body"><h3>${c.nombre}</h3><p>${c.desc}</p></div>
      </a>`;
    }).join("");
  }

  const destHost = $("#destacadosHost");
  if(destHost){
    const dest = PRODUCTOS.filter(p => p.flags.length).slice(0, 8);
    destHost.innerHTML = dest.map(cardHTML).join("");
  }

  /* portada: producto destacado (id en data-producto) */
  const sotd = $(".sotd[data-producto]");
  const pd = sotd && PRODUCTOS.find(p => p.id === sotd.dataset.producto);
  if(pd){
    const c = CATEGORIAS.find(x => x.slug === pd.cat);
    $("[data-f='precio']", sotd).textContent = "Desde " + money(pd.precio);
    $("[data-f='unidad']", sotd).textContent = pd.unidad;
    $("[data-f='nombre']", sotd).textContent = pd.nombre;
    $("[data-f='cat']", sotd).textContent = c ? c.nombre : "";
    const img = $("[data-f='img']", sotd);
    img.src = pd.img.replace(/w=\d+/, "w=1800"); img.alt = pd.nombre;
    $("[data-f='spec']", sotd).innerHTML =
      pd.specs.slice(0, 2).map((s, i) => `<div><small>${i ? "Detalle" : "Incluye"}</small><strong>${s}</strong></div>`).join("") +
      `<div><small>Plazo</small><strong>${pd.plazo}</strong></div>` +
      `<button class="sotd__go" type="button" data-view="${pd.id}">Ver detalle →</button>`;
  }

  /* "lo más pedido": grilla con filtro por categoría */
  const wGrid = $("#wGrid");
  if(wGrid){
    const lista = PRODUCTOS.slice(0, 9);
    const catsUsadas = CATEGORIAS.filter(c => lista.some(p => p.cat === c.slug));
    const CORTO = { granformato:"Gran formato", papeleria:"Papelería", vehicular:"Vehicular" };
    const corto = c => CORTO[c.slug] || c.nombre.split(" y ")[0];
    $("#wChips").innerHTML = `<button type="button" aria-pressed="true" data-c="">Todo</button>` +
      catsUsadas.map(c => `<button type="button" aria-pressed="false" data-c="${c.slug}">${corto(c)}</button>`).join("");
    const pintar = slug => {
      const l = slug ? lista.filter(p => p.cat === slug) : lista;
      wGrid.innerHTML = l.map(p => {
        const c = CATEGORIAS.find(x => x.slug === p.cat);
        return `<article class="wcard">
          <button class="wcard__img" type="button" data-view="${p.id}" aria-label="Ver ${p.nombre}"><img src="${p.img}" alt="" loading="lazy"></button>
          <div class="wcard__row"><h3>${p.nombre}</h3><span class="wtag">${c ? corto(c) : ""}</span></div>
          <div class="wcard__row"><p class="wprice"><b>${money(p.precio)}</b> ${p.unidad}</p>
            <button class="wadd" type="button" data-add="${p.id}" aria-label="Agregar ${p.nombre} al carrito">${I.plus}</button></div>
        </article>`;
      }).join("");
      $("#wCount").textContent = l.length;
    };
    $("#wChips").addEventListener("click", e => {
      const b = e.target.closest("button"); if(!b) return;
      $$("#wChips button").forEach(x => x.setAttribute("aria-pressed", x === b));
      pintar(b.dataset.c);
    });
    pintar("");
  }

  /* carrusel "lo más pedido" */
  const picksHost = $("#picksHost");
  if(picksHost){
    picksHost.innerHTML = PRODUCTOS.slice(0, 8).map(pcardHTML).join("");
    const step = () => {
      const c = picksHost.firstElementChild;
      return c ? c.getBoundingClientRect().width + 18 : 240;
    };
    $("#picksPrev") && ($("#picksPrev").onclick = () => picksHost.scrollBy({ left:-step(), behavior:"smooth" }));
    $("#picksNext") && ($("#picksNext").onclick = () => picksHost.scrollBy({ left: step(), behavior:"smooth" }));
  }

  const qHost = $("#quotesHost");
  if(qHost){
    qHost.innerHTML = TESTIMONIOS.map(t => `<div class="quote reveal">
      <span class="stars">${"★".repeat(t.estrellas)}</span>
      <p>“${t.texto}”</p>
      <footer>
        <span class="avatar">${t.inicial}</span>
        <span><b>${t.nombre}</b><span>${t.empresa}</span></span>
        <span class="verified">${I.check} Verificada</span>
      </footer>
    </div>`).join("");
  }

  const faqHost = $("#faqHost");
  if(faqHost){
    faqHost.innerHTML = FAQS.map(f => `<div class="faq__item">
      <button class="faq__q">${f.q}${I.plus}</button>
      <div class="faq__a"><p>${f.a}</p></div>
    </div>`).join("");

    $$(".faq__q", faqHost).forEach(b => b.onclick = () => {
      const item = b.parentElement;
      const open = item.classList.contains("is-open");
      $$(".faq__item", faqHost).forEach(i => {
        i.classList.remove("is-open");
        $(".faq__a", i).style.maxHeight = null;
      });
      if(!open){
        item.classList.add("is-open");
        $(".faq__a", item).style.maxHeight = $(".faq__a", item).scrollHeight + "px";
      }
    });
  }
}

/* ============================================================
   CATÁLOGO
   ============================================================ */
function buildShop(){
  const host = $("#catalogo");
  if(!host) return;

  const params = new URLSearchParams(location.search);
  const preCat = params.get("cat");

  $("#filtrosCats").innerHTML = CATEGORIAS.map(c => `
    <label class="check">
      <input type="checkbox" value="${c.slug}" ${preCat === c.slug ? "checked" : ""}>
      <span>${c.nombre}</span>
      <span class="count">${PRODUCTOS.filter(p => p.cat === c.slug).length}</span>
    </label>`).join("");

  const preQ = (params.get("q") || "").trim();
  if(preQ) $("#buscar").value = preQ;
  const state = { q:preQ, cats:new Set(preCat ? [preCat] : []), precio:"", orden:"rel" };

  function apply(){
    let list = PRODUCTOS.slice();
    if(state.cats.size) list = list.filter(p => state.cats.has(p.cat));
    if(state.q){
      const q = state.q.toLowerCase();
      list = list.filter(p => (p.nombre + " " + p.desc + " " + p.cat).toLowerCase().includes(q));
    }
    if(state.precio === "1") list = list.filter(p => p.precio < 30000);
    if(state.precio === "2") list = list.filter(p => p.precio >= 30000 && p.precio < 100000);
    if(state.precio === "3") list = list.filter(p => p.precio >= 100000);

    if(state.orden === "asc")  list.sort((a, b) => a.precio - b.precio);
    if(state.orden === "desc") list.sort((a, b) => b.precio - a.precio);
    if(state.orden === "top")  list.sort((a, b) => b.reviews - a.reviews);

    host.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<div class="empty" style="grid-column:1/-1">${I.search}
          <h4>Sin resultados</h4>
          <p>Probá con otra palabra o quitá algún filtro. También podés pedirnos una cotización a medida.</p>
          <a class="btn btn--red btn--sm" href="contacto.html" style="margin-top:14px">Cotizar a medida</a>
        </div>`;
    $("#results").textContent = `${list.length} producto${list.length === 1 ? "" : "s"}`;
    observeReveal();
  }

  $("#filtrosCats").addEventListener("change", e => {
    const v = e.target.value;
    e.target.checked ? state.cats.add(v) : state.cats.delete(v);
    apply();
  });
  $("#filtrosPrecio").addEventListener("change", e => { state.precio = e.target.value; apply(); });
  $("#buscar").addEventListener("input", e => { state.q = e.target.value.trim(); apply(); });
  $("#orden").addEventListener("change", e => { state.orden = e.target.value; apply(); });
  $("#limpiar").onclick = () => {
    state.q = ""; state.cats.clear(); state.precio = ""; state.orden = "rel";
    $("#buscar").value = ""; $("#orden").value = "rel";
    $$("#filtrosCats input").forEach(i => i.checked = false);
    $$("#filtrosPrecio input").forEach(i => i.checked = false);
    apply();
  };
  $("#toggleFiltros") && ($("#toggleFiltros").onclick = () => $("#filtros").classList.toggle("is-open"));
  $("#cerrarFiltros") && ($("#cerrarFiltros").onclick = () => $("#filtros").classList.remove("is-open"));

  apply();
}

/* ============================================================
   PÁGINA CARRITO / CHECKOUT
   ============================================================ */
function renderCartPage(){
  const host = $("#cartLines");
  if(!host) return;

  if(!Cart.items.length){
    host.innerHTML = `<div class="empty">${I.cart}
      <h4>Todavía no agregaste productos</h4>
      <p>Explorá el catálogo o pedinos una cotización a medida: letreros, stickers, pendones y más.</p>
      <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
        <a class="btn btn--red btn--sm" href="productos.html">Ver productos</a>
        <a class="btn btn--ghost btn--sm" href="contacto.html">Cotizar a medida</a>
      </div></div>`;
    $("#cartSummary").innerHTML = "";
    return;
  }

  host.innerHTML = Cart.items.map(i => Cart.lineHTML(i, false)).join("");
  const falta = SITE.envioGratisDesde - Cart.subtotal();

  $("#cartSummary").innerHTML = `
    <div class="totals">
      <div><span>Subtotal (${Cart.count()} ítems)</span><b>${money(Cart.subtotal())}</b></div>
      <div><span>Despacho</span><b>${Cart.envio() ? money(Cart.envio()) : "Gratis"}</b></div>
      ${falta > 0 ? `<div style="font-size:.82rem;color:var(--gray)"><span>Faltan ${money(falta)} para envío gratis</span></div>` : ""}
      <div class="grand"><span>Total</span><span>${money(Cart.total())}</span></div>
    </div>
    <p class="form-note" style="margin:10px 0 16px">Precios con IVA incluido. Emitimos boleta o factura.</p>
    <a class="btn btn--red btn--block" href="#datos">Continuar con mis datos ${I.arrowR}</a>
    <div class="pay-methods" style="justify-content:center;margin-top:14px">
      <span class="pay">Transferencia</span><span class="pay">Débito</span><span class="pay">Crédito</span><span class="pay">Factura 30 días</span>
    </div>
    <div class="secure-note" style="margin-top:14px">${I.shield}<span>Tus datos viajan cifrados y no se comparten con terceros.</span></div>
    <div class="secure-note" style="margin-top:8px">${I.check}<span>Aprobás una prueba digital antes de que entre a máquina.</span></div>`;
}

function initCheckout(){
  const form = $("#checkoutForm");
  if(!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    if(!Cart.items.length){ toast("Tu carrito está vacío", I.cart); return; }

    const data = Object.fromEntries(new FormData(form).entries());
    const nro = "BC-" + Date.now().toString().slice(-6);
    const detalle = Cart.items.map(i => {
      const p = Cart.find(i.id);
      return `• ${i.qty} × ${p.nombre} (${money(p.precio * i.qty)})`;
    }).join("\n");

    const msg = `Pedido ${nro} — ${SITE.dominio}\n\n${detalle}\n\nTotal: ${money(Cart.total())}\n\nNombre: ${data.nombre}\nEmail: ${data.email}\nTeléfono: ${data.telefono}\nDespacho: ${data.entrega}\nDirección: ${data.direccion || "—"}\nComuna: ${data.comuna || "—"}\nNotas: ${data.notas || "—"}`;

    $("#checkoutWrap").innerHTML = `
      <div class="panel center" style="padding:44px 30px">
        <div style="width:76px;height:76px;border-radius:50%;background:var(--red);color:#fff;display:grid;place-items:center;margin:0 auto 20px">
          <span style="width:34px;height:34px;display:block">${I.check}</span>
        </div>
        <h2 class="display" style="margin-bottom:12px">¡Pedido recibido!</h2>
        <p style="color:var(--gray);max-width:52ch;margin-inline:auto">
          Tu número de pedido es <b style="color:var(--black)">${nro}</b>. Te enviamos un correo a
          <b style="color:var(--black)">${data.email}</b> con el enlace para subir tu diseño y los datos de pago.
          Un ejecutivo confirma todo en menos de 2 horas hábiles.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:26px">
          <a class="btn btn--red" href="${waLink(msg)}" target="_blank" rel="noopener">Enviar pedido por WhatsApp ${I.wa}</a>
          <a class="btn btn--ghost" href="productos.html">Seguir comprando</a>
        </div>
        <p class="form-note" style="margin-top:22px">Guardá este número para hacer seguimiento de tu trabajo.</p>
      </div>`;
    Cart.clear();
    window.scrollTo({ top:0, behavior:"smooth" });
  });

  /* mostrar/ocultar dirección según tipo de entrega */
  form.addEventListener("change", e => {
    if(e.target.name === "entrega"){
      const retira = e.target.value === "Retiro en taller";
      $("#bloqueDespacho").style.display = retira ? "none" : "grid";
      $$("#bloqueDespacho .input").forEach(i => i.required = !retira);
    }
  });
}

/* ============================================================
   FORMULARIO DE CONTACTO
   ============================================================ */
function initContacto(){
  const form = $("#contactoForm");
  if(!form) return;

  /* si llega desde el menú (contacto.html?tipo=…), deja elegido ese tipo de trabajo */
  const tipo = new URLSearchParams(location.search).get("tipo");
  const sel = $("#c-tipo");
  if(tipo && sel){
    let opt = [...sel.options].find(o => o.text === tipo);
    if(!opt){ opt = new Option(tipo, tipo); sel.add(opt, sel.options[sel.options.length - 1]); }
    sel.value = opt.value;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    form.innerHTML = `<div class="center" style="padding:26px 0">
      <div style="width:66px;height:66px;border-radius:50%;background:var(--red);color:#fff;display:grid;place-items:center;margin:0 auto 18px">
        <span style="width:30px;height:30px;display:block">${I.check}</span>
      </div>
      <h3 class="display" style="margin-bottom:10px">Mensaje enviado</h3>
      <p style="color:var(--gray)">Gracias ${d.nombre.split(" ")[0]}, recibimos tu solicitud. Respondemos cotizaciones en menos de 2 horas hábiles.</p>
      <a class="btn btn--red" style="margin-top:20px" href="${waLink(`Hola Bacano, soy ${d.nombre}. ${d.mensaje}`)}" target="_blank" rel="noopener">Continuar por WhatsApp</a>
    </div>`;
    toast("Solicitud enviada. Te contactamos muy pronto.");
  });
}

/* ============================================================
   MOVIMIENTO — revelados, palabras enmascaradas, cintas y cursor
   ============================================================ */
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* selectores que entran con máscara/desplazamiento al aparecer */
const ANIM_SEL = ".reveal, .mask-img, .rule-draw, .heroX__mark, [data-split='done']";

/* títulos que se parten palabra por palabra */
const SPLIT_SEL = [
  "h1.display", "h2.display", ".heroX h1", ".picks__head h2",
  ".ctacard h3", ".testi__quote p", "[data-split]"
].join(",");

/* Envuelve cada palabra en <span class="rv"><i>palabra</i></span> */
function splitWords(el){
  if(!el || el.dataset.split === "done") return;

  const walk = node => {
    [...node.childNodes].forEach(n => {
      if(n.nodeType === 3){
        if(!n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if(!part) return;
          if(/^\s+$/.test(part)){ frag.append(document.createTextNode(" ")); return; }
          const w = document.createElement("span");
          w.className = "rv";
          const i = document.createElement("i");
          i.textContent = part;
          w.append(i);
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if(n.nodeType === 1 && n.tagName !== "BR" && !n.classList.contains("rv")){
        walk(n);
      }
    });
  };

  walk(el);
  el.dataset.split = "done";
  $$(".rv > i", el).forEach((i, k) => i.style.transitionDelay = (k * 0.042).toFixed(3) + "s");
}

let revealObs = null;
let ANIM_READY = false;   /* nada se anima hasta que cae el preloader */

function observeReveal(){
  if(!ANIM_READY) return;
  if(REDUCED || !("IntersectionObserver" in window)){
    $$(ANIM_SEL).forEach(el => el.classList.add("is-in"));
    return;
  }
  revealObs = revealObs || new IntersectionObserver((entries, o) => {
    entries.forEach(en => {
      if(en.isIntersecting){ en.target.classList.add("is-in"); o.unobserve(en.target); }
    });
  }, { threshold:.14, rootMargin:"0px 0px -60px" });

  $$(SPLIT_SEL).forEach(splitWords);
  $$(ANIM_SEL).forEach(el => { if(!el.classList.contains("is-in")) revealObs.observe(el); });
}

/* Cintas infinitas: duplica el contenido hasta cubrir el ancho */
function initMarquee(){
  $$(".marquee").forEach(m => {
    const row = $(".marquee__row", m);
    if(!row || row.dataset.ready) return;
    const base = row.innerHTML;
    let guard = 0;
    while(row.scrollWidth < m.offsetWidth * 2 && guard++ < 12) row.innerHTML += base;
    const clone = row.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    m.append(clone);
    row.dataset.ready = "1";
  });
}

/* Cursor propio (sólo puntero fino) */
function initCursor(){
  if(REDUCED || !window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  const c = document.createElement("div");
  c.className = "cursor is-off";
  document.body.append(c);

  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  addEventListener("mousemove", e => {
    x = e.clientX; y = e.clientY;
    c.classList.remove("is-off");
    const hit = e.target.closest("a,button,input,select,textarea,.card,.pcard,.cat,label");
    c.classList.toggle("is-big", !!hit);
  }, { passive:true });
  addEventListener("mouseleave", () => c.classList.add("is-off"));

  (function loop(){
    cx += (x - cx) * .18;
    cy += (y - cy) * .18;
    c.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    requestAnimationFrame(loop);
  })();
}

/* Paralaje suave en medios marcados */
function initParallax(){
  const els = $$("[data-parallax]");
  if(!els.length || REDUCED) return;
  const run = () => {
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if(r.bottom < 0 || r.top > innerHeight) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      const amt = parseFloat(el.dataset.parallax) || 40;
      el.style.transform = `translate3d(0, ${(-p * amt).toFixed(2)}px, 0)`;
    });
    requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}

/* ============================================================
   PRELOADER + TRANSICIÓN ENTRE PÁGINAS
   ============================================================ */
const SEEN_KEY = "bacano_seen_v1";
const seen = () => { try { return !!sessionStorage.getItem(SEEN_KEY); } catch { return false; } };
const markSeen = () => { try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {} };

function initPreloader(onDone){
  const pre = $("#pre");
  document.documentElement.classList.remove("is-loading");

  if(!pre || seen() || REDUCED){
    pre?.remove();
    markSeen();
    onDone();
    return;
  }

  document.documentElement.classList.add("is-loading");
  const cnt = $("#preCount", pre), bar = $("#preBar", pre);
  const MIN = 1600;
  const t0 = performance.now();
  let p = 0, loaded = document.readyState === "complete";

  addEventListener("load", () => loaded = true);

  const finish = () => {
    markSeen();
    document.documentElement.classList.remove("is-loading");
    pre.classList.add("is-done");
    onDone();
    setTimeout(() => pre.remove(), 1200);
  };

  const tick = ts => {
    const e = ts - t0;
    const target = (loaded && e > MIN) ? 100 : Math.min(94, (e / MIN) * 94);
    p += (target - p) * .1;
    if(target === 100 && p > 99.2) p = 100;
    const v = Math.round(p);
    if(cnt) cnt.textContent = String(v).padStart(3, "0");
    if(bar) bar.style.width = v + "%";
    if(v >= 100){ setTimeout(finish, 320); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function initPageTransition(){
  const pt = $("#pt");
  if(!pt) return;
  const EASE = "cubic-bezier(.76,0,.24,1)";

  /* la entrada la resuelve la animación CSS (@keyframes ptOut) */
  const internal = a => {
    if(!a || a.target === "_blank" || a.hasAttribute("download")) return false;
    const href = a.getAttribute("href") || "";
    if(!href || href.startsWith("#") || /^(mailto:|tel:|https?:)/i.test(href)) return false;
    return /\.html(\?|#|$)/i.test(href) || href === "/";
  };

  document.addEventListener("click", e => {
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const a = e.target.closest("a");
    if(!internal(a)) return;
    const href = a.getAttribute("href");
    if(href.split("#")[0] === PAGE) return;

    e.preventDefault();
    markSeen();
    if(REDUCED){ location.href = href; return; }

    pt.style.animation = "none";          /* anula la animación de entrada */
    pt.style.transition = "none";
    pt.style.transform = "translateY(100%)";
    void pt.offsetWidth;
    pt.style.transition = `transform .6s ${EASE}`;
    pt.style.transform = "translateY(0)";
    setTimeout(() => { location.href = href; }, 580);
  });

  /* volver con el botón atrás no debe dejar la cortina puesta */
  addEventListener("pageshow", ev => {
    if(ev.persisted){
      pt.style.animation = "none";
      pt.style.transition = "none";
      pt.style.transform = "translateY(100%)";
    }
  });
}

function initCounters(){
  const els = $$("[data-count]");
  if(!els.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((ents, o) => {
    ents.forEach(en => {
      if(!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, dur = 1300;
      let t0 = null;
      const tick = ts => {
        t0 = t0 || ts;
        const p = Math.min((ts - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString("es-CL");
        if(p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      o.unobserve(el);
    });
  }, { threshold:.5 });
  els.forEach(e => io.observe(e));
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  buildHeader();
  buildRail();
  buildFooter();
  buildFloating();
  Cart.load();
  Cart.render();

  buildHome();
  buildShop();
  initCheckout();
  initContacto();
  $$(".slider").forEach(initSlider);

  initMarquee();
  initCursor();
  initParallax();
  initPageTransition();

  /* el contenido no se anima hasta que el preloader termina */
  initPreloader(() => {
    ANIM_READY = true;
    observeReveal();
    initCounters();
  });

  /* año dinámico y datos de contacto en el HTML */
  $$("[data-site]").forEach(el => {
    const v = SITE[el.dataset.site];
    if(v !== undefined) el.textContent = v;
  });
  $$("[data-wa]").forEach(el => el.href = waLink(el.dataset.wa || undefined));
  $$("[data-foto]").forEach(el => { if(FOTOS[el.dataset.foto]) el.src = FOTOS[el.dataset.foto]; });
});
