"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";

// Full-bleed background slideshow that crossfades through a list of images.
// Meant to sit behind foreground content inside a `relative` container —
// render this first, then an overlay tint, then the actual content on top.
export default function BackgroundSlideshow({
  images,
  intervalMs = 4000,
}: {
  images: string[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <>
      {images.map((src, i) => (
        <NextImage
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1500ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}
