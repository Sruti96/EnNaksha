import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const pillars = [
  {
    num: "01",
    title: "Software Delivery Discipline",
    body: "We run your home project like a tech sprint — milestones, accountability, and zero surprises.",
  },
  {
    num: "02",
    title: "Absolute Financial Transparency",
    body: "Fixed BOQ agreed before work starts. Every rupee accounted for.",
  },
  {
    num: "03",
    title: "Async Project Tracking",
    body: "Daily photo updates replace weekend site visits. Check progress from anywhere.",
  },
];

export default function WhyEnNaksha() {
  return (
    <SectionWrapper className="bg-sand py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pillars.map((p, i) => (
          <AnimatedSection key={i}>
            <div className="text-center px-4">
              <div className="font-playfair text-[72px] font-bold text-terracotta leading-none mb-4">
                {p.num}
              </div>
              <h3 className="font-playfair text-xl font-bold text-charcoal mb-3">
                {p.title}
              </h3>
              <p className="font-inter text-sm text-muted leading-relaxed">
                {p.body}
              </p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </SectionWrapper>
  );
}
