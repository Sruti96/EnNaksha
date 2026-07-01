import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const projects = [
  {
    label: "3 BHK | Whitefield",
    gradient: "linear-gradient(160deg, #7C4A1E, #5C3310, #E0CCAA)",
    height: "h-64",
  },
  {
    label: "2 BHK | Sarjapur Road",
    gradient: "linear-gradient(160deg, #5C3310, #E0CCAA, #B5651D)",
    height: "h-80",
  },
  {
    label: "Villa | Electronic City",
    gradient: "linear-gradient(160deg, #F2E8D5, #7C4A1E, #B5651D)",
    height: "h-56",
  },
  {
    label: "3 BHK | Koramangala",
    gradient: "linear-gradient(160deg, #2E1B0E, #7C4A1E, #E0CCAA)",
    height: "h-72",
  },
  {
    label: "Penthouse | Indiranagar",
    gradient: "linear-gradient(160deg, #B5651D, #FBF5E6, #7C4A1E)",
    height: "h-60",
  },
  {
    label: "2 BHK | HSR Layout",
    gradient: "linear-gradient(160deg, #7C4A1E, #B5651D, #F2E8D5)",
    height: "h-80",
  },
];

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
          <AnimatedSection key={i} className="break-inside-avoid">
            <div
              className={`relative group rounded-xl overflow-hidden ${project.height} cursor-pointer`}
              style={{ background: project.gradient }}
            >
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
