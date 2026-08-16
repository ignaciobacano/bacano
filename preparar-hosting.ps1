# ============================================================
#  Bacano.cl — arma el paquete para subir al hosting
#  Uso:  clic derecho -> "Ejecutar con PowerShell"
#        o:  powershell -ExecutionPolicy Bypass -File preparar-hosting.ps1
#
#  Opciones:
#     -SinPanel     no incluye admin.html (panel solo desde tu PC)
#
#  Deja una carpeta "_publicar" y un archivo "bacano-sitio.zip"
#  listos para subir por FTP o por el Administrador de archivos.
# ============================================================

param([switch]$SinPanel)

$raiz    = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$destino = Join-Path $raiz "_publicar"
$zip     = Join-Path $raiz "bacano-sitio.zip"

# Lo que NO se sube: herramientas de desarrollo y control de versiones
$excluir = @(
  ".git", ".claude", "_publicar", "node_modules",
  "*.ps1", "*.md", ".gitignore", ".gitattributes",
  "*.zip", "bacano-respaldo-*.json", "_hoja.html",
  "Thumbs.db", "desktop.ini"
)

function Excluido($ruta) {
  $rel = $ruta.Substring($raiz.Length).TrimStart('\')
  foreach ($p in $excluir) {
    if ($rel -like $p -or $rel -like "$p\*" -or (Split-Path $rel -Leaf) -like $p) { return $true }
  }
  if ($SinPanel -and (Split-Path $rel -Leaf) -eq "admin.html") { return $true }
  return $false
}

Write-Host ""
Write-Host "  Preparando el paquete..." -ForegroundColor Cyan

if (Test-Path $destino) { Remove-Item $destino -Recurse -Force }
New-Item -ItemType Directory -Path $destino | Out-Null

$archivos = Get-ChildItem -Path $raiz -Recurse -File -Force | Where-Object { -not (Excluido $_.FullName) }

foreach ($a in $archivos) {
  $rel     = $a.FullName.Substring($raiz.Length).TrimStart('\')
  $salida  = Join-Path $destino $rel
  $carpeta = Split-Path $salida -Parent
  if (-not (Test-Path $carpeta)) { New-Item -ItemType Directory -Path $carpeta -Force | Out-Null }
  Copy-Item $a.FullName $salida
  Write-Host ("    + " + $rel) -ForegroundColor DarkGray
}

# El zip se arma a mano: Compress-Archive de PowerShell 5.1 guarda las rutas
# con "\", y al extraerlo en un hosting Linux los archivos salen sueltos
# con nombres tipo "assets\css\style.css". Con "/" se extrae bien en todos lados.
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path $zip) { Remove-Item $zip -Force }
$base = (Resolve-Path $destino).Path
$archivo = [System.IO.Compression.ZipFile]::Open($zip, 'Create')
try {
  Get-ChildItem $destino -Recurse -File -Force | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length).TrimStart('\').Replace('\', '/')
    $entrada = $archivo.CreateEntry($rel, [System.IO.Compression.CompressionLevel]::Optimal)
    $flujo = $entrada.Open()
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    $flujo.Write($bytes, 0, $bytes.Length)
    $flujo.Close()
  }
} finally { $archivo.Dispose() }

$peso = "{0:N2} MB" -f ((Get-ChildItem $destino -Recurse -File | Measure-Object Length -Sum).Sum / 1MB)
$pesoZip = "{0:N2} MB" -f ((Get-Item $zip).Length / 1MB)

Write-Host ""
Write-Host "  Listo." -ForegroundColor Green
Write-Host "  Carpeta : $destino   ($($archivos.Count) archivos, $peso)"
Write-Host "  Zip     : $zip   ($pesoZip)"
if ($SinPanel) { Write-Host "  Sin admin.html (lo usás solo desde tu PC)." -ForegroundColor Yellow }
Write-Host ""
Write-Host "  Subilo al hosting dentro de public_html (o la carpeta del dominio)."
Write-Host "  Importante: el .htaccess es un archivo oculto, activá 'mostrar ocultos' en el FTP."
Write-Host ""
