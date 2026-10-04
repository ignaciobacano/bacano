<?php
/* ============================================================
   BACANO.CL — Pago con Mercado Pago (Checkout Pro)
   El carrito manda qué productos y cuántos; los precios, el envío
   y los cupones se recalculan acá con el catálogo publicado, así
   nadie puede cambiar un precio desde el navegador.
   Uso:  mercadopago.php?accion=crear | verificar | webhook
   Credenciales: mercadopago-config.php (plantilla en mercadopago-config.ejemplo.php)
   ============================================================ */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
error_reporting(E_ALL);
ini_set('display_errors', 0);

define('RAIZ',      __DIR__);
define('CONFIG_MP', RAIZ . '/mercadopago-config.php');
define('CONFIG_BD', RAIZ . '/config.php');
define('DATAJS',    RAIZ . '/assets/js/data.js');
define('CATALOGO_CORE', RAIZ . '/catalogo-core.json');   /* lo escribe catalogo-sync.php */
define('API_MP',    'https://api.mercadopago.com');
define('ENVIO',     4990);   /* el mismo valor que Cart.envio() en app.js */

function salir($datos, $codigo = 200) {
  http_response_code($codigo);
  echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
function error($msg, $codigo = 400) { salir(['ok' => false, 'error' => $msg], $codigo); }

function cuerpo() {
  $j = json_decode(file_get_contents('php://input'), true);
  return is_array($j) ? $j : [];
}

/* ============================================================
   MERCADO PAGO
   ============================================================ */
function confMp() {
  static $c = null;
  if ($c !== null) return $c;
  if (!file_exists(CONFIG_MP)) error('Los pagos en línea todavía no están configurados.', 503);
  $c = require CONFIG_MP;
  if (empty($c['access_token']) || strpos($c['access_token'], 'PEGAR') === 0)
    error('Los pagos en línea todavía no están configurados.', 503);
  return $c;
}

/* Devuelve [código HTTP, respuesta] */
function mp($metodo, $ruta, $cuerpo = null, $idempotencia = null) {
  $cab = ['Authorization: Bearer ' . confMp()['access_token'], 'Content-Type: application/json'];
  if ($idempotencia) $cab[] = 'X-Idempotency-Key: ' . $idempotencia;
  $ch = curl_init(API_MP . $ruta);
  curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST  => $metodo,
    CURLOPT_HTTPHEADER     => $cab,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 20,
  ]);
  if ($cuerpo !== null)
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($cuerpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
  $resp = curl_exec($ch);
  $cod  = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err  = curl_error($ch);
  curl_close($ch);
  if ($resp === false) { error_log("Mercado Pago sin respuesta: $err"); error('No se pudo contactar a Mercado Pago.', 502); }
  $j = json_decode($resp, true);
  if ($cod >= 400) error_log("Mercado Pago $cod en $ruta: $resp");
  return [$cod, is_array($j) ? $j : []];
}

/* Dirección pública del sitio, para las páginas de vuelta */
function urlSitio() {
  $c = confMp();
  if (!empty($c['sitio'])) return rtrim($c['sitio'], '/');
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  $dir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
  return ($https ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $dir;
}
/* Mercado Pago solo avisa y vuelve solo a direcciones https reales, no a localhost */
function esPublica($url) {
  $h = parse_url($url, PHP_URL_HOST);
  return strpos($url, 'https://') === 0 && !in_array($h, ['localhost', '127.0.0.1', '::1'], true);
}

/* ============================================================
   CATÁLOGO — se lee de data.js, el mismo archivo que ve el visitante
   (si hay base de datos, data.js es la copia que genera el panel)
   ============================================================ */
function catalogo() {
  $js = @file_get_contents(DATAJS);
  if ($js === false) error('No se encontró el catálogo.', 500);

  $ini = strpos($js, 'let PRODUCTOS');
  $fin = $ini === false ? false : strpos($js, 'let TESTIMONIOS', $ini);
  if ($ini === false) error('No se pudo leer el catálogo.', 500);
  $seccion = substr($js, $ini, ($fin ?: strlen($js)) - $ini);

  $productos = [];
  preg_match_all('/\{(.*?)\}/s', $seccion, $objetos);
  foreach ($objetos[1] as $o) {
    if (!preg_match('/(?<![\w-])["\']?id["\']?\s*:\s*["\']([^"\']+)["\']/', $o, $id)) continue;
    if (!preg_match('/(?<![\w-])["\']?precio["\']?\s*:\s*(\d+)/', $o, $precio)) continue;
    preg_match('/(?<![\w-])["\']?nombre["\']?\s*:\s*"((?:[^"\\\\]|\\\\.)*)"/', $o, $nombre);
    $productos[$id[1]] = [
      'nombre' => isset($nombre[1]) ? stripcslashes($nombre[1]) : $id[1],
      'precio' => (int)$precio[1],
    ];
  }
  /* Con el catálogo de Bacano Core (catalogo-sync.php), se cobra por SKU con esos precios */
  $core = @json_decode((string)@file_get_contents(CATALOGO_CORE), true);
  if (is_array($core['familias'] ?? null) && $core['familias']) {
    $productos = [];
    foreach ($core['familias'] as $f) foreach ((array)($f['variantes'] ?? []) as $v) {
      if (empty($v['sku']) || empty($v['precio'])) continue;
      $productos[$v['sku']] = [
        'nombre' => $f['nombre'] . (!empty($v['opcion']) ? ' · ' . $v['opcion'] : ''),
        'precio' => (int)$v['precio'],
      ];
    }
  }
  if (!$productos) error('No se pudo leer el catálogo.', 500);

  $envioGratis = preg_match('/envioGratisDesde["\']?\s*:\s*(\d+)/', $js, $m) ? (int)$m[1] : PHP_INT_MAX;

  $cupones = [];
  if (preg_match('/cupones["\']?\s*:\s*\{([^}]*)\}/', $js, $m)) {
    preg_match_all('/["\']?([A-Za-z0-9_-]+)["\']?\s*:\s*(\d+(?:\.\d+)?)/', $m[1], $pares, PREG_SET_ORDER);
    foreach ($pares as $p) $cupones[$p[1]] = (float)$p[2];
  }
  return ['productos' => $productos, 'envioGratis' => $envioGratis, 'cupones' => $cupones];
}

/* ============================================================
   PEDIDOS — solo si la base de datos está instalada (instalar.php)
   ============================================================ */
function bd() {
  static $pdo = false;
  if ($pdo !== false) return $pdo;
  $pdo = null;
  if (!file_exists(CONFIG_BD)) return null;
  $c = require CONFIG_BD;
  try {
    $pdo = new PDO("mysql:host={$c['host']};dbname={$c['base']};charset=utf8mb4",
      $c['usuario'], $c['clave'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
  } catch (PDOException $e) { error_log('Base de datos: ' . $e->getMessage()); $pdo = null; }
  return $pdo;
}
function tablaPedidos() {
  $c = require CONFIG_BD;
  return '`' . ($c['prefijo'] ?? 'bc_') . 'pedidos`';
}

function guardarPedido($numero, $d, $lineas, $total) {
  $bd = bd();
  if (!$bd) return;
  try {
    $st = $bd->prepare("INSERT INTO " . tablaPedidos() . "
      (numero, nombre, email, telefono, documento, entrega, direccion, comuna, notas, items, total, estado, creado)
      VALUES (?,?,?,?,?,?,?,?,?,?,?, 'por pagar', NOW())");
    $st->execute([
      $numero, $d['nombre'], $d['email'], $d['telefono'], $d['documento'],
      $d['entrega'], $d['direccion'], $d['comuna'], $d['notas'],
      json_encode($lineas, JSON_UNESCAPED_UNICODE), $total,
    ]);
  } catch (PDOException $e) { error_log('No se guardó el pedido ' . $numero . ': ' . $e->getMessage()); }
}

/* Estado del pago en Mercado Pago → estado del pedido en el panel */
function estadoPedido($estadoMp) {
  switch ($estadoMp) {
    case 'approved':   return 'pagado';
    case 'pending':
    case 'in_process':
    case 'authorized': return 'pago pendiente';
    case 'refunded':
    case 'charged_back': return 'devuelto';
    default:           return 'pago rechazado';
  }
}
function actualizarPedido($numero, $estadoMp) {
  $bd = bd();
  if (!$bd || !$numero) return;
  try {
    /* un pedido ya pagado solo cambia si el pago se devuelve */
    $st = $bd->prepare("UPDATE " . tablaPedidos() . " SET estado = ?
                        WHERE numero = ? AND (estado <> 'pagado' OR ? = 'devuelto')");
    $e = estadoPedido($estadoMp);
    $st->execute([$e, $numero, $e]);
  } catch (PDOException $e) { error_log('No se actualizó el pedido ' . $numero . ': ' . $e->getMessage()); }
}

/* Consulta un pago directamente a Mercado Pago: nunca se confía en lo que diga la URL */
function consultarPago($id) {
  $id = preg_replace('/\D/', '', (string)$id);
  if ($id === '') return null;
  [$cod, $p] = mp('GET', '/v1/payments/' . $id);
  if ($cod >= 400 || empty($p['status'])) return null;
  actualizarPedido($p['external_reference'] ?? '', $p['status']);
  return $p;
}

/* ============================================================
   ACCIONES
   ============================================================ */
$accion = $_GET['accion'] ?? '';

switch ($accion) {

  /* El carrito pide el enlace de pago */
  case 'crear':
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') error('Método no permitido.', 405);
    if (empty($_SERVER['HTTP_X_BACANO'])) error('Petición no autorizada.', 403);
    $conf = confMp();
    $d    = cuerpo();
    $cat  = catalogo();

    $cliente = [];
    foreach (['nombre','email','telefono','documento','entrega','direccion','comuna','notas'] as $k)
      $cliente[$k] = mb_substr(trim((string)($d[$k] ?? '')), 0, $k === 'notas' ? 2000 : 160);
    if ($cliente['nombre'] === '' || $cliente['telefono'] === '') error('Faltan tu nombre o tu teléfono.');
    if (!filter_var($cliente['email'], FILTER_VALIDATE_EMAIL)) error('Revisá tu correo electrónico.');

    $lineas = []; $subtotal = 0;
    foreach ((array)($d['items'] ?? []) as $i) {
      $id = (string)($i['id'] ?? '');
      $q  = (int)($i['qty'] ?? 0);
      if (!isset($cat['productos'][$id]) || $q < 1 || $q > 999)
        error('Un producto de tu carrito ya no está disponible. Revisalo y probá de nuevo.');
      $p = $cat['productos'][$id];
      $lineas[] = ['id' => $id, 'nombre' => $p['nombre'], 'qty' => $q, 'precio' => $p['precio']];
      $subtotal += $p['precio'] * $q;
    }
    if (!$lineas) error('Tu carrito está vacío.');

    $cupon     = strtoupper(trim((string)($d['cupon'] ?? '')));
    $pct       = $cat['cupones'][$cupon] ?? 0;
    $descuento = $pct ? (int)round($subtotal * $pct / 100) : 0;
    $envio     = ($subtotal >= $cat['envioGratis'] || $cliente['entrega'] === 'Retiro en taller') ? 0 : ENVIO;
    $total     = $subtotal - $descuento + $envio;

    $numero = 'BC-' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(2)));

    /* Mercado Pago no admite líneas negativas: con descuento se cobra el pedido en una sola línea */
    if ($descuento > 0) {
      $items = [[ 'id' => $numero, 'title' => "Pedido $numero · Bacano.cl", 'quantity' => 1,
                  'unit_price' => $total, 'currency_id' => 'CLP' ]];
    } else {
      $items = array_map(fn($l) => [
        'id' => $l['id'], 'title' => $l['nombre'], 'quantity' => $l['qty'],
        'unit_price' => $l['precio'], 'currency_id' => 'CLP',
      ], $lineas);
      if ($envio) $items[] = ['id' => 'despacho', 'title' => 'Despacho', 'quantity' => 1,
                              'unit_price' => $envio, 'currency_id' => 'CLP'];
    }

    $base = urlSitio();
    $pref = [
      'items'                => $items,
      'external_reference'   => $numero,
      'statement_descriptor' => 'BACANO',
      'payer'                => ['name' => $cliente['nombre']],
      'back_urls'            => [
        'success' => "$base/carrito.html?pago=ok",
        'pending' => "$base/carrito.html?pago=pendiente",
        'failure' => "$base/carrito.html?pago=error",
      ],
    ];
    /* con credenciales de prueba el comprador es un usuario de prueba: no se precarga el correo real */
    if (empty($conf['prueba'])) $pref['payer']['email'] = $cliente['email'];
    if (esPublica($base)) {
      $pref['auto_return']      = 'approved';
      $pref['notification_url'] = "$base/mercadopago.php?accion=webhook";
    }

    [$cod, $r] = mp('POST', '/checkout/preferences', $pref, $numero);
    if ($cod >= 400 || empty($r['init_point']))
      error('Mercado Pago no pudo preparar el pago. Probá de nuevo o escribinos por WhatsApp.', 502);

    guardarPedido($numero, $cliente, $lineas, $total);
    salir(['ok' => true, 'numero' => $numero, 'total' => $total, 'url' => $r['init_point']]);

  /* La página de vuelta confirma el pago con Mercado Pago */
  case 'verificar':
    $p = consultarPago($_GET['payment_id'] ?? '');
    if (!$p) error('No encontramos ese pago.', 404);
    salir([
      'ok'     => true,
      'estado' => $p['status'],
      'numero' => $p['external_reference'] ?? '',
      'total'  => (int)round($p['transaction_amount'] ?? 0),
    ]);

  /* Aviso de Mercado Pago cuando un pago cambia de estado.
     Sea quien sea el que llame, el pago se vuelve a consultar a Mercado Pago. */
  case 'webhook':
    $d    = cuerpo();
    $tipo = $d['type'] ?? $d['topic'] ?? $_GET['type'] ?? $_GET['topic'] ?? '';
    $id   = $d['data']['id'] ?? $_GET['data_id'] ?? $_GET['id'] ?? '';
    if ($tipo === 'payment' && $id) consultarPago($id);
    salir(['ok' => true]);

  default:
    error('Acción desconocida.', 404);
}
