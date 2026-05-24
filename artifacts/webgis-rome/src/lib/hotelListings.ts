export type StayType = "hotel" | "apartment" | "hostel" | "guest_house";

export interface HotelImage {
  url: string;
  caption: string;
}

export interface HotelRoom {
  name: string;
  beds: string;
  size: string;
  pricePerNight: number;
  image: string;
  features: string[];
}

export interface NearbyPlace {
  name: string;
  distance: string;
  walkMin: number;
}

export interface HotelReview {
  author: string;
  rating: number;
  date: string;
  text: string;
  avatar?: string;
}

export interface HotelListing {
  id: string;
  osmName: string;
  title: string;
  type: StayType;
  lat: number;
  lng: number;
  neighborhood: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  pricePerNight: number;
  currency: string;
  rating: number;
  reviewCount: number;
  images: HotelImage[];
  host: { name: string; superhost: boolean; yearsHosting: number; bio: string };
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: string[];
  description: string;
  longDescription: string;
  highlights: string[];
  rooms: HotelRoom[];
  nearby: NearbyPlace[];
  reviews: HotelReview[];
  houseRules: string[];
  policies: {
    cancellation: string;
    pets: string;
    smoking: string;
    minStay?: string;
  };
  checkIn: string;
  checkOut: string;
  instantBook: boolean;
  cleaningFee: number;
  serviceFee: number;
}

export const STAY_TYPE_LABELS: Record<StayType, string> = {
  hotel: "Hotel",
  apartment: "Apartemen",
  hostel: "Hostel",
  guest_house: "Guest house",
};

/** Gambar lokal di public/hotels — tidak bergantung CDN eksternal */
export const HOTEL_IMAGE_FALLBACK = `${import.meta.env.BASE_URL}hotels/fallback.jpg`;

const hotelImg = (file: string, caption: string): HotelImage => ({
  url: `${import.meta.env.BASE_URL}hotels/${file}`,
  caption,
});

export const roomImg = (file: string) => `${import.meta.env.BASE_URL}hotels/${file}`;

export const HOTEL_LISTINGS: HotelListing[] = [
  {
    id: "hotel-piram",
    osmName: "Hotel Piram",
    title: "Suite klasik dekat Stasiun Termini",
    type: "hotel",
    lat: 41.8993079,
    lng: 12.500721,
    neighborhood: "Esquilino · Termini",
    address: "Via Pietro Micca 20/a, 00185 Roma RM, Italia",
    phone: "+39 06 481 4656",
    email: "info@hotelpiram.it",
    website: "www.hotelpiram.it",
    pricePerNight: 142,
    currency: "EUR",
    rating: 4.82,
    reviewCount: 318,
    images: [
      hotelImg("cover-piram.jpg", "Lobby mewah dengan lantai marmer Italia & lampu gantung klasik"),
      hotelImg("hotel-piram-1.jpg", "Kamar deluxe dengan ranjang king & marmer Italia"),
      hotelImg("hotel-piram-2.jpg", "Lobby elegan & area resepsionis"),
      hotelImg("hotel-piram-3.jpg", "Kamar mandi modern dengan shower"),
      hotelImg("hotel-piram-4.jpg", "Kamar mandi premium & amenitas"),
      hotelImg("hotel-piram-5.jpg", "Ruang sarapan bufet pagi"),
    ],
    host: {
      name: "Marco R.",
      superhost: true,
      yearsHosting: 6,
      bio: "Manajer hotel keluarga — fokus pada keramahan Italia autentik dan kenyamanan tamu internasional.",
    },
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: [
      "WiFi gratis", "AC", "Lift", "Resepsionis 24 jam", "Sarapan bufet",
      "Pembersihan harian", "Brankas", "Layanan kamar", "Concierge",
    ],
    description: "Kamar elegan dengan aksen marmer Italia, 8 menit jalan ke Stasiun Termini.",
    longDescription:
      "Hotel Piram menghadirkan kenyamanan klasik Roma di jantung distrik Esquilino. Setiap kamar dilengkapi tempat tidur premium, linen katun Mesir, dan kamar mandi marmer. Sarapan bufet Italia disajikan setiap pagi di ruang ber-AC dengan pemandangan halaman dalam yang tenang. Staf multibahasa siap membantu rencana wisata ke Colosseum, Vatican, dan kawasan belanja Via Nazionale.",
    highlights: ["8 menit ke Termini", "Sarapan bufet termasuk", "Kamar tenang halaman dalam", "Check-in mandiri tersedia"],
    rooms: [
      {
        name: "Classic Double",
        beds: "1 ranjang queen",
        size: "18 m²",
        pricePerNight: 128,
        image: roomImg("hotel-piram-1.jpg"),
        features: ["AC", "TV layar datar", "Minibar", "WiFi"],
      },
      {
        name: "Deluxe King",
        beds: "1 ranjang king",
        size: "24 m²",
        pricePerNight: 142,
        image: roomImg("hotel-piram-2.jpg"),
        features: ["Marmer", "Shower rain", "Meja kerja", "Brankas"],
      },
      {
        name: "Family Triple",
        beds: "1 king + 1 single",
        size: "28 m²",
        pricePerNight: 168,
        image: roomImg("hotel-piram-3.jpg"),
        features: ["Cocok keluarga", "Sofa bed", "Kulkas mini"],
      },
    ],
    nearby: [
      { name: "Stasiun Roma Termini", distance: "650 m", walkMin: 8 },
      { name: "Basilika Santa Maria Maggiore", distance: "400 m", walkMin: 5 },
      { name: "Colosseum", distance: "1.8 km", walkMin: 22 },
      { name: "Trevi Fountain", distance: "1.2 km", walkMin: 15 },
    ],
    reviews: [
      { author: "Dewi K.", rating: 5, date: "Maret 2026", text: "Lokasi sempurna! Kamar bersih, sarapan enak, staf sangat ramah. Termini dekat banget." },
      { author: "Thomas M.", rating: 5, date: "Februari 2026", text: "Classic Roman hotel feel. Marble bathroom was stunning. Great value near Termini." },
      { author: "Ayu P.", rating: 4, date: "Januari 2026", text: "Kamar agak kecil tapi nyaman. WiFi kencang. Cocok untuk solo traveler." },
    ],
    houseRules: ["Check-in setelah 14:00", "Dilarang merokok di kamar", "Hening setelah 22:00", "Tamu wajib tunjukkan ID"],
    policies: {
      cancellation: "Gratis hingga 48 jam sebelum check-in. Setelah itu, biaya 1 malam.",
      pets: "Tidak diperbolehkan",
      smoking: "Area merokok hanya di teras luar",
    },
    checkIn: "14:00",
    checkOut: "11:00",
    instantBook: true,
    cleaningFee: 25,
    serviceFee: 18,
  },
  {
    id: "rome-art-hotel",
    osmName: "Rome Art Hotel",
    title: "Boutique hotel dengan seni kontemporer",
    type: "hotel",
    lat: 41.9031277,
    lng: 12.4853894,
    neighborhood: "Prati · Vatikan",
    address: "Via Vespasiano 96, 00192 Roma RM, Italia",
    phone: "+39 06 397 23841",
    email: "welcome@romearthotel.it",
    pricePerNight: 168,
    currency: "EUR",
    rating: 4.91,
    reviewCount: 204,
    images: [
      hotelImg("cover-rome-art.jpg", "Kamar boutique dengan karya seni kontemporer Roma"),
      hotelImg("rome-art-1.jpg", "Suite artistik dengan dekorasi kontemporer"),
      hotelImg("rome-art-2.jpg", "Kamar dengan headboard custom & lampu desain"),
      hotelImg("rome-art-3.jpg", "Interior boutique & furnitur unik"),
      hotelImg("rome-art-4.jpg", "Kamar mandi elegan dengan bathtub"),
      hotelImg("rome-art-6.jpg", "Eksterior hotel di distrik Prati"),
    ],
    host: {
      name: "Giulia A.",
      superhost: true,
      yearsHosting: 9,
      bio: "Kurator seni & pemilik boutique hotel — setiap bulan berganti pameran karya seniman Roma muda.",
    },
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: [
      "WiFi", "AC", "Bar lounge", "Concierge", "Pameran seni", "Brankas",
      "Rooftop", "Sarapan à la carte", "Tur budaya",
    ],
    description: "Setiap lantai menampilkan karya seniman Roma kontemporer, dekat Vatikan.",
    longDescription:
      "Rome Art Hotel adalah pengalaman menginap sekaligus galeri seni. Kamar-kamar didesain oleh seniman lokal dengan furnitur unik dan palet warna hangat. Rooftop lounge menawarkan aperitivo saat matahari terbenam dengan siluet Basilika St. Peter. Concierge dapat mengatur tur pribadi ke Museum Vatikan dan workshop seni di Trastevere.",
    highlights: ["Karya seni unik tiap kamar", "10 menit ke Vatikan", "Rooftop aperitivo", "Concierge budaya"],
    rooms: [
      {
        name: "Art Studio",
        beds: "1 queen",
        size: "20 m²",
        pricePerNight: 148,
        image: roomImg("rome-art-1.jpg"),
        features: ["Mural custom", "Sound system", "Nespresso"],
      },
      {
        name: "Gallery Suite",
        beds: "1 king",
        size: "30 m²",
        pricePerNight: 168,
        image: roomImg("rome-art-4.jpg"),
        features: ["Bathtub", "Area duduk", "View kota"],
      },
    ],
    nearby: [
      { name: "Museum Vatikan", distance: "900 m", walkMin: 11 },
      { name: "Castel Sant'Angelo", distance: "1.1 km", walkMin: 14 },
      { name: "Piazza del Popolo", distance: "1.5 km", walkMin: 18 },
    ],
    reviews: [
      { author: "Rina S.", rating: 5, date: "April 2026", text: "Seperti menginap di galeri! Rooftop-nya magical saat sunset. Dekat banget ke Vatikan." },
      { author: "James L.", rating: 5, date: "Maret 2026", text: "Unique concept, beautiful rooms. Staff arranged skip-the-line Vatican tickets." },
    ],
    houseRules: ["Karya seni jangan disentuh", "Rooftop tutup 23:00", "Tamu eksternal di bar max 2/jam"],
    policies: {
      cancellation: "Gratis 72 jam sebelumnya",
      pets: "Anjing kecil diperbolehkan (€20/malam)",
      smoking: "Dilarang di dalam",
    },
    checkIn: "15:00",
    checkOut: "10:30",
    instantBook: true,
    cleaningFee: 30,
    serviceFee: 22,
  },
  {
    id: "antico-palazzo",
    osmName: "Hotel Antico Palazzo Rospigliosi",
    title: "Palazzo bersejarah abad ke-17",
    type: "hotel",
    lat: 41.8973734,
    lng: 12.4976311,
    neighborhood: "Monti · Colosseum",
    address: "Via Liberiana 21, 00185 Roma RM, Italia",
    phone: "+39 06 489 30434",
    email: "reservations@palazzorospigliosi.it",
    pricePerNight: 215,
    currency: "EUR",
    rating: 4.95,
    reviewCount: 412,
    images: [
      hotelImg("cover-antico-palazzo.jpg", "Fasad grand palazzo bersejarah abad ke-17 di Roma"),
      hotelImg("antico-palazzo-1.jpg", "Eksterior palazzo"),
      hotelImg("antico-palazzo-2.jpg", "Suite mewah dengan tempat tidur premium"),
      hotelImg("antico-palazzo-3.jpg", "Kamar klasik dengan furnitur kayu"),
      hotelImg("antico-palazzo-4.jpg", "Kamar elegan bergaya heritage"),
      hotelImg("antico-palazzo-5.jpg", "Ruang santai & detail interior"),
    ],
    host: {
      name: "Famiglia Rospigliosi",
      superhost: true,
      yearsHosting: 12,
      bio: "Keluarga pemilik palazzo sejak generasi — menjaga warisan arsitektur sambil menyambut tamu dunia.",
    },
    guests: 3,
    bedrooms: 1,
    beds: 2,
    baths: 1,
    amenities: [
      "WiFi", "AC", "Taman dalam", "Concierge", "Sarapan gourmet",
      "Parkir (terbatas)", "Butler on request", "Tur pribadi",
    ],
    description: "Bangunan abad ke-17, Colosseum 12 menit jalan kaki.",
    longDescription:
      "Antico Palazzo Rospigliosi adalah salah satu penginapan paling bergengsi di Roma. Langit-langit setinggi 4 meter, lantai teraso asli, dan detail barok menciptakan atmosfer istana. Taman dalam menawarkan sarapan alfresco di musim panas. Concierge VIP mengatur tur Colosseum, Forum Romanum, dan reservasi restoran Michelin terdekat.",
    highlights: ["Warisan UNESCO area", "Teras taman privat", "Sarapan gourmet", "12 min ke Colosseum"],
    rooms: [
      {
        name: "Heritage Double",
        beds: "1 king kanopi",
        size: "32 m²",
        pricePerNight: 195,
        image: roomImg("antico-palazzo-2.jpg"),
        features: ["Fresco", "Teras kecil", "Minibar premium"],
      },
      {
        name: "Noble Suite",
        beds: "1 king + sofa",
        size: "45 m²",
        pricePerNight: 215,
        image: roomImg("antico-palazzo-4.jpg"),
        features: ["Ruang tamu", "Bathtub clawfoot", "View taman"],
      },
    ],
    nearby: [
      { name: "Colosseum", distance: "950 m", walkMin: 12 },
      { name: "Forum Romanum", distance: "1.1 km", walkMin: 14 },
      { name: "Santa Maria Maggiore", distance: "200 m", walkMin: 3 },
    ],
    reviews: [
      { author: "Budi H.", rating: 5, date: "April 2026", text: "Pengalaman menginap paling mewah di Roma. Teras tamannya seperti mimpi. Worth every euro." },
      { author: "Claire D.", rating: 5, date: "Maret 2026", text: "Living history. The ceiling fresco in our room was breathtaking. Perfect for anniversary." },
      { author: "Hendra W.", rating: 5, date: "Februari 2026", text: "Concierge luar biasa. Colosseum tour diatur sempurna. Sarapan di taman unforgettable." },
    ],
    houseRules: ["Dress code smart casual di aula", "Tamu eksternal perlu registrasi", "Hening di taman setelah 21:00"],
    policies: {
      cancellation: "Gratis 7 hari sebelumnya untuk suite",
      pets: "Tidak diperbolehkan",
      smoking: "Hanya area luar gerbang",
      minStay: "Minimum 2 malam di musim panas",
    },
    checkIn: "14:00",
    checkOut: "12:00",
    instantBook: false,
    cleaningFee: 45,
    serviceFee: 35,
  },
  {
    id: "mood-suites-tritone",
    osmName: "Mood Suites Tritone",
    title: "Suite modern dekat Fontana di Trevi",
    type: "apartment",
    lat: 41.9026319,
    lng: 12.4881996,
    neighborhood: "Trevi · Centro Storico",
    address: "Via della Panetteria 92, 00187 Roma RM, Italia",
    phone: "+39 06 6994 1280",
    email: "stay@moodsuitestritone.it",
    pricePerNight: 189,
    currency: "EUR",
    rating: 4.88,
    reviewCount: 267,
    images: [
      hotelImg("cover-mood-suites.jpg", "Apartemen modern minimalis dengan dapur Italia lengkap"),
      hotelImg("mood-suites-1.jpg", "Ruang tamu terbuka dengan dapur Italia"),
      hotelImg("mood-suites-2.jpg", "Kamar tidur utama minimalis"),
      hotelImg("mood-suites-3.jpg", "Kamar mandi modern & shower walk-in"),
      hotelImg("mood-suites-4.jpg", "Kamar kedua / area tidur tambahan"),
    ],
    host: {
      name: "Elena M.",
      superhost: true,
      yearsHosting: 4,
      bio: "Interior designer Roma — mendesain setiap suite dengan gaya kontemporer dan kenyamanan keluarga.",
    },
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    amenities: [
      "WiFi", "AC", "Dapur lengkap", "Mesin cuci", "Smart TV",
      "Check-in mandiri", "Nespresso", "Setrika", "Pemanas air",
    ],
    description: "Apartemen minimalis, Trevi 3 menit jalan kaki.",
    longDescription:
      "Mood Suites Tritone menawarkan ruang seperti rumah di lokasi paling ikonik Roma. Dapur Italia lengkap dengan kompor gas, oven, dan peralatan premium untuk memasak pasta sendiri. Dua kamar tidur terpisah ideal untuk keluarga atau dua pasangan. Self check-in via keypad 24 jam. Panduan digital berisi rekomendasi gelato, espresso bar, dan foto spot Trevi tanpa antre.",
    highlights: ["3 menit ke Trevi", "Dapur penuh", "2 kamar tidur", "Self check-in 24j"],
    rooms: [
      {
        name: "Trevi Suite (seluruh unit)",
        beds: "2 queen",
        size: "65 m²",
        pricePerNight: 189,
        image: roomImg("mood-suites-1.jpg"),
        features: ["2 BR", "Dapur", "Balkon", "Mesin cuci"],
      },
    ],
    nearby: [
      { name: "Fontana di Trevi", distance: "250 m", walkMin: 3 },
      { name: "Pantheon", distance: "700 m", walkMin: 9 },
      { name: "Piazza di Spagna", distance: "900 m", walkMin: 11 },
    ],
    reviews: [
      { author: "Sari M.", rating: 5, date: "April 2026", text: "Lokasi impossible to beat! Masak pasta di dapur sendiri, Trevi 3 menit. Anak-anak suka banget." },
      { author: "Michael T.", rating: 5, date: "Maret 2026", text: "Perfect family base. Clean, modern, great kitchen. Trevi at night is magical from here." },
    ],
    houseRules: ["Maks 4 tamu", "Pesta dilarang", "Hening 22:00–08:00", "Buang sampah di tempat yang ditentukan"],
    policies: {
      cancellation: "Gratis 5 hari sebelumnya",
      pets: "Tidak diperbolehkan",
      smoking: "Dilarang",
    },
    checkIn: "15:00",
    checkOut: "10:00",
    instantBook: true,
    cleaningFee: 35,
    serviceFee: 25,
  },
  {
    id: "hotel-fenix",
    osmName: "Hotel Fenix",
    title: "Kamar nyaman dekat Villa Borghese",
    type: "hotel",
    lat: 41.9185819,
    lng: 12.51433,
    neighborhood: "Parioli · Villa Borghese",
    address: "Via Boncompagni 31, 00187 Roma RM, Italia",
    phone: "+39 06 4201 4511",
    email: "info@hotelfenixroma.it",
    pricePerNight: 128,
    currency: "EUR",
    rating: 4.76,
    reviewCount: 156,
    images: [
      hotelImg("cover-hotel-fenix.jpg", "Kamar nyaman dengan view taman hijau Villa Borghese"),
      hotelImg("hotel-fenix-1.jpg", "Kamar double dengan pencahayaan alami"),
      hotelImg("hotel-fenix-2.jpg", "Kamar nyaman dengan ranjang besar"),
      hotelImg("hotel-fenix-3.jpg", "Area sarapan & ruang bersama"),
      hotelImg("hotel-fenix-4.jpg", "Kamar keluarga dekat taman hijau"),
      hotelImg("hotel-fenix-5.jpg", "Suasana tenang dekat Villa Borghese"),
    ],
    host: { name: "Luca B.", superhost: false, yearsHosting: 3, bio: "Manajer operasional — fokus kenyamanan keluarga dan area hijau Roma." },
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ["WiFi", "AC", "Sarapan", "Teras kecil", "Penyimpanan bagasi", "Parkir (€15/hari)"],
    description: "Area tenang dekat Villa Borghese & Galeri Borghese.",
    longDescription:
      "Hotel Fenix adalah oase tenang di utara pusat wisata. Cocok untuk tamu yang ingin istirahat di taman hijau Villa Borghese atau bersepeda di pagi hari. Sarapan kontinental disajikan di teras dengan roti segar dan cappuccino. Stasiun metro Barberini dapat dijangkau dengan bus 10 menit.",
    highlights: ["Dekat Villa Borghese", "Area tenang", "Sarapan di teras", "Harga terjangkau"],
    rooms: [
      {
        name: "Garden View Double",
        beds: "1 queen",
        size: "16 m²",
        pricePerNight: 118,
        image: roomImg("hotel-fenix-1.jpg"),
        features: ["View taman", "AC", "TV"],
      },
      {
        name: "Family Triple",
        beds: "1 double + 1 single",
        size: "22 m²",
        pricePerNight: 128,
        image: roomImg("hotel-fenix-4.jpg"),
        features: ["Cocok 3 orang", "Extra bed"],
      },
    ],
    nearby: [
      { name: "Villa Borghese", distance: "400 m", walkMin: 5 },
      { name: "Galleria Borghese", distance: "600 m", walkMin: 8 },
      { name: "Spanish Steps", distance: "1.4 km", walkMin: 17 },
    ],
    reviews: [
      { author: "Andi R.", rating: 4, date: "Maret 2026", text: "Tenang dan hijau. Cocok setelah 3 hari ramai di pusat kota. Sarapan sederhana tapi enak." },
      { author: "Lisa K.", rating: 5, date: "Februari 2026", text: "Lovely garden area. Perfect for morning runs in Borghese park." },
    ],
    houseRules: ["Check-in 14:00", "Parkir terbatas — reservasi dulu"],
    policies: { cancellation: "Gratis 24 jam", pets: "Kucing kecil OK (€10)", smoking: "Teras saja" },
    checkIn: "14:00",
    checkOut: "11:00",
    instantBook: true,
    cleaningFee: 20,
    serviceFee: 15,
  },
  {
    id: "hotel-cambridge",
    osmName: "Hotel cambridge",
    title: "Hotel klasik di jantung Roma",
    type: "hotel",
    lat: 41.9033918,
    lng: 12.5060841,
    neighborhood: "Repubblica · Via Nazionale",
    address: "Via Palestro 87, 00185 Roma RM, Italia",
    phone: "+39 06 4456 911",
    email: "booking@hotelcambridgeroma.com",
    pricePerNight: 155,
    currency: "EUR",
    rating: 4.79,
    reviewCount: 189,
    images: [
      hotelImg("cover-hotel-cambridge.jpg", "Bar lounge bergaya Inggris-Italia dengan perpustakaan & whisky"),
      hotelImg("hotel-cambridge-1.jpg", "Kamar superior gaya Inggris-Italia"),
      hotelImg("hotel-cambridge-3.jpg", "Kamar mandi dengan amenitas premium"),
      hotelImg("hotel-cambridge-4.jpg", "Kamar executive luas & nyaman"),
      hotelImg("hotel-cambridge-5.jpg", "Interior klasik di pusat Roma"),
    ],
    host: { name: "Cambridge Roma S.r.l.", superhost: false, yearsHosting: 8, bio: "Grup perhotelan dengan standar layanan internasional sejak 1998." },
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ["WiFi", "AC", "Bar", "Room service", "Lift", "Resepsionis 24 jam", "Business corner"],
    description: "Gaya Inggris-Italia di Via Nazionale, dekat teater & museum.",
    longDescription:
      "Hotel Cambridge menghadirkan elegan British di jantung Roma. Kamar luas dengan furnitur kayu gelap dan karpet empuk. Bar perpustakaan menyajikan whisky Italia dan cocktail klasik. Lokasi ideal untuk belanja di Via Nazionale dan pertunjukan di Teatro dell'Opera. Metro Repubblica 4 menit jalan kaki.",
    highlights: ["Dekat metro Repubblica", "Bar perpustakaan", "Room service 24j", "Kamar luas"],
    rooms: [
      {
        name: "Standard Double",
        beds: "1 queen",
        size: "20 m²",
        pricePerNight: 135,
        image: roomImg("hotel-cambridge-1.jpg"),
        features: ["AC", "TV", "Minibar"],
      },
      {
        name: "Executive King",
        beds: "1 king",
        size: "28 m²",
        pricePerNight: 155,
        image: roomImg("hotel-cambridge-4.jpg"),
        features: ["Ruang duduk", "Bathrobe", "Espresso machine"],
      },
    ],
    nearby: [
      { name: "Teatro dell'Opera", distance: "350 m", walkMin: 4 },
      { name: "Metro Repubblica", distance: "300 m", walkMin: 4 },
      { name: "Termini", distance: "800 m", walkMin: 10 },
    ],
    reviews: [
      { author: "Fajar N.", rating: 5, date: "Maret 2026", text: "Kamar besar, bar-nya cozy. Metro dekat, mudah ke mana-mana." },
      { author: "Emma W.", rating: 4, date: "Februari 2026", text: "Classic charm. Great location on Via Nazionale for shopping." },
    ],
    houseRules: ["Anak di bawah 12 menginap gratis di ranjang induk", "Room service 07:00–23:00"],
    policies: { cancellation: "Gratis 48 jam", pets: "Tidak", smoking: "Bar area luar saja" },
    checkIn: "14:00",
    checkOut: "11:00",
    instantBook: false,
    cleaningFee: 28,
    serviceFee: 20,
  },
  {
    id: "hotel-la-pergola",
    osmName: "Hotel La Pergola",
    title: "Penginapan hijau di utara Roma",
    type: "hotel",
    lat: 41.9458706,
    lng: 12.5230584,
    neighborhood: "Cassia · Monte Mario",
    address: "Via Cassia 1216, 00189 Roma RM, Italia",
    phone: "+39 06 3089 1200",
    email: "info@hotellapergolaroma.it",
    pricePerNight: 112,
    currency: "EUR",
    rating: 4.71,
    reviewCount: 98,
    images: [
      hotelImg("hotel-la-pergola-2.jpg", "Kamar dengan balkon menghadap taman & pergola rindang"),
      hotelImg("hotel-la-pergola-3.jpg", "Interior kamar keluarga yang luas"),
      hotelImg("hotel-la-pergola-4.jpg", "Kamar nyaman dengan ranjang besar"),
      hotelImg("hotel-la-pergola-5.jpg", "Suasana santai di utara Roma"),
    ],
    host: { name: "Antonio P.", superhost: false, yearsHosting: 5, bio: "Pengusaha lokal — hotel ramah keluarga dengan taman dan parkir luas." },
    guests: 3,
    bedrooms: 1,
    beds: 2,
    baths: 1,
    amenities: ["WiFi", "AC", "Parkir gratis", "Teras taman", "Sarapan", "Kolam (musim panas)", "Area BBQ"],
    description: "Suasana santai di utara Roma dengan parkir & taman.",
    longDescription:
      "La Pergola ideal untuk tamu berkendara atau menginap lebih lama. Taman seluas 2000 m² dengan pergola rindang, kolam kecil di musim panas, dan area BBQ. Parkir privat gratis. Sarapan tradisional Italia dengan pastry segar. Akses cepat ke Vatican via bus dan jalan Cassia.",
    highlights: ["Parkir gratis", "Taman besar", "Kolam musim panas", "Nilai terbaik keluarga"],
    rooms: [
      {
        name: "Garden Double",
        beds: "1 queen",
        size: "19 m²",
        pricePerNight: 102,
        image: roomImg("hotel-la-pergola-2.jpg"),
        features: ["Balkon", "View taman"],
      },
      {
        name: "Family Room",
        beds: "1 queen + 1 twin",
        size: "26 m²",
        pricePerNight: 112,
        image: roomImg("hotel-la-pergola-3.jpg"),
        features: ["3-4 tamu", "Meja makan"],
      },
    ],
    nearby: [
      { name: "Monte Mario viewpoint", distance: "2 km", walkMin: 25 },
      { name: "Vatican (mobil)", distance: "4 km", walkMin: 12 },
    ],
    reviews: [
      { author: "Rudi S.", rating: 5, date: "April 2026", text: "Parkir luas, anak bisa main di taman. Harga sangat worth untuk Roma." },
    ],
    houseRules: ["Kolam buka Juni–September", "BBQ booking di resepsionis"],
    policies: { cancellation: "Gratis 24 jam", pets: "Anjing besar OK di taman", smoking: "Area taman saja" },
    checkIn: "13:00",
    checkOut: "10:00",
    instantBook: true,
    cleaningFee: 22,
    serviceFee: 12,
  },
  {
    id: "trastevere-loft",
    osmName: "Trastevere Loft",
    title: "Loft artistik di Trastevere",
    type: "apartment",
    lat: 41.8892,
    lng: 12.4698,
    neighborhood: "Trastevere",
    address: "Via della Scala 52, 00153 Roma RM, Italia",
    phone: "+39 333 882 4410",
    email: "sofia@trastevereloft.it",
    pricePerNight: 134,
    currency: "EUR",
    rating: 4.93,
    reviewCount: 341,
    images: [
      hotelImg("trastevere-2.jpg", "Loft artistik dengan bata ekspos & plafon tinggi di Trastevere"),
      hotelImg("trastevere-1.jpg", "Loft terbuka dengan ruang tamu luas"),
      hotelImg("trastevere-3.jpg", "Interior artistik & furnitur vintage"),
      hotelImg("trastevere-4.jpg", "Sudut kerja & dekorasi dinding"),
      hotelImg("trastevere-5.jpg", "Kamar mandi modern dengan shower"),
      hotelImg("trastevere-6.jpg", "Kamar tidur nyaman di Trastevere"),
    ],
    host: {
      name: "Sofia T.",
      superhost: true,
      yearsHosting: 7,
      bio: "Seniman & host lokal — tinggal di sebelah dan siap berbagi tips trattoria terbaik.",
    },
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ["WiFi", "AC", "Dapur", "Balkon", "Mesin cuci", "Guidebook lokal", "Sepeda sewa"],
    description: "Loft bohemian di jalan batu Trastevere dengan balkon privat.",
    longDescription:
      "Trastevere Loft adalah ruang kreatif di distrik paling autentik Roma. Plafon tinggi, bata ekspos, dan karya seni Sofia sendiri. Balkon kecil untuk espresso pagi sambil melihat kehidupan jalanan. Panduan PDF berisi 20 trattoria favorit, market minggu, dan walking tour Graffiti. Sepeda dapat disewa untuk eksplorasi tepi Sungai Tiber.",
    highlights: ["Trastevere autentik", "Balkon privat", "Guide kuliner", "Sepeda tersedia"],
    rooms: [
      {
        name: "Artist Loft (full unit)",
        beds: "1 queen mezzanine",
        size: "48 m²",
        pricePerNight: 134,
        image: roomImg("trastevere-1.jpg"),
        features: ["Loft", "Balkon", "Dapur", "Mezzanine"],
      },
    ],
    nearby: [
      { name: "Piazza di Santa Maria", distance: "200 m", walkMin: 3 },
      { name: "Tiber River", distance: "350 m", walkMin: 5 },
      { name: "Colosseum", distance: "2.5 km", walkMin: 30 },
    ],
    reviews: [
      { author: "Maya L.", rating: 5, date: "April 2026", text: "Trastevere malam hari dari balkon ini = magic. Sofia's food tips semua spot on!" },
      { author: "Kevin O.", rating: 5, date: "Maret 2026", text: "Most authentic stay in Rome. Loft is beautiful, neighborhood is alive at night." },
      { author: "Putri A.", rating: 5, date: "Februari 2026", text: "Foto-fotonya tidak bohong. Balkon kecil tapi unforgettable. Highly recommend." },
    ],
    houseRules: ["Maks 2 tamu", "Sepeda kembali sebelum 20:00", "Jangan bunyi di balkon setelah 23:00"],
    policies: { cancellation: "Gratis 3 hari", pets: "Tidak", smoking: "Balkon saja" },
    checkIn: "16:00",
    checkOut: "10:00",
    instantBook: true,
    cleaningFee: 32,
    serviceFee: 18,
  },
];

export function findListingByOsmName(name: string | null | undefined): HotelListing | undefined {
  if (!name) return undefined;
  const norm = name.trim().toLowerCase();
  return HOTEL_LISTINGS.find((h) => h.osmName.toLowerCase() === norm);
}

export function getListingImageUrl(listing: HotelListing, index = 0): string {
  return listing.images[index]?.url ?? listing.images[0]?.url ?? "";
}

export function formatPrice(listing: HotelListing, nights = 1): string {
  const total = listing.pricePerNight * nights + listing.cleaningFee + listing.serviceFee;
  return `€${listing.pricePerNight} / malam · €${total} total (${nights} malam)`;
}

export function estimateTotal(listing: HotelListing, nights: number): number {
  return listing.pricePerNight * nights + listing.cleaningFee + listing.serviceFee;
}
