import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const pillars = [
  {
    num: "01",
    title: "Software Delivery Discipline",
    body: "We run your home project like a tech sprint — milestones, accountability, and zero surprises.",
    quote: "EnNaksha delivered our 3 BHK exactly on time. It felt like a well-oiled machine — nothing slipped.",
    author: "Priya & Rahul S.",
    location: "Sarjapur Road",
    initials: "PR",
  },
  {
    num: "02",
    title: "Absolute Financial Transparency",
    body: "Transparent BOQ agreed before work starts. Every rupee documented — no surprise costs on your agreed scope.",
    quote: "The fixed quote they gave upfront matched the final bill to the last rupee. I still can't believe it.",
    author: "Meera K.",
    location: "Koramangala",
    initials: "MK",
  },
  {
    num: "03",
    title: "Async Project Tracking",
    body: "Daily photo updates replace weekend site visits. Check progress from anywhere in the world.",
    quote: "I was buying remotely from Dubai. EnNaksha's daily photos gave me complete peace of mind.",
    author: "Arun M.",
    location: "NRI — Whitefield",
    initials: "AM",
  },
];

export default function WhyEnNaksha() {
  return (
    <SectionWrapper id="reviews" className="bg-sand py-20">
      <AnimatedSection>
        <div className="text-center mb-14">
          <span className="font-inter text-[11px] uppercase tracking-[0.18em] text-warm-brown/70 mb-3 block">
            What sets us apart
          </span>
          <h2 className="font-playfair text-3xl sm:text-[42px] font-bold text-charcoal leading-tight">
            Why Homeowners Trust EnNaksha
          </h2>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillars.map((p, i) => (
          <AnimatedSection key={i}>
            <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-sand shadow-sm hover:shadow-md transition-shadow">
              {/* Pillar */}
              <div className="bg-ivory px-7 pt-8 pb-7">
                <div className="font-playfair text-[60px] font-bold text-terracotta leading-none mb-5">
                  {p.num}
                </div>
                <h3 className="font-playfair text-[20px] font-bold text-charcoal mb-3 leading-snug">
                  {p.title}
                </h3>
                <p className="font-inter text-[15px] text-charcoal/65 leading-[1.75]">
                  {p.body}
                </p>
              </div>

              {/* Review */}
              <div className="bg-warm-brown/[0.07] border-t-2 border-warm-brown/20 px-7 py-6 flex-1 flex flex-col justify-between relative">
                <span className="absolute top-3 right-6 font-playfair text-[64px] leading-none text-warm-brown/10 select-none">&ldquo;</span>
                <div>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="text-yellow-500 text-[16px]">★</span>
                    ))}
                  </div>
                  <p className="font-inter text-[15px] italic text-charcoal/80 leading-[1.75] mb-5">
                    &ldquo;{p.quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warm-brown text-ivory flex items-center justify-center font-inter font-bold text-sm flex-shrink-0">
                    {p.initials}
                  </div>
                  <div>
                    <div className="font-inter font-semibold text-charcoal text-[14px]">{p.author}</div>
                    <div className="font-inter text-[13px] text-charcoal/55">{p.location}</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </SectionWrapper>
  );
}
