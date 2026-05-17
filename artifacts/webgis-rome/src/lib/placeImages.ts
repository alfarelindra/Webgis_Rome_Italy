import type { LayerKey } from "@/components/LayerControl";
import { findAttractionByOsmName } from "@/lib/attractionListings";
import { findListingByOsmName } from "@/lib/hotelListings";
import placeImageIndex from "@/data/placeImageIndex.json";

export interface PlaceImage {
  url: string;
  alt: string;
  source: "listing" | "dataset" | "type" | "category";
}

type IndexEntry = { file: string; caption?: string; via?: string };

const index = placeImageIndex as Record<string, IndexEntry>;

const base = () => `${import.meta.env.BASE_URL}places/`;
const named = (file: string) => `${base()}named/${file}`;
const img = (file: string) => `${base()}${file}`;

export const PLACE_IMAGE_FALLBACK = img("fallback.jpg");

/** Normalisasi nama OSM untuk lookup dataset */
export function normalizePlaceKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['`´]/g, "'")
    .replace(/\s+/g, " ");
}

const TYPE_IMAGES: Record<string, string> = {
  "amenity:restaurant": "amenity-restaurant.jpg",
  "amenity:cafe": "amenity-cafe.jpg",
  "amenity:fast_food": "amenity-fast_food.jpg",
  "amenity:bar": "amenity-bar.jpg",
  "amenity:pub": "amenity-pub.jpg",
  "amenity:ice_cream": "amenity-ice_cream.jpg",
  "amenity:pizza": "amenity-pizza.jpg",
  "amenity:bakery": "amenity-bakery.jpg",
  "amenity:place_of_worship": "amenity-place_of_worship.jpg",
  "amenity:church": "amenity-place_of_worship.jpg",
  "amenity:pharmacy": "amenity-pharmacy.jpg",
  "amenity:fountain": "amenity-fountain.jpg",
  "amenity:marketplace": "amenity-marketplace.jpg",
  "amenity:supermarket": "amenity-supermarket.jpg",
  "amenity:bank": "amenity-bank.jpg",
  "amenity:atm": "amenity-atm.jpg",
  "amenity:theatre": "amenity-theatre.jpg",
  "amenity:cinema": "amenity-cinema.jpg",
  "amenity:nightclub": "amenity-nightclub.jpg",
  "amenity:drinking_water": "amenity-fountain.jpg",
  "tourism:hotel": "tourism-hotel.jpg",
  "tourism:hostel": "tourism-hostel.jpg",
  "tourism:guest_house": "tourism-hotel.jpg",
  "tourism:museum": "tourism-museum.jpg",
  "tourism:gallery": "tourism-gallery.jpg",
  "tourism:attraction": "tourism-attraction.jpg",
  "tourism:viewpoint": "tourism-viewpoint.jpg",
  "tourism:artwork": "tourism-artwork.jpg",
  "tourism:information": "tourism-information.jpg",
  "railway:station": "railway-station.jpg",
  "railway:subway_entrance": "railway-subway.jpg",
  "railway:tram_stop": "railway-tram.jpg",
  "railway:bus_stop": "railway-bus.jpg",
  "railway:stop": "railway-bus.jpg",
  "historic:monument": "historic-monument.jpg",
  "historic:ruins": "historic-ruins.jpg",
  "leisure:park": "leisure-park.jpg",
  "shop:souvenirs": "shop-souvenirs.jpg",
};

const CATEGORY_IMAGES: Record<LayerKey | "default", string> = {
  tourism: "category-tourism.jpg",
  railway: "category-railway.jpg",
  amenity: "category-amenity.jpg",
  default: "fallback.jpg",
};

type OSMProps = Record<string, string | number | null | undefined>;

function getTypeKey(props: OSMProps): string | null {
  if (props.amenity) return `amenity:${props.amenity}`;
  if (props.tourism) return `tourism:${props.tourism}`;
  if (props.railway) return `railway:${props.railway}`;
  if (props.historic) return `historic:${props.historic}`;
  if (props.leisure) return `leisure:${props.leisure}`;
  if (props.shop) return `shop:${props.shop}`;
  if (props.highway) return `highway:${props.highway}`;
  return null;
}

function lookupDataset(name: string | null): PlaceImage | null {
  if (!name) return null;
  const key = normalizePlaceKey(name);

  const exact = index[key];
  if (exact?.file) {
    return {
      url: named(exact.file),
      alt: exact.caption ?? name,
      source: "dataset",
    };
  }

  const fuzzy = Object.entries(index).find(
    ([k]) => k === key || key.includes(k) || k.includes(key)
  );
  if (fuzzy?.[1]?.file) {
    return {
      url: named(fuzzy[1].file),
      alt: fuzzy[1].caption ?? name,
      source: "dataset",
    };
  }

  return null;
}

export function getPlaceImage(
  props: OSMProps,
  category: LayerKey | null,
  placeName?: string | null
): PlaceImage | null {
  const name = placeName ?? (props.name != null ? String(props.name) : null);

  const attraction = findAttractionByOsmName(name);
  if (attraction?.images[0]) {
    return {
      url: attraction.images[0].url,
      alt: attraction.images[0].caption,
      source: "listing",
    };
  }

  const hotel = findListingByOsmName(name);
  if (hotel?.images[0]) {
    return {
      url: hotel.images[0].url,
      alt: hotel.title,
      source: "listing",
    };
  }

  const fromDataset = lookupDataset(name);
  if (fromDataset) return fromDataset;

  const typeKey = getTypeKey(props);
  if (typeKey && TYPE_IMAGES[typeKey]) {
    return {
      url: img(TYPE_IMAGES[typeKey]),
      alt: name ?? typeKey.replace(":", " — "),
      source: "type",
    };
  }

  const cat = category ?? "default";
  const catFile = CATEGORY_IMAGES[cat] ?? CATEGORY_IMAGES.default;
  return {
    url: img(catFile),
    alt: name ?? "Lokasi di Roma",
    source: "category",
  };
}

export function getDatasetPlaceCount(): number {
  return Object.keys(index).length;
}
