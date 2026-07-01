import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const services = [
  {
    icon: "🏠",
    name: "Full Home Interiors",
    desc: "We design and manage your full home project — every room, all woodwork, kitchen, and finishes. You hire the contractors, we run the show.",
    tag: "Most popular scope",
  },
  {
    icon: "🍳",
    name: "Modular Kitchen",
    desc: "We design your modular kitchen layout and supervise your contractor's execution — shutters, countertop, storage, and appliance placement.",
    tag: "High value",
  },
  {
    icon: "🛋️",
    name: "Single Room Makeover",
    desc: "We design and manage the transformation of one room. The best way to experience EnNaksha before committing to a full home.",
    tag: "Best entry point",
  },
  {
    icon: "✨",
    name: "Ceiling Design & Wall Finishes",
    desc: "We design your false ceiling, cove lighting, and wall finishes — and supervise your contractor to make sure it's done right.",
    tag: "Standalone",
  },
];

export default function Services() {
  return (
    <SectionWrapper id="services" className="bg-cream py-20">
      <AnimatedSection>
        <div className="text-center mb-12">
          <span className="font-inter text-[11px] uppercase tracking-[0.18em] text-warm-brown/70 mb-3 block">
            What we cover
          </span>
          <h2 className="font-playfair text-3xl sm:text-[42px] font-bold text-charcoal mb-4 leading-tight">
            Everything Your Home Needs
          </h2>
          <p className="font-inter text-[17px] text-charcoal/60 max-w-md mx-auto leading-relaxed">
            End-to-end interiors and beyond — all under one roof.
          </p>
        </div>
      </AnimatedSection>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {services.map((service, i) => (
          <AnimatedSection key={i} className="h-full">
            <div className="group h-full bg-ivory rounded-2xl p-6 border border-sand hover:border-warm-brown hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="font-playfair text-[18px] font-bold text-charcoal mb-2 leading-snug">
                {service.name}
              </h3>
              <p className="font-inter text-[14px] text-charcoal/65 leading-[1.7] flex-1 mb-4">
                {service.desc}
              </p>
              <div className="flex items-center justify-between">
                <span className="bg-sand text-charcoal/70 text-[11px] font-inter rounded-full px-2.5 py-0.5">
                  {service.tag}
                </span>
                <a
                  href="#contact"
                  className="font-inter text-[13px] text-warm-brown font-semibold hover:text-charcoal transition-colors"
                >
                  Get a quote →
                </a>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
      <p className="font-inter text-[13px] text-charcoal/50 text-center mt-8 italic">
        Painting, electrical, and balcony work available as add-ons — select in the enquiry form.
      </p>
    </SectionWrapper>
  );
}
