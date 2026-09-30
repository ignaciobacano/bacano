<?php
/* ============================================================
   BACANO.CL — Credenciales de Mercado Pago (PLANTILLA)
   Copiá este archivo como  mercadopago-config.php  y pegá tus
   credenciales. Se sacan en:
   mercadopago.cl/developers/panel → Tus integraciones → Credenciales

   mercadopago-config.php NUNCA se sube a GitHub (está en .gitignore)
   y el .htaccess lo bloquea desde internet.
   ============================================================ */
return [
  'access_token' => 'PEGAR_AQUI_EL_ACCESS_TOKEN',   // privado: solo vive en el servidor
  'public_key'   => 'PEGAR_AQUI_LA_PUBLIC_KEY',     // pública: hoy no se usa (Checkout Pro no la necesita)
  'prueba'       => true,                           // true con credenciales de prueba; false con las de producción
  'sitio'        => '',                             // dirección pública, ej. https://bacano.cl — vacío = se detecta sola
];
