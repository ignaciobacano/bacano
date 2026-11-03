<?php
/* ============================================================
   BACANO.CL — Pedidos del carrito y sus correos
   Cada pedido se guarda como un archivo JSON fuera de la carpeta
   pública. Cada consulta del pago lo manda a Bacano Core (Pedidos),
   y cuando Mercado Pago lo aprueba el cliente recibe su comprobante,
   una sola vez. Lo usa mercadopago.php.
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
  $entrega = $p['cliente']['entrega'] ?? '';
  $t[] = '  Entrega:   ' . ($entrega === 'Despacho a regiones' ? 'por pagar al recibir'
                         : ($tot['envio'] ? clp($tot['envio']) : 'sin costo'));
  $t[] = '  TOTAL:     ' . clp($tot['total']);
  return implode("\n", $t);
}

/* La entrega, con lo que hace falta para cumplirla */
function textoEntrega($c) {
  $e = $c['entrega'] ?? '';
  if ($e === 'Retiro en taller')
    return "Retiro en taller\nRetira: {$c['r_nombre']} · RUT {$c['r_rut']}";
  if ($e === 'Delivery en Puerto Montt' || $e === 'Delivery en Puerto Varas')
    return "$e\nDirección: {$c['direccion']}" . (($c['referencia'] ?? '') !== '' ? " ({$c['referencia']})" : '');
  if ($e === 'Despacho a regiones')
    return "Despacho a regiones por {$c['courier']}, POR PAGAR al recibir\n"
         . "Recibe: {$c['d_nombre']} · RUT {$c['d_rut']} · {$c['d_telefono']}\n"
         . "Destino: {$c['d_direccion']}, {$c['comuna']}, región de {$c['region']}";
  return $e . (($c['direccion'] ?? '') !== '' ? "\nDirección: {$c['direccion']}, {$c['comuna']}" : '');
}

/* El documento, y con factura todos sus datos */
function textoDocumento($c) {
  if (($c['documento'] ?? '') !== 'Factura') return 'Boleta';
  return "Factura\nRazón social: {$c['f_razon']}\nRUT: {$c['f_rut']}\nGiro: {$c['f_giro']}\n"
       . "Dirección: {$c['f_direccion']}, {$c['f_comuna']}\nTeléfono: {$c['f_telefono']}\nCorreo de facturación: {$c['f_email']}";
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

/* ============================================================
   EL PEDIDO VA A BACANO CORE (Ignacio, 2026-11-02)
   Los pedidos ya no llegan por correo a Bacano: se ven en Bacano Core →
   Pedidos. Cada vez que se consulta un pago (la vuelta del cliente y el
   aviso de Mercado Pago) el pedido se manda a Core, que comprueba el pago
   con Mercado Pago antes de guardarlo. Core no duplica: el segundo envío
   solo actualiza el estado del pago.
   ============================================================ */
define('URL_CORE_PEDIDOS', 'https://bacanocore.cl/api/tienda/pedidos');

function enviarPedidoACore($pago, $prueba) {
  $numero = $pago['external_reference'] ?? '';
  $p = leerPedido($numero);
  if (!$p) return;
  $envio = file_exists(__DIR__ . '/mercadopago-config-envio.php') ? (require __DIR__ . '/mercadopago-config-envio.php') : [];
  $clave = (string)($envio['clave'] ?? '');
  if (strlen($clave) < 32) { error_log("Pedido $numero: falta la clave para enviarlo a Bacano Core"); return; }

  $cuerpo = [
    'clave'   => $clave,
    'numero'  => $numero,
    'pago_id' => (string)($pago['id'] ?? ''),
    'modo'    => $prueba ? 'prueba' : 'produccion',
    'creado'  => $p['creado'],
    'cliente' => $p['cliente'],
    'lineas'  => $p['lineas'],
    'totales' => $p['totales'],
  ];
  $ch = curl_init((string)($envio['core_url'] ?? URL_CORE_PEDIDOS));
  curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($cuerpo, JSON_UNESCAPED_UNICODE),
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_FOLLOWLOCATION => false,
  ]);
  $resp = curl_exec($ch);
  $cod  = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($cod !== 200) error_log("Pedido $numero: Bacano Core contestó $cod " . substr((string)$resp, 0, 200));
}

/* El comprobante al cliente: se manda una sola vez, la primera vez que el pago llega aprobado. */
function avisarPedido($pago) {
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

  $aCliente = "Hola {$c['nombre']}:\n\n"
    . "Recibimos tu pago. Este es el comprobante de tu pedido en Bacano.\n\n"
    . "Pedido:  $numero\n"
    . "Pago Mercado Pago:  $idPago\n\n"
    . detallePedido($p) . "\n\n"
    . 'Entrega: ' . textoEntrega($c) . "\n\n"
    . 'Documento: ' . textoDocumento($c) . "\n\n"
    . "Te escribiremos para que nos envíes tu diseño y apruebes la prueba digital antes de producir.\n"
    . "Si tienes dudas, responde este correo o escríbenos por WhatsApp al +56 9 6776 0841.\n\n"
    . "CONDICIONES DE TU COMPRA (versión 1.0)\n"
    . "- Sin derecho a retracto: el trabajo se fabrica según tus especificaciones (Ley 19.496, art. 3 bis letra b).\n"
    . "- Garantía legal de 6 meses: si la falla es nuestra, eliges rehacerlo, cambiarlo o la devolución del dinero en 15 días.\n"
    . "- Producción: 5 días hábiles desde que apruebas la prueba digital; después, la entrega.\n"
    . "Términos completos: https://bacano.cl/politicas.html\n\n"
    . "Bacano SpA · RUT 77.257.839-3 · Puerto Montt, Chile · bacano.cl\n";

  /* si no salió, se vuelve a intentar en la próxima consulta del pago */
  $ok = enviarCorreo($c['email'], "Tu pedido $numero en Bacano", $aCliente);

  $p['pago'] = ['id' => $idPago, 'estado' => 'approved', 'metodo' => $metodo, 'fecha' => date('c')];
  $p['avisado'] = $ok;
  ftruncate($h, 0);
  rewind($h);
  fwrite($h, json_encode($p, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
  fflush($h);
  flock($h, LOCK_UN);
  fclose($h);
}
