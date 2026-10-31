param()
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root 'wp-theme\lucymary'
$versionLine = Select-String -LiteralPath (Join-Path $source 'style.css') -Pattern '^Version:\s*(\d+\.\d+\.\d+)\s*$' | Select-Object -First 1
if (-not $versionLine) { throw 'Versão do tema ausente em style.css' }
$version = $versionLine.Matches[0].Groups[1].Value
$target = Join-Path $root "wp-theme\lucymary-$version.zip"
foreach ($required in @('style.css', 'functions.php', 'index.php', 'header.php', 'footer.php', 'assets\css\theme.css', 'assets\js\theme.js')) {
    if (-not (Test-Path -LiteralPath (Join-Path $source $required))) { throw "Arquivo obrigatório ausente: $required" }
}
if (Test-Path -LiteralPath $target) { Remove-Item -LiteralPath $target }
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$archive = [System.IO.Compression.ZipFile]::Open($target, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem -LiteralPath $source -Recurse -File | ForEach-Object {
        $relative = $_.FullName.Substring($source.Length).TrimStart([char[]]@('\', '/')).Replace('\', '/')
        $entryName = 'lucymary/' + $relative
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally {
    $archive.Dispose()
}
Write-Output $target
