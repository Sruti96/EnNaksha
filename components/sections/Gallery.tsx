"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

// Real project photos, self-hosted under /public/gallery (one folder per
// project). Each project renders as a single card that cycles through its
// own photos rather than one tile per photo.
const PROJECTS = [
  { label: "Uber Verdant | Sarjapur Road", folder: "uber-verdant-sarjapur-road", count: 8, ext: "png" },
  { label: "Amrutha Platinum | Whitefield", folder: "amrutha-platinum-whitefield", count: 13, ext: "jpg" },
].map((p) => ({
  label: p.label,
  photos: Array.from({ length: p.count }, (_, i) => `/gallery/${p.folder}/photo-${String(i + 1).padStart(2, "0")}.${p.ext}`),
}));

const ROTATE_MS = 3500;

function ProjectCard({ label, photos }: { label: string; photos: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [photos.length]);

  return (
    <AnimatedSection className="break-inside-avoid">
      <div className="relative group rounded-xl overflow-hidden h-[440px] cursor-pointer bg-sand">
        {photos.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${label} — photo ${i + 1}`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            priority={i === 0}
            className={`object-cover transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-charcoal/70 text-ivory text-[13px] font-inter font-semibold px-3 py-1.5 rounded-full">
            {label}
          </span>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              aria-label={`Show photo ${i + 1} of ${label}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-ivory" : "w-1.5 bg-ivory/50"
              }`}
            />
          ))}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/50 transition-all duration-300 flex items-center justify-center">
          <span className="text-ivory font-inter font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-ivory px-6 py-3 rounded-xl">
            View Project →
          </span>
        </div>
      </div>
    </AnimatedSection>
  );
}

export default function Gallery() {
  return (
    <SectionWrapper id="gallery" className="bg-ivory py-20">
      <AnimatedSection>
        <div className="text-center mb-12">
          <span className="font-inter text-[11px] uppercase tracking-[0.18em] text-warm-brown/70 mb-3 block">Portfolio</span>
          <h2 className="font-playfair text-3xl sm:text-[42px] font-bold text-charcoal leading-tight">
            Our Work Speaks
          </h2>
        </div>
      </AnimatedSection>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.label} label={project.label} photos={project.photos} />
        ))}
      </div>
      <div className="text-center mt-10">
        <a
          href="#"
          className="font-inter text-sm font-semibold text-charcoal border border-charcoal rounded-lg px-6 py-3 hover:bg-charcoal hover:text-ivory transition-all inline-block"
        >
          See All Projects →
        </a>
      </div>
    </SectionWrapper>
  );
}
