import { useEffect, useState } from "react";
import { HOTEL_IMAGE_FALLBACK } from "@/lib/hotelListings";

interface HotelImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export default function HotelImage({ src, alt, className = "", fallback = HOTEL_IMAGE_FALLBACK }: HotelImageProps) {
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
