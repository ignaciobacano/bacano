/* ============================================================
   DISEÑO WEB · Planes Partner Bacano (diseno-web.html)
   Datos del Informe Maestro Partner Bacano v3. Precios netos; la página
   muestra el IVA aparte. El carro cobra la implementación con IVA
   (ver PLANES_PARTNER en app.js); la membresía no pasa por el carro.
   ============================================================ */
(function(){
"use strict";
if(!document.querySelector(".dw")) return;
const raiz = document.querySelector(".dw");
const $ = s => raiz.querySelector(s);
const $$ = s => [...raiz.querySelectorAll(s)];
const clp = n => "$" + Math.round(n).toLocaleString("es-CL");

/* ---------- datos (del Informe Maestro Partner Bacano v3) ---------- */
const P = {
  start:{ nombre:"Start", lema:"Preséntate", prod:"Landing Page profesional", impl:349900, memb:29990,
    capas:["Orientar"], semana:3, dia:1, vivo:0,
    construimos:[["diseno","Diseño adaptado a tu marca"],["landing","Landing para informar y generar contacto"],["chat","WhatsApp y formulario"],["responsive","Responsive"],["dominio","Dominio, hosting, SSL y correo"]],
    membresia:[["mantencion","Mantención básica"],["soporte","Soporte y asesoría"],["grafico","Apoyo gráfico básico"],["descuento","Descuentos base Bacano"]],
    fuera:"E-commerce, campañas e identidad corporativa completa se cotizan aparte." },
  grow:{ nombre:"Grow", lema:"Crece", prod:"Sitio web profesional y administrable", impl:549900, memb:59990,
    capas:["Orientar","Desarrollar"], semana:5, dia:1, vivo:1,
    construimos:[["web","Arquitectura y navegación"],["diseno","Diseño personalizado"],["sitio","Inicio, Nosotros, Servicios, Catálogo, Galería, Contacto"],["chat","Formularios, WhatsApp y redes"],["seo","SEO básico, dominio, hosting, SSL y correo"]],
    membresia:[["mantencion","Mantención y mejoras"],["grafico","Apoyo gráfico"],["analisis","Análisis de ideas y proyectos"],["descuento","Descuentos superiores"]],
    fuera:"E-commerce completo y campañas recurrentes se cotizan aparte." },
  elite:{ nombre:"Elite", lema:"Vende y escala", prod:"E-commerce con carrito de compra", impl:899900, memb:99990,
    capas:["Orientar","Desarrollar","Ejecutar","Acompañar"], semana:8, dia:2, vivo:2,
    construimos:[["diseno","Tienda con diseño personalizado"],["catalogo","Catálogo, categorías y productos"],["pago","Carrito, checkout y medios de pago"],["pedidos","Gestión básica de pedidos"],["mentoria","Mentoría para administrar tu tienda"]],
    membresia:[["mantencion","Mantención y mejoras"],["grafico","Diseño gráfico recurrente"],["campana","Campañas de marketing: ejecución y seguimiento"],["descuento","Descuentos preferenciales"]],
    fuera:"La inversión publicitaria (Meta, Google) y el software a medida van aparte." }
};
let actual = "grow";

/* ---------- aparición al hacer scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add("ve"); io.unobserve(e.target); } }), {threshold:.15});
$$(".rev").forEach(el => io.observe(el));

/* ---------- 01 · proveedor vs partner ---------- */
const MESES = 12;
$("#comp").innerHTML = Array.from({length:MESES}, (_, i) =>
  `<div class="m"><div class="rotulo"></div><div class="barra"></div><span>${i === 0 ? "MES 1" : i + 1}</span></div>`).join("");
const ESC = {
  prov:{ h:[100,0,0,0,0,0,0,0,0,0,0,0], r:[0], tags:{0:"Te entregan el sitio",4:"¿Un cambio? Cotiza de cero"},
    txt:"El proyecto termina el día que te entregan el sitio. <b>Cada cambio después es una negociación nueva.</b>" },
  part:{ h:[100,38,52,30,64,44,58,36,70,48,62,80], r:[0], tags:{0:"Construimos",4:"Nueva sección",8:"Campaña",11:"Subes de plan"},
    txt:"La web sale en línea y el trabajo sigue. <b>Mes a mes, tu negocio tiene un equipo detrás.</b>" }
};
function modo(m){
  $("#bProv").classList.toggle("on", m === "prov");
  $("#bPart").classList.toggle("on", m === "part");
  const e = ESC[m], alto = $("#comp").clientHeight - 40;
  $$("#comp .m").forEach((col, i) => {
    const h = e.h[i], b = col.querySelector(".barra"), t = col.querySelector(".rotulo");
    b.style.height = h / 100 * alto + "px";
    b.classList.toggle("rayada", e.r.includes(i));
    col.style.setProperty("--h", h / 100 * alto + "px");
    t.textContent = e.tags[i] || "";
    col.classList.toggle("contag", !!e.tags[i]);
  });
  $("#veredicto").innerHTML = e.txt;
}
const obsComp = new IntersectionObserver(es => { if(es[0].isIntersecting){ modo("prov"); setTimeout(() => modo("part"), 1800); obsComp.disconnect(); } }, {threshold:.4});
obsComp.observe($("#comp"));

/* ---------- 02 · ficha del plan ---------- */
function plan(p){
  actual = p;
  const d = P[p];
  $$("[data-p]").forEach(el => el.classList.toggle("on", el.dataset.p === p));
  const orden = ["start","grow","elite"];
  $$(".esc").forEach(el => el.classList.toggle("pasado", orden.indexOf(el.dataset.p) < orden.indexOf(p)));
  const det = $("#detalle");
  det.innerHTML = `
    <div class="cab">
      <div><div class="kick" style="margin:0">${d.lema}</div><h3>${d.nombre}</h3><div class="prod">${d.prod}</div></div>
      <div class="precio2">
        <div><small>Implementación · pago único</small><strong data-n="${d.impl}">$0</strong><em> + IVA</em></div>
        <div><small>Membresía · cada 30 días</small><strong data-n="${d.memb}">$0</strong><em> + IVA</em></div>
      </div>
    </div>
    <div class="bloque">
      <h4>Qué hace Bacano por ti</h4>
      <div class="capas">${["Orientar","Desarrollar","Ejecutar","Acompañar"].map(c =>
        `<div class="capa" data-c="${c}"><span>${dwIco({Orientar:"orientar",Desarrollar:"desarrollar",Ejecutar:"ejecutar",Acompañar:"acompanar"}[c])}${c}</span><div class="tubo"><b></b></div></div>`).join("")}</div>
    </div>
    <div class="bloque">
      <h4>Tus solicitudes por semana</h4>
      <div class="cupos">${Array.from({length:8}, () => "<i></i>").join("")}</div>
      <p class="cupos-txt"><b>${d.semana} por semana</b>, hasta ${d.dia} al día. Asesoría y soporte: sin límite.</p>
    </div>
    <div class="bloque">
      <h4>Construimos</h4><ul class="lista ic">${d.construimos.map(([k, x]) => `<li>${dwIco(k)}${x}</li>`).join("")}</ul>
    </div>
    <div class="bloque">
      <h4>Cada mes</h4><ul class="lista ic">${d.membresia.map(([k, x]) => `<li>${dwIco(k)}${x}</li>`).join("")}</ul>
      <h4 style="margin-top:22px">Reuniones en vivo</h4>
      <div class="vivo">${[0,1].map(i => `<span class="cara ${i < d.vivo ? "" : "off"}">${dwIco("reunion")}</span>`).join("")}
        <span>${d.vivo ? (d.vivo === 1 ? "1 al mes" : "Hasta 2 al mes") : "No incluidas"}</span></div>
    </div>
    <div class="acciones">
      <button class="dbtn" onclick="dw.agregar()">${dwIco("carro")}Agregar ${d.nombre} al carro</button>
      <a class="dbtn ghost" href="contacto.html?tipo=Dise%C3%B1o%20web%3A%20plan%20Partner%20${d.nombre}">Tengo dudas</a>
      <span class="fuera">${d.fuera}</span>
    </div>`;
  det.classList.remove("cambia"); void det.offsetWidth; det.classList.add("cambia");
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$(".capa").forEach(c => c.classList.toggle("on", d.capas.includes(c.dataset.c)));
    $$(".cupos i").forEach((c, i) => setTimeout(() => c.classList.toggle("ve", i < d.semana), i * 70));
    $$("#detalle [data-n]").forEach(contar);
  }));
  pintarPagos(); pintarSim();
}
function contar(el){
  const fin = +el.dataset.n, t0 = performance.now(), dur = 700;
  const paso = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = clp(fin * (1 - Math.pow(1 - k, 3))); if(k < 1) requestAnimationFrame(paso); };
  requestAnimationFrame(paso);
}

/* ---------- 03 · simulador ---------- */
const PEDIDOS = [
  { k:"precio", t:"Cambiar los precios de mi web", cupo:true, tipo:"Cambio puntual" },
  { k:"redes", t:"Una pieza para Instagram", cupo:true, tipo:"Pieza gráfica" },
  { k:"fotos", t:"Actualizar las fotos", cupo:true, tipo:"Contenido" },
  { k:"producto", t:"Agregar un producto nuevo", cupo:true, tipo:"Contenido" },
  { k:"idea", t:"Tengo una idea, ¿qué opinan?", cupo:false, tipo:"Nueva idea" },
  { k:"problema", t:"Algo no funciona", cupo:false, tipo:"Soporte técnico" },
  { k:"pregunta", t:"¿Qué me conviene hacer?", cupo:false, tipo:"Asesoría" },
  { k:"impresion", t:"Necesito 500 tarjetas", cupo:false, tipo:"Encargo Bacano" }
];
let usados = 0;
$("#chips").innerHTML = PEDIDOS.map((x, i) => `<button class="chip" onclick="dw.pedir(${i})">${dwIco(x.k)}${x.t}</button>`).join("");
function pintarSim(){
  const max = P[actual].semana;
  if(usados > max) usados = max;
  $("#casillas").innerHTML = Array.from({length:max}, (_, i) => `<i class="${i < usados ? "usada" : ""}"></i>`).join("");
  $("#usados").textContent = `${usados} / ${max}`;
}
function ficha(dest, x, extra){
  const c = $(dest); const v = c.querySelector(".vacio"); if(v) v.remove();
  c.insertAdjacentHTML("afterbegin", `<span class="ficha-sol ${x.cupo ? "" : "no"}">${dwIco(x.k)}<span>${x.t}<small>${extra}</small></span></span>`);
  [...c.children].slice(5).forEach(n => n.remove());
}
function pedir(i){
  const x = PEDIDOS[i], max = P[actual].semana, m = $("#msg");
  if(!x.cupo){
    ficha("#bNo", x, x.tipo + " · no descuenta");
    m.classList.remove("lleno");
    m.innerHTML = `<b>${x.tipo}</b>: te respondemos sin tocar tu cupo. Conversar con tu equipo nunca se descuenta.`;
    return;
  }
  if(usados >= max){
    m.classList.add("lleno");
    m.innerHTML = `Cupo de la semana completo. Se renueva en 7 días. Mientras, la asesoría y el soporte siguen disponibles${actual !== "elite" ? ", o puedes subir de plan" : ""}.`;
    return;
  }
  usados++; pintarSim();
  ficha("#bUsa", x, `${x.tipo} · cupo ${usados} de ${max}`);
  m.classList.remove("lleno");
  m.innerHTML = `<b>${x.tipo}</b>: es una tarea concreta con un resultado claro, así que usa 1 cupo. Te quedan ${max - usados}.`;
}
function reiniciar(){
  usados = 0; pintarSim();
  $("#bUsa").innerHTML = '<p class="vacio">Aquí caen las tareas concretas.</p>';
  $("#bNo").innerHTML = '<p class="vacio">Aquí, todo lo demás.</p>';
  $("#msg").classList.remove("lleno");
  $("#msg").textContent = "Semana nueva: cupos completos.";
}

/* ---------- 04 · línea de pagos ---------- */
function pintarPagos(){
  const d = P[actual];
  $("#pagosLinea").innerHTML = `
    <div class="pg pago rev ve"><div class="nodo">${dwIco("moneda")}<span class="paso-n">1</span></div><div class="cuando">Hoy</div><h4>Pagas la implementación</h4><p>Un solo pago para construir tu ${d.prod.split(" ")[0].toLowerCase() === "e-commerce" ? "tienda" : "web"}.</p><div class="monto">${clp(d.impl * 1.19)}<small>${clp(d.impl)} + IVA</small></div></div>
    <div class="pg"><div class="nodo">${dwIco("construir")}<span class="paso-n">2</span></div><div class="cuando">Construcción</div><h4>Diseñamos y desarrollamos</h4><p>Levantamos tu información, diseñamos, probamos y corregimos contigo.</p></div>
    <div class="pg"><div class="nodo">${dwIco("lanzamiento")}<span class="paso-n">3</span></div><div class="cuando">Lanzamiento</div><h4>Tu web en línea</h4><p>Y te abrimos tu portal Bacano Core.</p></div>
    <div class="pg pago"><div class="nodo">${dwIco("calendario")}<span class="paso-n">4</span></div><div class="cuando">Desde ahí</div><h4>Membresía cada 30 días</h4><p>Empieza el acompañamiento.</p><div class="monto">${clp(d.memb * 1.19)}<small>${clp(d.memb)} + IVA</small></div></div>
    <div class="pg"><div class="nodo">${dwIco("ciclo")}<span class="paso-n">∞</span></div><div class="cuando">Cada mes</div><h4>Seguimos creciendo</h4><p>Solicitudes, soporte, encargos y beneficios.</p><div class="ciclo"><i></i><i></i><i></i><i></i></div></div>`;
}

/* ---------- 05 · portal ---------- */
const VISTAS = {
  sol:`<h5>Solicitudes</h5>
    <div class="fila-core"><span>Cambiar precios del menú</span><em class="neg">Finalizada</em></div>
    <div class="fila-core"><span>Banner para el Cyber</span><em>En desarrollo</em></div>
    <div class="fila-core"><span>¿Conviene una tienda online?</span><em>Asesoría</em></div>
    <div class="fila-core"><span>Cupo de esta semana</span><span style="font-weight:600">2 de 5</span></div>`,
  doc:`<h5>Mis documentos</h5><div class="archivos">
    <div><b>Ai</b>Logotipo</div><div><b>PDF</b>Manual de marca</div><div><b>PNG</b>Redes</div>
    <div><b>PDF</b>Tarjetas</div><div><b>JPG</b>Fotos web</div><div><b>PDF</b>Cotización</div></div>`,
  enc:`<h5>Encargos Bacano</h5>
    <div class="fila-core"><span>500 tarjetas de presentación</span><em class="neg">Entregado</em></div>
    <div class="fila-core"><span>Pendón roller 200×80</span><em>En producción</em></div>
    <div class="fila-core"><span>Stickers troquelados</span><em>Cotización</em></div>`,
  ben:`<h5>Beneficios</h5>
    <div class="fila-core"><span>Descuento Partner en impresión</span><em class="neg">Activo</em></div>
    <div class="fila-core"><span>Reunión del mes</span><em>Agendar</em></div>
    <div class="fila-core"><span>Archivos de marca resguardados</span><em class="neg">Activo</em></div>`
};
function vista(v){
  $$("#menuCore button").forEach(b => b.classList.toggle("on", b.dataset.v === v));
  const el = $("#vista"); el.innerHTML = VISTAS[v];
  el.classList.remove("cambia"); void el.offsetWidth; el.classList.add("cambia");
}
$$("#menuCore button").forEach(b => { b.onclick = () => vista(b.dataset.v); b.onmouseenter = () => vista(b.dataset.v); });
vista("sol");

/* ---------- valores ---------- */
const ORDEN = ["start","grow","elite"];
const fila = (cls, ic, txt, f) => `<tr class="${cls}"><td>${ic ? dwIco(ic) : ""}${txt}</td>${ORDEN.map(p => `<td>${f(P[p], p)}</td>`).join("")}</tr>`;
const doble = n => `<span class="con">${clp(n * 1.19)}</span><span class="sin-iva">${clp(n)} + IVA</span>`;
$("#tvalCuerpo").innerHTML = [
  `<tr class="sec"><td colspan="4">Implementación · pago único</td></tr>`,
  fila("", "construir", "Valor neto", d => clp(d.impl)),
  fila("sub", "", "IVA 19%", d => clp(d.impl * .19)),
  fila("tot", "", "Total implementación", d => clp(d.impl * 1.19)),
  `<tr class="sec"><td colspan="4">Membresía · cada 30 días</td></tr>`,
  fila("", "calendario", "Valor neto", d => clp(d.memb)),
  fila("sub", "", "IVA 19%", d => clp(d.memb * .19)),
  fila("tot", "", "Total membresía", d => clp(d.memb * 1.19)),
  fila("hoy", "", "Pagas hoy", d => doble(d.impl)),
  fila("luego", "ciclo", "Luego, cada 30 días", d => doble(d.memb)),
  fila("fila-cta", "", "", (d, p) => `<button class="dbtn" onclick="dw.plan('${p}');dw.agregar()">${dwIco("carro")}Agregar ${d.nombre}</button>`)
].join("");
$$("#ivaSw button").forEach(b => b.onclick = () => {
  $$("#ivaSw button").forEach(x => x.classList.toggle("on", x === b));
  $("#tval").classList.toggle("con-iva", b.dataset.m === "con");
  $("#tval").classList.toggle("sin", b.dataset.m === "sin");
});

/* ---------- carro: el plan entra al carro del sitio (Cart, en app.js) ---------- */
function agregar(){ Cart.add("PARTNER-" + actual.toUpperCase()); }

plan("grow");
window.dw = { plan, modo, pedir, reiniciar, agregar };
})();
