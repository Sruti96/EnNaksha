import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

// Real project photos, self-hosted under /public/gallery (grouped by project
// folder). Both sets were deduplicated against exact byte-identical re-uploads
// before being placed here.
const HEIGHTS = ["h-64", "h-80", "h-56", "h-72", "h-60"];

const projects = [
  { label: "Uber Verdant | Sarjapur Road", folder: "uber-verdant-sarjapur-road", count: 8, ext: "png" },
  { label: "Amrutha Platinum | Whitefield", folder: "amrutha-platinum-whitefield", count: 13, ext: "jpg" },
].flatMap((project) =>
  Array.from({ length: project.count }, (_, i) => ({
    label: project.label,
    src: `/gallery/${project.folder}/photo-${String(i + 1).padStart(2, "0")}.${project.ext}`,
  }))
);

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
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        {projects.map((project, i) => (
          <AnimatedSection key={project.src} className="break-inside-avoid">
            <div className={`relative group rounded-xl overflow-hidden ${HEIGHTS[i % HEIGHTS.length]} cursor-pointer bg-sand`}>
              <Image
                src={project.src}
                alt={project.label}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
              {/* Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-charcoal/70 text-ivory text-[13px] font-inter font-semibold px-3 py-1.5 rounded-full">
                  {project.label}
                </span>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/50 transition-all duration-300 flex items-center justify-center">
                <span className="text-ivory font-inter font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-ivory px-6 py-3 rounded-xl">
                  View Project →
                </span>
              </div>
            </div>
          </AnimatedSection>
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
