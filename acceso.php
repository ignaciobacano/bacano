<?php
/* ============================================================
   BACANO.CL — Acceso del equipo mientras el sitio está en «Próximamente»
   (Ignacio, 2026-10-05: «un coming soon… con un login que se pueda acceder
   con los usuarios de Bacano Core», solo el equipo interno).

   No es una página: lo usan entrar.php y portero.php.

   · Bacano Core firma un PASE de pocos minutos (quién y hasta cuándo) y
     manda a la persona a entrar.php. Aquí se comprueba esa firma.
   · Si es válida, este sitio deja su propia cookie, firmada igual, que
     abre las páginas por 7 días en ese navegador.
   · La firma usa una clave DERIVADA de la `clave` de catalogo-config.php
     (la que ya se comparte con Core), la misma derivación que hace Core.
     Las contraseñas de Core nunca pasan por aquí.
   ============================================================ */

const ACCESO_COOKIE = 'bacano_equipo';
const ACCESO_DURA   = 604800;   /* 7 días */

function accesoClave() {
  static $k = false;
  if ($k !== false) return $k;
  $f = __DIR__ . '/catalogo-config.php';
  $c = file_exists($f) ? (require $f) : [];
  $clave = is_array($c) ? (string)($c['clave'] ?? '') : '';
  $k = strlen($clave) >= 16 ? hash_hmac('sha256', 'acceso-bacano-cl', $clave, true) : null;
  return $k;
}

function accesoB64($bytes) { return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '='); }
function accesoDesdeB64($s) {
  $s = strtr($s, '-_', '+/');
  return base64_decode($s . str_repeat('=', (4 - strlen($s) % 4) % 4), true);
}

/* «carga.firma» → los datos, o null si la firma no cuadra o ya venció. */
function accesoLeer($texto) {
  $k = accesoClave();
  if (!$k || !is_string($texto) || strlen($texto) > 600) return null;
  $partes = explode('.', $texto);
  if (count($partes) !== 2) return null;
  [$carga, $firma] = $partes;
  if (!hash_equals(accesoB64(hash_hmac('sha256', $carga, $k, true)), $firma)) return null;
  $d = json_decode((string)accesoDesdeB64($carga), true);
  if (!is_array($d) || !is_int($d['exp'] ?? null) || $d['exp'] < time()) return null;
  return $d;
}

function accesoFirmar(array $d) {
  $carga = accesoB64(json_encode($d));
  return $carga . '.' . accesoB64(hash_hmac('sha256', $carga, accesoClave(), true));
}

function accesoAbrir($usuario) {
  $hasta = time() + ACCESO_DURA;
  /* `t` distingue la cookie del sitio del pase de Core: uno no sirve por el otro. */
  $valor = accesoFirmar(['u' => (string)$usuario, 'exp' => $hasta, 't' => 'sitio']);
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  setcookie(ACCESO_COOKIE, $valor, [
    'expires' => $hasta, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Lax',
  ]);
}

function accesoDelEquipo() {
  $d = accesoLeer($_COOKIE[ACCESO_COOKIE] ?? '');
  return $d !== null && ($d['t'] ?? '') === 'sitio';
}

/* Una página propia del sitio: «/» o «/algo.html». Nunca otra dirección. */
function accesoPaginaDeVuelta($ir) {
  return (is_string($ir) && preg_match('#^/(?:[a-z0-9-]+\.html)?$#i', $ir)) ? $ir : '/';
}
