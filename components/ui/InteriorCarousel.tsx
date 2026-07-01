"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  {
    // Verified: 3D render of 1BHK Indian apartment — earthy tones, open plan (photo by Poojan Thanekar)
    src: "https://images.unsplash.com/photo-1745429523617-0d837856ca35?w=900&q=85",
    alt: "Modern Indian apartment living room 3D render",
  },
  {
    // Verified: Contemporary New Delhi kitchen — monochromatic cabinets, ceiling fan, India (photo KAXJqMoe8OI)
    src: "https://images.unsplash.com/photo-1682662045815-9016c6225dd3?w=900&q=85",
    alt: "Premium modular kitchen — New Delhi apartment",
  },
  {
    // Verified: Modern minimal bedroom — white bed near window, neutral warm tones, Berlin apartment (photo ABohRftG_Os)
    src: "https://images.unsplash.com/photo-1585128792103-0b591f96512e?w=900&q=85",
    alt: "Elegant minimal master bedroom",
  },
  {
    // Verified: Compact balcony with chair, potted plants, wooden shelf — apartment scale (photo dIfDLRiv75g)
    src: "https://images.unsplash.com/photo-1763741208003-cb6968d343fa?w=900&q=85",
    alt: "Compact Bangalore apartment balcony with garden seating",
  },
  {
    // Verified: Warm living room — brown sofa, natural light, wood tones (photo 4_jQL4JCS98 by Collov Home Design)
    src: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=900&q=85",
    alt: "Modern warm living and dining space",
  },
];

export default function InteriorCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-[28px] overflow-hidden shadow-[0_40px_100px_-15px_rgba(46,27,14,0.4)]">
      {images.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={i === 0}
          />
          {/* Subtle warm overlay so it blends with the site palette */}
          <div className="absolute inset-0 bg-warm-brown/10" />
        </div>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-5 h-2 bg-ivory"
                : "w-2 h-2 bg-ivory/40 hover:bg-ivory/70"
            }`}
          />
        ))}
      </div>

      {/* Corner accents */}
      <div className="absolute top-4 left-4 w-7 h-7 border-t border-l border-ivory/50 z-10 pointer-events-none" />
      <div className="absolute top-4 right-4 w-7 h-7 border-t border-r border-ivory/50 z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-4 w-7 h-7 border-b border-l border-ivory/50 z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-4 w-7 h-7 border-b border-r border-ivory/50 z-10 pointer-events-none" />
    </div>
  );
}
