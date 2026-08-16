# ============================================================
#  Bacano.cl — respaldo completo del proyecto
#  Genera bacano-proyecto-completo.zip con TODO: el sitio, el panel,
#  los archivos PHP, los scripts y la documentación.
#  (El historial de git y las carpetas temporales quedan afuera.)
#
#  Uso:  powershell -ExecutionPolicy Bypass -File respaldo-zip.ps1
# ============================================================

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$raiz = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$zip  = Join-Path $raiz "bacano-proyecto-completo.zip"

$archivos = Get-ChildItem -Path $raiz -Recurse -File -Force | Where-Object {
  $r = $_.FullName.Substring($raiz.Length).TrimStart([char]92)
  $r -notmatch '^\.git\b' -and $r -notmatch '^\.claude\b' -and
  $r -notmatch '^_publicar' -and $r -notlike '*.zip' -and $r -ne 'config.php'
}

$fs = [System.IO.File]::Open($zip, [System.IO.FileMode]::Create)
$ar = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($f in $archivos) {
    $rel = $f.FullName.Substring($raiz.Length).TrimStart([char]92).Replace([char]92, '/')
    $e   = $ar.CreateEntry($rel, [System.IO.Compression.CompressionLevel]::Optimal)
    $s   = $e.Open()
    $b   = [System.IO.File]::ReadAllBytes($f.FullName)
    $s.Write($b, 0, $b.Length)
    $s.Close()
  }
} finally { $ar.Dispose(); $fs.Dispose() }

$peso = "{0:N2} MB" -f ((Get-Item $zip).Length / 1MB)
Write-Host ""
Write-Host "  Respaldo listo: $zip" -ForegroundColor Green
Write-Host "  $($archivos.Count) archivos · $peso"
Write-Host ""
