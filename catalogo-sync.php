<?php
/* ============================================================
   BACANO.CL — Catálogo desde Bacano Core
   Lee el catálogo público de bacanocore.cl y lo deja listo para el sitio:
     catalogo-core.js    lo que carga el navegador (window.CATALOGO_CORE)
     catalogo-core.json  lo que usa mercadopago.php para cobrar (bloqueado en .htaccess)

   Se ejecuta una vez al día con una tarea programada de cPanel:
     php /home1/bacanoc1/public_html/catalogo-sync.php

   Si Core no responde o manda algo raro, NO se toca nada: el sitio sigue con
   la última copia buena. Sin ninguna copia, el sitio usa el catálogo de data.js.

   Configuración opcional en catalogo-config.php (ver catalogo-config.ejemplo.php).
   ============================================================ */

define('RAIZ',      __DIR__);
define('CONFIG',    RAIZ . '/catalogo-config.php');
define('SALIDA_JS', RAIZ . '/catalogo-core.js');
define('SALIDA_JSON', RAIZ . '/catalogo-core.json');
define('URL_CORE',  'https://bacanocore.cl/api/catalogo-publico');

$conf = file_exists(CONFIG) ? (require CONFIG) : [];
$url  = $conf['url'] ?? URL_CORE;

/* Solo desde la tarea programada (línea de comandos), o desde el navegador con la clave */
if (PHP_SAPI !== 'cli') {
  header('Content-Type: text/plain; charset=utf-8');
  $clave = (string)($conf['clave'] ?? '');
  if (strlen($clave) < 16 || !hash_equals($clave, (string)($_GET['clave'] ?? ''))) {
    http_response_code(403);
    exit("No autorizado.\n");
  }
}

function terminar($msg, $ok) {
  echo ($ok ? 'OK' : 'ERROR') . ' · ' . date('d-m-Y H:i') . " · $msg\n";
  if (!$ok) error_log("catalogo-sync: $msg");
  exit($ok ? 0 : 1);
}

/* ---------- 1. Leer Core ---------- */
$ch = curl_init($url);
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT        => 30,
  CURLOPT_FOLLOWLOCATION => false,   /* si Core manda a /ingresar, es un error, no un catálogo */
  CURLOPT_HTTPHEADER     => ['Accept: application/json'],
]);
$resp = curl_exec($ch);
$cod  = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err  = curl_error($ch);
curl_close($ch);
if ($resp === false) terminar("Core no respondió ($err). Se mantiene la copia anterior.", false);
if ($cod !== 200)    terminar("Core respondió $cod. Se mantiene la copia anterior.", false);

$cat = json_decode($resp, true);
if (!is_array($cat) || ($cat['version'] ?? null) !== 1 || !is_array($cat['familias'] ?? null))
  terminar('Core mandó algo que no es el catálogo. Se mantiene la copia anterior.', false);

/* ---------- 2. Limpiar: solo los campos conocidos, con su tipo ---------- */
$txt = fn($v, $max = 300) => is_string($v) && trim($v) !== '' ? mb_substr(trim($v), 0, $max) : null;
$lista = fn($v) => array_values(array_filter(array_map(fn($x) => $txt($x, 200), is_array($v) ? $v : [])));
$img = fn($v) => is_string($v) && preg_match('#^https://\S+$#i', trim($v)) ? trim($v) : null;

$familias = [];
$skus = [];
foreach ($cat['familias'] as $f) {
  $codigo = $txt($f['codigo'] ?? null, 30);
  $nombre = $txt($f['nombre'] ?? null, 200);
  if (!$codigo || !$nombre || !preg_match('/^[A-Za-z0-9_-]+$/', $codigo)) continue;
  $variantes = [];
  foreach ((array)($f['variantes'] ?? []) as $v) {
    $sku = $txt($v['sku'] ?? null, 60);
    if (!$sku || !preg_match('/^[A-Za-z0-9_.-]+$/', $sku) || isset($skus[$sku])) continue;
    $precio = $v['precio'] ?? null;
    $precio = is_numeric($precio) && $precio > 0 ? (int)round($precio) : null;
    $skus[$sku] = true;
    $variantes[] = [
      'sku'       => $sku,
      'opcion'    => $txt($v['opcion'] ?? null, 200),
      'formato'   => $txt($v['formato'] ?? null, 120),
      'minimo'    => $txt($v['minimo'] ?? null, 60),
      'precio'    => $precio,
      'imagen'    => $img($v['imagen'] ?? null),
      'incluye'   => $lista($v['incluye'] ?? []),
      'noIncluye' => $lista($v['noIncluye'] ?? []),
    ];
  }
  if (!$variantes) continue;
  $familias[] = [
    'codigo'    => $codigo,
    'nombre'    => $nombre,
    'detalle'   => $txt($f['detalle'] ?? null),
    'lista'     => $txt($f['lista'] ?? null, 30) ?? 'productos',
    'categoria' => $txt($f['categoria'] ?? null, 120) ?? 'Otros',
    'variantes' => $variantes,
  ];
}

/* Un catálogo vacío casi siempre es un error de Core, no una decisión: no se publica */
$conPrecio = 0;
foreach ($familias as $f) foreach ($f['variantes'] as $v) if ($v['precio']) $conPrecio++;
if (!$familias || !$conPrecio)
  terminar('Core mandó un catálogo vacío o sin precios. Se mantiene la copia anterior.', false);

/* ---------- 3. Escribir, sin dejar nunca un archivo a medias ---------- */
$datos = ['generado' => $cat['generado'] ?? date('c'), 'leido' => date('c'), 'familias' => $familias];
$json  = json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

function escribir($ruta, $contenido) {
  $tmp = $ruta . '.tmp';
  if (@file_put_contents($tmp, $contenido) === false || !@rename($tmp, $ruta))
    terminar('No se pudo escribir ' . basename($ruta) . '. Revisá los permisos de la carpeta.', false);
}
escribir(SALIDA_JSON, $json);
escribir(SALIDA_JS, "/* Catálogo de Bacano Core — generado por catalogo-sync.php el " . date('d-m-Y H:i') . ". No editar a mano. */\n"
                  . "window.CATALOGO_CORE = " . str_replace('</', '<\/', $json) . ";\n");

terminar(count($familias) . ' familias y ' . count($skus) . ' variantes (' . $conPrecio . ' con precio).', true);
