<?php
/* ============================================================
   BACANO.CL — Vuelta desde Bacano Core con el pase del equipo.
   bacanocore.cl/acceso/bacano-cl → entrar.php?pase=…&ir=/pagina.html
   Ver acceso.php.
   ============================================================ */
require __DIR__ . '/acceso.php';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

$pase = accesoLeer($_GET['pase'] ?? '');
/* El pase de Core es de minutos: uno sin `u`, con `t` (una cookie del sitio)
   o con vencimiento lejano no vale aquí. */
$valido = $pase !== null
  && is_string($pase['u'] ?? null) && $pase['u'] !== ''
  && !isset($pase['t'])
  && $pase['exp'] <= time() + 600;

if (!$valido) {
  header('Location: /?acceso=no', true, 302);
  exit;
}

accesoAbrir($pase['u']);
header('Location: ' . accesoPaginaDeVuelta($_GET['ir'] ?? '/'), true, 302);
