/* ============================================================
   BACANO.CL — Datos del sitio y catálogo

   FOTOS  → trabajos reales de Bacano tomados de @bacanocl (Instagram).
            Están en assets/img/fotos/, ya pasadas a blanco y negro con
            el contraste del sitio. Para cambiarlas, reemplazá el archivo
            manteniendo el nombre, o apuntá a otra ruta.
   PRODUCTOS y CATEGORIAS → siguen con fotos de Unsplash (licencia libre).
   ============================================================ */

/* helper: arma la URL de Unsplash con recorte y peso optimizado */
const U = (id, w = 900, h = 0) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}${h ? "&h=" + h : ""}&q=80`;

/* helper: foto propia dentro del repositorio */
const F = name => `assets/img/fotos/${name}.jpg`;

let FOTOS = {
  heroPrincipal : F("bacano-letrero-taller"),    // letrero propio de Bacano en la fachada del taller
  heroSecundaria: F("grafica-vehicular"),        // gráfica sobre camioneta
  heroTerciaria : F("grafica-vehicular-2"),      // gráfica vehicular con QR
  terreno       : F("letrero-fachada-alto"),     // letrero visto desde la vereda (vertical)
  terreno2      : F("fachada-completa"),         // fachada completa con gráfica integral
  terreno3      : F("plano-impreso"),            // plano de loteo impreso en gran formato
  ploter        : F("impresion-gran-formato"),   // pliego impreso listo para entrega
  ploterCorte   : F("corte-troquelado"),         // trabajo terminado sobre la mesa de corte
  taller        : F("letras-corporeas"),         // letras corpóreas montadas en muro
  cliente       : F("lona-local"),               // lona instalada en local
  local         : F("local-grafica-vitrina"),    // local con gráfica en vitrina

  /* sin equivalente en el Instagram: queda foto de stock hasta tener una propia */
  estampado     : U("photo-1773525912476-213bff96b8a4", 1000) // serigrafía / estampado textil
};

let SITE = {
  nombre: "Bacano",
  dominio: "bacano.cl",
  slogan: "Publicidad que se ve, se toca y se recuerda",
  telefono: "+56 9 6776 0841",
  telefonoLink: "+56967760841",
  whatsapp: "56967760841",
  email: "contacto@bacano.cl",
  direccion: "Av. Ejemplo 1234, Santiago, Chile",
  horario: "Lun a Vie 9:00–18:30 · Sáb 10:00–14:00",
  rut: "77.123.456-7",
  anios: 12,
  envioGratisDesde: 80000,
  ivaIncluido: true
};

let CATEGORIAS = [
  { slug:"letreros",    nombre:"Letreros y corpóreos",  desc:"Luminosos, acrílico, PVC, tótems y señalética.", img:U("photo-1676917824872-83f2fa04898b",700) },
  { slug:"stickers",    nombre:"Stickers y adhesivos",  desc:"Troquelados, en rollo, holográficos y vinilos.",  img:U("photo-1625768376503-68d2495d78c5",700) },
  { slug:"granformato", nombre:"Gran formato",          desc:"Pendones, roll ups, lienzos y gigantografías.",   img:U("photo-1513757378314-e46255f6ed16",700) },
  { slug:"papeleria",   nombre:"Papelería e imprenta",  desc:"Volantes, tarjetas, afiches y talonarios.",       img:U("photo-1718670013921-2f144aba173a",700) },
  { slug:"estampados",  nombre:"Estampados y textil",   desc:"Poleras, polerones, gorros y uniformes.",         img:U("photo-1773525912586-fbc51bbe0fdf",700) },
  { slug:"vehicular",   nombre:"Rotulación vehicular",  desc:"Autos, camionetas, furgones y flotas.",           img:U("photo-1646531840695-62810bcd1171",700) }
];

let PRODUCTOS = [
  {
    id:"stk-troquelado", nombre:"Stickers troquelados", cat:"stickers",
    precio:24900, antes:29900, unidad:"100 unidades · 5 × 5 cm",
    img:U("photo-1773904215704-139e9ff8c894",700),
    flags:["Top ventas"], rating:4.9, reviews:312,
    desc:"Impresión digital y corte de contorno en plóter de troquelado sobre vinilo blanco. Cortados uno a uno con tu forma exacta, sin bordes cuadrados.",
    specs:["Corte de contorno con plóter","Vinilo monomérico + laminado","Resistente a agua y roce","Cualquier forma, sin costo extra"],
    plazo:"3 a 5 días hábiles"
  },
  {
    id:"let-luminoso", nombre:"Letrero luminoso LED", cat:"letreros",
    precio:189000, unidad:"por m² instalado",
    img:U("photo-1676917824872-83f2fa04898b",700),
    flags:["Instalación incluida"], rating:5.0, reviews:64,
    desc:"Caja de aluminio con frente en acrílico opal e impresión translúcida, iluminada con módulos LED de alta eficiencia. Incluye visita técnica, fabricación e instalación en terreno.",
    specs:["Estructura de aluminio anodizado","LED 12V con fuente certificada","Resistente a lluvia y sol","Garantía 24 meses en LED"],
    plazo:"10 a 14 días hábiles"
  },
  {
    id:"gf-pendon", nombre:"Pendón con ojetillos", cat:"granformato",
    precio:21900, antes:26900, unidad:"80 × 120 cm",
    img:U("photo-1513757378314-e46255f6ed16",700),
    flags:["Entrega rápida"], rating:4.8, reviews:187,
    desc:"Pendón en tela PVC de 440 gr con impresión a todo color, terminación con dobladillo y ojetillos metálicos. Listo para colgar.",
    specs:["PVC 440 gr resistente a exterior","Impresión full color 1440 dpi","Ojetillos cada 50 cm","Incluye cuerda de amarre"],
    plazo:"2 a 4 días hábiles"
  },
  {
    id:"pap-tarjetas", nombre:"Tarjetas de presentación", cat:"papeleria",
    precio:27900, unidad:"500 unidades",
    img:U("photo-1718670013921-2f144aba173a",700),
    flags:["Más vendido"], rating:4.9, reviews:198,
    desc:"Tarjetas en couché 300 gr con laminado mate o brillante por ambas caras. Terminación firme y elegante que no se dobla.",
    specs:["Couché 300 gr","Laminado mate o brillante","Esquinas rectas o redondeadas","Opción con reserva UV"],
    plazo:"4 a 6 días hábiles"
  },
  {
    id:"let-corporeo", nombre:"Letras corpóreas PVC 10 mm", cat:"letreros",
    precio:18900, antes:23900, unidad:"por letra (alto 20 cm)",
    img:U("photo-1605053755182-5748283aa375",700),
    flags:["Más vendido"], rating:4.9, reviews:128,
    desc:"Letras cortadas con router CNC en PVC expandido de 10 mm, pintadas en color a elección y listas para instalar. Ideal para fachadas de locales, oficinas y recepciones.",
    specs:["Corte CNC de alta precisión","Pintura poliuretano resistente a UV","Incluye plantilla de montaje","Alto personalizable de 10 a 100 cm"],
    plazo:"5 a 7 días hábiles"
  },
  {
    id:"pap-volantes", nombre:"Volantes 10 × 15 cm", cat:"papeleria",
    precio:34900, antes:42900, unidad:"1.000 unidades",
    img:U("photo-1695634621375-0b66a9d5d1bc",700),
    flags:["Más vendido"], rating:4.8, reviews:254,
    desc:"Volantes impresos en offset digital sobre papel couché 150 gr, tiro y retiro a todo color. Corte a guillotina profesional.",
    specs:["Couché 150 gr","Impresión doble cara","Corte parejo a guillotina","Opción papel reciclado"],
    plazo:"3 a 5 días hábiles"
  },
  {
    id:"est-polera", nombre:"Polera estampada DTF", cat:"estampados",
    precio:9900, unidad:"por unidad (desde 10)",
    img:U("photo-1773525912586-fbc51bbe0fdf",700),
    flags:["Desde 10 unidades"], rating:4.8, reviews:165,
    desc:"Polera de algodón con estampado DTF a todo color, sin límite de colores y con excelente resistencia al lavado.",
    specs:["Algodón 100% o mezcla","Estampado DTF full color","Tallas S a XXL","Estampado frente y espalda opcional"],
    plazo:"5 a 7 días hábiles"
  },
  {
    id:"veh-rotulacion", nombre:"Rotulación de vehículo", cat:"vehicular",
    precio:189000, unidad:"proyecto completo",
    img:U("photo-1646531840695-62810bcd1171",700),
    flags:["Instalación en terreno"], rating:4.9, reviews:53,
    desc:"Diseño, impresión e instalación de gráfica adhesiva en tu vehículo. Incluye visita para medir, propuesta visual y montaje en nuestro taller o en terreno.",
    specs:["Vinilo fundido + laminado UV","Instalación profesional sin burbujas","Diseño incluido en el valor","Duración estimada 5 años"],
    plazo:"7 a 10 días hábiles"
  },
  {
    id:"gf-rollup", nombre:"Roll up 85 × 200 cm", cat:"granformato",
    precio:49900, unidad:"unidad con estuche",
    img:U("photo-1617355405361-29f0f0a3d737",700),
    flags:[], rating:4.9, reviews:143,
    desc:"Estructura retráctil de aluminio con gráfica intercambiable, bolso de transporte incluido. Ideal para ferias, charlas y activaciones.",
    specs:["Estructura de aluminio reforzado","Gráfica en PVC opaco antibrillo","Bolso de transporte incluido","Repuesto de gráfica disponible"],
    plazo:"3 a 5 días hábiles"
  },
  {
    id:"stk-holo", nombre:"Stickers holográficos", cat:"stickers",
    precio:34900, unidad:"50 unidades · 7 × 7 cm",
    img:U("photo-1625768376503-68d2495d78c5",700),
    flags:["Novedad"], rating:4.9, reviews:58,
    desc:"Vinilo holográfico con efecto tornasol y laminado protector. Muy usados en packaging, skate, notebooks y merchandising.",
    specs:["Vinilo holográfico importado","Laminado brillante anti-rayas","Corte de contorno incluido","Colores vivos de alta saturación"],
    plazo:"5 días hábiles"
  },
  {
    id:"stk-rollo", nombre:"Stickers en rollo", cat:"stickers",
    precio:39900, unidad:"500 unidades",
    img:U("photo-1712736051179-1d77e1180eef",700),
    flags:[], rating:4.8, reviews:96,
    desc:"Etiquetas adhesivas en rollo, ideales para productos, envases y despacho. Se entregan con separación entre piezas para aplicación rápida.",
    specs:["Papel couché o vinilo","Troquel a medida","Rollo con núcleo de 40 mm","Apto para uso alimentario (opcional)"],
    plazo:"5 a 7 días hábiles"
  },
  {
    id:"stk-vinilo", nombre:"Vinilo adhesivo impreso", cat:"stickers",
    precio:12900, unidad:"por m² impreso",
    img:U("photo-1632605179016-7e21ad342b14",700),
    flags:[], rating:4.7, reviews:74,
    desc:"Vinilo adhesivo impreso en gran formato para vidrieras, muros y muebles. Puede entregarse laminado mate o brillante y con corte listo.",
    specs:["Impresión ecosolvente 1440 dpi","Vinilo brillante, mate o esmerilado","Laminado opcional","Duración exterior hasta 5 años"],
    plazo:"3 a 5 días hábiles"
  },
  {
    id:"let-acrilico", nombre:"Placa de acrílico con separadores", cat:"letreros",
    precio:42900, unidad:"30 × 20 cm",
    img:U("photo-1674460625989-7f985ca3e353",700),
    flags:[], rating:4.8, reviews:41,
    desc:"Placa de acrílico cristal de 5 mm con impresión por reverso y separadores de acero. Perfecta para recepciones, consultas y oficinas.",
    specs:["Acrílico 5 mm pulido","Impresión UV por reverso","4 separadores de acero inoxidable","Incluye kit de instalación"],
    plazo:"4 a 6 días hábiles"
  },
  {
    id:"let-senaletica", nombre:"Señalética interior (pack 10)", cat:"letreros",
    precio:79900, unidad:"pack de 10 piezas",
    img:U("photo-1579167761393-3dcc94aabbd5",700),
    flags:[], rating:4.7, reviews:35,
    desc:"Set de señalética para oficinas, clínicas y locales: baños, salidas, capacidad y accesos. Material PVC 3 mm con vinilo impreso y laminado.",
    specs:["PVC 3 mm rígido","Vinilo impreso + laminado mate","Adhesivo 3M en cada pieza","Diseño según normativa"],
    plazo:"5 días hábiles"
  },
  {
    id:"let-toten", nombre:"Tótem publicitario 2 caras", cat:"letreros",
    precio:349000, unidad:"2,0 m de alto",
    img:U("photo-1768225324952-07dc4e64a875",700),
    flags:["Proyecto a medida"], rating:4.9, reviews:22,
    desc:"Tótem autosoportante en estructura metálica con gráfica en vinilo de alta durabilidad por ambas caras. Se fabrica a medida según tu espacio.",
    specs:["Estructura de acero galvanizado","Vinilo fundido + laminado UV","Base con anclaje al suelo","Opción retroiluminado"],
    plazo:"12 a 18 días hábiles"
  },
  {
    id:"gf-giganto", nombre:"Gigantografía para fachada", cat:"granformato",
    precio:15900, unidad:"por m²",
    img:U("photo-1638572568877-45885de23843",700),
    flags:["Instalación disponible"], rating:4.8, reviews:61,
    desc:"Impresión de gran tamaño en tela PVC o malla mesh para fachadas y andamios. Cotizamos instalación en terreno con equipo certificado.",
    specs:["PVC 510 gr o malla mesh","Refuerzo perimetral y ojetillos","Resistencia al viento","Instalación con altura certificada"],
    plazo:"5 a 8 días hábiles"
  },
  {
    id:"pap-afiches", nombre:"Afiches carta / oficio", cat:"papeleria",
    precio:18900, unidad:"100 unidades",
    img:U("photo-1695634621145-9133286e0247",700),
    flags:[], rating:4.7, reviews:82,
    desc:"Afiches a todo color en papel couché 170 gr, ideales para promociones, carteleras y puntos de venta.",
    specs:["Couché 170 gr","Full color una cara","Tamaños carta, oficio y A3","Entrega en paquetes de 25"],
    plazo:"3 días hábiles"
  },
  {
    id:"pap-talonario", nombre:"Talonarios autocopiativos", cat:"papeleria",
    precio:44900, unidad:"10 talonarios de 50 hojas",
    img:U("photo-1516409590654-e8d51fc2d25c",700),
    flags:[], rating:4.8, reviews:47,
    desc:"Talonarios numerados en papel autocopiativo original y copia, con engomado superior y tapa de cartulina.",
    specs:["Papel autocopiativo 2 copias","Numeración correlativa","Engomado superior","Formato carta o media carta"],
    plazo:"6 a 8 días hábiles"
  },
  {
    id:"est-poleron", nombre:"Polerón con logo bordado", cat:"estampados",
    precio:24900, unidad:"por unidad (desde 6)",
    img:U("photo-1773525912457-6a7278efb9e4",700),
    flags:[], rating:4.9, reviews:88,
    desc:"Polerón de algodón perchado con logo bordado en pecho. Terminación premium para uniformes corporativos y equipos.",
    specs:["Bordado hasta 12.000 puntadas","Algodón perchado 320 gr","Tallas S a XXL","Opción con capucha o cierre"],
    plazo:"8 a 12 días hábiles"
  },
  {
    id:"veh-microperforado", nombre:"Vinilo microperforado", cat:"vehicular",
    precio:26900, unidad:"por m² instalado",
    img:U("photo-1632605157148-6313421c504b",700),
    flags:[], rating:4.7, reviews:39,
    desc:"Vinilo perforado que se ve desde afuera y permite visibilidad desde el interior. Ideal para lunetas y vidrios laterales.",
    specs:["Perforación 50/50","Laminado protector incluido","Visión desde el interior","Fácil de retirar sin dañar el vidrio"],
    plazo:"4 a 6 días hábiles"
  }
];

let TESTIMONIOS = [
  { nombre:"Carolina Muñoz", empresa:"Café Raíz · Providencia", inicial:"C", estrellas:5,
    texto:"Nos hicieron el letrero luminoso y la gráfica de la vidriera. Llegaron a medir el mismo día que cotizamos y la instalación fue impecable. El local se ve otro." },
  { nombre:"Rodrigo Salinas", empresa:"Constructora Andes", inicial:"R", estrellas:5,
    texto:"Trabajamos con Bacano hace 3 años en señalética de obra y rotulación de la flota. Cumplen los plazos, que en nuestro rubro es lo más difícil de encontrar." },
  { nombre:"Fernanda Ríos", empresa:"Tienda Lunares", inicial:"F", estrellas:5,
    texto:"Pedí 500 stickers troquelados por la web, pagué en línea y llegaron en 4 días a Valparaíso. La calidad del corte es exacta a mi diseño." }
];

let FAQS = [
  { q:"¿Cómo envío mi diseño o archivo?",
    a:"Después de comprar te llega un correo con un enlace para subir tu archivo (PDF, AI, PSD, PNG o JPG). También podés enviarlo por WhatsApp. Si no tenés diseño, nuestro equipo lo crea por vos y te muestra una propuesta antes de imprimir." },
  { q:"¿Puedo ver una prueba antes de que impriman?",
    a:"Sí. En todos los trabajos enviamos una prueba digital (mockup) para tu aprobación por escrito. Nada entra a máquina sin tu confirmación, así evitamos errores de texto, medidas o color." },
  { q:"¿Hacen despacho a regiones?",
    a:"Sí, despachamos a todo Chile por courier con número de seguimiento. Los envíos sobre $80.000 tienen despacho gratis en Región Metropolitana. Para letreros grandes coordinamos transporte especial o instalación en terreno." },
  { q:"¿Qué formas de pago aceptan?",
    a:"Transferencia bancaria, tarjetas de crédito y débito, y pago en efectivo en taller. Para empresas trabajamos con orden de compra y factura a 30 días previa evaluación." },
  { q:"¿Instalan los letreros o solo los fabrican?",
    a:"Hacemos ambas cosas. Contamos con equipo propio de instalación en terreno, con trabajo en altura certificado y todos los elementos de seguridad. La instalación se cotiza según ubicación y complejidad." },
  { q:"¿Qué pasa si el producto llega con una falla?",
    a:"Respondemos por cualquier defecto de fabricación: reimprimimos o reponemos sin costo dentro de los primeros 30 días. Si el error fue nuestro, también asumimos el flete." }
];

/* ------------------------------------------------------------
   VISTA PREVIA DEL PANEL
   Si abrís cualquier página con ?preview=1, el sitio muestra los
   cambios guardados en el panel (admin.html) sin publicarlos.
   ------------------------------------------------------------ */
if(location.search.includes("preview=1") || location.hash.includes("preview")){
  try{
    const p = JSON.parse(localStorage.getItem("bacano_admin_v1"));
    if(p){
      if(p.SITE)        SITE        = p.SITE;
      if(p.FOTOS)       FOTOS       = p.FOTOS;
      if(p.CATEGORIAS)  CATEGORIAS  = p.CATEGORIAS;
      if(p.PRODUCTOS)   PRODUCTOS   = p.PRODUCTOS;
      if(p.TESTIMONIOS) TESTIMONIOS = p.TESTIMONIOS;
      if(p.FAQS)        FAQS        = p.FAQS;
      document.addEventListener("DOMContentLoaded", () => {
        const b = document.createElement("a");
        b.href = "admin.html";
        b.textContent = "◀ Vista previa del panel — volver a editar";
        b.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:999;background:#000;color:#fff;text-align:center;padding:9px;font:600 13px/1.2 system-ui;text-decoration:none";
        document.body.appendChild(b);
      });
    }
  }catch(e){ console.warn("preview:", e); }
}
