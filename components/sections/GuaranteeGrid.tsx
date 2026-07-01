import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const rows = [
  {
    icon: "💰",
    ennaksha: "Scope-Locked Pricing",
    enDetail: "Every rupee agreed in writing before work starts. Changes only if you change the scope.",
    traditional: "Hidden Costs",
    trDetail: "Bills quietly inflate once the work is underway.",
  },
  {
    icon: "🪵",
    ennaksha: "Material Inspection",
    enDetail: "We verify every sheet of plywood and fitting on your behalf — before it reaches your site.",
    traditional: "Material Swaps",
    trDetail: "Cheaper substitutes arrive with the same invoice.",
  },
  {
    icon: "📸",
    ennaksha: "Daily Photo Updates",
    enDetail: "Progress photos straight to your WhatsApp every single day.",
    traditional: "Weekend Site Visits",
    trDetail: "You must physically show up just to know what's happening.",
  },
  {
    icon: "📅",
    ennaksha: "On-Time Delivery",
    enDetail: "Milestone dates are locked in your contract. We hold vendors to them.",
    traditional: "Endless Delays",
    trDetail: "\"Next week\" silently becomes next month, then the month after.",
  },
  {
    icon: "📐",
    ennaksha: "Laser Measurements",
    enDetail: "Furniture is built to your exact walls — no gaps, no rework, no waste.",
    traditional: "Blueprint Guesswork",
    trDetail: "Furniture arrives and doesn't fit. Costly rework follows.",
  },
];

export default function GuaranteeGrid() {
  return (
    <SectionWrapper className="bg-cream py-20">
      <AnimatedSection>
        <div className="text-center mb-14">
          <span className="font-inter text-[11px] uppercase tracking-[0.18em] text-warm-brown/70 mb-3 block">
            Why homeowners choose us
          </span>
          <h2 className="font-playfair text-3xl sm:text-[42px] font-bold text-charcoal mb-4 leading-tight">
            The EnNaksha Promise
          </h2>
          <p className="font-inter text-[17px] text-charcoal/60 max-w-md mx-auto leading-relaxed">
            Every project. Every time. No exceptions.
          </p>
        </div>
      </AnimatedSection>

      {/* Column headers */}
      <AnimatedSection>
        <div className="grid grid-cols-[40px_1fr_1fr] gap-0 mb-3 px-2">
          <div />
          <div className="text-center pb-3 border-b-2 border-forest mr-2">
            <span className="font-inter text-[13px] font-bold text-forest uppercase tracking-widest">✓ With EnNaksha</span>
          </div>
          <div className="text-center pb-3 border-b-2 border-sand ml-2">
            <span className="font-inter text-[13px] font-semibold text-charcoal/40 uppercase tracking-widest">✗ Without Us</span>
          </div>
        </div>
      </AnimatedSection>

      <div className="flex flex-col gap-3 mb-12">
        {rows.map((row, i) => (
          <AnimatedSection key={i}>
            <div className="grid grid-cols-[40px_1fr_1fr] items-stretch group">
              {/* Icon */}
              <div className="flex items-center justify-center pr-2">
                <div className="w-9 h-9 rounded-full bg-warm-brown/10 border border-warm-brown/15 flex items-center justify-center text-base group-hover:bg-warm-brown/20 transition-colors">
                  {row.icon}
                </div>
              </div>
              {/* EnNaksha side */}
              <div className="bg-ivory border border-forest/20 border-r-0 rounded-l-2xl px-6 py-5 mr-0 group-hover:bg-forest/5 transition-colors">
                <div className="font-inter font-bold text-charcoal text-[15px] mb-1.5">{row.ennaksha}</div>
                <div className="font-inter text-[14px] text-charcoal/65 leading-[1.7]">{row.enDetail}</div>
              </div>
              {/* Traditional side */}
              <div className="bg-sand/40 border border-sand rounded-r-2xl border-l-0 px-6 py-5">
                <div className="font-inter font-semibold text-charcoal/40 text-[15px] mb-1.5 line-through decoration-terracotta/40">
                  {row.traditional}
                </div>
                <div className="font-inter text-[14px] text-charcoal/40 leading-[1.7]">{row.trDetail}</div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection>
        <div className="text-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center font-inter font-semibold px-10 py-4 rounded-xl bg-warm-brown text-ivory text-[16px] shadow-lg shadow-warm-brown/20 hover:bg-charcoal transition-all duration-200 active:scale-95"
          >
            I Want This For My Home →
          </a>
        </div>
      </AnimatedSection>
    </SectionWrapper>
  );
}
