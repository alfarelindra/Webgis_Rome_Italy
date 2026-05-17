export type AttractionCategory = "attraction" | "museum" | "viewpoint" | "gallery" | "theme_park" | "artwork";

export interface AttractionImage {
  url: string;
  caption: string;
}

export interface AttractionListing {
  id: string;
  osmName: string;
  title: string;
  category: AttractionCategory;
  lat: number;
  lng: number;
  neighborhood: string;
  address: string;
  rating: number;
  reviewCount: number;
  images: AttractionImage[];
  description: string;
  longDescription: string;
  highlights: string[];
  visitTips: string[];
  openingHours: string;
  entryFee: string;
  duration: string;
  bestTime: string;
  wheelchair: string;
  website?: string;
  tags: string[];
}

export const ATTRACTION_CATEGORY_LABELS: Record<AttractionCategory, string> = {
  attraction: "Atraksi ikonik",
  museum: "Museum",
  viewpoint: "Viewpoint",
  gallery: "Galeri seni",
  theme_park: "Taman hiburan",
  artwork: "Karya seni publik",
};

export const ATTRACTION_IMAGE_FALLBACK = `${import.meta.env.BASE_URL}attractions/fallback.jpg`;

const attImg = (file: string, caption: string): AttractionImage => ({
  url: `${import.meta.env.BASE_URL}attractions/${file}`,
  caption,
});

export const ATTRACTION_LISTINGS: AttractionListing[] = [
  {
    id: "colosseum",
    osmName: "Colosseum",
    title: "Colosseum — Amfiteater Flavian",
    category: "attraction",
    lat: 41.89021,
    lng: 12.492231,
    neighborhood: "Celio · Colosseum",
    address: "Piazza del Colosseo, 1, 00184 Roma RM",
    rating: 4.96,
    reviewCount: 28400,
    images: [
      attImg("colosseum-1.jpg", "Fasad Colosseum — Amfiteater Flavian"),
      attImg("colosseum-2.jpg", "Pemandangan Colosseum dari luar"),
      attImg("colosseum-3.jpg", "Sudut fasad & lingkungan Colosseo"),
    ],
    description: "Simbol abadi Roma — amfiteater terbesar Kekaisaran Romawi.",
    longDescription:
      "Dibangun pada abad ke-1 M, Colosseum menampung hingga 50.000 penonton untuk gladiator, perburuan, dan pertunjukan publik. Hari ini menjadi situs Warisan Dunia UNESCO dan landmark paling fotogenik di Italia. Area sekitar (Via dei Fori Imperiali) ideal untuk berjalan kaki sore hari.",
    highlights: ["UNESCO World Heritage", "Audio guide multibahasa", "Akses metro Colosseo", "Kombinasi tiket Forum Romanum"],
    visitTips: [
      "Beli tiket online untuk hindari antre panjang",
      "Kunjungi pagi (08:30) atau sore menjelang tutup",
      "Kenakan sepatu nyaman — banyak jalan batu",
    ],
    openingHours: "09:00–19:00 (variasi musiman)",
    entryFee: "€18 (termasuk Forum & Palatine, 24 jam)",
    duration: "1,5–3 jam",
    bestTime: "Pagi hari kerja",
    wheelchair: "Akses terbatas di tingkat atas",
    website: "colosseo.it",
    tags: ["Sejarah", "Arsitektur", "Must-see"],
  },
  {
    id: "trevi-fountain",
    osmName: "Fontana di Trevi",
    title: "Fontana di Trevi",
    category: "attraction",
    lat: 41.900939,
    lng: 12.483313,
    neighborhood: "Trevi · Centro Storico",
    address: "Piazza di Trevi, 00187 Roma RM",
    rating: 4.88,
    reviewCount: 19200,
    images: [
      attImg("trevi-1.jpg", "Air mancur barok dengan patung Neptunus"),
      attImg("trevi-2.jpg", "Detail patung & air mengalir"),
      attImg("trevi-3.jpg", "Suasana malam hari yang ramai"),
    ],
    description: "Air mancur barok paling terkenal di dunia — lempar koin & harap kembali ke Roma.",
    longDescription:
      "Didesain Nicola Salvi dan diselesaikan 1762, Trevi menggabungkan patung mitologi, air jernih, dan fasad istana Palazzo Poli. Tradisi melempar koin dengan punggung ke air mancur diyakini membawa keberuntungan. Gratis untuk area luar; sangat ramai siang dan malam.",
    highlights: ["Gratis (area publik)", "Terindah saat malam terang", "Dekat Pantheon & Spagna"],
    visitTips: ["Datang sebelum 08:00 untuk foto tanpa keramaian", "Waspadai pickpocket saat ramai", "Jangan makan di tangga air mancur"],
    openingHours: "24 jam (area publik)",
    entryFee: "Gratis",
    duration: "20–45 menit",
    bestTime: "Malam (pencahayaan) atau pagi buta",
    wheelchair: "Akses sulit — banyak tangga",
    tags: ["Barok", "Foto", "Tradisi"],
  },
  {
    id: "pantheon",
    osmName: "Pantheon",
    title: "Pantheon — Kuil abad ke-2",
    category: "attraction",
    lat: 41.898611,
    lng: 12.476833,
    neighborhood: "Pigna · Centro Storico",
    address: "Piazza della Rotonda, 00186 Roma RM",
    rating: 4.94,
    reviewCount: 15600,
    images: [
      attImg("pantheon-1.jpg", "Kolom depan & Piazza della Rotonda"),
      attImg("pantheon-2.jpg", "Fasad kuil dengan kubah ikonik"),
      attImg("pantheon-3.jpg", "Pantheon dari piazza — arsitektur Romawi"),
    ],
    description: "Bangunan kuno terbaik yang masih berdiri — kubah sempurna dengan lubang cahaya di puncak.",
    longDescription:
      "Pantheon awalnya kuil untuk semua dewa Romawi, kemudian menjadi gereja Santa Maria ad Martyres. Oculus diameter 8,5 meter menjadi satu-satunya sumber cahaya alami. Makam Raphael dan raja Italia Vittorio Emanuele II berada di dalam.",
    highlights: ["Masuk gratis", "Arsitektur teknik luar biasa", "Suasana tenang di dalam"],
    visitTips: ["Duduk sejenak di bangku dalam untuk merasakan akustik", "Gabung tur audio jika ingin sejarah mendalam"],
    openingHours: "09:00–19:00 (Senin–Sabtu); Minggu 09:00–13:00",
    entryFee: "Gratis",
    duration: "30–60 menit",
    bestTime: "Pagi saat sinar masuk melalui oculus",
    wheelchair: "Akses penuh di lantai dasar",
    website: "pantheonroma.com",
    tags: ["Kuno", "Arsitektur", "Gratis"],
  },
  {
    id: "vatican-museums",
    osmName: "Musei Vaticani",
    title: "Museum Vatikan & Kapel Sistina",
    category: "museum",
    lat: 41.906487,
    lng: 12.453641,
    neighborhood: "Vaticano",
    address: "Viale Vaticano, 00165 Città del Vaticano",
    rating: 4.91,
    reviewCount: 22100,
    images: [
      attImg("vatican-1.jpg", "Lapangan St. Peter dari udara saat senja"),
      attImg("vatican-2.jpg", "Kubah Basilika St. Peter"),
      attImg("vatican-3.jpg", "Langit-langit Kapel Sistina — Michelangelo"),
    ],
    description: "Koleksi seni terbesar di dunia termasuk Michelangelo di Kapel Sistina.",
    longDescription:
      "Perjalanan museum mencakup Galeri Peta, Stanza Raphael, dan berakhir di Kapel Sistina dengan langit-langit Michelangelo. Tiket terpisah untuk Basilika St. Peter. Wajib reservasi online; antre tanpa tiket bisa 2–3 jam.",
    highlights: ["Kapel Sistina", "Raphael Rooms", "Spiral Bramante", "Basilika terpisah (gratis)"],
    visitTips: ["Tiket online wajib di musim ramai", "Dress code: bahu & lutut tertutup", "Kunjungi Rabu/Kamis sore lebih sepi"],
    openingHours: "Senin–Sabtu 08:00–20:00; Minggu tutup (kecuali terakhir bulan)",
    entryFee: "€20+ (online); audioguide €8",
    duration: "3–5 jam",
    bestTime: "Buka pukul 08:00",
    wheelchair: "Rute aksesibel sebagian",
    website: "museivaticani.va",
    tags: ["Seni", "Michelangelo", "Must-see"],
  },
  {
    id: "spanish-steps",
    osmName: "Scalinata di Trinità dei Monti",
    title: "Tangga Spanyol — Piazza di Spagna",
    category: "attraction",
    lat: 41.905634,
    lng: 12.482348,
    neighborhood: "Campo Marzio · Spagna",
    address: "Piazza di Spagna, 00187 Roma RM",
    rating: 4.79,
    reviewCount: 9800,
    images: [
      attImg("spagna-1.jpg", "Tangga barok & obelisk Trinità dei Monti"),
      attImg("spagna-2.jpg", "Piazza di Spagna & Fontana della Barcaccia"),
      attImg("spagna-3.jpg", "Gereja Trinità dei Monti & tangga malam hari"),
    ],
    description: "Tangga ikonik 135 anak tangga menghubungkan piazza dengan gereja Trinità dei Monti.",
    longDescription:
      "Dibangun abad ke-18, Scalinata adalah titik kumpul warga dan turis. Fontana Barcaccia di kaki tangga karya Bernini. Musim semi penuh bunga azalea. Area ini pusat belanja mewah (Via Condotti, Via del Babuino).",
    highlights: ["Gratis", "Foto klasik Roma", "Dekat metro Spagna"],
    visitTips: ["Dilarang duduk di tangga (peraturan lokal)", "Kombinasikan dengan Villa Medici", "Hati-hati keramaian"],
    openingHours: "24 jam (area publik)",
    entryFee: "Gratis",
    duration: "30–60 menit",
    bestTime: "Matahari terbit atau senja",
    wheelchair: "Hanya area piazza bawah",
    tags: ["Barok", "Belanja", "Foto"],
  },
  {
    id: "roman-forum",
    osmName: "Forum Romanum",
    title: "Forum Romanum & Palatine Hill",
    category: "attraction",
    lat: 41.892464,
    lng: 12.483636,
    neighborhood: "Foro Romano",
    address: "Via della Salara Vecchia, 5/6, 00186 Roma RM",
    rating: 4.93,
    reviewCount: 12400,
    images: [
      attImg("forum-1.jpg", "Puing kuil & jalan batu Forum Romanum"),
      attImg("forum-2.jpg", "Reruntuhan & pemandangan Forum Romanum"),
      attImg("forum-3.jpg", "Arco di Tito di Forum Romanum"),
    ],
    description: "Pusat kehidupan politik, agama, dan komersial Roma kuno.",
    longDescription:
      "Berjalan di antara Kuil Saturnus, Basilika Julia, dan Curia. Tiket gabungan dengan Colosseum dan Palatine. Palatine menawarkan pemandangan panorama Colosseum. Audio guide sangat disarankan untuk memahami konteks sejarah.",
    highlights: ["Tiket combo Colosseum", "Arco di Tito", "Hill Palatine panorama"],
    visitTips: ["Topi & air — sedikit teduhan", "Satu tiket berlaku 24 jam untuk 3 situs", "Mulai dari Colosseum lalu Forum"],
    openingHours: "09:00–19:00",
    entryFee: "Termasuk tiket Colosseum (€18)",
    duration: "2–4 jam (dengan Palatine)",
    bestTime: "Pagi",
    wheelchair: "Jalan tidak rata, akses terbatas",
    tags: ["Sejarah", "Arkeologi", "UNESCO"],
  },
  {
    id: "castel-sant-angelo",
    osmName: "Museo Nazionale di Castel Sant’Angelo",
    title: "Castel Sant'Angelo & Museum",
    category: "museum",
    lat: 41.90308,
    lng: 12.466181,
    neighborhood: "Borgo · Vatikan",
    address: "Lungotevere Castello, 50, 00193 Roma RM",
    rating: 4.87,
    reviewCount: 7200,
    images: [
      attImg("castel-1.jpg", "Castel Sant'Angelo dari Sungai Tiber"),
      attImg("castel-2.jpg", "Benteng diterangi cahaya malam"),
      attImg("castel-3.jpg", "Patung malaikat di Ponte Sant'Angelo"),
    ],
    description: "Mausoleum Hadrian yang menjadi benteng Paus — rooftop view spektakuler.",
    longDescription:
      "Awalnya makam Kaisar, kemudian kubu Paus dengan koridor rahasia ke Vatikan. Museum menampilkan senjata, fresko, dan apartemen Paus. Teras atas menawarkan 360° view: St. Peter, Tiber, dan centro storico.",
    highlights: ["Rooftop panorama", "Passetto di Borgo (sejarah)", "Jembatan Bernini"],
    visitTips: ["Tiket online mengurangi antre", "Sunset di rooftop sangat populer"],
    openingHours: "09:00–19:30",
    entryFee: "€17 (online €15)",
    duration: "1,5–2 jam",
    bestTime: "Sore menjelang sunset",
    wheelchair: "Lift ke sebagian besar area",
    website: "castelsantangelo.beniculturali.it",
    tags: ["Museum", "View", "Sejarah"],
  },
  {
    id: "galleria-borghese",
    osmName: "Galleria Borghese",
    title: "Galleria Borghese",
    category: "gallery",
    lat: 41.914113,
    lng: 12.492105,
    neighborhood: "Villa Borghese",
    address: "Piazzale Scipione Borghese, 5, 00197 Roma RM",
    rating: 4.92,
    reviewCount: 5400,
    images: [
      attImg("borghese-1.jpg", "Danau & taman Villa Borghese"),
      attImg("borghese-2.jpg", "Apollo dan Daphne — Bernini"),
      attImg("borghese-3.jpg", "Patung David — Bernini, Galleria Borghese"),
    ],
    description: "Museum seni kelas dunia: Bernini, Caravaggio, Raphael dalam villa abad ke-17.",
    longDescription:
      "Kunjungan dibatasi 2 jam per slot (max 360 orang) untuk menjaga pengalaman. Karya utama: Apollo dan Daphne (Bernini), David (Bernini), dan karya Caravaggio. Taman Villa Borghese sempurna untuk piknik setelah museum.",
    highlights: ["Bernini & Caravaggio", "Taman Villa Borghese", "Reservasi wajib"],
    visitTips: ["Pesan tiket minggu sebelumnya", "Tiba 30 menit lebih awal", "Sewa sepeda di taman setelahnya"],
    openingHours: "Sel–Ming 09:00–19:00 (slot 2 jam)",
    entryFee: "€15 + €2 reservasi",
    duration: "2 jam (slot tetap)",
    bestTime: "Slot pagi pertama",
    wheelchair: "Akses dengan pemberitahuan",
    website: "galleriaborghese.beniculturali.it",
    tags: ["Seni", "Bernini", "Taman"],
  },
  {
    id: "piazza-navona",
    osmName: "Piazza Navona",
    title: "Piazza Navona & Fontana dei Quattro Fiumi",
    category: "attraction",
    lat: 41.89919,
    lng: 12.473071,
    neighborhood: "Parione · Centro Storico",
    address: "Piazza Navona, 00186 Roma RM",
    rating: 4.85,
    reviewCount: 11300,
    images: [
      attImg("navona-1.jpg", "Fontana Bernini & piazza oval"),
      attImg("navona-2.jpg", "Kafe tepi piazza & street art"),
      attImg("navona-3.jpg", "Gereja Sant'Agnese in Agone"),
    ],
    description: "Piazza barok di atas Stadium Domitian — tiga air mancur megah.",
    longDescription:
      "Bentuk oval mengikuti arena kuno. Fontana dei Quattro Fiumi (Bernini) di tengah, Fontana del Moro dan Neptune di ujung. Penuh pelukis, musisi, dan kafe. Malam hari atmosfer magis dengan pencahayaan hangat.",
    highlights: ["Gratis", "Bernini fountain", "Kuliner & gelato"],
    visitTips: ["Harga kafe mahal — cek menu dulu", "Kunjungi malam untuk lampu", "Dekat Pantheon 5 menit jalan"],
    openingHours: "24 jam",
    entryFee: "Gratis",
    duration: "30–90 menit",
    bestTime: "Malam",
    wheelchair: "Akses baik di permukaan piazza",
    tags: ["Barok", "Kuliner", "Foto"],
  },
  {
    id: "capitoline",
    osmName: "Musei Capitolini",
    title: "Museum Capitolini — Piazza del Campidoglio",
    category: "museum",
    lat: 41.893028,
    lng: 12.482811,
    neighborhood: "Campitelli · Capitol",
    address: "Piazza del Campidoglio, 1, 00186 Roma RM",
    rating: 4.89,
    reviewCount: 4800,
    images: [
      attImg("capitoline-1.jpg", "Piazza Michelangelo & patung Marcus Aurelius"),
      attImg("capitoline-2.jpg", "Patung berkuda Marcus Aurelius"),
      attImg("capitoline-3.jpg", "Lupa Capitolina — serigala & Romulus"),
    ],
    description: "Museum publik tertua di dunia — patung Romulus, Remus, dan wolf.",
    longDescription:
      "Dirancang Michelangelo untuk piazza. Koleksi mencakup Marcus Aurelius (replika di luar), Capitoline Wolf, dan karya dari Colosseum. View sunset ke Forum Romanum dari belakang museum spektakuler.",
    highlights: ["Michelangelo piazza", "Patung Marcus Aurelius", "View Forum"],
    visitTips: ["Tiket online tersedia", "Kombinasi dengan Monumento Vittoriano"],
    openingHours: "09:30–19:30 (Senin tutup)",
    entryFee: "€15",
    duration: "2–3 jam",
    bestTime: "Sore untuk view",
    wheelchair: "Lift tersedia",
    website: "museicapitolini.org",
    tags: ["Museum", "Michelangelo", "Sejarah"],
  },
  {
    id: "vittoriano",
    osmName: "Monumento a Vittorio Emanuele II",
    title: "Altare della Patria — Monumento Vittorio",
    category: "attraction",
    lat: 41.894596,
    lng: 12.483306,
    neighborhood: "Campitelli · Piazza Venezia",
    address: "Piazza Venezia, 00186 Roma RM",
    rating: 4.72,
    reviewCount: 8900,
    images: [
      attImg("vittoriano-1.jpg", "Monumen putih megah di Piazza Venezia"),
      attImg("vittoriano-2.jpg", "Tangga & kolom korintus"),
      attImg("vittoriano-3.jpg", "Panorama Roma dari teras atas"),
    ],
    description: "Monumen nasional Italia — teras rooftop dengan panorama 360° Roma.",
    longDescription:
      "Dibangun 1885–1935 untuk memperingati Vittorio Emanuele II. Warga lokal menyebutnya \"the wedding cake\" karena marmer putihnya. Lift ke teras (€12) memberi view Colosseum, Forum, dan Vatican. Museum Risorgimento di dalam.",
    highlights: ["Panorama 360°", "Museum sejarah Italia", "Dekat Forum & Capitoline"],
    visitTips: ["Lift teras terpisah dari museum dasar", "Sangat panas di musim panas — bawa air"],
    openingHours: "09:30–19:30 (teras); museum variasi",
    entryFee: "Teras €12; museum dasar gratis (area tertentu)",
    duration: "45–90 menit",
    bestTime: "Sore hari cerah",
    wheelchair: "Lift ke teras",
    tags: ["Panorama", "Sejarah", "Foto"],
  },
];

export function findAttractionByOsmName(name: string | null | undefined): AttractionListing | undefined {
  if (!name) return undefined;
  const norm = name.trim().toLowerCase();
  return ATTRACTION_LISTINGS.find((a) => {
    const osm = a.osmName.toLowerCase();
    return osm === norm || norm.includes(osm) || osm.includes(norm);
  });
}
