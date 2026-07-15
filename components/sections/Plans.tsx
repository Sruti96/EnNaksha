import AnimatedSection from "@/components/ui/AnimatedSection";

const check = <span className="text-forest font-bold">✓</span>;
const cross = <span className="text-muted/50">✗</span>;

export default function Plans() {
  return (
    <section id="plans" className="bg-sand py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="font-playfair text-[38px] font-bold text-charcoal mb-3 leading-tight">
              Choose Your EnNaksha Plan
            </h2>
            <p className="font-inter text-[17px] text-charcoal/60 max-w-xl mx-auto">
              Both plans include Vastu-based design and transparent pricing. Pick the level of support you need.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Naksha Design Plan */}
          <AnimatedSection className="h-full">
            <div className="h-full bg-ivory rounded-2xl p-7 border border-sand shadow-sm flex flex-col">
              <div className="mb-5">
                <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-inter font-semibold px-3 py-1 rounded-full mb-4">
                  Design Only
                </span>
                <h3 className="font-playfair text-[22px] font-bold text-charcoal mb-1">Naksha Plan</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-playfair text-[28px] font-bold text-charcoal">₹99</span>
                  <span className="font-inter text-[14px] text-muted">/sq.ft</span>
                </div>
                <p className="font-inter text-[14px] text-charcoal/60">Professional design package. You manage execution.</p>
              </div>

              <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                {[
                  [true, "Vastu-based 2D furniture layout"],
                  [true, "3D renders of full home"],
                  [true, "Working drawings + electrical layout"],
                  [true, "Material spec sheet (brands + price codes)"],
                  [true, "Purchase links for soft furnishings"],
                  [true, "2 design revision rounds"],
                  [false, "No site supervision"],
                  [false, "No material quality checks"],
                  [false, "No progress updates"],
                ].map(([ok, label], i) => (
                  <li key={i} className="flex items-start gap-2 font-inter text-[14px] text-charcoal/70">
                    <span className="mt-0.5 flex-shrink-0">{ok ? check : cross}</span>
                    <span>{label as string}</span>
                  </li>
                ))}
              </ul>

              <div>
                <a
                  href="#contact"
                  className="block w-full text-center font-inter font-semibold text-[14px] border-2 border-warm-brown text-warm-brown py-3 rounded-xl hover:bg-warm-brown hover:text-ivory transition-all duration-200"
                >
                  Start with Design →
                </a>
                <p className="font-inter text-[12px] text-charcoal/50 text-center mt-3">
                  Best for clients with a trusted contractor who want professional drawings.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Card 2: PMC Plan (highlighted) */}
          <AnimatedSection className="h-full">
            <div className="h-full bg-ivory rounded-2xl p-7 border-2 border-warm-brown shadow-lg flex flex-col relative">
              <div className="mb-5">
                <span className="inline-block bg-warm-brown text-ivory text-[11px] font-inter font-semibold px-3 py-1 rounded-full mb-4">
                  Most Popular
                </span>
                <h3 className="font-playfair text-[22px] font-bold text-charcoal mb-1">PMC Plan</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-playfair text-[28px] font-bold text-charcoal">₹199</span>
                  <span className="font-inter text-[14px] text-muted">/sq.ft</span>
                </div>
                <p className="font-inter text-[14px] text-charcoal/60">Design + full project management. We run it, you approve.</p>
              </div>

              <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                {[
                  "Everything in the Naksha Design Plan",
                  "Dedicated EnNaksha Project Manager",
                  "Laser measurements (not builder blueprints)",
                  "Vendor and contractor coordination",
                  "Raw material quality checks before coating",
                  "Weekly photo + video updates on WhatsApp",
                  "Transparent BOQ — agreed scope costs locked in writing",
                  "On-time delivery — committed in writing, managed by us",
                  "2 design revision rounds included",
                ].map((label, i) => (
                  <li key={i} className="flex items-start gap-2 font-inter text-[14px] text-charcoal/70">
                    <span className="mt-0.5 flex-shrink-0">{check}</span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>

              <div>
                <a
                  href="#contact"
                  className="block w-full text-center font-inter font-semibold text-[14px] bg-warm-brown text-ivory py-3 rounded-xl hover:bg-charcoal transition-all duration-200"
                >
                  Start My Project →
                </a>
                <p className="font-inter text-[12px] text-charcoal/50 text-center mt-3">
                  Best for working professionals and NRIs who want zero site visits.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Card 3: Full Build (coming soon) */}
          <AnimatedSection className="h-full">
            <div className="h-full bg-ivory rounded-2xl p-7 border border-sand shadow-sm flex flex-col opacity-70">
              <div className="mb-5">
                <span className="inline-block bg-muted/20 text-muted border border-muted/30 text-[11px] font-inter font-semibold px-3 py-1 rounded-full mb-4">
                  Coming Soon
                </span>
                <h3 className="font-playfair text-[22px] text-charcoal mb-1">Full Build Plan</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-playfair text-[28px] font-bold text-charcoal">₹399</span>
                  <span className="font-inter text-[14px] text-muted">/sq.ft</span>
                </div>
                <p className="font-inter text-[14px] text-charcoal/60">End-to-end. We design, specify, coordinate, and deliver.</p>
              </div>

              <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                {[
                  "Everything in PMC Plan",
                  "EnNaksha specifies all materials (escrow-protected)",
                  "We coordinate and supervise all labour",
                  "On-time delivery — committed in writing, managed by us",
                  "No client involvement in execution",
                  "Handover inspection included",
                ].map((label, i) => (
                  <li key={i} className="flex items-start gap-2 font-inter text-[14px] text-charcoal/70">
                    <span className="mt-0.5 flex-shrink-0">{check}</span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>

              <div>
                <a
                  href="#contact"
                  className="block w-full text-center font-inter font-semibold text-[14px] bg-muted/20 text-muted py-3 rounded-xl cursor-pointer hover:bg-muted/30 transition-all duration-200"
                >
                  Notify Me When Live
                </a>
                <p className="font-inter text-[12px] text-charcoal/50 text-center mt-3">
                  Launching for NRI clients and time-poor homeowners. Join the waitlist.
                </p>
              </div>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}
