import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const services = [
  {
    icon: "🏠",
    name: "Full Home Interiors",
    desc: "Complete modular furniture and design for every room.",
  },
  {
    icon: "🔨",
    name: "Renovation & Remodelling",
    desc: "Transform your existing space from scratch.",
  },
  {
    icon: "🌿",
    name: "Balcony & Garden Setup",
    desc: "Lush balcony gardens and outdoor living setups.",
  },
  {
    icon: "🎨",
    name: "Painting Work",
    desc: "Interior and exterior painting with premium finishes.",
  },
  {
    icon: "⚡",
    name: "Electrical Work",
    desc: "Safe, certified wiring, fixtures, and smart switches.",
  },
  {
    icon: "✨",
    name: "POP & False Ceiling",
    desc: "Designer ceilings, cornices, and wall textures.",
  },
  {
    icon: "🛋️",
    name: "Single Room Makeover",
    desc: "Full transformation of one room on a focused budget.",
  },
  {
    icon: "🍳",
    name: "Kitchen & Modular Furniture",
    desc: "Custom kitchens, wardrobes, and storage units.",
  },
];

export default function Services() {
  return (
    <SectionWrapper id="services" className="bg-cream py-20">
      <AnimatedSection>
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-charcoal mb-3">
            Everything Your Home Needs
          </h2>
          <p className="font-inter text-muted text-lg">
            End-to-end interiors and beyond — all under one roof.
          </p>
        </div>
      </AnimatedSection>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {services.map((service, i) => (
          <AnimatedSection key={i}>
            <div className="group bg-ivory rounded-xl p-6 border border-sand hover:border-warm-brown hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
              <div className="text-3xl text-terracotta mb-3">{service.icon}</div>
              <h3 className="font-playfair text-lg font-bold text-charcoal mb-2">
                {service.name}
              </h3>
              <p className="font-inter text-sm text-muted leading-relaxed">
                {service.desc}
              </p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </SectionWrapper>
  );
}
