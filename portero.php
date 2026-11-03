<?php
/* ============================================================
   BACANO.CL — El portero, con el sitio ABIERTO (Ignacio, 2026-11-03:
   «saquemos el próximamente, dejemos el sitio web online»).
   El .htaccess del servidor todavía manda aquí cada página .html y la
   portada; ahora todos ven la página que pidieron. El «Próximamente» ya no
   se muestra: quien pida proximamente.html llega a la portada.
   Cuando se quite el bloque «Próximamente» del .htaccess del servidor,
   este archivo deja de usarse.
   ============================================================ */
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: max-age=600');

$pagina = (string)($_GET['pagina'] ?? 'index.html');
if (!preg_match('/^[a-z0-9-]+\.html$/i', $pagina) || !is_file(__DIR__ . '/' . $pagina)
    || in_array(strtolower($pagina), ['proximamente.html', 'admin.html'], true)) {
  $pagina = 'index.html';
}

readfile(__DIR__ . '/' . $pagina);
