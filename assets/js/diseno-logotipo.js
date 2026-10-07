/* ============================================================
   DISEÑO DE LOGOTIPO (diseno-logotipo.html) · 2026-10-07
   Las 6 etapas de la infografía de Bacano «Nuestro proceso ·
   diseño de tu logotipo», con sus tiempos y sus reuniones.
   ============================================================ */
(function(){
"use strict";
const raiz = document.querySelector(".dw.lg");
if(!raiz) return;
const $ = s => raiz.querySelector(s);
const $$ = s => [...raiz.querySelectorAll(s)];
const ico = k => `<svg class="ico" aria-hidden="true"><use href="#i-${k}"/></svg>`;

const ETAPAS = [
  { n:1, horas:1, reunion:true,  icono:"acompanar",  titulo:"Alineación de información",
    texto:"Nos reunimos para conversar tus ideas y las proyecciones de tu empresa: tu logotipo será la imagen con la que muestres tu empresa al mundo." },
  { n:2, horas:6, reunion:false, icono:"propuestas", titulo:"Desarrollo de 3 propuestas de logotipo",
    texto:"Comenzamos a diseñar y te mostramos los primeros pasos de tu marca. Desarrollamos 3 propuestas, con la idea de extraer lo mejor de cada una para formular la final." },
  { n:3, horas:1, reunion:true,  icono:"mentoria",   titulo:"Presentación de propuestas",
    texto:"Te presentamos las 3 propuestas y analizamos juntos cuál representa mejor tu idea y qué elementos formarán tu logotipo." },
  { n:4, horas:1, reunion:false, icono:"lapiz",      titulo:"Correcciones",
    texto:"Trabajamos sobre lo que nos dijiste en la reunión anterior y armamos la propuesta final." },
  { n:5, horas:2, reunion:true,  icono:"reunion",    titulo:"Reunión de preentrega",
    texto:"Te presentamos el logotipo final. Si no te convence al 100%, trabajamos en más modificaciones." },
  { n:6, horas:1, reunion:false, icono:"descarga",   titulo:"Entrega de tu logotipo",
    texto:"Desarrollamos todos los entregables con sus distintos formatos y fichas técnicas. Te los enviamos por correo y quedan respaldados en una nube." }
];
const hrs = h => `${h} ${h === 1 ? "hora" : "horas"}`;

/* ---------- aparición al hacer scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if(e.isIntersecting){ e.target.classList.add("ve"); io.unobserve(e.target); }
}), { threshold:.15 });
$$(".rev").forEach(el => io.observe(el));

/* ---------- la barra a escala de horas ---------- */
$("#barra").innerHTML = ETAPAS.map((e, i) => `
  <button type="button" role="tab" class="lg-tramo${e.horas > 3 ? " largo" : ""}" style="flex:${e.horas}" data-i="${i}"
          aria-label="Etapa ${e.n}: ${e.titulo}, ${hrs(e.horas)}${e.reunion ? ", reunión contigo" : ""}">
    <span class="n">0${e.n}</span>
    <span class="h">${ico("reloj")}${e.horas} h</span>
    ${e.reunion ? '<span class="reu" title="Reunión contigo"></span>' : ""}
  </button>`).join("");

let actual = 0;
function etapa(i){
  actual = i;
  const e = ETAPAS[i];
  $$(".lg-tramo").forEach((b, j) => { b.classList.toggle("on", j === i); b.setAttribute("aria-selected", j === i); });
  const el = $("#etapa");
  el.innerHTML = `
    <div class="grande">${ico(e.icono)}</div>
    <div>
      <span class="rotulo-etapa">${e.n}ª etapa${e.reunion ? " · reunión" : ""}</span>
      <h3>${e.titulo}.</h3>
      <p>${e.texto}</p>
      <div class="pasar">
        <button type="button" class="atras" aria-label="Etapa anterior" ${i === 0 ? "disabled" : ""}>${ico("flecha")}</button>
        <button type="button" class="sigue" aria-label="Etapa siguiente" ${i === ETAPAS.length - 1 ? "disabled" : ""}>${ico("flecha")}</button>
      </div>
    </div>
    <div class="tiempo"><strong>${e.horas} H</strong><span>Tiempo de la etapa</span></div>`;
  el.querySelector(".atras").onclick = () => etapa(Math.max(0, actual - 1));
  el.querySelector(".sigue").onclick = () => etapa(Math.min(ETAPAS.length - 1, actual + 1));
}
$$(".lg-tramo").forEach(b => b.onclick = () => etapa(+b.dataset.i));
etapa(0);

/* ---------- las tres propuestas se funden en una ---------- */
const fusion = $("#fusion");
function armar(){
  fusion.classList.remove("armada");
  $$(".lg-prop").forEach(p => p.classList.remove("elegida"));
  void fusion.offsetWidth;
  /* se destacan una a una, como en la reunión de presentación */
  $$(".lg-prop").forEach((p, i) => setTimeout(() => p.classList.add("elegida"), 250 + i * 450));
  setTimeout(() => { $$(".lg-prop").forEach(p => p.classList.remove("elegida")); fusion.classList.add("armada"); }, 250 + 3 * 450 + 200);
}
const ioF = new IntersectionObserver(es => { if(es[0].isIntersecting){ armar(); ioF.disconnect(); } }, { threshold:.4 });
ioF.observe(fusion);
$("#repetir").onclick = armar;
})();
