import AnimatedSection from "@/components/ui/AnimatedSection";

const rows = [
  { category: "Plywood", brands: "Century / Green / Wigwam", why: "ISI-certified, no cheap core substitutions" },
  { category: "Laminate", brands: "Century / Royal Touch / Marino", why: "Up to ₹2,500/sqft options" },
  { category: "Veneer", brands: "Decowood / Century Veneers", why: "₹300/sqft, real wood finish" },
  { category: "Paint", brands: "Asian Paints (Royale range)", why: "Premium washable, consistent colour" },
  { category: "Door Hardware", brands: "Hafele / Hettich", why: "German-engineered, 10-year durability" },
  { category: "Wallpaper", brands: "Nilaya / Life in Colours", why: "₹15,000/roll imported options" },
  { category: "Electrical", brands: "Polycab wiring", why: "ISI-certified, fire-safe" },
  { category: "Lights", brands: "Philips / Havells", why: "As per client selection" },
];

export default function Materials() {
  return (
    <section id="materials" className="bg-ivory py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-10">
            <h2 className="font-playfair text-[38px] font-bold text-charcoal mb-3 leading-tight">
              We Publish What We Use
            </h2>
            <p className="font-inter text-[17px] text-charcoal/60 max-w-xl mx-auto">
              No bait-and-switch. Every brand and material grade is agreed upfront — documented in your BOQ before work begins.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[14px] border border-sand rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead>
                <tr className="bg-warm-brown text-ivory">
                  <th className="font-inter font-semibold text-left px-5 py-4">Category</th>
                  <th className="font-inter font-semibold text-left px-5 py-4">Brand(s) We Specify</th>
                  <th className="font-inter font-semibold text-left px-5 py-4">Why It Matters</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-ivory" : "bg-sand/40"}>
                    <td className="font-inter font-semibold text-charcoal px-5 py-3.5">{row.category}</td>
                    <td className="font-inter text-charcoal/70 px-5 py-3.5">{row.brands}</td>
                    <td className="font-inter text-charcoal/60 px-5 py-3.5">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="font-inter text-[13px] text-charcoal/50 italic text-center mt-6">
            Don&apos;t see a brand you prefer? We&apos;re happy to work with your specifications. All substitutions must be approved by you in writing.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
