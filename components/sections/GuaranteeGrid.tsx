import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const rows = [
  { ennaksha: "Fixed Pricing", traditional: "Hidden Costs" },
  { ennaksha: "Raw Material Inspection", traditional: "Plywood Swaps" },
  { ennaksha: "Photo Updates", traditional: "Weekend Site Visits" },
  { ennaksha: "On-Time Delivery", traditional: "Endless Delays" },
  { ennaksha: "Laser Measurements", traditional: "Blueprint Guesswork" },
];

export default function GuaranteeGrid() {
  return (
    <SectionWrapper className="bg-cream py-20">
      <AnimatedSection>
        <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-charcoal text-center mb-12">
          The EnNaksha Promise
        </h2>
      </AnimatedSection>
      <AnimatedSection>
        <div className="overflow-x-auto rounded-2xl shadow-lg border border-sand">
          <table className="w-full text-sm font-inter">
            <thead>
              <tr>
                <th className="bg-forest text-ivory py-4 px-6 text-left font-bold text-base w-1/2">
                  ✅ EnNaksha Way
                </th>
                <th className="bg-muted/20 text-muted py-4 px-6 text-left font-bold text-base w-1/2">
                  ❌ Traditional Way
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-ivory" : "bg-sand/40"}
                >
                  <td className="py-4 px-6 text-forest font-semibold flex items-center gap-2">
                    <span className="text-forest font-bold">✓</span>
                    {row.ennaksha}
                  </td>
                  <td className="py-4 px-6 text-muted line-through">
                    <span className="no-underline mr-2 not-italic">✗</span>
                    {row.traditional}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedSection>
    </SectionWrapper>
  );
}
