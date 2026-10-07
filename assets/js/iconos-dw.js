/* ============================================================
   ICONOGRAFÍA BACANO · Servicios digitales
   Rejilla de 24 px · trazo de 2 px · puntas y esquinas rectas ·
   sin relleno · un solo color (currentColor).
   ============================================================ */
const DW_ICONOS = {
  /* --- los planes --- */
  landing:    { n:"Landing",            g:"Planes",     d:'<rect x="5" y="2" width="14" height="20"/><path d="M8 6h8"/><rect x="8" y="9" width="8" height="5"/><path d="M8 17h5"/>' },
  sitio:      { n:"Sitio web",          g:"Planes",     d:'<rect x="8" y="2" width="13" height="15"/><path d="M5 5v15h13"/><path d="M2 8v14h13"/><path d="M11 6h7"/>' },
  tienda:     { n:"E-commerce",         g:"Planes",     d:'<path d="M2 3h3l3 12h11l2-9H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>' },
  subir:      { n:"Subir de plan",      g:"Planes",     d:'<path d="M2 21h6v-5h6v-5h6"/><path d="M15 3h6v6"/><path d="M21 3l-7 7"/>' },
  especial:   { n:"Proyecto especial",  g:"Planes",     d:'<path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4"/>' },

  /* --- el rol de Bacano --- */
  orientar:   { n:"Orientar",           g:"Rol",        d:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>' },
  desarrollar:{ n:"Desarrollar",        g:"Rol",        d:'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>' },
  ejecutar:   { n:"Ejecutar",           g:"Rol",        d:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>' },
  acompanar:  { n:"Acompañar",          g:"Rol",        d:'<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M2 20c0-4 3-6 6-6s6 2 6 6"/><path d="M14.5 14.2c.5-.1 1-.2 1.5-.2 3 0 6 2 6 6"/>' },

  /* --- lo que construimos --- */
  diseno:     { n:"Diseño",             g:"Construimos",d:'<path d="M12 2l7 8-7 12-7-12z"/><path d="M12 10v6"/><circle cx="12" cy="9" r="1"/>' },
  web:        { n:"Navegador",          g:"Construimos",d:'<rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M6 6.5h1M9 6.5h1"/>' },
  responsive: { n:"Responsive",         g:"Construimos",d:'<rect x="2" y="4" width="14" height="11"/><path d="M5 19h8"/><rect x="17" y="9" width="5" height="11"/>' },
  dominio:    { n:"Dominio",            g:"Construimos",d:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>' },
  hosting:    { n:"Hosting",            g:"Construimos",d:'<rect x="3" y="4" width="18" height="7"/><rect x="3" y="13" width="18" height="7"/><path d="M7 7.5h1M7 16.5h1"/>' },
  ssl:        { n:"SSL seguro",         g:"Construimos",d:'<rect x="4" y="11" width="16" height="10"/><path d="M8 11V7a4 4 0 0 1 8 0v4M12 15v2"/>' },
  correo:     { n:"Correo",             g:"Construimos",d:'<rect x="2" y="5" width="20" height="14"/><path d="M2 5l10 8 10-8"/>' },
  chat:       { n:"WhatsApp",           g:"Construimos",d:'<path d="M4 4h16v12H9l-5 4z"/><path d="M8 9h8M8 12h5"/>' },
  formulario: { n:"Formulario",         g:"Construimos",d:'<rect x="4" y="3" width="16" height="18"/><path d="M8 8h8M8 12h8M8 16h4"/>' },
  seo:        { n:"SEO",                g:"Construimos",d:'<circle cx="10" cy="10" r="6"/><path d="M15 15l6 6"/>' },
  catalogo:   { n:"Catálogo",           g:"Construimos",d:'<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>' },
  pago:       { n:"Medios de pago",     g:"Construimos",d:'<rect x="2" y="5" width="20" height="14"/><path d="M2 10h20M6 15h4"/>' },
  pedidos:    { n:"Pedidos",            g:"Construimos",d:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>' },
  mentoria:   { n:"Mentoría",           g:"Construimos",d:'<rect x="3" y="3" width="18" height="12"/><path d="M8 21l4-6 4 6M7 11l3-3 3 2 4-4"/>' },

  /* --- cada mes --- */
  mantencion: { n:"Mantención",         g:"Cada mes",   d:'<path d="M15 3a5 5 0 0 0-4.6 7L3 17.4 6.6 21l7.4-7.4A5 5 0 0 0 21 9l-3 3-3-3 3-3a5 5 0 0 0-3-3z"/>' },
  soporte:    { n:"Soporte",            g:"Cada mes",   d:'<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6"/><rect x="17" y="14" width="4" height="6"/><path d="M19 20v1h-6"/>' },
  grafico:    { n:"Apoyo gráfico",      g:"Cada mes",   d:'<path d="M18 3l3 3-9 9-3-3z"/><path d="M9 12c-3 0-5 2-5 5v3h3c3 0 5-2 5-5"/>' },
  analisis:   { n:"Análisis",           g:"Cada mes",   d:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-7"/>' },
  descuento:  { n:"Descuentos",         g:"Cada mes",   d:'<path d="M5 19L19 5"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>' },
  campana:    { n:"Campañas",           g:"Cada mes",   d:'<path d="M3 10v4h3l9 5V5l-9 5z"/><path d="M6 14l1 6h3l-1-5"/><path d="M18 9a3 3 0 0 1 0 6"/>' },
  reunion:    { n:"Reunión en vivo",    g:"Cada mes",   d:'<rect x="2" y="6" width="13" height="12"/><path d="M15 10l7-4v12l-7-4"/>' },
  archivo:    { n:"Archivos de marca",  g:"Cada mes",   d:'<path d="M3 5h7l2 3h9v12H3z"/>' },
  beneficio:  { n:"Beneficios",         g:"Cada mes",   d:'<rect x="3" y="8" width="18" height="4"/><rect x="5" y="12" width="14" height="9"/><path d="M12 8v13"/><path d="M12 8C10 4 6 4 6 6.5S12 8 12 8zM12 8c2-4 6-4 6-1.5S12 8 12 8z"/>' },

  /* --- solicitudes y pedidos --- */
  solicitud:  { n:"Solicitud",          g:"Solicitudes",d:'<path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4z"/><path d="M15 6v12"/>' },
  cupo:       { n:"Cupo",               g:"Solicitudes",d:'<rect x="4" y="4" width="16" height="16"/><path d="M8 12l3 3 5-6"/>' },
  ilimitado:  { n:"Sin límite",         g:"Solicitudes",d:'<path d="M12 12c-2-3-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1 6-4s4-4 6-4a4 4 0 0 1 0 8c-2 0-4-1-6-4z"/>' },
  ciclo:      { n:"Se renueva",         g:"Solicitudes",d:'<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 3v5h-5"/>' },
  idea:       { n:"Idea",               g:"Solicitudes",d:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>' },
  precio:     { n:"Precio",             g:"Solicitudes",d:'<path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7.5" cy="7.5" r="1.5"/>' },
  redes:      { n:"Pieza para redes",   g:"Solicitudes",d:'<rect x="4" y="4" width="16" height="16"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>' },
  fotos:      { n:"Fotos",              g:"Solicitudes",d:'<rect x="3" y="4" width="18" height="16"/><circle cx="9" cy="10" r="2"/><path d="M3 18l6-5 4 4 3-2 5 4"/>' },
  producto:   { n:"Producto nuevo",     g:"Solicitudes",d:'<rect x="3" y="3" width="18" height="18"/><path d="M12 8v8M8 12h8"/>' },
  problema:   { n:"Algo no funciona",   g:"Solicitudes",d:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>' },
  pregunta:   { n:"Asesoría",           g:"Solicitudes",d:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17v.5"/>' },
  impresion:  { n:"Encargo Bacano",     g:"Solicitudes",d:'<path d="M6 9V3h12v6"/><path d="M6 18H3V9h18v9h-3"/><rect x="6" y="14" width="12" height="7"/>' },
  sticker:    { n:"Stickers",           g:"Solicitudes",d:'<path d="M4 4h16v9l-7 7H4z"/><path d="M13 20v-7h7"/>' },

  /* --- el camino --- */
  moneda:     { n:"Pago",               g:"Camino",     d:'<circle cx="12" cy="12" r="9"/><path d="M15 9h-4a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3H9M12 7v2M12 15v2"/>' },
  construir:  { n:"Construcción",       g:"Camino",     d:'<path d="M3 17L17 3l4 4L7 21H3z"/><path d="M14 6l4 4"/>' },
  lanzamiento:{ n:"Lanzamiento",        g:"Camino",     d:'<path d="M12 2c4 3 5 7 4 12H8C7 9 8 5 12 2z"/><circle cx="12" cy="9" r="1.5"/><path d="M8 14l-3 4h4M16 14l3 4h-4M10 18v3h4v-3"/>' },
  core:       { n:"Bacano Core",        g:"Camino",     d:'<rect x="3" y="3" width="18" height="18"/><path d="M3 8h18M8 8v13"/>' },
  calendario: { n:"Cada 30 días",       g:"Camino",     d:'<rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 15h3"/>' },
  carro:      { n:"Carro",              g:"Camino",     d:'<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>' },
  flecha:     { n:"Flecha",             g:"Camino",     d:'<path d="M4 12h16M14 6l6 6-6 6"/>' }
};

/* el trazo va por CSS (no en el símbolo) para poder engrosarlo o afinarlo según el tamaño */
/* inserta el sprite al principio del body; luego cada ícono es <svg class="ico"><use href="#i-nombre"/></svg> */
(function(){
  const s = Object.entries(DW_ICONOS).map(([k, v]) =>
    `<symbol id="i-${k}" viewBox="0 0 24 24">${v.d}</symbol>`).join("");
  document.head.insertAdjacentHTML("beforeend", "<style>.dw .ico,.ico{width:24px;height:24px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:square;stroke-linejoin:miter;overflow:visible}</style>");
  document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${s}</svg>`);
})();
const dwIco = (k, c = "") => `<svg class="ico ${c}" aria-hidden="true"><use href="#i-${k}"/></svg>`;
