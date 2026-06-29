import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const cards = [
  {
    icon: "💸",
    title: "The Trust Deficit",
    description:
      "90% of homeowners face hidden cost escalations and material fraud mid-project.",
  },
  {
    icon: "📵",
    title: "The Communication Void",
    description:
      "Professionals waste weekends monitoring sites because contractors give zero updates.",
  },
  {
    icon: "🐢",
    title: "The Delivery Lag",
    description:
      "Corporate firms offer rigid designs; local carpenters blow deadlines by months.",
  },
  {
    icon: "🔄",
    title: "The Endless Cycle",
    description:
      "Projects stretch with no clear end date — clients left wondering if they'll ever move in.",
  },
];

export default function PainPoints() {
  return (
    <SectionWrapper className="bg-sand py-20">
      <AnimatedSection>
        <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-charcoal text-center mb-12">
          The Modern Interior Nightmare
        </h2>
      </AnimatedSection>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((card, i) => (
          <AnimatedSection key={i}>
            <div className="bg-ivory rounded-xl p-6 border-l-4 border-warm-brown shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-playfair text-xl font-bold text-charcoal mb-2">
                {card.title}
              </h3>
              <p className="font-inter text-sm text-muted leading-relaxed">
                {card.description}
              </p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </SectionWrapper>
  );
}
