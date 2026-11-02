<?php
/* ============================================================
   BACANO.CL — Recibe las credenciales de Mercado Pago desde Bacano Core
   (Ignacio, 2026-11-02: «Pagos en línea», solo el CEO de Core las envía).

   Core manda por POST: clave, modo (prueba | produccion), access_token y
   public_key. Este archivo escribe mercadopago-config.php, el que usa
   mercadopago.php para cobrar.

   LOS RESGUARDOS
   1. La clave de envío es propia (no la del catálogo) y va en
      mercadopago-config-envio.php, que se crea A MANO en el hosting.
   2. Solo se aceptan las cuentas anotadas ahí, una por modo. Antes de
      guardar, se pregunta a Mercado Pago de quién es el token: si es de otra
      cuenta, se rechaza. Así, aunque alguien robe la clave, no puede desviar
      los pagos a su cuenta.
   3. El token nunca se devuelve: la respuesta dice solo la cuenta.

   Contesta una línea:  OK · fecha · detalle   o   ERROR · fecha · motivo
   ============================================================ */

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
error_reporting(E_ALL);
ini_set('display_errors', 0);

define('RAIZ',         __DIR__);
define('CONFIG_ENVIO', RAIZ . '/mercadopago-config-envio.php');
define('CONFIG_MP',    RAIZ . '/mercadopago-config.php');
define('API_MP',       'https://api.mercadopago.com');

function responder($ok, $msg, $codigo) {
  http_response_code($codigo);
  if (!$ok) error_log("mercadopago-recibir: $msg");
  exit(($ok ? 'OK' : 'ERROR') . ' · ' . date('d-m-Y H:i') . " · $msg\n");
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  exit("Solo por POST.\n");
}

/* ---------- 1. La clave ---------- */
$conf  = file_exists(CONFIG_ENVIO) ? (require CONFIG_ENVIO) : [];
$clave = (string)($conf['clave'] ?? '');
$dada  = (string)($_POST['clave'] ?? '');
if (strlen($clave) < 32 || !hash_equals($clave, $dada)) {
  sleep(2);   /* frena a quien prueba claves */
  http_response_code(403);
  exit("No autorizado.\n");
}

/* ---------- 2. Lo que llega ---------- */
$modo   = (string)($_POST['modo'] ?? '');
$token  = preg_replace('/\s+/', '', (string)($_POST['access_token'] ?? ''));
$public = preg_replace('/\s+/', '', (string)($_POST['public_key'] ?? ''));

if (!in_array($modo, ['prueba', 'produccion'], true))
  responder(false, 'Modo desconocido.', 422);
if (!preg_match('/^(APP_USR|TEST)-[A-Za-z0-9-]{20,250}$/', $token))
  responder(false, 'Eso no es un Access Token de Mercado Pago.', 422);
if ($public !== '' && !preg_match('/^(APP_USR|TEST)-[A-Za-z0-9-]{8,120}$/', $public))
  responder(false, 'Eso no es una Public Key de Mercado Pago.', 422);

$permitida = trim((string)($conf['cuentas'][$modo] ?? ''));
if (!preg_match('/^\d{3,20}$/', $permitida))
  responder(false, "Falta anotar en mercadopago-config-envio.php la cuenta de Mercado Pago de $modo.", 422);

/* ---------- 3. ¿De quién es el token? Lo dice Mercado Pago ---------- */
$ch = curl_init(API_MP . '/users/me');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT        => 20,
  CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $token, 'Accept: application/json'],
]);
$resp = curl_exec($ch);
$cod  = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
if ($resp === false) responder(false, 'Mercado Pago no respondió. No se cambió nada.', 502);
if ($cod === 401 || $cod === 403) responder(false, 'Mercado Pago no reconoce ese Access Token. No se cambió nada.', 422);
if ($cod !== 200) responder(false, "Mercado Pago contestó $cod. No se cambió nada.", 502);

$yo       = json_decode($resp, true);
$cuenta   = (string)($yo['id'] ?? '');
$nombre   = preg_replace('/[^\w .@-]/u', '', (string)($yo['nickname'] ?? ''));
$dePrueba = in_array('test_user', (array)($yo['tags'] ?? []), true);

if ($cuenta !== $permitida)
  responder(false, "La cuenta $cuenta no es la cuenta de $modo de Bacano. No se cambió nada.", 422);
if ($modo === 'prueba' && !$dePrueba)
  responder(false, 'Es una cuenta real y llegó como prueba. No se cambió nada.', 422);
if ($modo === 'produccion' && $dePrueba)
  responder(false, 'Es una cuenta de prueba y llegó como producción. No se cambió nada.', 422);

/* ---------- 4. Escribir mercadopago-config.php, conservando lo demás ---------- */
$antes = file_exists(CONFIG_MP) ? (require CONFIG_MP) : [];
$nueva = [
  'access_token' => $token,
  'public_key'   => $public,
  'prueba'       => $modo === 'prueba',
  'sitio'        => (string)($antes['sitio'] ?? ''),
  'avisar_a'     => (string)($antes['avisar_a'] ?? 'contacto@bacano.cl'),
];
$php = "<?php\n/* Escrito por mercadopago-recibir.php el " . date('d-m-Y H:i')
     . " desde Bacano Core (Pagos en línea). Modo: $modo. No editar a mano: se reemplaza al enviar desde Core. */\n"
     . 'return ' . var_export($nueva, true) . ";\n";

$tmp = CONFIG_MP . '.' . bin2hex(random_bytes(4)) . '.tmp';
if (@file_put_contents($tmp, $php, LOCK_EX) === false)
  responder(false, 'No se pudo escribir en el hosting. No se cambió nada.', 500);
@chmod($tmp, 0640);
if (!@rename($tmp, CONFIG_MP)) {
  @unlink($tmp);
  responder(false, 'No se pudo reemplazar mercadopago-config.php. No se cambió nada.', 500);
}
if (function_exists('opcache_invalidate')) @opcache_invalidate(CONFIG_MP, true);

$cual = $modo === 'prueba' ? 'Prueba' : 'Producción';
responder(true, "Cuenta $nombre ($cuenta) en $cual", 200);
