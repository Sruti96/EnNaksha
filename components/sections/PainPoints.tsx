import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const cards = [
  {
    icon: "💸",
    title: "The Trust Deficit",
    description: "90% of homeowners face hidden cost escalations and material fraud mid-project.",
  },
  {
    icon: "📵",
    title: "The Communication Void",
    description: "Professionals waste weekends monitoring sites because contractors give zero updates.",
  },
  {
    icon: "🐢",
    title: "The Delivery Lag",
    description: "Corporate firms offer rigid designs; local carpenters blow deadlines by months.",
  },
  {
    icon: "🔄",
    title: "The Endless Cycle",
    description: "Projects stretch with no clear end date — clients left wondering if they'll ever move in.",
  },
];

export default function PainPoints() {
  return (
    <SectionWrapper className="bg-sand py-20">
      <AnimatedSection>
        <h2 className="font-playfair text-3xl sm:text-[42px] font-bold text-charcoal text-center mb-12 leading-tight">
          The Modern Interior Nightmare
        </h2>
      </AnimatedSection>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((card, i) => (
          <AnimatedSection key={i}>
            <div className="bg-ivory rounded-2xl p-7 border-l-4 border-warm-brown shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="font-playfair text-[22px] font-bold text-charcoal mb-3 leading-snug">
                {card.title}
              </h3>
              <p className="font-inter text-[15px] text-charcoal/70 leading-[1.75]">
                {card.description}
              </p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </SectionWrapper>
  );
}
