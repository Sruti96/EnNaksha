import AnimatedSection from "@/components/ui/AnimatedSection";

export default function Founder() {
  return (
    <section id="founder" className="bg-cream py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12 items-center">
            {/* Left: placeholder photo */}
            <div className="w-full aspect-[4/5] max-w-[320px] mx-auto md:mx-0 bg-gradient-to-br from-sand to-warm-brown/30 rounded-2xl flex items-center justify-center text-charcoal/40 font-inter text-[13px]">
              Founder photo
            </div>

            {/* Right: story */}
            <div>
              <h2 className="font-playfair text-[34px] font-bold text-charcoal mb-6 leading-tight">
                Why I Built EnNaksha
              </h2>
              <div className="font-inter text-[16px] text-charcoal/70 leading-[1.85] flex flex-col gap-5 mb-8">
                <p>
                  I&apos;ve seen too many homeowners — friends, colleagues, family — lose lakhs to contractors who disappeared, materials that were swapped, and projects that dragged for months with zero updates.
                </p>
                <p>
                  EnNaksha was built to change that. We run home projects the way good software teams run sprints — clear milestones, written commitments, and no surprises.
                </p>
                <p>
                  If you&apos;re a working professional or an NRI buying a home in Bangalore, you deserve a partner who treats your time and money with the same respect you give your career.
                </p>
              </div>
              <div>
                <p className="font-inter font-semibold text-charcoal text-[15px]">
                  [Your Name], Founder — EnNaksha
                </p>
                <p className="font-inter text-[13px] text-charcoal/50 mt-1">
                  Based in Bangalore | Serving projects across Whitefield, Sarjapur, HSR, and Electronic City
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
