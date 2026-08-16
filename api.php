<?php
/* ============================================================
   BACANO.CL — API del panel
   Habla con la base de datos y regenera assets/js/data.js.
   Todas las respuestas son JSON.  Uso:  api.php?accion=...
   ============================================================ */

session_start();
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
error_reporting(E_ALL);
ini_set('display_errors', 0);

define('RAIZ',   __DIR__);
define('CONFIG', RAIZ . '/config.php');
define('DATAJS', RAIZ . '/assets/js/data.js');

function salir($datos, $codigo = 200) {
  http_response_code($codigo);
  echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
function error($msg, $codigo = 400) { salir(['ok' => false, 'error' => $msg], $codigo); }

/* Configuración: el archivo si ya existe; si no, la sesión del instalador */
function conf() {
  if (file_exists(CONFIG)) return require CONFIG;
  if (!empty($_SESSION['bc_bd'])) return $_SESSION['bc_bd'];
  return null;
}
function bd() {
  static $pdo = null;
  if ($pdo) return $pdo;
  $c = conf();
  if (!$c) error('El sitio todavía no está instalado. Abrí instalar.php', 409);
  try {
    $pdo = new PDO("mysql:host={$c['host']};dbname={$c['base']};charset=utf8mb4",
      $c['usuario'], $c['clave'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
      ]);
  } catch (PDOException $e) { error('No se pudo conectar a la base de datos.', 500); }
  return $pdo;
}
function pre() { $c = conf(); return $c['prefijo'] ?? 'bc_'; }
function t($n) { return '`' . pre() . $n . '`'; }

function cuerpo() {
  $j = json_decode(file_get_contents('php://input'), true);
  return is_array($j) ? $j : [];
}
function autenticado() { return !empty($_SESSION['bc_usuario']); }
function exigirSesion() { if (!autenticado()) error('Tenés que iniciar sesión.', 401); }

/* Pequeña defensa: las acciones que escriben exigen la cabecera del panel */
$accion = $_GET['accion'] ?? '';
$escribe = in_array($accion, ['login','guardar','publicar','importar_instalacion','pedido','borrar_pedido','estado_pedido'], true);
if ($escribe && $_SERVER['REQUEST_METHOD'] !== 'POST') error('Método no permitido.', 405);
if ($escribe && empty($_SERVER['HTTP_X_BACANO'])) error('Petición no autorizada.', 403);

/* ============================================================
   LECTURA / ESCRITURA DEL CONTENIDO
   ============================================================ */
function leerTodo() {
  $bd = bd();
  $aj = [];
  foreach ($bd->query("SELECT clave, valor FROM " . t('ajustes')) as $r) {
    $aj[$r['clave']] = json_decode($r['valor'], true);
  }
  $cats = $bd->query("SELECT slug, nombre, descripcion AS `desc`, img FROM " . t('categorias') . " ORDER BY orden, id")->fetchAll();

  $prod = [];
  foreach ($bd->query("SELECT * FROM " . t('productos') . " WHERE activo = 1 ORDER BY orden, id") as $p) {
    $item = [
      'id'      => $p['slug'],
      'nombre'  => $p['nombre'],
      'cat'     => $p['cat'],
      'precio'  => (int)$p['precio'],
      'unidad'  => $p['unidad'],
      'img'     => $p['img'],
      'flags'   => $p['flags'] ? json_decode($p['flags'], true) : [],
      'rating'  => (float)$p['rating'],
      'reviews' => (int)$p['reviews'],
      'desc'    => $p['descripcion'],
      'specs'   => $p['specs'] ? json_decode($p['specs'], true) : [],
      'plazo'   => $p['plazo'],
    ];
    if ($p['antes'] !== null && $p['antes'] > 0) $item['antes'] = (int)$p['antes'];
    $prod[] = $item;
  }
  $test = $bd->query("SELECT nombre, empresa, inicial, estrellas, texto FROM " . t('testimonios') . " ORDER BY orden, id")->fetchAll();
  foreach ($test as &$x) { $x['estrellas'] = (int)$x['estrellas']; } unset($x);
  $faqs = [];
  foreach ($bd->query("SELECT pregunta, respuesta FROM " . t('faqs') . " ORDER BY orden, id") as $f) {
    $faqs[] = ['q' => $f['pregunta'], 'a' => $f['respuesta']];
  }
  return [
    'SITE'        => $aj['SITE']  ?? new stdClass(),
    'FOTOS'       => $aj['FOTOS'] ?? new stdClass(),
    'CATEGORIAS'  => $cats,
    'PRODUCTOS'   => $prod,
    'TESTIMONIOS' => $test,
    'FAQS'        => $faqs,
    'BIBLIOTECA'  => $aj['BIBLIOTECA'] ?? [],
  ];
}

function guardarTodo($d) {
  $bd = bd();
  $bd->beginTransaction();
  try {
    foreach (['SITE', 'FOTOS', 'BIBLIOTECA'] as $k) {
      if (!isset($d[$k])) continue;
      $st = $bd->prepare("INSERT INTO " . t('ajustes') . " (clave, valor) VALUES (?, ?)
                          ON DUPLICATE KEY UPDATE valor = VALUES(valor)");
      $st->execute([$k, json_encode($d[$k], JSON_UNESCAPED_UNICODE)]);
    }

    if (isset($d['CATEGORIAS'])) {
      $bd->exec("DELETE FROM " . t('categorias'));
      $st = $bd->prepare("INSERT INTO " . t('categorias') . " (slug, nombre, descripcion, img, orden) VALUES (?,?,?,?,?)");
      foreach ($d['CATEGORIAS'] as $i => $c)
        $st->execute([$c['slug'] ?? '', $c['nombre'] ?? '', $c['desc'] ?? '', $c['img'] ?? '', $i]);
    }

    if (isset($d['PRODUCTOS'])) {
      $bd->exec("DELETE FROM " . t('productos'));
      $st = $bd->prepare("INSERT INTO " . t('productos') . "
        (slug, nombre, cat, precio, antes, unidad, img, flags, rating, reviews, descripcion, specs, plazo, orden, activo)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)");
      foreach ($d['PRODUCTOS'] as $i => $p) {
        $st->execute([
          $p['id'] ?? ('p' . $i), $p['nombre'] ?? '', $p['cat'] ?? '',
          (int)($p['precio'] ?? 0), isset($p['antes']) && $p['antes'] ? (int)$p['antes'] : null,
          $p['unidad'] ?? '', $p['img'] ?? '',
          json_encode($p['flags'] ?? [], JSON_UNESCAPED_UNICODE),
          (float)($p['rating'] ?? 5), (int)($p['reviews'] ?? 0),
          $p['desc'] ?? '', json_encode($p['specs'] ?? [], JSON_UNESCAPED_UNICODE),
          $p['plazo'] ?? '', $i,
        ]);
      }
    }

    if (isset($d['TESTIMONIOS'])) {
      $bd->exec("DELETE FROM " . t('testimonios'));
      $st = $bd->prepare("INSERT INTO " . t('testimonios') . " (nombre, empresa, inicial, estrellas, texto, orden) VALUES (?,?,?,?,?,?)");
      foreach ($d['TESTIMONIOS'] as $i => $x)
        $st->execute([$x['nombre'] ?? '', $x['empresa'] ?? '', $x['inicial'] ?? '', (int)($x['estrellas'] ?? 5), $x['texto'] ?? '', $i]);
    }

    if (isset($d['FAQS'])) {
      $bd->exec("DELETE FROM " . t('faqs'));
      $st = $bd->prepare("INSERT INTO " . t('faqs') . " (pregunta, respuesta, orden) VALUES (?,?,?)");
      foreach ($d['FAQS'] as $i => $f) $st->execute([$f['q'] ?? '', $f['a'] ?? '', $i]);
    }

    $bd->commit();
  } catch (Exception $e) {
    $bd->rollBack();
    error('No se pudo guardar: ' . $e->getMessage(), 500);
  }
}

/* Regenera assets/js/data.js desde la base */
function publicarDataJs() {
  $d = leerTodo();
  $j = function ($n, $v) {
    return "let $n = " . json_encode($v, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n\n";
  };
  $txt  = "/* ============================================================\n"
        . "   BACANO.CL — Datos del sitio y catálogo\n"
        . "   Generado desde la base de datos el " . date('d-m-Y H:i') . "\n"
        . "   No edites este archivo a mano: se reescribe al publicar.\n"
        . "   ============================================================ */\n\n"
        . "const U = (id, w = 900, h = 0) =>\n"
        . "  `https://images.unsplash.com/\${id}?auto=format&fit=crop&w=\${w}\${h ? \"&h=\" + h : \"\"}&q=80`;\n\n";
  foreach (['FOTOS','SITE','CATEGORIAS','PRODUCTOS','TESTIMONIOS','FAQS','BIBLIOTECA'] as $k)
    $txt .= $j($k, $d[$k]);
  $txt .= "/* Vista previa del panel: abrí cualquier página con ?preview=1 */\n"
        . "if(location.search.includes(\"preview=1\") || location.hash.includes(\"preview\")){\n"
        . "  try{\n"
        . "    const p = JSON.parse(localStorage.getItem(\"bacano_admin_v1\"));\n"
        . "    if(p){\n"
        . "      if(p.SITE) SITE = p.SITE;\n"
        . "      if(p.FOTOS) FOTOS = p.FOTOS;\n"
        . "      if(p.CATEGORIAS) CATEGORIAS = p.CATEGORIAS;\n"
        . "      if(p.PRODUCTOS) PRODUCTOS = p.PRODUCTOS;\n"
        . "      if(p.TESTIMONIOS) TESTIMONIOS = p.TESTIMONIOS;\n"
        . "      if(p.FAQS) FAQS = p.FAQS;\n"
        . "    }\n"
        . "  }catch(e){ console.warn(\"preview:\", e); }\n"
        . "}\n";

  if (@file_put_contents(DATAJS, $txt) === false)
    error('No se pudo escribir assets/js/data.js. Revisá los permisos de la carpeta.', 500);
  return strlen($txt);
}

/* ============================================================
   ACCIONES
   ============================================================ */
switch ($accion) {

  case 'estado':
    $inst = file_exists(CONFIG);
    $r = ['ok' => true, 'instalado' => $inst, 'sesion' => autenticado(), 'usuario' => $_SESSION['bc_usuario'] ?? null];
    if ($inst && autenticado()) {
      try {
        $bd = bd();
        $r['contadores'] = [
          'productos'   => (int)$bd->query("SELECT COUNT(*) c FROM " . t('productos'))->fetch()['c'],
          'categorias'  => (int)$bd->query("SELECT COUNT(*) c FROM " . t('categorias'))->fetch()['c'],
          'pedidos'     => (int)$bd->query("SELECT COUNT(*) c FROM " . t('pedidos'))->fetch()['c'],
          'pendientes'  => (int)$bd->query("SELECT COUNT(*) c FROM " . t('pedidos') . " WHERE estado='nuevo'")->fetch()['c'],
        ];
        $r['data_js'] = file_exists(DATAJS) ? date('d-m-Y H:i', filemtime(DATAJS)) : null;
      } catch (Exception $e) { $r['contadores'] = null; }
    }
    salir($r);

  case 'login':
    $d = cuerpo();
    $u = trim($d['usuario'] ?? '');
    $c = (string)($d['clave'] ?? '');
    if ($u === '' || $c === '') error('Faltan usuario o contraseña.');
    $st = bd()->prepare("SELECT * FROM " . t('usuarios') . " WHERE usuario = ?");
    $st->execute([$u]);
    $row = $st->fetch();
    if (!$row || !password_verify($c, $row['hash'])) { usleep(700000); error('Usuario o contraseña incorrectos.', 401); }
    session_regenerate_id(true);
    $_SESSION['bc_usuario'] = $row['usuario'];
    salir(['ok' => true, 'usuario' => $row['usuario']]);

  case 'salir':
    unset($_SESSION['bc_usuario']);
    salir(['ok' => true]);

  case 'leer':
    exigirSesion();
    salir(['ok' => true, 'datos' => leerTodo()]);

  case 'guardar':
    exigirSesion();
    guardarTodo(cuerpo());
    salir(['ok' => true]);

  case 'publicar':
    exigirSesion();
    $d = cuerpo();
    if (!empty($d['PRODUCTOS'])) guardarTodo($d);
    $bytes = publicarDataJs();
    salir(['ok' => true, 'bytes' => $bytes, 'fecha' => date('d-m-Y H:i')]);

  /* Solo durante la instalación: config.php todavía no existe */
  case 'importar_instalacion':
    if (file_exists(CONFIG) && !autenticado()) error('La instalación ya terminó.', 403);
    if (empty($_SESSION['bc_bd']) && !autenticado()) error('No hay una instalación en curso.', 403);
    guardarTodo(cuerpo());
    salir(['ok' => true]);

  /* Público: el carrito manda el pedido */
  case 'pedido':
    $d = cuerpo();
    if (empty($d['items'])) error('El pedido no tiene productos.');
    $numero = 'BC-' . date('ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 4));
    $st = bd()->prepare("INSERT INTO " . t('pedidos') . "
      (numero, nombre, email, telefono, documento, entrega, direccion, comuna, notas, items, total, estado, creado)
      VALUES (?,?,?,?,?,?,?,?,?,?,?, 'nuevo', NOW())");
    $st->execute([
      $numero, $d['nombre'] ?? '', $d['email'] ?? '', $d['telefono'] ?? '', $d['documento'] ?? '',
      $d['entrega'] ?? '', $d['direccion'] ?? '', $d['comuna'] ?? '', $d['notas'] ?? '',
      json_encode($d['items'], JSON_UNESCAPED_UNICODE), (int)($d['total'] ?? 0),
    ]);
    salir(['ok' => true, 'numero' => $numero]);

  case 'pedidos':
    exigirSesion();
    $lista = bd()->query("SELECT * FROM " . t('pedidos') . " ORDER BY creado DESC LIMIT 100")->fetchAll();
    foreach ($lista as &$p) $p['items'] = json_decode($p['items'], true); unset($p);
    salir(['ok' => true, 'pedidos' => $lista]);

  case 'estado_pedido':
    exigirSesion();
    $d = cuerpo();
    $st = bd()->prepare("UPDATE " . t('pedidos') . " SET estado = ? WHERE numero = ?");
    $st->execute([$d['estado'] ?? 'nuevo', $d['numero'] ?? '']);
    salir(['ok' => true]);

  default:
    error('Acción desconocida.', 404);
}
