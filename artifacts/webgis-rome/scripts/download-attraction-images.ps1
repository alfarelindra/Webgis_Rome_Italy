# Gambar akurat dari Wikimedia Commons (satu permintaan API per file + jeda)
$ErrorActionPreference = "Continue"
$base = Join-Path $PSScriptRoot "..\public\attractions"
New-Item -ItemType Directory -Force -Path $base | Out-Null

$map = [ordered]@{
  "colosseum-1.jpg"   = "Colosseo 2020.jpg"
  "colosseum-2.jpg"   = "Colosseum in Rome, Italy - April 2007.jpg"
  "colosseum-3.jpg"   = "Colosseum (Rome).jpg"
  "trevi-1.jpg"       = "Trevi Fountain, Rome, Italy 2 - May 2007.jpg"
  "trevi-2.jpg"       = "Fontana di Trevi by TC.jpg"
  "trevi-3.jpg"       = "Trevi Fountain HD.jpg"
  "pantheon-1.jpg"    = "Pantheon Rom 1 cropped.jpg"
  "pantheon-2.jpg"    = "Pantheon in Rome.jpg"
  "pantheon-3.jpg"    = "The Pantheon in Rome, Italy.jpg"
  "vatican-1.jpg"     = "Vatican City and St. Peter Square evening twilight aerial view.jpg"
  "vatican-2.jpg"     = "S. Pietro May 2022-15.jpg"
  "vatican-3.jpg"     = "Sistine Chapel ceiling.jpg"
  "spagna-1.jpg"      = "Spanish Steps, Rome (Ank Kumar) 02.jpg"
  "spagna-2.jpg"      = "Barcaccia - Boat Fountain in Rome.jpg"
  "spagna-3.jpg"      = "Rome Trinita dei Monti 2020 P13 Spanish Steps at night with bride.jpg"
  "forum-1.jpg"       = "Roman Forum.JPG"
  "forum-2.jpg"       = "Forum Romanum (14).jpg"
  "forum-3.jpg"       = "Arch of Titus (Rome).jpg"
  "castel-1.jpg"      = "RomaCastelSantAngelo.jpg"
  "castel-2.jpg"      = "Castel Sant' Angelo at night, Rome - panoramio.jpg"
  "castel-3.jpg"      = "Statue on Ponte Sant Angelo - panoramio.jpg"
  "borghese-1.jpg"    = "Villa Borghese Lake.jpg"
  "borghese-2.jpg"    = "Apollo and Daphne (Bernini) (cropped).jpg"
  "borghese-3.jpg"    = "Roma, galleria borghese, sala del sole, col david di bernini 02.jpg"
  "navona-1.jpg"      = "Piazza Navona Gange fontana dei Fiumi Roma.jpg"
  "navona-2.jpg"      = "Piazza Navona 1.jpg"
  "navona-3.jpg"      = "Rome (Italy), Piazza Navona -- 2013 -- 4418.jpg"
  "capitoline-1.jpg"  = "Piazza del Campidoglio (Rome).jpg"
  "capitoline-2.jpg"  = "Marcus Aurelius Capitoline Hill September 2015-1.jpg"
  "capitoline-3.jpg"  = "Lupa Capitolina, Rome.jpg"
  "vittoriano-1.jpg"  = "Piazza Venezia - Il Vittoriano.jpg"
  "vittoriano-2.jpg"  = "Piazza Venezia - Il Vittoriano (cropped).jpg"
  "vittoriano-3.jpg"  = "Vittoriano, detail, Rome, Italy.jpg"
}

function Get-ThumbUrl {
  param([string]$FileName)
  for ($try = 0; $try -lt 4; $try++) {
    $json = curl.exe -sG "https://commons.wikimedia.org/w/api.php" `
      --data-urlencode "action=query" `
      --data-urlencode "format=json" `
      --data-urlencode "prop=imageinfo" `
      --data-urlencode "iiprop=url" `
      --data-urlencode "iiurlwidth=1280" `
      --data-urlencode "titles=File:$FileName" `
      -A "WebGIS-Rome/1.0 (educational; local student project)"
    if ($json -match "too many requests") {
      Start-Sleep -Seconds (8 + $try * 5)
      continue
    }
    $data = $json | ConvertFrom-Json
    $page = $data.query.pages.PSObject.Properties | Select-Object -First 1 -ExpandProperty Value
    if ($page.missing -or -not $page.imageinfo) { return $null }
    $url = $page.imageinfo[0].thumburl
    if (-not $url) { $url = $page.imageinfo[0].url }
    if ($url) { return ($url -split '\?')[0] }
    return $null
  }
  return $null
}

$ok = 0
$fail = @()
foreach ($local in $map.Keys) {
  $commonsName = $map[$local]
  $out = Join-Path $base $local
  if ((Test-Path $out) -and (Get-Item $out).Length -gt 8000) {
    $ok++
    continue
  }
  $url = Get-ThumbUrl -FileName $commonsName
  Start-Sleep -Seconds 2
  if (-not $url) {
    $fail += "$local ($commonsName)"
    continue
  }
  curl.exe -sL -A "WebGIS-Rome/1.0" -o $out $url
  Start-Sleep -Milliseconds 400
  if ((Test-Path $out) -and (Get-Item $out).Length -gt 8000) {
    $ok++
    Write-Host "OK $local"
  } else {
    $fail += $local
    Remove-Item $out -ErrorAction SilentlyContinue
    Write-Host "FAIL $local"
  }
}

$fallback = Join-Path $base "colosseum-1.jpg"
if (Test-Path $fallback) {
  Copy-Item $fallback (Join-Path $base "fallback.jpg") -Force
}
Write-Host "`nDownloaded: $ok / $($map.Count)"
if ($fail.Count) { Write-Host "Failed: $($fail -join '; ')" }
