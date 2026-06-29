import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const steps = [
  {
    num: "01",
    title: "Share Your Floor Plan",
    desc: "Upload via our website. We collect your property type, location, timeline, and budget automatically.",
  },
  {
    num: "02",
    title: "We Create Your Design (Free)",
    desc: "Initial 2D layout within 24–48 hours at no cost. 3D renders and BOQ on request.",
  },
  {
    num: "03",
    title: "Approve the Budget",
    desc: "Review a detailed cost breakdown. Zero hidden charges — everything locked in writing.",
  },
  {
    num: "04",
    title: "Make Payment & Commit",
    desc: "Secure your project slot with a payment. Hassle-free from here.",
  },
  {
    num: "05",
    title: "We Build Your Furniture",
    desc: "Our workshop builds after precise laser measurements of your actual walls.",
  },
  {
    num: "06",
    title: "Regular Photo Updates",
    desc: "Daily progress photos sent to you. No site visits needed.",
  },
  {
    num: "07",
    title: "Your Home is Ready",
    desc: "On-time delivery with full quality inspection before handover.",
  },
];

export default function HowItWorks() {
  return (
    <SectionWrapper id="how-it-works" className="bg-sand py-20">
      <AnimatedSection>
        <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-charcoal text-center mb-16">
          The EnNaksha Journey
        </h2>
      </AnimatedSection>
      <div className="relative">
        {/* Connecting line for desktop */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-warm-brown/30 -translate-x-1/2" />

        <div className="flex flex-col gap-10">
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0;
            return (
              <AnimatedSection key={i}>
                <div className={`flex items-center gap-6 lg:gap-0 ${isLeft ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
                  {/* Content */}
                  <div className={`flex-1 ${isLeft ? "lg:pr-16 lg:text-right" : "lg:pl-16"}`}>
                    <div
                      className={`bg-ivory rounded-xl p-6 shadow-sm border border-sand inline-block w-full max-w-sm ${isLeft ? "lg:ml-auto" : ""}`}
                    >
                      <h3 className="font-playfair text-xl font-bold text-charcoal mb-2">
                        {step.title}
                      </h3>
                      <p className="font-inter text-sm text-muted leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Number badge */}
                  <div className="flex-shrink-0 z-10">
                    <div className="w-12 h-12 rounded-full bg-warm-brown text-ivory flex items-center justify-center font-inter font-bold text-sm shadow-lg">
                      {step.num}
                    </div>
                  </div>

                  {/* Spacer for alternating */}
                  <div className="hidden lg:block flex-1" />
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
