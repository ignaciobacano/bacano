<?php
/* ============================================================
   BACANO.CL — Configuración del catálogo desde Bacano Core (OPCIONAL)
   Sin este archivo, catalogo-sync.php lee https://bacanocore.cl/api/catalogo-publico
   y solo se puede ejecutar desde la tarea programada.

   Copialo como  catalogo-config.php  solo si necesitás:
   - 'clave': actualizar al momento desde el navegador, abriendo
       https://bacano.cl/catalogo-sync.php?clave=TU_CLAVE
     (mínimo 16 caracteres; inventá una larga y no la compartas)
   - 'url': leer el catálogo desde otra dirección (para pruebas)
   ============================================================ */
return [
  'clave' => '',
  // 'url' => 'https://bacanocore.cl/api/catalogo-publico',
];
