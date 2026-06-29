import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const testimonials = [
  {
    quote:
      "EnNaksha delivered our 3 BHK exactly on time with zero surprise costs. The WhatsApp updates meant we never had to visit the site once.",
    name: "Priya & Rahul S.",
    location: "Sarjapur Road",
    initials: "PR",
  },
  {
    quote:
      "As an NRI buying a home in Bangalore remotely, I was terrified. EnNaksha's photo updates and fixed pricing gave me complete peace of mind.",
    name: "Arun M.",
    location: "NRI — buying in Whitefield",
    initials: "AM",
  },
];

export default function Testimonials() {
  return (
    <SectionWrapper className="bg-cream py-20">
      <AnimatedSection>
        <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-charcoal text-center mb-12">
          What Our Clients Say
        </h2>
      </AnimatedSection>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t, i) => (
          <AnimatedSection key={i}>
            <div className="bg-ivory rounded-xl p-8 border-l-4 border-warm-brown shadow-sm">
              <div className="flex mb-4">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-yellow-400 text-xl">
                    ★
                  </span>
                ))}
              </div>
              <p className="font-inter text-base italic text-charcoal leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warm-brown text-ivory flex items-center justify-center font-inter font-bold text-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="font-inter font-bold text-charcoal text-sm">
                    {t.name}
                  </div>
                  <div className="font-inter text-xs text-muted">{t.location}</div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </SectionWrapper>
  );
}
