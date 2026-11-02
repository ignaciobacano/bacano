<?php
/* ============================================================
   BACANO.CL — Pedidos del carrito y sus correos
   Cada pedido se guarda como un archivo JSON fuera de la carpeta
   pública. Cuando Mercado Pago confirma el pago, se envían dos
   correos, una sola vez: el aviso a Bacano y el comprobante al
   cliente. Lo usa mercadopago.php.
   ============================================================ */

/* Carpeta de pedidos: fuera de public_html, para que nadie la abra desde internet */
function carpetaPedidos() {
  static $dir = null;
  if ($dir !== null) return $dir;
  $dir = dirname(__DIR__) . '/bacano-pedidos';
  if (!is_dir($dir) && !@mkdir($dir, 0750, true)) {
    /* si el hosting no deja escribir afuera, una carpeta interna cerrada */
    $dir = __DIR__ . '/_pedidos';
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    if (!file_exists("$dir/.htaccess")) @file_put_contents("$dir/.htaccess", "Require all denied\nDeny from all\n");
  }
  return $dir;
}

function archivoPedido($numero) {
  if (!preg_match('/^BC-\d{6}-[A-F0-9]{4}$/', (string)$numero)) return null;
  return carpetaPedidos() . "/$numero.json";
}

function guardarPedidoArchivo($numero, $cliente, $lineas, $totales) {
  $f = archivoPedido($numero);
  if (!$f) return;
  $pedido = [
    'numero'  => $numero,
    'creado'  => date('c'),
    'cliente' => $cliente,
    'lineas'  => $lineas,
    'totales' => $totales,
    'pago'    => null,
    'avisado' => false,
  ];
  if (@file_put_contents($f, json_encode($pedido, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) === false)
    error_log("No se guardó el archivo del pedido $numero");
}

function leerPedido($numero) {
  $f = archivoPedido($numero);
  if (!$f || !file_exists($f)) return null;
  $p = json_decode((string)file_get_contents($f), true);
  return is_array($p) ? $p : null;
}

function clp($n) { return '$' . number_format((int)$n, 0, ',', '.'); }

/* Texto del pedido, igual para los dos correos */
function detallePedido($p) {
  $t = [];
  foreach ($p['lineas'] as $l) $t[] = "  {$l['qty']} × {$l['nombre']}  " . clp($l['precio'] * $l['qty']);
  $tot = $p['totales'];
  $t[] = '';
  $t[] = '  Subtotal:  ' . clp($tot['subtotal']);
  if (!empty($tot['descuento'])) $t[] = '  Descuento: -' . clp($tot['descuento']) . (empty($tot['cupon']) ? '' : " (cupón {$tot['cupon']})");
  $t[] = '  Despacho:  ' . ($tot['envio'] ? clp($tot['envio']) : 'sin costo');
  $t[] = '  TOTAL:     ' . clp($tot['total']);
  return implode("\n", $t);
}

function enviarCorreo($para, $asunto, $texto, $responderA = '') {
  $de = 'contacto@bacano.cl';
  $cab = [
    'From: Bacano <' . $de . '>',
    'Reply-To: ' . ($responderA ?: $de),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ];
  $ok = @mail($para, mb_encode_mimeheader($asunto, 'UTF-8'), $texto, implode("\r\n", $cab), '-f' . $de);
  if (!$ok) error_log("No se pudo enviar el correo a $para: $asunto");
  return $ok;
}

/* Se llama cada vez que se consulta un pago. Solo actúa la primera vez que llega aprobado. */
function avisarPedido($pago, $avisarA) {
  if (($pago['status'] ?? '') !== 'approved') return;
  $numero = $pago['external_reference'] ?? '';
  $f = archivoPedido($numero);
  if (!$f || !file_exists($f)) return;

  /* el candado evita que el webhook y la página de vuelta manden el correo dos veces */
  $h = fopen($f, 'c+');
  if (!$h || !flock($h, LOCK_EX)) return;
  $p = json_decode(stream_get_contents($h), true);
  if (!is_array($p) || !empty($p['avisado'])) { flock($h, LOCK_UN); fclose($h); return; }

  $c = $p['cliente'];
  $idPago = (string)($pago['id'] ?? '');
  $metodo = trim(($pago['payment_type_id'] ?? '') . ' ' . ($pago['payment_method_id'] ?? ''));
  $detalle = detallePedido($p);
  $entrega = $c['entrega'] . ($c['entrega'] === 'Retiro en taller' ? '' : "\nDirección: {$c['direccion']}, {$c['comuna']}");

  $aBacano = "Nuevo pedido pagado en bacano.cl\n\n"
    . "Pedido:  $numero\n"
    . "Pago Mercado Pago:  $idPago ($metodo)\n"
    . 'Fecha:  ' . date('d-m-Y H:i') . "\n\n"
    . "PRODUCTOS\n$detalle\n\n"
    . "CLIENTE\n"
    . "Nombre: {$c['nombre']}\n"
    . "Correo: {$c['email']}\n"
    . "Teléfono: {$c['telefono']}\n"
    . ($c['documento'] !== '' ? "RUT / documento: {$c['documento']}\n" : '')
    . "Entrega: $entrega\n"
    . 'Notas: ' . ($c['notas'] !== '' ? $c['notas'] : '—') . "\n\n"
    . "Responde este correo para escribirle directamente al cliente.\n";

  $aCliente = "Hola {$c['nombre']}:\n\n"
    . "Recibimos tu pago. Este es el comprobante de tu pedido en Bacano.\n\n"
    . "Pedido:  $numero\n"
    . "Pago Mercado Pago:  $idPago\n\n"
    . "$detalle\n\n"
    . "Entrega: $entrega\n\n"
    . "Te escribiremos para que nos envíes tu diseño y apruebes la prueba digital antes de producir.\n"
    . "Si tienes dudas, responde este correo o escríbenos por WhatsApp al +56 9 6776 0841.\n\n"
    . "Bacano · Puerto Montt, Chile · bacano.cl\n";

  $ok1 = enviarCorreo($avisarA, "Pedido pagado $numero · " . clp($p['totales']['total']), $aBacano, $c['email']);
  $ok2 = enviarCorreo($c['email'], "Tu pedido $numero en Bacano", $aCliente);

  /* si no salió el aviso a Bacano, se vuelve a intentar en la próxima consulta del pago */
  $p['pago'] = ['id' => $idPago, 'estado' => 'approved', 'metodo' => $metodo, 'fecha' => date('c')];
  $p['avisado'] = $ok1;
  $p['correo_cliente'] = $ok2;
  ftruncate($h, 0);
  rewind($h);
  fwrite($h, json_encode($p, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
  fflush($h);
  flock($h, LOCK_UN);
  fclose($h);
}
