<?php
/* ============================================================
   BACANO.CL — Instalador de la base de datos
   Asistente paso a paso. Se abre una sola vez:
   cuando termina, config.php queda creado y este archivo
   se bloquea solo.  Borralo del servidor al terminar.
   ============================================================ */

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

define('RAIZ',   __DIR__);
define('CONFIG', RAIZ . '/config.php');

$instalado = file_exists(CONFIG);
$paso  = isset($_GET['paso']) ? max(1, min(5, (int)$_GET['paso'])) : 1;
$error = '';
$ok    = '';

/* Si ya está instalado, solo se permite entrar con la clave de reinstalación */
if ($instalado && !isset($_SESSION['bc_reinstalar'])) {
  $paso = 0;
  if (isset($_POST['confirmar_reinstalar'])) {
    $_SESSION['bc_reinstalar'] = true;
    header('Location: instalar.php?paso=1'); exit;
  }
}

/* ---------- utilidades ---------- */
function tabla($p, $n) { return '`' . $p . $n . '`'; }

function conectar($d) {
  $dsn = "mysql:host={$d['host']};dbname={$d['base']};charset=utf8mb4";
  return new PDO($dsn, $d['usuario'], $d['clave'], [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
  ]);
}

function crearTablas(PDO $bd, $p) {
  $motor = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
  $sql = [
    "CREATE TABLE IF NOT EXISTS " . tabla($p,'ajustes') . " (
       clave VARCHAR(64) NOT NULL PRIMARY KEY,
       valor MEDIUMTEXT NULL
     ) $motor",

    "CREATE TABLE IF NOT EXISTS " . tabla($p,'categorias') . " (
       id INT AUTO_INCREMENT PRIMARY KEY,
       slug VARCHAR(80) NOT NULL UNIQUE,
       nombre VARCHAR(120) NOT NULL,
       descripcion VARCHAR(255) NULL,
       img VARCHAR(255) NULL,
       orden INT NOT NULL DEFAULT 0
     ) $motor",

    "CREATE TABLE IF NOT EXISTS " . tabla($p,'productos') . " (
       id INT AUTO_INCREMENT PRIMARY KEY,
       slug VARCHAR(120) NOT NULL UNIQUE,
       nombre VARCHAR(180) NOT NULL,
       cat VARCHAR(80) NOT NULL,
       precio INT NOT NULL DEFAULT 0,
       antes INT NULL,
       unidad VARCHAR(140) NULL,
       img VARCHAR(255) NULL,
       flags VARCHAR(255) NULL,
       rating DECIMAL(2,1) NOT NULL DEFAULT 5.0,
       reviews INT NOT NULL DEFAULT 0,
       descripcion TEXT NULL,
       specs TEXT NULL,
       plazo VARCHAR(90) NULL,
       orden INT NOT NULL DEFAULT 0,
       activo TINYINT(1) NOT NULL DEFAULT 1,
       KEY idx_cat (cat), KEY idx_orden (orden)
     ) $motor",

    "CREATE TABLE IF NOT EXISTS " . tabla($p,'testimonios') . " (
       id INT AUTO_INCREMENT PRIMARY KEY,
       nombre VARCHAR(120) NOT NULL,
       empresa VARCHAR(160) NULL,
       inicial VARCHAR(4) NULL,
       estrellas TINYINT NOT NULL DEFAULT 5,
       texto TEXT NULL,
       orden INT NOT NULL DEFAULT 0
     ) $motor",

    "CREATE TABLE IF NOT EXISTS " . tabla($p,'faqs') . " (
       id INT AUTO_INCREMENT PRIMARY KEY,
       pregunta VARCHAR(255) NOT NULL,
       respuesta TEXT NULL,
       orden INT NOT NULL DEFAULT 0
     ) $motor",

    "CREATE TABLE IF NOT EXISTS " . tabla($p,'usuarios') . " (
       id INT AUTO_INCREMENT PRIMARY KEY,
       usuario VARCHAR(60) NOT NULL UNIQUE,
       hash VARCHAR(255) NOT NULL,
       creado DATETIME NOT NULL
     ) $motor",

    "CREATE TABLE IF NOT EXISTS " . tabla($p,'pedidos') . " (
       id INT AUTO_INCREMENT PRIMARY KEY,
       numero VARCHAR(20) NOT NULL UNIQUE,
       nombre VARCHAR(160) NULL,
       email VARCHAR(160) NULL,
       telefono VARCHAR(60) NULL,
       documento VARCHAR(40) NULL,
       entrega VARCHAR(60) NULL,
       direccion VARCHAR(255) NULL,
       comuna VARCHAR(120) NULL,
       notas TEXT NULL,
       items MEDIUMTEXT NULL,
       total INT NOT NULL DEFAULT 0,
       estado VARCHAR(20) NOT NULL DEFAULT 'nuevo',
       creado DATETIME NOT NULL,
       KEY idx_estado (estado), KEY idx_creado (creado)
     ) $motor",
  ];
  foreach ($sql as $q) $bd->exec($q);
}

/* ---------- procesamiento de cada paso ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $paso > 0) {

  /* PASO 2 — datos de conexión */
  if (isset($_POST['bd_host'])) {
    $d = [
      'host'    => trim($_POST['bd_host']),
      'base'    => trim($_POST['bd_base']),
      'usuario' => trim($_POST['bd_usuario']),
      'clave'   => (string)$_POST['bd_clave'],
      'prefijo' => preg_replace('/[^a-z0-9_]/i', '', trim($_POST['bd_prefijo'])) ?: 'bc_',
    ];
    try {
      $bd = conectar($d);
      crearTablas($bd, $d['prefijo']);
      $_SESSION['bc_bd'] = $d;
      header('Location: instalar.php?paso=3'); exit;
    } catch (PDOException $e) {
      $m = $e->getMessage();
      if (stripos($m, 'Access denied') !== false)      $error = 'Usuario o contraseña incorrectos para la base de datos.';
      elseif (stripos($m, 'Unknown database') !== false) $error = 'Esa base de datos no existe. Creala primero en el panel de tu hosting.';
      elseif (stripos($m, 'getaddrinfo') !== false || stripos($m, 'Connection refused') !== false)
                                                        $error = 'No se puede llegar al servidor «' . htmlspecialchars($d['host']) . '». En la mayoría de los hostings es localhost.';
      else                                              $error = 'MySQL respondió: ' . htmlspecialchars($m);
    }
  }

  /* PASO 3 — usuario del panel */
  elseif (isset($_POST['adm_usuario'])) {
    $u = trim($_POST['adm_usuario']);
    $c = (string)$_POST['adm_clave'];
    $c2 = (string)$_POST['adm_clave2'];
    if (strlen($u) < 3)            $error = 'El usuario necesita al menos 3 caracteres.';
    elseif (strlen($c) < 8)        $error = 'La contraseña necesita al menos 8 caracteres.';
    elseif ($c !== $c2)            $error = 'Las dos contraseñas no coinciden.';
    else {
      try {
        $d  = $_SESSION['bc_bd'];
        $bd = conectar($d);
        $st = $bd->prepare("INSERT INTO " . tabla($d['prefijo'],'usuarios') . " (usuario, hash, creado)
                            VALUES (?, ?, NOW())
                            ON DUPLICATE KEY UPDATE hash = VALUES(hash)");
        $st->execute([$u, password_hash($c, PASSWORD_DEFAULT)]);
        header('Location: instalar.php?paso=4'); exit;
      } catch (PDOException $e) { $error = 'No se pudo crear el usuario: ' . htmlspecialchars($e->getMessage()); }
    }
  }

  /* PASO 5 — escribir config.php */
  elseif (isset($_POST['finalizar'])) {
    $d = $_SESSION['bc_bd'];
    $php = "<?php\n"
         . "/* Generado por instalar.php el " . date('d-m-Y H:i') . " — no compartir este archivo */\n"
         . "return " . var_export([
             'host'    => $d['host'],
             'base'    => $d['base'],
             'usuario' => $d['usuario'],
             'clave'   => $d['clave'],
             'prefijo' => $d['prefijo'],
           ], true) . ";\n";
    if (@file_put_contents(CONFIG, $php) === false) {
      $error = 'No se pudo escribir config.php. Dale permiso de escritura a la carpeta (755) y reintentá.';
    } else {
      @chmod(CONFIG, 0640);
      unset($_SESSION['bc_bd'], $_SESSION['bc_reinstalar']);
      header('Location: instalar.php?paso=5&listo=1'); exit;
    }
  }
}

/* ---------- chequeos del paso 1 ---------- */
function chequeos() {
  return [
    ['PHP 7.4 o superior',      version_compare(PHP_VERSION, '7.4', '>='), 'Tenés PHP ' . PHP_VERSION],
    ['Extensión PDO MySQL',     extension_loaded('pdo_mysql'),             'Necesaria para hablar con MySQL'],
    ['Extensión JSON',          extension_loaded('json'),                  'Viene con PHP'],
    ['Escritura en la carpeta', is_writable(RAIZ),                         'Para crear config.php'],
    ['Escritura en assets/js',  is_writable(RAIZ . '/assets/js'),          'Para regenerar data.js'],
    ['Carpeta de fotos',        is_dir(RAIZ . '/assets/img/fotos') && is_writable(RAIZ . '/assets/img/fotos'), 'Para subir imágenes desde el panel'],
    ['Extensión GD (opcional)', extension_loaded('gd'),                    'Para achicar fotos en el servidor'],
  ];
}
$listo = isset($_GET['listo']);
?>
<!DOCTYPE html>
<html lang="es-CL">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Instalar · Bacano.cl</title>
<link rel="icon" href="assets/img/logo-mark.svg" type="image/svg+xml">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--black:#0c0c0e;--line:#e2e2e8;--paper:#f5f5f7;--gray:#6c6c78;--red:#8b0f14;--red2:#a8151b;--ok:#1c7a4b}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);font-family:Inter,system-ui,sans-serif;color:var(--black)}
.top{background:var(--black);color:#fff;padding:16px 22px;display:flex;align-items:center;gap:10px}
.top b{display:block;height:30px;aspect-ratio:1065/456;background:#fff;
       -webkit-mask:url(assets/img/logo-bacano.png) center/contain no-repeat;
               mask:url(assets/img/logo-bacano.png) center/contain no-repeat}
.top span{margin-left:auto;font-size:.78rem;color:#9a9aa5}
main{max-width:760px;margin:0 auto;padding:30px 20px 70px}
.pasos{display:flex;gap:8px;margin-bottom:26px;flex-wrap:wrap}
.pasos div{flex:1;min-width:110px;border-top:3px solid var(--line);padding-top:9px;font-size:.74rem;font-weight:700;color:#9a9aa5;text-transform:uppercase;letter-spacing:.05em}
.pasos div.on{border-color:var(--red);color:var(--black)}
.pasos div.hecho{border-color:var(--ok);color:var(--ok)}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:26px;margin-bottom:18px}
h1{font-size:1.6rem;margin:0 0 8px}
h2{font-size:1.15rem;margin:0 0 6px}
p{color:var(--gray);line-height:1.6;margin:0 0 14px}
label{display:block;font-size:.74rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px;color:var(--gray)}
input{width:100%;border:1px solid var(--line);border-radius:9px;padding:12px 14px;font:inherit;background:#fff}
input:focus{outline:2px solid var(--red);outline-offset:-1px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:620px){.g2{grid-template-columns:1fr}}
.btn{display:inline-flex;align-items:center;gap:9px;background:var(--red);color:#fff;border:0;border-radius:100px;
     padding:13px 26px;font-weight:700;font-size:.9rem;cursor:pointer;text-decoration:none}
.btn:hover{background:var(--red2)}
.btn.gris{background:#fff;color:var(--black);border:2px solid var(--line)}
.chk{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--line);font-size:.92rem}
.chk:last-child{border:0}
.chk b{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:.8rem;flex:none}
.si{background:var(--ok)} .no{background:var(--red)} .op{background:#c9a227}
.chk span{color:var(--gray);font-size:.8rem;margin-left:auto;text-align:right}
.aviso{border-left:4px solid var(--red);background:#fdeced;padding:14px 16px;border-radius:0 9px 9px 0;margin-bottom:18px;font-size:.9rem}
.bien{border-left:4px solid var(--ok);background:#e9f6ef;padding:14px 16px;border-radius:0 9px 9px 0;margin-bottom:18px;font-size:.9rem}
.hint{font-size:.78rem;color:var(--gray);margin-top:6px}
code{background:var(--paper);padding:2px 6px;border-radius:5px;border:1px solid var(--line);font-size:.85em}
.log{background:#0c0c0e;color:#c9c9d2;border-radius:10px;padding:14px;font:12px/1.7 ui-monospace,Consolas,monospace;max-height:220px;overflow:auto;white-space:pre-wrap}
.log b{color:#7fd8a3}.log i{color:#ff8f95;font-style:normal}
</style>
</head>
<body>
<div class="top"><b role="img" aria-label="Bacano Estudio Creativo"></b><span>Instalador de la base de datos</span></div>
<main>

<?php if ($paso === 0): ?>
  <div class="card">
    <h1>El sitio ya está instalado</h1>
    <p>Existe el archivo <code>config.php</code>, así que la base de datos ya fue configurada. Por seguridad deberías <b>borrar este instalador</b> del servidor.</p>
    <div class="aviso">Si volvés a instalar, se conservan las tablas y los datos: solo se reescribe la conexión y podés crear otro usuario del panel.</div>
    <form method="post">
      <button class="btn gris" name="confirmar_reinstalar" value="1">Volver a configurar de todas formas</button>
      <a class="btn" href="admin.html" style="margin-left:8px">Ir al panel</a>
    </form>
  </div>

<?php else: ?>

  <div class="pasos">
    <?php
      $nombres = [1 => 'Requisitos', 2 => 'Base de datos', 3 => 'Usuario', 4 => 'Catálogo', 5 => 'Listo'];
      foreach ($nombres as $n => $t) {
        $cls = $n < $paso ? 'hecho' : ($n === $paso ? 'on' : '');
        echo '<div class="' . $cls . '">' . $n . ' · ' . $t . '</div>';
      }
    ?>
  </div>

  <?php if ($error): ?><div class="aviso"><b>✕</b> <?= $error ?></div><?php endif; ?>

  <?php /* ---------------- PASO 1 ---------------- */ if ($paso === 1): ?>
    <div class="card">
      <h1>Revisemos el servidor</h1>
      <p>Antes de tocar la base de datos, comprobamos que tu hosting tenga todo lo necesario.</p>
      <?php $c = chequeos(); $faltan = 0; ?>
      <?php foreach ($c as $i => $x):
        $opcional = strpos($x[0], 'opcional') !== false;
        if (!$x[1] && !$opcional) $faltan++;
      ?>
        <div class="chk">
          <b class="<?= $x[1] ? 'si' : ($opcional ? 'op' : 'no') ?>"><?= $x[1] ? '✓' : '!' ?></b>
          <?= htmlspecialchars($x[0]) ?>
          <span><?= htmlspecialchars($x[2]) ?></span>
        </div>
      <?php endforeach; ?>

      <?php if ($faltan): ?>
        <div class="aviso" style="margin-top:18px">Hay <?= $faltan ?> requisito(s) sin cumplir. Si es un problema de permisos, en el administrador de archivos del hosting poné la carpeta en <code>755</code>. Si falta PDO MySQL, pedíselo al soporte.</div>
      <?php else: ?>
        <div class="bien" style="margin-top:18px">Todo en orden. Podemos seguir.</div>
      <?php endif; ?>

      <a class="btn" href="instalar.php?paso=2" style="margin-top:8px">Continuar →</a>
    </div>

  <?php /* ---------------- PASO 2 ---------------- */ elseif ($paso === 2): ?>
    <div class="card">
      <h1>Datos de la base de datos</h1>
      <p>Creá primero una base de datos vacía y un usuario en el panel de tu hosting (en cPanel: <b>MySQL Databases</b>). Después copiá acá esos datos.</p>
      <form method="post">
        <div class="g2">
          <div>
            <label>Servidor</label>
            <input name="bd_host" value="<?= htmlspecialchars($_SESSION['bc_bd']['host'] ?? 'localhost') ?>" required>
            <p class="hint">Casi siempre <code>localhost</code>.</p>
          </div>
          <div>
            <label>Nombre de la base</label>
            <input name="bd_base" value="<?= htmlspecialchars($_SESSION['bc_bd']['base'] ?? '') ?>" required placeholder="usuario_bacano">
          </div>
        </div>
        <div class="g2" style="margin-top:14px">
          <div>
            <label>Usuario</label>
            <input name="bd_usuario" value="<?= htmlspecialchars($_SESSION['bc_bd']['usuario'] ?? '') ?>" required>
          </div>
          <div>
            <label>Contraseña</label>
            <input name="bd_clave" type="password" value="">
          </div>
        </div>
        <div style="margin-top:14px;max-width:220px">
          <label>Prefijo de las tablas</label>
          <input name="bd_prefijo" value="<?= htmlspecialchars($_SESSION['bc_bd']['prefijo'] ?? 'bc_') ?>">
          <p class="hint">Dejalo así si la base es solo para este sitio.</p>
        </div>
        <button class="btn" style="margin-top:22px">Conectar y crear las tablas →</button>
      </form>
    </div>

  <?php /* ---------------- PASO 3 ---------------- */ elseif ($paso === 3): ?>
    <div class="card">
      <div class="bien">Conexión correcta. Se crearon 7 tablas: productos, categorías, testimonios, preguntas, ajustes, pedidos y usuarios.</div>
      <h1>Usuario para entrar al panel</h1>
      <p>Con estos datos vas a iniciar sesión en <code>admin.html</code>. La contraseña se guarda cifrada, no en texto plano.</p>
      <form method="post">
        <div>
          <label>Usuario</label>
          <input name="adm_usuario" required autocomplete="username" placeholder="ignacio">
        </div>
        <div class="g2" style="margin-top:14px">
          <div>
            <label>Contraseña</label>
            <input name="adm_clave" type="password" required minlength="8" autocomplete="new-password">
            <p class="hint">Mínimo 8 caracteres.</p>
          </div>
          <div>
            <label>Repetir contraseña</label>
            <input name="adm_clave2" type="password" required minlength="8" autocomplete="new-password">
          </div>
        </div>
        <button class="btn" style="margin-top:22px">Crear usuario →</button>
      </form>
    </div>

  <?php /* ---------------- PASO 4 ---------------- */ elseif ($paso === 4): ?>
    <div class="card">
      <h1>Cargar el catálogo</h1>
      <p>Ahora pasamos a la base los productos, categorías, testimonios y textos que ya tiene el sitio. Se leen del archivo <code>assets/js/data.js</code>.</p>
      <div class="log" id="log">Esperando…</div>
      <div style="margin-top:18px">
        <button class="btn" id="btnImp" onclick="importar()">Importar contenido actual</button>
        <a class="btn gris" href="instalar.php?paso=5" style="margin-left:8px">Saltar este paso</a>
      </div>
    </div>

    <!-- el navegador ya sabe leer data.js: lo cargamos y lo mandamos a la API -->
    <script src="assets/js/data.js"></script>
    <script>
      const L = document.getElementById('log');
      const p = (m, t) => L.innerHTML += (t === 'ok' ? '<b>✓ ' + m + '</b>' : t === 'err' ? '<i>✕ ' + m + '</i>' : '· ' + m) + "\n";
      async function importar(){
        const b = document.getElementById('btnImp'); b.disabled = true;
        try{
          p('Leyendo el contenido del sitio…');
          const datos = { SITE, FOTOS, CATEGORIAS, PRODUCTOS, TESTIMONIOS, FAQS };
          p(PRODUCTOS.length + ' productos, ' + CATEGORIAS.length + ' categorías, ' +
            TESTIMONIOS.length + ' testimonios, ' + FAQS.length + ' preguntas');
          const r = await fetch('api.php?accion=importar_instalacion', {
            method:'POST', headers:{'Content-Type':'application/json','X-Bacano':'1'},
            body: JSON.stringify(datos)
          });
          const j = await r.json();
          if(!j.ok) throw new Error(j.error || 'error desconocido');
          p('Guardado en la base de datos', 'ok');
          p('Listo. Pasando al último paso…');
          setTimeout(() => location.href = 'instalar.php?paso=5', 1200);
        }catch(e){
          p(e.message, 'err');
          p('Podés saltear este paso y cargar los productos a mano desde el panel.');
          b.disabled = false;
        }
      }
    </script>

  <?php /* ---------------- PASO 5 ---------------- */ elseif ($paso === 5): ?>
    <?php if ($listo): ?>
      <div class="card">
        <div class="bien"><b>Instalación terminada.</b> Ya podés entrar al panel con el usuario que creaste.</div>
        <h1>Falta un último detalle</h1>
        <p><b>Borrá <code>instalar.php</code> del servidor.</b> Mientras siga ahí, cualquiera que encuentre la dirección puede volver a configurar la conexión.</p>
        <p>También conviene proteger <code>admin.html</code> con contraseña desde <i>Directory Privacy</i> de cPanel.</p>
        <a class="btn" href="admin.html">Entrar al panel →</a>
        <a class="btn gris" href="index.html" style="margin-left:8px">Ver el sitio</a>
      </div>
    <?php else: ?>
      <div class="card">
        <h1>Guardar la configuración</h1>
        <p>Se va a crear el archivo <code>config.php</code> con los datos de conexión. Es el único archivo que guarda la contraseña de la base, así que queda con permisos restringidos y bloqueado desde el <code>.htaccess</code>.</p>
        <form method="post">
          <button class="btn" name="finalizar" value="1">Finalizar instalación</button>
        </form>
      </div>
    <?php endif; ?>
  <?php endif; ?>

<?php endif; ?>

</main>
</body>
</html>
