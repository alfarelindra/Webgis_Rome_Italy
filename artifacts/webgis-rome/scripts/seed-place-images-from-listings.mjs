/**
 * Salin foto hotel/destinasi ke dataset named + isi index (tanpa API).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const NAMED = path.join(ROOT, "public/places/named");
const INDEX = path.join(ROOT, "src/data/placeImageIndex.json");

function normKey(name) {
  return name.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/['`´]/g, "'").replace(/\s+/g, " ");
}
function slugify(name) {
  return normKey(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
}

const SEEDS = [
  { osmName: "Colosseum", file: "attractions/colosseum-1.jpg" },
  { osmName: "Fontana di Trevi", file: "attractions/trevi-1.jpg" },
  { osmName: "Pantheon", file: "attractions/pantheon-1.jpg" },
  { osmName: "Musei Vaticani", file: "attractions/vatican-1.jpg" },
  { osmName: "Scalinata di Trinità dei Monti", file: "attractions/spagna-1.jpg" },
  { osmName: "Forum Romanum", file: "attractions/forum-1.jpg" },
  { osmName: "Museo Nazionale di Castel Sant'Angelo", file: "attractions/castel-1.jpg" },
  { osmName: "Galleria Borghese", file: "attractions/borghese-2.jpg" },
  { osmName: "Piazza Navona", file: "attractions/navona-1.jpg" },
  { osmName: "Musei Capitolini", file: "attractions/capitoline-1.jpg" },
  { osmName: "Monumento a Vittorio Emanuele II", file: "attractions/vittoriano-1.jpg" },
  { osmName: "Hotel Piram", file: "hotels/hotel-piram-1.jpg" },
  { osmName: "Rome Art Hotel", file: "hotels/rome-art-1.jpg" },
  { osmName: "Hotel Antico Palazzo Rospigliosi", file: "hotels/antico-palazzo-1.jpg" },
  { osmName: "Mood Suites Tritone", file: "hotels/mood-suites-1.jpg" },
  { osmName: "Hotel Fenix", file: "hotels/hotel-fenix-1.jpg" },
  { osmName: "Hotel cambridge", file: "hotels/hotel-cambridge-1.jpg" },
  { osmName: "Hotel La Pergola", file: "hotels/hotel-la-pergola-1.jpg" },
  { osmName: "Trastevere Loft", file: "hotels/trastevere-1.jpg" },
];

fs.mkdirSync(NAMED, { recursive: true });
let index = fs.existsSync(INDEX) ? JSON.parse(fs.readFileSync(INDEX, "utf8")) : {};

for (const s of SEEDS) {
  const src = path.join(ROOT, "public", s.file);
  if (!fs.existsSync(src)) continue;
  const outFile = `${slugify(s.osmName)}.jpg`;
  const dest = path.join(NAMED, outFile);
  fs.copyFileSync(src, dest);
  index[normKey(s.osmName)] = { file: outFile, caption: s.osmName, via: "listing" };
  console.log("seed", s.osmName);
}

fs.writeFileSync(INDEX, JSON.stringify(index, null, 2));
console.log("Total index:", Object.keys(index).length);
