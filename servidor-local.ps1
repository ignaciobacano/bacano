# ============================================================
#  Bacano.cl — servidor local para ver el sitio
#  Uso:  clic derecho sobre este archivo -> "Ejecutar con PowerShell"
#        o en una terminal:  powershell -ExecutionPolicy Bypass -File servidor-local.ps1
#  Después abrí:  http://localhost:8080
#  Cortalo con Ctrl+C.
# ============================================================

$puerto = 8080
$raiz   = $PSScriptRoot
if (-not $raiz) { $raiz = (Get-Location).Path }

$mime = @{
  ".html"="text/html; charset=utf-8"; ".htm"="text/html; charset=utf-8"
  ".css"="text/css; charset=utf-8";   ".js"="application/javascript; charset=utf-8"
  ".json"="application/json; charset=utf-8"; ".md"="text/markdown; charset=utf-8"
  ".svg"="image/svg+xml"; ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"
  ".gif"="image/gif"; ".webp"="image/webp"; ".avif"="image/avif"; ".ico"="image/x-icon"
  ".woff"="font/woff"; ".woff2"="font/woff2"; ".ttf"="font/ttf"
  ".pdf"="application/pdf"; ".txt"="text/plain; charset=utf-8"
}

try {
  $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $puerto)
  $listener.Start()
} catch {
  Write-Host "No se pudo abrir el puerto $puerto. ¿Ya hay otro servidor corriendo?" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "  Bacano.cl corriendo en  http://localhost:$puerto" -ForegroundColor Green
Write-Host "  Carpeta: $raiz"
Write-Host "  Panel:   http://localhost:$puerto/admin.html"
Write-Host "  Ctrl+C para detener."
Write-Host ""

function Send-Respuesta {
  param($stream, [int]$codigo, [string]$texto, [byte[]]$cuerpo, [string]$tipo)
  $cab  = "HTTP/1.1 $codigo $texto`r`n"
  $cab += "Content-Type: $tipo`r`n"
  $cab += "Content-Length: $($cuerpo.Length)`r`n"
  $cab += "Cache-Control: no-store`r`n"
  $cab += "Connection: close`r`n`r`n"
  $bytes = [System.Text.Encoding]::ASCII.GetBytes($cab)
  $stream.Write($bytes, 0, $bytes.Length)
  if ($cuerpo.Length -gt 0) { $stream.Write($cuerpo, 0, $cuerpo.Length) }
  $stream.Flush()
}

while ($true) {
  $cliente = $listener.AcceptTcpClient()
  try {
    $stream = $cliente.GetStream()
    $stream.ReadTimeout = 4000
    $lector = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII)

    $peticion = $lector.ReadLine()
    if ([string]::IsNullOrWhiteSpace($peticion)) { $cliente.Close(); continue }
    while ($true) { $l = $lector.ReadLine(); if ($null -eq $l -or $l -eq "") { break } }

    $partes = $peticion -split ' '
    $metodo = $partes[0]
    $url    = if ($partes.Length -gt 1) { $partes[1] } else { "/" }
    $ruta   = ($url -split '\?')[0]
    $ruta   = [System.Uri]::UnescapeDataString($ruta)
    if ($ruta -eq "/" -or $ruta -eq "") { $ruta = "/index.html" }

    $archivo = Join-Path $raiz ($ruta.TrimStart('/').Replace('/', '\'))
    $completo = ""
    try { $completo = [System.IO.Path]::GetFullPath($archivo) } catch { $completo = "" }

    if ($metodo -ne "GET" -and $metodo -ne "HEAD") {
      Send-Respuesta $stream 405 "Method Not Allowed" ([byte[]]@()) "text/plain"
    }
    elseif ($completo -and $completo.StartsWith([System.IO.Path]::GetFullPath($raiz)) -and (Test-Path -LiteralPath $completo -PathType Leaf)) {
      $ext  = [System.IO.Path]::GetExtension($completo).ToLower()
      $tipo = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
      $datos = [System.IO.File]::ReadAllBytes($completo)
      Send-Respuesta $stream 200 "OK" $datos $tipo
      Write-Host ("  200  " + $ruta) -ForegroundColor DarkGray
    }
    else {
      $html = "<!doctype html><meta charset='utf-8'><title>404</title>" +
              "<body style='font:16px system-ui;padding:60px;background:#0c0c0e;color:#fff'>" +
              "<h1 style='font-size:2rem'>404</h1><p>No existe <code>$ruta</code>.</p>" +
              "<p><a style='color:#c62128' href='/'>Volver al inicio</a></p>"
      Send-Respuesta $stream 404 "Not Found" ([System.Text.Encoding]::UTF8.GetBytes($html)) "text/html; charset=utf-8"
      Write-Host ("  404  " + $ruta) -ForegroundColor DarkYellow
    }
  } catch {
    # conexión cortada por el navegador: se ignora
  } finally {
    $cliente.Close()
  }
}
