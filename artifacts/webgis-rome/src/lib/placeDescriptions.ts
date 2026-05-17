/**
 * placeDescriptions.ts
 * Generates a short human-readable description for any OSM place
 * based on its tags (amenity, tourism, railway, highway, etc.)
 */

export interface PlaceDescription {
  summary: string;   // 1-sentence plain explanation
  emoji: string;     // visual hint
  tips?: string;     // optional helpful tip for visitors
}

// ── Amenity ──────────────────────────────────────────────────────────────────
const AMENITY_DESC: Record<string, PlaceDescription> = {
  restaurant:       { emoji: "🍽️",  summary: "Restoran yang menyajikan makanan Italia dan internasional. Cocok untuk makan siang atau makan malam." },
  cafe:             { emoji: "☕",  summary: "Kafe yang menyajikan espresso, cappuccino, dan makanan ringan khas Italia." },
  fast_food:        { emoji: "🍟",  summary: "Tempat makan cepat saji dengan menu siap saji yang praktis." },
  bar:              { emoji: "🍸",  summary: "Bar yang menyajikan minuman beralkohol, cocktail, dan camilan ringan." },
  pub:              { emoji: "🍺",  summary: "Pub dengan nuansa santai, ideal untuk bersantai sambil menikmati minuman." },
  ice_cream:        { emoji: "🍦",  summary: "Gelateria Italia — tempat terbaik mencicipi gelato asli Roma.", tips: "Cari gelateria dengan gelato yang disimpan dalam wadah tertutup untuk kualitas terbaik." },
  pizza:            { emoji: "🍕",  summary: "Tempat menikmati pizza Italia autentik, baik pizza al taglio (potongan) maupun bulat." },
  bakery:           { emoji: "🥐",  summary: "Toko roti dan kue yang menjual cornetto, pane, dan kue tradisional Italia." },
  food_court:       { emoji: "🍱",  summary: "Area makan dengan berbagai pilihan kuliner dalam satu tempat." },
  place_of_worship: { emoji: "⛪",  summary: "Tempat ibadah — bisa berupa gereja, masjid, atau sinagog. Roma dikenal dengan gereja-gereja bersejarahnya.", tips: "Kenakan pakaian sopan saat mengunjungi tempat ibadah." },
  church:           { emoji: "⛪",  summary: "Gereja Katolik Roma yang kaya akan seni dan arsitektur bersejarah." },
  monastery:        { emoji: "🏛️",  summary: "Biara bersejarah dengan arsitektur keagamaan yang menakjubkan." },
  pharmacy:         { emoji: "💊",  summary: "Apotek — menjual obat-obatan dan produk kesehatan. Tanda salib hijau menjadi penanda khasnya.", tips: "Buka juga pada hari Minggu secara bergiliran di Roma." },
  hospital:         { emoji: "🏥",  summary: "Rumah sakit yang melayani pasien umum dan gawat darurat." },
  clinic:           { emoji: "🏥",  summary: "Klinik kesehatan untuk pemeriksaan dan perawatan medis ringan." },
  doctors:          { emoji: "👨‍⚕️", summary: "Praktik dokter umum atau spesialis." },
  dentist:          { emoji: "🦷",  summary: "Klinik dokter gigi." },
  bank:             { emoji: "🏦",  summary: "Bank yang melayani transaksi keuangan dan penukaran mata uang." },
  atm:              { emoji: "🏧",  summary: "ATM (Bancomat) — mesin penarikan uang tunai yang tersedia 24 jam." },
  post_office:      { emoji: "📮",  summary: "Kantor pos Italia (Poste Italiane) untuk pengiriman surat dan paket." },
  police:           { emoji: "👮",  summary: "Kantor polisi (Carabinieri atau Polizia di Stato).", tips: "Hubungi 112 untuk keadaan darurat." },
  fire_station:     { emoji: "🚒",  summary: "Stasiun pemadam kebakaran (Vigili del Fuoco)." },
  school:           { emoji: "🏫",  summary: "Sekolah dasar atau menengah." },
  university:       { emoji: "🎓",  summary: "Universitas atau lembaga pendidikan tinggi." },
  library:          { emoji: "📚",  summary: "Perpustakaan umum dengan koleksi buku dan fasilitas baca." },
  theatre:          { emoji: "🎭",  summary: "Gedung teater untuk pertunjukan drama, opera, atau seni pertunjukan." },
  cinema:           { emoji: "🎬",  summary: "Bioskop yang menayangkan film-film Italia dan internasional." },
  marketplace:      { emoji: "🛒",  summary: "Pasar tradisional tempat membeli buah, sayuran, dan produk lokal.", tips: "Kunjungi di pagi hari untuk pilihan terlengkap dan harga terbaik." },
  supermarket:      { emoji: "🛒",  summary: "Supermarket modern dengan berbagai kebutuhan sehari-hari." },
  fountain:         { emoji: "⛲",  summary: "Air mancur (fontana) — ikon arsitektur kota Roma yang tersebar di seluruh kota.", tips: "Banyak air mancur kecil Roma (nasoni) menyediakan air minum gratis yang segar." },
  toilets:          { emoji: "🚻",  summary: "Toilet umum yang tersedia untuk pengunjung." },
  parking:          { emoji: "🅿️",  summary: "Area parkir kendaraan berbayar atau gratis." },
  fuel:             { emoji: "⛽",  summary: "Stasiun pengisian bahan bakar (SPBU)." },
  charging_station: { emoji: "⚡",  summary: "Stasiun pengisian daya kendaraan listrik." },
  bicycle_rental:   { emoji: "🚲",  summary: "Tempat sewa sepeda untuk menjelajahi kota.", tips: "Bersepeda adalah cara menyenangkan untuk mengunjungi Roma — pilih jalur tepi sungai Tiber." },
  car_rental:       { emoji: "🚗",  summary: "Tempat sewa kendaraan bermotor." },
  taxi:             { emoji: "🚕",  summary: "Pangkalan taksi resmi kota Roma." },
  bus_station:      { emoji: "🚌",  summary: "Terminal bus untuk rute dalam kota dan antarkota." },
  shelter:          { emoji: "🛖",  summary: "Tempat perlindungan atau halte dengan atap." },
  bench:            { emoji: "🪑",  summary: "Bangku taman untuk beristirahat." },
  waste_basket:     { emoji: "🗑️",  summary: "Tempat sampah umum." },
  recycling:        { emoji: "♻️",  summary: "Tempat daur ulang sampah." },
  embassy:          { emoji: "🏛️",  summary: "Kedutaan besar negara asing di Roma." },
  community_centre: { emoji: "🏢",  summary: "Pusat komunitas untuk kegiatan sosial dan budaya." },
  social_facility:  { emoji: "🤝",  summary: "Fasilitas sosial untuk layanan masyarakat." },
  arts_centre:      { emoji: "🎨",  summary: "Pusat seni yang menyelenggarakan pameran dan pertunjukan budaya." },
  nightclub:        { emoji: "🎶",  summary: "Klub malam untuk hiburan dan dansa di malam hari." },
  stripclub:        { emoji: "🎭",  summary: "Tempat hiburan dewasa." },
  casino:           { emoji: "🎰",  summary: "Kasino untuk hiburan dan perjudian." },
  vending_machine:  { emoji: "🤖",  summary: "Mesin penjual otomatis — minuman, makanan ringan, atau tiket." },
  drinking_water:   { emoji: "💧",  summary: "Titik air minum gratis. Roma terkenal dengan 2.500+ nasoni (keran air) di seluruh kota.", tips: "Air keran Roma sangat aman dan enak diminum langsung." },
  spa:              { emoji: "🧖",  summary: "Pusat spa dan perawatan tubuh." },
  gym:              { emoji: "💪",  summary: "Pusat kebugaran dan olahraga." },
  swimming_pool:    { emoji: "🏊",  summary: "Kolam renang umum atau kompleks olahraga air." },
};

// ── Tourism ───────────────────────────────────────────────────────────────────
const TOURISM_DESC: Record<string, PlaceDescription> = {
  hotel:          { emoji: "🏨",  summary: "Hotel berbintang dengan fasilitas penginapan lengkap.", tips: "Pesan jauh hari terutama di musim panas (Juni–Agustus) saat Roma sangat ramai wisatawan." },
  hostel:         { emoji: "🛏️",  summary: "Hostel dengan kamar dormitori atau privat — pilihan hemat untuk backpacker." },
  guest_house:    { emoji: "🏡",  summary: "Guest house atau B&B dengan suasana lebih personal dan harga terjangkau." },
  apartment:      { emoji: "🏠",  summary: "Apartemen sewaan jangka pendek — cocok untuk keluarga atau grup." },
  museum:         { emoji: "🏛️",  summary: "Museum dengan koleksi seni, arkeologi, atau sejarah yang kaya.", tips: "Museum Roma sering gratis di hari pertama atau ketiga setiap bulan. Cek Musei in Comune Roma." },
  gallery:        { emoji: "🖼️",  summary: "Galeri seni yang memamerkan karya seniman lokal maupun internasional." },
  artwork:        { emoji: "🗿",  summary: "Karya seni publik — patung, mural, atau instalasi yang dapat dinikmati gratis." },
  attraction:     { emoji: "⭐",  summary: "Atraksi wisata populer — destinasi wajib saat berkunjung ke Roma." },
  viewpoint:      { emoji: "👀",  summary: "Titik pandang (belvedere) dengan pemandangan kota Roma yang menakjubkan.", tips: "Kunjungi saat matahari terbenam (tramonto) untuk pemandangan terbaik." },
  information:    { emoji: "ℹ️",  summary: "Pusat informasi wisata — sumber panduan, peta, dan tips perjalanan." },
  picnic_site:    { emoji: "🌿",  summary: "Area piknik di taman kota atau kawasan alam." },
  zoo:            { emoji: "🦁",  summary: "Kebun binatang dengan koleksi satwa dari berbagai penjuru dunia." },
  aquarium:       { emoji: "🐠",  summary: "Akuarium dengan berbagai spesies kehidupan laut." },
  theme_park:     { emoji: "🎡",  summary: "Taman hiburan dengan wahana dan atraksi untuk keluarga." },
  camp_site:      { emoji: "⛺",  summary: "Area berkemah di luar kota Roma untuk pengalaman alam terbuka." },
  caravan_site:   { emoji: "🚐",  summary: "Area parkir karavan dan rumah bergerak." },
};

// ── Railway / Transport ───────────────────────────────────────────────────────
const RAILWAY_DESC: Record<string, PlaceDescription> = {
  station:          { emoji: "🚂",  summary: "Stasiun kereta api untuk layanan dalam kota (Ferrovie) maupun antarkota (Trenitalia/Italo).", tips: "Validasi tiket sebelum naik untuk menghindari denda." },
  subway_entrance:  { emoji: "🚇",  summary: "Pintu masuk stasiun metro (Metropolitana). Roma memiliki 3 jalur metro: A, B, dan C.", tips: "Metro adalah transportasi tercepat menghindari kemacetan Roma." },
  tram_stop:        { emoji: "🚊",  summary: "Halte tram (tranvie) — transportasi permukaan yang menghubungkan area-area kota.", tips: "Tram 8 adalah salah satu rute paling populer melewati pusat kota." },
  bus_stop:         { emoji: "🚌",  summary: "Halte bus kota (ATAC Roma). Jaringan bus Roma sangat luas mencakup seluruh kota." },
  stop:             { emoji: "🛑",  summary: "Titik pemberhentian transportasi umum." },
  platform:         { emoji: "🛤️",  summary: "Peron stasiun — tempat menunggu dan naik kereta." },
  crossing:         { emoji: "🦓",  summary: "Zebra cross atau penyeberangan jalan yang aman untuk pejalan kaki." },
  halt:             { emoji: "🚉",  summary: "Stasiun kecil (halte kereta) dengan layanan terbatas." },
  funicular:        { emoji: "🚠",  summary: "Funicular (kereta kabel) di area perbukitan kota." },
  aerodrome:        { emoji: "✈️",  summary: "Bandara atau lapangan terbang." },
};

// ── Highway (jalan / fasilitas jalan) ────────────────────────────────────────
const HIGHWAY_DESC: Record<string, PlaceDescription> = {
  bus_stop:         { emoji: "🚌",  summary: "Halte bus kota ATAC Roma." },
  traffic_signals:  { emoji: "🚦",  summary: "Lampu lalu lintas (semaforo)." },
  crossing:         { emoji: "🦓",  summary: "Penyeberangan pejalan kaki (strisce pedonali)." },
  turning_circle:   { emoji: "🔄",  summary: "Bundaran putar balik kendaraan." },
  rest_area:        { emoji: "🛣️",  summary: "Area istirahat di pinggir jalan besar." },
  motorway_junction:{ emoji: "🔀",  summary: "Persimpangan jalan bebas hambatan." },
  speed_camera:     { emoji: "📷",  summary: "Kamera pengawas kecepatan kendaraan." },
};

// ── Historic ──────────────────────────────────────────────────────────────────
const HISTORIC_DESC: Record<string, PlaceDescription> = {
  ruins:           { emoji: "🏚️",  summary: "Situs reruntuhan bersejarah dari era Romawi Kuno atau abad pertengahan." },
  monument:        { emoji: "🗽",  summary: "Monumen bersejarah yang didirikan untuk memperingati peristiwa atau tokoh penting." },
  memorial:        { emoji: "🕍",  summary: "Memorial atau peringatan untuk mengenang sejarah penting." },
  castle:          { emoji: "🏰",  summary: "Kastil atau benteng bersejarah dari abad pertengahan." },
  archaeological_site: { emoji: "⚱️", summary: "Situs arkeologi dengan temuan peninggalan dari era Romawi Kuno.", tips: "Beberapa situs terbuka untuk dikunjungi dengan tiket, yang lain bisa dilihat dari luar." },
  city_gate:       { emoji: "🚪",  summary: "Gerbang kota (Porta) bersejarah dari tembok kota Roma kuno." },
  aqueduct:        { emoji: "🌉",  summary: "Reruntuhan akueduk Romawi — sistem saluran air kuno yang luar biasa." },
  column:          { emoji: "🏛️",  summary: "Kolom kemenangan (Colonna) bersejarah dari masa Romawi." },
  triumphal_arch:  { emoji: "🏛️",  summary: "Lengkungan kemenangan (Arco di Trionfo) — warisan arsitektur Roma kuno." },
  obelisk:         { emoji: "🗿",  summary: "Obelisk Mesir Kuno yang dibawa ke Roma oleh kaisar-kaisar Romawi." },
};

// ── Shop ─────────────────────────────────────────────────────────────────────
const SHOP_DESC: Record<string, PlaceDescription> = {
  clothes:         { emoji: "👗",  summary: "Toko pakaian dan fashion — dari brand lokal hingga desainer internasional." },
  shoes:           { emoji: "👠",  summary: "Toko sepatu dengan koleksi kulit Italia berkualitas tinggi." },
  jewelry:         { emoji: "💍",  summary: "Toko perhiasan dengan koleksi emas, perak, dan permata." },
  books:           { emoji: "📖",  summary: "Toko buku dengan koleksi Italia, Latin, dan internasional." },
  souvenirs:       { emoji: "🎁",  summary: "Toko suvenir khas Roma — magnet, replika Colosseum, dan barang-barang khas.", tips: "Harga suvenir lebih murah jika menjauh dari area wisata utama." },
  supermarket:     { emoji: "🛒",  summary: "Supermarket dengan kebutuhan sehari-hari." },
  convenience:     { emoji: "🏪",  summary: "Minimarket atau toko kelontong yang buka hingga malam." },
  electronics:     { emoji: "📱",  summary: "Toko elektronik dan perangkat digital." },
  hairdresser:     { emoji: "✂️",  summary: "Salon rambut atau barbershop." },
  optician:        { emoji: "👓",  summary: "Toko kacamata dan optik." },
  florist:         { emoji: "💐",  summary: "Toko bunga dan tanaman hias." },
  gift:            { emoji: "🎁",  summary: "Toko hadiah dan barang-barang unik untuk oleh-oleh." },
};

// ── Leisure ───────────────────────────────────────────────────────────────────
const LEISURE_DESC: Record<string, PlaceDescription> = {
  park:            { emoji: "🌳",  summary: "Taman kota (parco) — tempat bersantai, berolahraga, dan menikmati alam di tengah kota.", tips: "Villa Borghese adalah taman terbesar dan paling populer di Roma." },
  garden:          { emoji: "🌷",  summary: "Taman bunga atau taman botani yang indah." },
  playground:      { emoji: "🛝",  summary: "Area bermain anak dengan berbagai fasilitas." },
  sports_centre:   { emoji: "⚽",  summary: "Pusat olahraga dengan fasilitas lapangan dan gym." },
  stadium:         { emoji: "🏟️",  summary: "Stadion olahraga — Roma memiliki Stadio Olimpico untuk pertandingan AS Roma dan SS Lazio.", tips: "Beli tiket online jauh hari untuk pertandingan Serie A." },
  swimming_pool:   { emoji: "🏊",  summary: "Kolam renang umum atau kompleks akuatik." },
  fitness_centre:  { emoji: "💪",  summary: "Pusat kebugaran dengan peralatan modern." },
  golf_course:     { emoji: "⛳",  summary: "Lapangan golf dengan pemandangan alam." },
  marina:          { emoji: "⚓",  summary: "Marina atau dermaga perahu di Sungai Tiber." },
  track:           { emoji: "🏃",  summary: "Trek lari atau sirkuit olahraga." },
  pitch:           { emoji: "⚽",  summary: "Lapangan olahraga untuk sepak bola, basket, atau tenis." },
};

// ── Natural ───────────────────────────────────────────────────────────────────
const NATURAL_DESC: Record<string, PlaceDescription> = {
  tree:            { emoji: "🌲",  summary: "Pohon besar atau pohon bersejarah yang dilindungi." },
  wood:            { emoji: "🌲",  summary: "Area hutan atau kawasan hijau perkotaan." },
  water:           { emoji: "💧",  summary: "Badan air — kolam, danau kecil, atau ceruk sungai." },
  spring:          { emoji: "⛲",  summary: "Mata air alami atau sumber air bersih." },
  hill:            { emoji: "⛰️",  summary: "Perbukitan — Roma dibangun di atas Tujuh Bukit yang legendaris.", tips: "Bukit-bukit Roma seperti Gianicolo dan Aventino menawarkan pemandangan terbaik kota." },
};

// ── Office ────────────────────────────────────────────────────────────────────
const OFFICE_DESC: Record<string, PlaceDescription> = {
  government:      { emoji: "🏛️",  summary: "Kantor pemerintahan Italia atau regional." },
  ngo:             { emoji: "🤝",  summary: "Kantor organisasi non-pemerintah (NGO) internasional — Roma adalah markas bagi banyak lembaga PBB." },
  company:         { emoji: "🏢",  summary: "Kantor perusahaan swasta." },
  estate_agent:    { emoji: "🏠",  summary: "Agen properti dan real estate." },
  lawyer:          { emoji: "⚖️",  summary: "Kantor pengacara atau firma hukum." },
};

// ── Fallback berdasarkan kategori OSM ─────────────────────────────────────────
const CATEGORY_FALLBACK: Record<string, PlaceDescription> = {
  tourism:  { emoji: "⭐",  summary: "Destinasi wisata yang menarik di kota Roma." },
  railway:  { emoji: "🚆",  summary: "Titik transportasi umum — bagian dari jaringan ATAC Roma." },
  amenity:  { emoji: "📍",  summary: "Fasilitas umum yang tersedia untuk warga dan wisatawan." },
  highway:  { emoji: "🛣️",  summary: "Infrastruktur jalan atau fasilitas di pinggir jalan." },
  historic: { emoji: "🏛️",  summary: "Situs atau bangunan bersejarah Roma." },
  shop:     { emoji: "🛍️",  summary: "Toko atau tempat belanja." },
  leisure:  { emoji: "🎪",  summary: "Fasilitas rekreasi dan hiburan." },
  natural:  { emoji: "🌿",  summary: "Elemen alam di dalam kota Roma." },
  office:   { emoji: "🏢",  summary: "Kantor atau gedung perkantoran." },
  default:  { emoji: "📌",  summary: "Titik menarik di kota Roma, Italia." },
};

type OSMProps = Record<string, string | number | null | undefined>;

/**
 * Returns a PlaceDescription for the given OSM feature properties.
 * Looks up specific type first, falls back to category, then generic.
 */
export function getPlaceDescription(props: OSMProps): PlaceDescription {
  // Amenity
  if (props.amenity) {
    const key = String(props.amenity);
    if (AMENITY_DESC[key]) return AMENITY_DESC[key];
    return CATEGORY_FALLBACK.amenity;
  }

  // Tourism
  if (props.tourism) {
    const key = String(props.tourism);
    if (TOURISM_DESC[key]) return TOURISM_DESC[key];
    return CATEGORY_FALLBACK.tourism;
  }

  // Railway / transport
  if (props.railway) {
    const key = String(props.railway);
    if (RAILWAY_DESC[key]) return RAILWAY_DESC[key];
    return CATEGORY_FALLBACK.railway;
  }

  // Highway facilities
  if (props.highway) {
    const key = String(props.highway);
    if (HIGHWAY_DESC[key]) return HIGHWAY_DESC[key];
    return CATEGORY_FALLBACK.highway;
  }

  // Historic
  if (props.historic) {
    const key = String(props.historic);
    if (HISTORIC_DESC[key]) return HISTORIC_DESC[key];
    return CATEGORY_FALLBACK.historic;
  }

  // Shop
  if (props.shop) {
    const key = String(props.shop);
    if (SHOP_DESC[key]) return SHOP_DESC[key];
    return CATEGORY_FALLBACK.shop;
  }

  // Leisure
  if (props.leisure) {
    const key = String(props.leisure);
    if (LEISURE_DESC[key]) return LEISURE_DESC[key];
    return CATEGORY_FALLBACK.leisure;
  }

  // Natural
  if (props.natural) {
    const key = String(props.natural);
    if (NATURAL_DESC[key]) return NATURAL_DESC[key];
    return CATEGORY_FALLBACK.natural;
  }

  // Office
  if (props.office) {
    const key = String(props.office);
    if (OFFICE_DESC[key]) return OFFICE_DESC[key];
    return CATEGORY_FALLBACK.office;
  }

  return CATEGORY_FALLBACK.default;
}
