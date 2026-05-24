// ============================================================
// restaurantListings.ts — Daftar restauran ikonik di Roma
// ============================================================

export type CuisineType =
  | "italian"
  | "roman"
  | "pizza"
  | "seafood"
  | "trattoria"
  | "osteria"
  | "fine_dining";

export const CUISINE_TYPE_LABELS: Record<CuisineType, string> = {
  italian: "Italia",
  roman: "Masakan Roma",
  pizza: "Pizza",
  seafood: "Seafood",
  trattoria: "Trattoria",
  osteria: "Osteria",
  fine_dining: "Fine Dining",
};

export interface RestaurantReview {
  author: string;
  date: string;
  rating: number;
  text: string;
}

export interface RestaurantDish {
  name: string;
  description: string;
  price: string;
  image: string;
}

export interface RestaurantListing {
  id: string;
  title: string;
  osmName: string;
  cuisine: CuisineType;
  rating: number;
  reviewCount: number;
  priceRange: "€" | "€€" | "€€€" | "€€€€";
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  phone: string;
  website?: string;
  openingHours: string;
  description: string;
  longDescription: string;
  highlights: string[];
  images: { url: string; caption: string }[];
  signatureDishes: RestaurantDish[];
  reviews: RestaurantReview[];
  founded: number;
  michelin?: string;
  tags: string[];
}

export const RESTAURANT_LISTINGS: RestaurantListing[] = [
  {
    id: "rst-001",
    title: "La Pergola",
    osmName: "La Pergola",
    cuisine: "fine_dining",
    rating: 4.97,
    reviewCount: 2841,
    priceRange: "€€€€",
    address: "Via Alberto Cadlolo, 101, 00136 Roma",
    neighborhood: "Monte Mario",
    lat: 41.9177,
    lng: 12.4397,
    phone: "+39 06 35092152",
    website: "www.romecavalieri.com/lapergola",
    openingHours: "Selasa–Sabtu: 19:30–00:00",
    description:
      "Satu-satunya restoran berbintang tiga Michelin di Roma, berdiri megah di puncak bukit Monte Mario dengan panorama kota Roma yang tak tertandingi.",
    longDescription:
      "La Pergola adalah mahkota kuliner Roma — restoran fine dining milik Chef Heinz Beck yang telah meraih tiga bintang Michelin selama lebih dari dua dekade. Terletak di Roma Cavalieri Waldorf Astoria, setiap meja menawarkan pemandangan 180° kota Abadi di malam hari. Dengan wine cellar berisi lebih dari 53.000 botol dan menu yang menggabungkan tradisi Italia dengan teknik modern terdepan, La Pergola adalah pengalaman kuliner yang melampaui sekadar makan malam.",
    highlights: [
      "Tiga bintang Michelin — tertinggi di Roma",
      "Pemandangan panoramik kota Roma 180°",
      "Wine cellar dengan 53.000+ koleksi botol",
      "Chef Heinz Beck — legenda kuliner Italia",
      "Reservasi wajib jauh-jauh hari",
    ],
    founded: 1994,
    michelin: "★★★ Michelin",
    tags: ["Fine Dining", "Michelin", "Panoramik", "Romantis", "Wine"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
        caption: "Ruang makan elegan dengan pemandangan Roma",
      },
      {
        url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80",
        caption: "Hidangan tanda tangan Chef Heinz Beck",
      },
      {
        url: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80",
        caption: "Wine cellar eksklusif La Pergola",
      },
      {
        url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
        caption: "Pemandangan malam kota Roma dari La Pergola",
      },
    ],
    signatureDishes: [
      {
        name: "Tortelli di Ricotta e Spinaci",
        description:
          "Pasta tortelli isian ricotta dan bayam segar dengan mentega truffle putih dan parmesan aged 36 bulan.",
        price: "€65",
        image:
          "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80",
      },
      {
        name: "Maialino Romano",
        description:
          "Babi susu panggang ala Roma dengan kulit renyah sempurna, disajikan bersama kentang rosemary dan salsa verde.",
        price: "€85",
        image:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
      },
      {
        name: "Spaghetti all'Astice",
        description:
          "Spaghetti with lobster Mediterania segar dalam saus tomat San Marzano dan minyak zaitun extra virgin.",
        price: "€78",
        image:
          "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80",
      },
    ],
    reviews: [
      {
        author: "Alessandro R.",
        date: "April 2025",
        rating: 5,
        text: "Pengalaman yang benar-benar tak terlupakan. Pemandangan Roma di malam hari sambil menikmati hidangan Chef Beck — luar biasa. Layanan sempurna dari awal hingga akhir.",
      },
      {
        author: "Sophie M.",
        date: "Maret 2025",
        rating: 5,
        text: "Tiga bintang Michelin yang sungguh layak. Setiap detail terperhatikan — dari crystal glassware hingga sommelier yang luar biasa berpengetahuan.",
      },
      {
        author: "Marco T.",
        date: "Februari 2025",
        rating: 5,
        text: "Kami merayakan ulang tahun pernikahan di sini dan menjadi malam yang paling berkesan. Semua hidangan masterpiece.",
      },
    ],
  },

  {
    id: "rst-002",
    title: "Roscioli Ristorante Salumeria",
    osmName: "Roscioli",
    cuisine: "roman",
    rating: 4.82,
    reviewCount: 4215,
    priceRange: "€€€",
    address: "Via dei Giubbonari, 21, 00186 Roma",
    neighborhood: "Campo de' Fiori",
    lat: 41.8945,
    lng: 12.4726,
    phone: "+39 06 6875287",
    website: "www.salumeriaroscioli.com",
    openingHours: "Senin–Sabtu: 12:30–16:00 & 19:30–00:00",
    description:
      "Institusi kuliner Roma yang unik — gabungan delicatessen premium, enoteca bergengsi, dan restoran masakan Roman tradisional dalam satu atap bersejarah.",
    longDescription:
      "Roscioli adalah lebih dari sekadar restoran — ini adalah kuil daging, keju, dan wine terbaik Italia. Didirikan oleh keluarga Roscioli yang juga memiliki toko roti terkemuka di Roma, restoran ini menggabungkan salumeria (deli) autentik dengan ruang makan bergaya yang intim. Rak-rak kayu dipenuhi keju artisanal dari seluruh Italia, prosciutto Parma dan San Daniele tergantung di langit-langit, dan daftar wine mencakup lebih dari 2.800 label pilihan.",
    highlights: [
      "Gabungan delicatessen + restoran + enoteca",
      "Pasta Cacio e Pepe terbaik versi banyak food critic",
      "Wine list 2.800+ label pilihan sommelier",
      "Keju artisanal dari seluruh Italia",
      "Dekat Campo de' Fiori",
    ],
    founded: 1972,
    tags: ["Tradisional", "Wine", "Pasta", "Keju", "Ikonik"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
        caption: "Interior Roscioli dengan rak wine dan salumi",
      },
      {
        url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
        caption: "Cacio e Pepe autentik ala Roscioli",
      },
      {
        url: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80",
        caption: "Koleksi keju artisanal pilihan",
      },
      {
        url: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800&q=80",
        caption: "Charcuterie board premium Roscioli",
      },
    ],
    signatureDishes: [
      {
        name: "Cacio e Pepe",
        description:
          "Pasta tonnarelli dengan keju pecorino romano DOP dan pepe nero yang dipanggang sempurna — resep turun-temurun keluarga Roscioli.",
        price: "€22",
        image:
          "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80",
      },
      {
        name: "Amatriciana Classica",
        description:
          "Rigatoni dengan guanciale babi pipi, tomat Pachino, pecorino romano, dan sedikit peperoncino — resep autentik.",
        price: "€20",
        image:
          "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&q=80",
      },
      {
        name: "Tagliere di Salumi e Formaggi",
        description:
          "Papan charcuterie premium: prosciutto di Parma 24 bulan, salame Napoli, mortadella Bologna, dan 5 jenis keju artisanal.",
        price: "€38",
        image:
          "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80",
      },
    ],
    reviews: [
      {
        author: "Giulia B.",
        date: "April 2025",
        rating: 5,
        text: "Cacio e Pepe terbaik yang pernah saya makan di Roma! Suasana autentik, staf sangat ramah dan berpengetahuan soal wine.",
      },
      {
        author: "David K.",
        date: "Maret 2025",
        rating: 5,
        text: "Tempat yang benar-benar unik — bagian toko deli di depan dan ruang makan di belakang. Wine list luar biasa. Wajib dikunjungi!",
      },
      {
        author: "Elena V.",
        date: "Februari 2025",
        rating: 4,
        text: "Pasta yang fantastis dan suasana yang hangat. Cukup ramai di malam hari jadi sebaiknya reservasi terlebih dahulu.",
      },
    ],
  },

  {
    id: "rst-003",
    title: "Pizzarium Bonci",
    osmName: "Pizzarium",
    cuisine: "pizza",
    rating: 4.79,
    reviewCount: 8743,
    priceRange: "€",
    address: "Via della Meloria, 43, 00136 Roma",
    neighborhood: "Prati / Vatikan",
    lat: 41.9073,
    lng: 12.4514,
    phone: "+39 06 39745416",
    openingHours: "Setiap hari: 11:00–22:00",
    description:
      "Pizza al taglio revolusioner dari Gabriele Bonci — 'Michelangelo of pizza' versi majalah Time. Topping artistik dan adonan fermentasi 72 jam yang mengubah pizza menjadi seni.",
    longDescription:
      "Gabriele Bonci mengubah konsep pizza al taglio (pizza potongan) menjadi sebuah gerakan kuliner. Adonannya difermentasi selama 72 jam dengan tepung organik pilihan, menghasilkan tekstur yang ringan, berongga, dan renyah sempurna. Topping berubah setiap hari mengikuti musim: truffle di musim gugur, bunga zucchini di musim panas, dan figs dengan gorgonzola di musim gugur. Tempat kecil ini selalu ramai dengan antrian panjang — tanda kesempurnaan yang tak terbantahkan.",
    highlights: [
      "Disebut 'Michelangelo of Pizza' oleh Time Magazine",
      "Adonan fermentasi 72 jam dengan tepung organik",
      "Topping berganti setiap hari sesuai musim",
      "Harga terjangkau mulai €4/etto",
      "Dekat Musei Vaticani",
    ],
    founded: 2003,
    tags: ["Pizza", "Al Taglio", "Street Food", "Dekat Vatikan", "Antrian"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
        caption: "Pizza al taglio beraneka ragam topping di Pizzarium",
      },
      {
        url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
        caption: "Adonan Bonci — ringan, berongga, sempurna",
      },
      {
        url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
        caption: "Topping musiman pilihan Gabriele Bonci",
      },
    ],
    signatureDishes: [
      {
        name: "Pizza Patate e Rosmarino",
        description:
          "Pizza kentang tipis dengan rosemary segar, minyak zaitun extra virgin, dan fleur de sel — kesederhanaan yang sempurna.",
        price: "€5/etto",
        image:
          "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&q=80",
      },
      {
        name: "Pizza Fiori di Zucca",
        description:
          "Pizza dengan bunga zucchini segar, ricotta cremosa, dan anchovy Mediterania — musiman dan tak tertandingi.",
        price: "€6/etto",
        image:
          "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&q=80",
      },
    ],
    reviews: [
      {
        author: "James W.",
        date: "April 2025",
        rating: 5,
        text: "Pizza terbaik dalam hidup saya. Antriannya panjang tapi sangat layak. Bonci adalah jenius pizza!",
      },
      {
        author: "Mei L.",
        date: "Maret 2025",
        rating: 5,
        text: "Datang setelah mengunjungi Vatikan — keputusan terbaik! Pizza ringan dan lezat, harga sangat terjangkau.",
      },
      {
        author: "Carla S.",
        date: "Februari 2025",
        rating: 4,
        text: "Antrian bisa panjang tapi bergerak cepat. Topping hari itu sungguh kreatif. Wajib coba!",
      },
    ],
  },

  {
    id: "rst-004",
    title: "Da Enzo al 29",
    osmName: "Da Enzo al 29",
    cuisine: "trattoria",
    rating: 4.74,
    reviewCount: 6328,
    priceRange: "€€",
    address: "Via dei Vascellari, 29, 00153 Roma",
    neighborhood: "Trastevere",
    lat: 41.888,
    lng: 12.4706,
    phone: "+39 06 5812260",
    openingHours: "Senin–Sabtu: 12:30–15:00 & 19:30–23:00",
    description:
      "Trattoria autentik di jantung Trastevere yang telah melayani warga Roma selama puluhan tahun dengan hidangan Roman tradisional yang dibuat dari resep turun-temurun.",
    longDescription:
      "Da Enzo al 29 adalah definisi trattoria Roman sejati — tanpa tipu-tipu, tanpa bintang Michelin, hanya masakan rumahan yang jujur dan lezat. Terletak di kawasan Trastevere yang romantis, restoran ini tetap setia pada resep tradisional selama dekade-dekade. Menu hariannya ditulis tangan di papan tulis sesuai ketersediaan bahan segar. Atmosfernya hangat, penuh canda para pelayan senior yang sudah bekerja di sini bertahun-tahun.",
    highlights: [
      "Trattoria autentik di Trastevere",
      "Menu harian ditulis tangan sesuai bahan segar",
      "Carciofi alla Romana legendaris",
      "Pelayan senior yang berpengalaman puluhan tahun",
      "Favorit warga lokal Roma",
    ],
    founded: 1963,
    tags: ["Trattoria", "Autentik", "Trastevere", "Lokal", "Tradisional"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
        caption: "Interior hangat Da Enzo al 29",
      },
      {
        url: "https://images.unsplash.com/photo-1551183053-bf91798d792c?w=800&q=80",
        caption: "Carciofi alla Romana — artichoke panggang khas Roma",
      },
      {
        url: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&q=80",
        caption: "Jalan Trastevere di malam hari",
      },
    ],
    signatureDishes: [
      {
        name: "Carciofi alla Romana",
        description:
          "Artichoke dipanggang dengan mentah putih, menta segar, dan prezzemolo — hidangan khas Roma yang melegenda.",
        price: "€12",
        image:
          "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80",
      },
      {
        name: "Rigatoni alla Gricia",
        description:
          "Pasta rigatoni dengan guanciale (babi pipi kering), pecorino romano, dan lada hitam — leluhur dari pasta Amatriciana.",
        price: "€16",
        image:
          "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80",
      },
      {
        name: "Trippa alla Romana",
        description:
          "Babat sapi dimasak perlahan dalam saus tomat mint dan pecorino — hidangan otentik yang hanya ada di trattoria sesungguhnya.",
        price: "€14",
        image:
          "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80",
      },
    ],
    reviews: [
      {
        author: "Roberto F.",
        date: "April 2025",
        rating: 5,
        text: "Ini adalah Roma yang sesungguhnya! Tidak ada basa-basi untuk turis, hanya masakan rumahan yang luar biasa dan suasana yang hangat.",
      },
      {
        author: "Anna M.",
        date: "Maret 2025",
        rating: 5,
        text: "Carciofi alla Romana-nya adalah yang terbaik di kota ini. Pelayan seniornya ramah dan lucu. Akan kembali lagi!",
      },
      {
        author: "Tom B.",
        date: "Februari 2025",
        rating: 4,
        text: "Tempat kecil dan selalu penuh. Datanglah tepat waktu saat buka atau siap antri. Makanannya worth it!",
      },
    ],
  },

  {
    id: "rst-005",
    title: "Il Sorpasso",
    osmName: "Il Sorpasso",
    cuisine: "osteria",
    rating: 4.68,
    reviewCount: 3892,
    priceRange: "€€",
    address: "Via Properzio, 31, 00193 Roma",
    neighborhood: "Prati",
    lat: 41.9024,
    lng: 12.464,
    phone: "+39 06 89020554",
    website: "www.ilsorpassoroma.it",
    openingHours: "Setiap hari: 08:00–02:00",
    description:
      "Osteria modern bergaya vintage yang buka dari pagi hingga dini hari — tempat sempurna untuk sarapan, apéritivo, makan siang, makan malam, dan segalanya di tengah Prati.",
    longDescription:
      "Il Sorpasso adalah institusi modern di kawasan Prati yang membuktikan bahwa osteria Romawi bisa hadir dalam format kontemporer tanpa kehilangan jiwanya. Dengan interior bergaya years '60s-'70s Italia, tempat ini menjadi favorit warga setempat dari pagi (untuk cappuccino dan cornetto) hingga larut malam (untuk wine dan cicchetti). Menu berputar mengikuti musim dan pasar Campo de' Fiori.",
    highlights: [
      "Buka 18 jam sehari — dari pagi hingga dini hari",
      "Interior vintage bergaya tahun 60-an Italia",
      "Apéritivo terbaik di kawasan Prati",
      "Dekat Piazza Navona dan Castel Sant'Angelo",
      "Menu musiman dari pasar Campo de' Fiori",
    ],
    founded: 2011,
    tags: ["Osteria", "Aperitivo", "Vintage", "Prati", "Fleksibel"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80",
        caption: "Interior bergaya vintage Il Sorpasso",
      },
      {
        url: "https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=800&q=80",
        caption: "Apéritivo dan cicchetti pilihan",
      },
      {
        url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
        caption: "Koleksi wine dan Negroni pilihan",
      },
    ],
    signatureDishes: [
      {
        name: "Supplì al Telefono",
        description:
          "Kroket nasi goreng dengan mozzarella leleh di dalam — Street food Roma klasik yang ditarik seperti 'telepon' saat digigit.",
        price: "€3.50",
        image:
          "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&q=80",
      },
      {
        name: "Carbonara Tradizionale",
        description:
          "Spaghetti dengan guanciale crispy, tuning kuning telur segar, pecorino romano, dan pepe nero — resep paling autentik.",
        price: "€18",
        image:
          "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80",
      },
    ],
    reviews: [
      {
        author: "Lorenzo C.",
        date: "April 2025",
        rating: 5,
        text: "Tempat favorit di Roma untuk apéritivo! Negroni mereka sempurna dan cicchetti-nya lezat. Atmosfer sangat nyaman.",
      },
      {
        author: "Sarah J.",
        date: "Maret 2025",
        rating: 4,
        text: "Sangat fleksibel — bisa untuk sarapan atau makan malam larut. Pasta carbonara mereka adalah salah satu terbaik.",
      },
    ],
  },

  {
    id: "rst-006",
    title: "Checchino dal 1887",
    osmName: "Checchino dal 1887",
    cuisine: "roman",
    rating: 4.71,
    reviewCount: 2156,
    priceRange: "€€€",
    address: "Via di Monte Testaccio, 30, 00153 Roma",
    neighborhood: "Testaccio",
    lat: 41.8792,
    lng: 12.4774,
    phone: "+39 06 5746318",
    website: "www.checchino-dal-1887.com",
    openingHours: "Selasa–Sabtu: 12:30–15:00 & 19:30–23:30",
    description:
      "Restoran bersejarah di Testaccio sejak 1887 yang terkenal dengan masakan 'quinto quarto' — tradisi kuliner unik Roma dari jeroan dan bagian hewan yang tak biasa.",
    longDescription:
      "Checchino dal 1887 adalah museum kuliner hidup. Terletak di Testaccio, kawasan yang dahulu merupakan pusat slaughterhouse Roma, restoran ini mewarisi tradisi 'quinto quarto' (bagian kelima dari hewan) yang unik untuk Roma. Para tukang jagal dahulu dibayar dengan jeroan dan bagian yang tidak dijual di pasar, dan dari sinilah lahir hidangan-hidangan khas Roma yang kini menjadi ikon. Ruang bawah tanah restoran ini dibuat langsung dari Monte Testaccio — bukit yang terbentuk dari jutaan amphora Romawi kuno.",
    highlights: [
      "Berdiri sejak 1887 — lebih dari 5 generasi",
      "Dibangun di dalam Monte Testaccio (bukit amphora Romawi)",
      "Spesialis 'quinto quarto' — masakan jeroan tradisional Roma",
      "Wine cellar bersejarah di dalam bukit",
      "Kuliner bersejarah wajib dicoba",
    ],
    founded: 1887,
    tags: ["Bersejarah", "Quinto Quarto", "Testaccio", "Tradisional", "Unik"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
        caption: "Ruang makan bersejarah Checchino",
      },
      {
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
        caption: "Interior klasik tahun 1887",
      },
      {
        url: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80",
        caption: "Monte Testaccio — bukit amphora Romawi",
      },
    ],
    signatureDishes: [
      {
        name: "Coda alla Vaccinara",
        description:
          "Ekor sapi dibraised perlahan selama 5+ jam dengan tomat, seledri, kismis, dan pignoli — hidangan ikonik Testaccio.",
        price: "€28",
        image:
          "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80",
      },
      {
        name: "Rigatoni con Pajata",
        description:
          "Pasta rigatoni dengan usus anak sapi muda yang dimasak dalam tomat — hidangan paling ikonik dan berani di Roma.",
        price: "€24",
        image:
          "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80",
      },
      {
        name: "Carciofi alla Giudia",
        description:
          "Artichoke digoreng dalam minyak zaitun panas hingga mekar seperti bunga — resep tradisional komunitas Yahudi Roma.",
        price: "€14",
        image:
          "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80",
      },
    ],
    reviews: [
      {
        author: "Francesca P.",
        date: "April 2025",
        rating: 5,
        text: "Pengalaman kuliner Roma yang paling autentik! Coda alla Vaccinara mereka adalah karya seni. Sejarahnya menambah kedalaman pengalaman.",
      },
      {
        author: "Michael H.",
        date: "Maret 2025",
        rating: 4,
        text: "Bukan untuk yang baru pertama kali mencoba masakan Roma, tapi jika Anda siap berpetualang, ini adalah yang terbaik.",
      },
    ],
  },
];

export type RestaurantSortKey = "rating" | "price_asc" | "price_desc" | "reviews";
