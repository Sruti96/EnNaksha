export default function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1 */}
          <div>
            <div className="font-playfair text-2xl font-bold text-warm-brown mb-3">
              EnNaksha
            </div>
            <p className="font-inter text-sm text-ivory/60 leading-relaxed">
              Your Dream Space. Zero Stress.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-inter font-bold text-sm uppercase tracking-wider text-ivory/50 mb-4">
              Services
            </h4>
            <ul className="flex flex-col gap-2 font-inter text-sm text-ivory/70">
              {[
                "Full Home Interiors",
                "Renovation",
                "Balcony Setup",
                "Painting",
                "Electrical",
                "POP Work",
                "Single Room",
                "Kitchen",
              ].map((item) => (
                <li key={item}>
                  <a href="#services" className="hover:text-warm-brown transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-inter font-bold text-sm uppercase tracking-wider text-ivory/50 mb-4">
              Company
            </h4>
            <ul className="flex flex-col gap-2 font-inter text-sm text-ivory/70">
              {[
                { label: "How It Works", href: "#how-it-works" },
                { label: "Gallery", href: "#gallery" },
                { label: "Contact", href: "#contact" },
                { label: "Our Promise", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-warm-brown transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-inter font-bold text-sm uppercase tracking-wider text-ivory/50 mb-4">
              Contact
            </h4>
            <ul className="flex flex-col gap-3 font-inter text-sm text-ivory/70">
              <li>📱 WhatsApp: +91 XXXXX XXXXX</li>
              <li>📧 hello@ennaksha.com</li>
              <li>📍 Bengaluru, Karnataka</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="font-inter text-xs text-ivory/40 text-center">
            © 2025 EnNaksha. All rights reserved. | Built with ❤️ for Bangalore homeowners
          </p>
        </div>
      </div>
    </footer>
  );
}
