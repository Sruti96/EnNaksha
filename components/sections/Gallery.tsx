"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

// Real project photos, self-hosted under /public/gallery (one folder per
// project). Each project renders as a single card that cycles through its
// own photos, and clicking "View Project" opens a drawer with every photo.
const PROJECTS = [
  { label: "Uber Verdant | Sarjapur Road", folder: "uber-verdant-sarjapur-road", count: 8, ext: "png" },
  { label: "Amrutha Platinum | Whitefield", folder: "amrutha-platinum-whitefield", count: 13, ext: "jpg" },
].map((p) => ({
  label: p.label,
  photos: Array.from({ length: p.count }, (_, i) => `/gallery/${p.folder}/photo-${String(i + 1).padStart(2, "0")}.${p.ext}`),
}));

type Project = (typeof PROJECTS)[number];

const ROTATE_MS = 3500;

function ProjectCard({ project, onView }: { project: Project; onView: (startIndex: number) => void }) {
  const { label, photos } = project;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [photos.length]);

  return (
    <AnimatedSection className="break-inside-avoid">
      <div
        onClick={() => onView(index)}
        className="relative group rounded-xl overflow-hidden h-[440px] cursor-pointer bg-sand"
      >
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

function ProjectDrawer({
  project,
  initialIndex,
  onClose,
}: {
  project: Project | null;
  initialIndex: number;
  onClose: () => void;
}) {
  // Always a single full-size image view — no grid mode anymore.
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Keep rendering the last-open project's photos while the popup fades out
  // (project becomes null immediately on close, but the panel is still
  // visible for ~300ms). Without this, `photos` would drop to [] mid-fade
  // and `photos[activeIndex]` would be undefined, which Next/Image turns
  // into an empty-string `src` and logs a console warning.
  const [displayProject, setDisplayProject] = useState<Project | null>(project);
  useEffect(() => {
    if (project) setDisplayProject(project);
  }, [project]);

  const isOpen = Boolean(project);
  const photos = displayProject?.photos ?? [];

  const showPrev = () => setActiveIndex((i) => (i - 1 + photos.length) % photos.length);
  const showNext = () => setActiveIndex((i) => (i + 1) % photos.length);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") showNext();
      else if (e.key === "ArrowLeft") showPrev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, onClose, photos.length]);

  // Jump to the photo that triggered the click every time a (new) project opens.
  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [project, initialIndex]);

  // Auto-advance through the photos by default while the popup is open.
  useEffect(() => {
    if (!isOpen || photos.length < 2) return;
    const id = setInterval(() => setActiveIndex((i) => (i + 1) % photos.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [isOpen, photos.length]);

  const currentPhoto = photos[activeIndex];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal/60" onClick={onClose} />

      {/* Popup panel */}
      <div
        className={`relative bg-ivory rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col transition-all duration-300 ease-out ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="relative flex items-center justify-center px-12 py-5 border-b border-sand">
          <h3 className="font-playfair text-xl font-bold text-charcoal text-center">
            {displayProject?.label}
            <span className="font-inter text-sm font-normal text-muted ml-3">
              {activeIndex + 1} / {photos.length}
            </span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-6 top-1/2 -translate-y-1/2 text-charcoal/60 hover:text-charcoal text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="relative flex-1 bg-charcoal/5 flex items-center justify-center overflow-hidden">
          {currentPhoto && (
            <div className="relative w-full h-[60vh] sm:h-[65vh]">
              <Image
                src={currentPhoto}
                alt={`${displayProject?.label} — photo ${activeIndex + 1}`}
                fill
                sizes="(min-width: 768px) 700px, 100vw"
                className="object-contain"
              />
            </div>
          )}

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-ivory/90 hover:bg-ivory text-charcoal w-10 h-10 rounded-full flex items-center justify-center shadow-md text-xl"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-ivory/90 hover:bg-ivory text-charcoal w-10 h-10 rounded-full flex items-center justify-center shadow-md text-xl"
              >
                ›
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [openIndex, setOpenIndex] = useState(0);

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
          <ProjectCard
            key={project.label}
            project={project}
            onView={(startIndex) => {
              setOpenIndex(startIndex);
              setOpenProject(project);
            }}
          />
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

      <ProjectDrawer project={openProject} initialIndex={openIndex} onClose={() => setOpenProject(null)} />
    </SectionWrapper>
  );
}
