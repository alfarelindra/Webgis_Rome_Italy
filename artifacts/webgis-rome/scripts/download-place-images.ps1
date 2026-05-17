# Gambar kategori tempat (Roma) — Wikimedia Commons API
$ErrorActionPreference = "Continue"
$base = Join-Path $PSScriptRoot "..\public\places"
New-Item -ItemType Directory -Force -Path $base | Out-Null

$map = [ordered]@{
  "fallback.jpg" = "Rome skyline from Gianicolo hill.jpg"
  "category-tourism.jpg" = "Colosseo 2020.jpg"
  "category-amenity.jpg" = "Trastevere, Rome, Italy.jpg"
  "category-railway.jpg" = "Roma Termini railway station.jpg"
  "amenity-restaurant.jpg" = "Trastevere - Rome, Italy.jpg"
  "amenity-cafe.jpg" = "Caffe Sant'Eustachio Roma.jpg"
  "amenity-fast_food.jpg" = "Pizza al taglio in Rome.jpg"
  "amenity-bar.jpg" = "Bar in Rome, Italy.jpg"
  "amenity-pub.jpg" = "Pub in Rome.jpg"
  "amenity-ice_cream.jpg" = "Gelato in Rome.jpg"
  "amenity-pizza.jpg" = "Pizza al taglio in Rome.jpg"
  "amenity-bakery.jpg" = "Bakery in Rome.jpg"
  "amenity-place_of_worship.jpg" = "Santa Maria in Trastevere - Rome.jpg"
  "amenity-pharmacy.jpg" = "Farmacia in Rome.jpg"
  "amenity-fountain.jpg" = "Trevi Fountain, Rome, Italy 2 - May 2007.jpg"
  "amenity-marketplace.jpg" = "Campo de' Fiori market, Rome.jpg"
  "amenity-supermarket.jpg" = "Supermarket in Rome.jpg"
  "amenity-bank.jpg" = "Bank in Rome.jpg"
  "amenity-atm.jpg" = "ATM in Rome.jpg"
  "amenity-theatre.jpg" = "Teatro dell'Opera di Roma.jpg"
  "amenity-cinema.jpg" = "Cinema in Rome.jpg"
  "amenity-nightclub.jpg" = "Night in Rome.jpg"
  "tourism-hotel.jpg" = "Hotel in Rome.jpg"
  "tourism-hostel.jpg" = "Hostel in Rome.jpg"
  "tourism-museum.jpg" = "Capitoline Museums Rome.jpg"
  "tourism-gallery.jpg" = "Galleria Borghese.jpg"
  "tourism-attraction.jpg" = "Colosseo 2020.jpg"
  "tourism-viewpoint.jpg" = "Rome - View from the top of Vittoriano.jpg"
  "tourism-artwork.jpg" = "Fontana dei Quattro Fiumi (Rome).jpg"
  "tourism-information.jpg" = "Piazza Navona 1.jpg"
  "railway-station.jpg" = "Roma Termini railway station.jpg"
  "railway-subway.jpg" = "Rome Metro station.jpg"
  "railway-tram.jpg" = "Tram in Rome.jpg"
  "railway-bus.jpg" = "ATAC bus in Rome.jpg"
  "historic-monument.jpg" = "Altare della Patria September 2015-1.jpg"
  "historic-ruins.jpg" = "Roman Forum.JPG"
  "leisure-park.jpg" = "Villa Borghese Lake.jpg"
  "shop-souvenirs.jpg" = "Souvenir shop in Rome.jpg"
}

function Get-ThumbUrl {
  param([string]$FileName)
  for ($try = 0; $try -lt 4; $try++) {
    $json = curl.exe -sG "https://commons.wikimedia.org/w/api.php" `
      --data-urlencode "action=query" `
      --data-urlencode "format=json" `
      --data-urlencode "prop=imageinfo" `
      --data-urlencode "iiprop=url" `
      --data-urlencode "iiurlwidth=960" `
      --data-urlencode "titles=File:$FileName" `
      -A "WebGIS-Rome/1.0 (educational map)"
    if ($json -match "too many requests") {
      Start-Sleep -Seconds (10 + $try * 5)
      continue
    }
    $page = ($json | ConvertFrom-Json).query.pages.PSObject.Properties | Select-Object -First 1 -ExpandProperty Value
    if ($page.missing -or -not $page.imageinfo) { return $null }
    $url = $page.imageinfo[0].thumburl
    if (-not $url) { $url = $page.imageinfo[0].url }
    if ($url) { return ($url -split '\?')[0] }
  }
  return $null
}

$ok = 0; $fail = @()
foreach ($local in $map.Keys) {
  $out = Join-Path $base $local
  if ((Test-Path $out) -and (Get-Item $out).Length -gt 5000) { $ok++; continue }
  $url = Get-ThumbUrl -FileName $map[$local]
  Start-Sleep -Seconds 2
  if (-not $url) { $fail += "$local ($($map[$local]))"; continue }
  curl.exe -sL -A "WebGIS-Rome/1.0" -o $out $url
  Start-Sleep -Milliseconds 300
  if ((Test-Path $out) -and (Get-Item $out).Length -gt 5000) { $ok++ } else { $fail += $local; Remove-Item $out -EA SilentlyContinue }
}
Write-Host "OK $ok / $($map.Count)"
if ($fail.Count) { Write-Host "Failed: $($fail -join '; ')" }
