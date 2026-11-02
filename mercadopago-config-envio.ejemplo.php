<?php
/* ============================================================
   BACANO.CL — Quién puede enviar credenciales de Mercado Pago (PLANTILLA)
   Copiá este archivo como  mercadopago-config-envio.php  en el hosting
   (cPanel → Administrador de archivos, junto a mercadopago.php).

   · clave: la misma BACANO_CL_PAGOS_CLAVE del servidor de Bacano Core.
     Al menos 32 caracteres. DISTINTA de la del catálogo.
   · cuentas: el número de la cuenta de Mercado Pago que se acepta en cada
     modo. Lo muestra Bacano Core → Pagos en línea, al guardar y verificar
     las credenciales («Cuenta … (número)»). Cualquier otra cuenta se rechaza.

   mercadopago-config-envio.php NUNCA se sube a GitHub (está en .gitignore)
   y el .htaccess lo bloquea desde internet.
   ============================================================ */
return [
  'clave'   => 'PEGAR_AQUI_LA_CLAVE_DE_ENVIO',
  'cuentas' => [
    'prueba'     => '',   // el número del usuario de prueba vendedor
    'produccion' => '',   // el número de la cuenta real de Bacano
  ],
];
