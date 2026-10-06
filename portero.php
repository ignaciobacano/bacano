<?php
/* ============================================================
   BACANO.CL — El portero del «Próximamente».
   El .htaccess manda aquí cada página .html (y la portada). Quien tiene el
   acceso del equipo (ver acceso.php) ve la página que pidió; cualquier otra
   persona ve proximamente.html.
   Para abrir el sitio a todos: se quita el bloque «Próximamente» del
   .htaccess y listo; este archivo deja de usarse.
   ============================================================ */
require __DIR__ . '/acceso.php';

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: private, no-store');
header('X-Robots-Tag: noindex');

$pagina = (string)($_GET['pagina'] ?? 'index.html');
if (!preg_match('/^[a-z0-9-]+\.html$/i', $pagina) || !is_file(__DIR__ . '/' . $pagina)) {
  $pagina = 'index.html';
}

if (accesoDelEquipo() && $pagina !== 'proximamente.html') {
  readfile(__DIR__ . '/' . $pagina);
} else {
  readfile(__DIR__ . '/proximamente.html');
}
