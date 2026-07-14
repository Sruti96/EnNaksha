import EnNakshaLogo from "@/components/ui/EnNakshaLogo";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1 */}
          <div>
            <a href="#" aria-label="EnNaksha — go to top" className="inline-block mb-3">
              <EnNakshaLogo variant="dark" className="h-10" />
            </a>
          </div>

          {/* Col 2 — Services */}
          <div>
            <h4 className="font-inter font-bold text-sm uppercase tracking-wider text-ivory/50 mb-4">
              Services
            </h4>
            <ul className="flex flex-col gap-2 font-inter text-sm text-ivory/70">
              {[
                "Full Home Interiors",
                "Modular Kitchen",
                "Single Room Makeover",
                "Ceiling Design & Wall Finishes",
              ].map((item) => (
                <li key={item}>
                  <a href="#services" className="hover:text-warm-brown transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Plans */}
          <div>
            <h4 className="font-inter font-bold text-sm uppercase tracking-wider text-ivory/50 mb-4">
              Plans
            </h4>
            <ul className="flex flex-col gap-2 font-inter text-sm text-ivory/70">
              <li>
                <a href="#plans" className="hover:text-warm-brown transition-colors">
                  Naksha Design Plan (₹175–200/sqft)
                </a>
              </li>
              <li>
                <a href="#plans" className="hover:text-warm-brown transition-colors">
                  PMC Plan (₹350–450/sqft)
                </a>
              </li>
              <li className="text-ivory/40">
                Full Build — Coming Soon
              </li>
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h4 className="font-inter font-bold text-sm uppercase tracking-wider text-ivory/50 mb-4">
              Contact
            </h4>
            <ul className="flex flex-col gap-3 font-inter text-sm text-ivory/70">
              <li>📱 WhatsApp: +91 97311 90902</li>
              <li>📧 hello@ennaksha.com</li>
              <li>📍 Bengaluru, Karnataka</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="font-inter text-xs text-ivory/40 text-center mb-2">
            EnNaksha is not affiliated with any material brand. All brand recommendations are based on quality assessment and client budget.
          </p>
          <p className="font-inter text-xs text-ivory/40 text-center">
            © 2025 EnNaksha. All rights reserved. | Built with ❤️ for Bangalore homeowners
          </p>
        </div>
      </div>
    </footer>
  );
}
