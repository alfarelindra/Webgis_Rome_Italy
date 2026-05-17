/**
 * Bangun dataset gambar per nama tempat (OSM) → public/places/named/ + src/data/placeImageIndex.json
 * Jalankan: node scripts/build-place-image-dataset.mjs [--limit 150] [--resume]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const GEO_PATH = [
  path.resolve(ROOT, "../../attached_assets/rome_filtered.geojson"),
  path.resolve(ROOT, "../../../attached_assets/rome_filtered.geojson"),
].find((p) => fs.existsSync(p));
if (!GEO_PATH) throw new Error("rome_filtered.geojson not found");
const NAMED_DIR = path.join(ROOT, "public/places/named");
const INDEX_PATH = path.join(ROOT, "src/data/placeImageIndex.json");
const UA = "WebGIS-Rome/1.0 (educational; Roma map dataset)";

const args = process.argv.slice(2);
const LIMIT = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 120);
const RESUME = args.includes("--resume");

/** Nama OSM (key dinormalisasi) → judul file di Wikimedia Commons */
const CURATED_COMMONS = {
  colosseum: "Colosseo 2020.jpg",
  "fontana di trevi": "Trevi Fountain, Rome, Italy 2 - May 2007.jpg",
  pantheon: "Pantheon Rom 1 cropped.jpg",
  "musei vaticani": "Sistine Chapel ceiling.jpg",
  "vatican museums": "St. Peter's Square, Vatican City - April 2007.jpg",
  "st. peter's basilica": "036CupolaSPietro.jpg",
  "piazza navona": "Piazza Navona 1.jpg",
  "forum romanum": "Roman Forum.JPG",
  "roman forum": "Roman Forum.JPG",
  "castel sant'angelo": "RomaCastelSantAngelo.jpg",
  "castel sant’angelo": "RomaCastelSantAngelo.jpg",
  "galleria borghese": "Apollo and Daphne (Bernini) (cropped).jpg",
  "musei capitolini": "Piazza del Campidoglio (Rome).jpg",
  "capitoline museums": "Marcus Aurelius Capitoline Hill September 2015-1.jpg",
  "monumento a vittorio emanuele ii": "Piazza Venezia - Il Vittoriano.jpg",
  "altare della patria": "Piazza Venezia - Il Vittoriano.jpg",
  "spanish steps": "Spanish Steps, Rome (Ank Kumar) 02.jpg",
  "scalinata di trinità dei monti": "Spanish Steps, Rome (Ank Kumar) 02.jpg",
  "scalinata di trinita dei monti": "Spanish Steps, Rome (Ank Kumar) 02.jpg",
  "piazza di spagna": "Spanish Steps, Rome (Ank Kumar) 02.jpg",
  "circus maximus": "Circus Maximus Rome.jpg",
  "circo massimo": "Circus Maximus Rome.jpg",
  "palatine hill": "Roman Forum.JPG",
  "colle palatino": "Roman Forum.JPG",
  "trajan's column": "Trajan's Column closeup.jpg",
  "column of trajan": "Trajan's Column closeup.jpg",
  "piazza del popolo": "Piazza del Popolo, Rome.jpg",
  "campo de' fiori": "Campo de' Fiori market, Rome.jpg",
  "villa borghese": "Villa Borghese Lake.jpg",
  "villa d'este": "Villa d'Este Tivoli.jpg",
  "galleria nazionale d'arte antica": "Capitoline Museums Rome.jpg",
  "galleria spada": "Galleria Spada.jpg",
  "museo nazionale romano": "Roman Forum.JPG",
  "explora": "Explora children's museum Rome.jpg",
  "museo ebraico di roma": "Great Synagogue of Rome.jpg",
  "chiostro del bramante": "Chiostro del Bramante.jpg",
  "catacombe di san callisto": "Catacombs of San Callisto.jpg",
  "catacombe di san sebastiano": "Catacombs of San Sebastiano.jpg",
  "bocca della verità": "Bocca della Verita.jpg",
  "mouth of truth": "Bocca della Verita.jpg",
  "piazza venezia": "Piazza Venezia - Il Vittoriano.jpg",
  "terme di caracalla": "Baths of Caracalla.jpg",
  "baths of caracalla": "Baths of Caracalla.jpg",
  "ara pacis": "Ara Pacis Museum.jpg",
  "museo dell'ara pacis": "Ara Pacis Museum.jpg",
  "palazzo massimo": "Palazzo Massimo alle Terme.jpg",
  "trastevere": "Trastevere, Rome, Italy.jpg",
  "ponte sisto": "Ponte Sisto Rome.jpg",
  "isola tiberina": "Isola Tiberina Rome.jpg",
  "santa maria in trastevere": "Santa Maria in Trastevere - Rome.jpg",
  "basilica di san pietro": "St. Peter's Square, Vatican City - April 2007.jpg",
  "roma termini": "Roma Termini railway station.jpg",
  "stazione termini": "Roma Termini railway station.jpg",
  "termini": "Roma Termini railway station.jpg",
};

const PRIORITY_TYPES = new Set([
  "museum", "attraction", "viewpoint", "gallery", "artwork", "theme_park",
  "hotel", "hostel", "guest_house", "apartment",
  "restaurant", "cafe", "fast_food", "bar", "pub", "ice_cream", "marketplace",
  "place_of_worship", "theatre", "cinema",
  "station", "subway_entrance",
]);

function normKey(name) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['`´]/g, "'")
    .replace(/\s+/g, " ");
}

function slugify(name) {
  return normKey(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function commonsThumb(fileTitle, width = 960) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: String(width),
    titles: `File:${fileTitle}`,
  });
  for (let i = 0; i < 4; i++) {
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { "User-Agent": UA },
    });
    const text = await res.text();
    if (text.includes("too many requests")) {
      await sleep(10000 + i * 5000);
      continue;
    }
    const data = JSON.parse(text);
    const page = Object.values(data.query?.pages ?? {})[0];
    if (page?.missing || !page?.imageinfo?.[0]) return null;
    const url = page.imageinfo[0].thumburl || page.imageinfo[0].url;
    return url ? url.split("?")[0] : null;
  }
  return null;
}

async function commonsSearch(placeName) {
  const q = `${placeName} Rome Italy`.replace(/[^\w\sàèéìòù']/gi, " ");
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    list: "search",
    srnamespace: "6",
    srlimit: "3",
    srsearch: q,
  });
  for (let i = 0; i < 3; i++) {
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { "User-Agent": UA },
    });
    const text = await res.text();
    if (text.includes("too many requests")) {
      await sleep(12000);
      continue;
    }
    const data = JSON.parse(text);
    const hit = data.query?.search?.[0]?.title?.replace(/^File:/, "");
    return hit ?? null;
  }
  return null;
}

async function downloadUrl(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 6000) return false;
  fs.writeFileSync(dest, buf);
  return true;
}

function loadGeoNames() {
  const geo = JSON.parse(fs.readFileSync(GEO_PATH, "utf8"));
  const seen = new Map();
  for (const f of geo.features) {
    if (f.geometry?.type !== "Point" || !f.properties?.name) continue;
    const name = String(f.properties.name).trim();
    const key = normKey(name);
    if (!key || seen.has(key)) continue;
    const type =
      f.properties.tourism ||
      f.properties.amenity ||
      f.properties.railway ||
      f.properties.historic ||
      "";
    let score = 0;
    if (PRIORITY_TYPES.has(type)) score += 8;
    if (f.properties.tourism === "attraction") score += 22;
    if (f.properties.tourism === "museum") score += 14;
    if (f.properties.tourism === "hotel" || f.properties.tourism === "hostel") score += 18;
    if (f.properties.amenity === "restaurant") score += 20;
    if (f.properties.amenity === "cafe" || f.properties.amenity === "fast_food") score += 19;
    if (f.properties.amenity === "bar" || f.properties.amenity === "pub") score += 16;
    if (f.properties.amenity === "ice_cream") score += 15;
    if (CURATED_COMMONS[key]) score += 100;
    if (name.length < 40) score += 3;
    if (name.length > 55) score -= 5;
    seen.set(key, { name, key, score, type });
  }
  return [...seen.values()].sort((a, b) => b.score - a.score);
}

async function resolveImage(name, key) {
  const curated = CURATED_COMMONS[key];
  if (curated) return { commons: curated, via: "curated" };

  const searched = await commonsSearch(name);
  if (searched) return { commons: searched, via: "search" };
  return null;
}

async function main() {
  fs.mkdirSync(NAMED_DIR, { recursive: true });
  let index = {};
  if (RESUME && fs.existsSync(INDEX_PATH)) {
    index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
    console.log(`Resume: ${Object.keys(index).length} entries`);
  }

  const queue = loadGeoNames();
  let added = 0;
  let skipped = 0;

  for (const item of queue) {
    if (added >= LIMIT) break;
    if (index[item.key]?.file && fs.existsSync(path.join(NAMED_DIR, index[item.key].file))) {
      skipped++;
      continue;
    }

    const file = `${slugify(item.name)}.jpg`;
    const dest = path.join(NAMED_DIR, file);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 6000) {
      index[item.key] = { file, caption: item.name, via: "cached" };
      added++;
      continue;
    }

    const resolved = await resolveImage(item.name, item.key);
    await sleep(2500);
    if (!resolved) {
      console.log(`  skip (no image): ${item.name}`);
      continue;
    }

    const url = await commonsThumb(resolved.commons);
    await sleep(400);
    if (!url) {
      console.log(`  skip (no thumb): ${item.name} → ${resolved.commons}`);
      continue;
    }

    const ok = await downloadUrl(url, dest);
    if (!ok) {
      console.log(`  fail download: ${item.name}`);
      continue;
    }

    index[item.key] = { file, caption: item.name, via: resolved.via };
    added++;
    console.log(`+ [${added}] ${item.name} (${resolved.via})`);

    if (added % 10 === 0) {
      fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
    }
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`\nDone. Index: ${Object.keys(index).length} places (${added} new, ${skipped} cached).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
