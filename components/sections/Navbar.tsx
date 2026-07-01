"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import EnNakshaLogo from "@/components/ui/EnNakshaLogo";

const plans = [
  { icon: "✏️", iconColor: "text-terracotta", title: "Naksha Design Plan", sub: "Design drawings + specs · ₹175–200/sqft", href: "#plans", badge: null, muted: false },
  { icon: "📋", iconColor: "text-warm-brown", title: "EnNaksha PMC Plan", sub: "Design + full project management · ₹350–450/sqft", href: "#plans", badge: "Most Popular", muted: false },
  { icon: "🏗️", iconColor: "text-muted", title: "Full Managed Build", sub: "End-to-end execution — Coming Soon", href: "#contact", badge: "Coming Soon", muted: true },
];

const serviceItems = [
  { icon: "🏠", title: "Full Home Interiors", sub: "2BHK, 3BHK, 4BHK and villas", href: "#services" },
  { icon: "🍳", title: "Modular Kitchen", sub: "Custom layout, shutters, and storage", href: "#services" },
  { icon: "🛋️", title: "Single Room Makeover", sub: "Best entry point — one room, full transformation", href: "#services" },
  { icon: "✨", title: "Ceiling Design & Wall Finishes", sub: "False ceiling, cove lighting, wall textures", href: "#services" },
];

const steps = [
  { icon: "📐", label: "Share Your Floor Plan", sub: "Free", href: "#contact" },
  { icon: "✏️", label: "We Create Your 2D Layout", sub: "Free · 48 hours", href: "#contact" },
  { icon: "🎨", label: "3D Design & Full Quote", sub: "Token fee", href: "#contact", highlight: true },
  { icon: "✅", label: "Lock the Budget", sub: "Scope-locked in writing", href: "#contact" },
  { icon: "🔨", label: "We Manage Everything", sub: "End-to-end", href: "#contact" },
  { icon: "🏡", label: "You Move In", sub: "On time · 30-day support", href: "#contact" },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useDropdown() {
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const enter = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    setOpen(true);
  }, []);

  const leave = useCallback(() => {
    timeout.current = setTimeout(() => setOpen(false), 150);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return { open, setOpen, enter, leave, ref };
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesAccordion, setServicesAccordion] = useState(false);
  const [howAccordion, setHowAccordion] = useState(false);

  const services = useDropdown();
  const how = useDropdown();

  const closeAll = () => { setMenuOpen(false); setServicesAccordion(false); setHowAccordion(false); };

  const panelClass = (open: boolean) =>
    `absolute top-full mt-3 bg-[#FAF7F2] border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-4 transition-all duration-200 z-50 ${
      open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-md border-b border-sand/40 shadow-[0_1px_24px_rgba(46,27,14,0.07)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[84px]">

          {/* Logo */}
          <a href="#" aria-label="EnNaksha — go to top">
            <EnNakshaLogo variant="light" className="h-16" />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">

            {/* ── Services dropdown ── */}
            <div ref={services.ref} className="relative" onMouseEnter={services.enter} onMouseLeave={services.leave}>
              <button
                className="flex items-center gap-1.5 font-inter text-[15px] font-medium text-charcoal/70 hover:text-warm-brown transition-colors tracking-wide"
                aria-expanded={services.open}
              >
                Services <Chevron open={services.open} />
              </button>

              <div
                className={`${panelClass(services.open)} left-1/2 -translate-x-1/2 w-[640px]`}
                onMouseEnter={services.enter}
                onMouseLeave={services.leave}
              >
                <div className="flex gap-4">
                  {/* Group 1 */}
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-[11px] uppercase tracking-[0.12em] text-muted mb-2 px-1">How we work with you</p>
                    <div className="flex flex-col gap-0.5">
                      {plans.map((item) => (
                        <a
                          key={item.title}
                          href={item.href}
                          onClick={() => services.setOpen(false)}
                          className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors ${item.muted ? "opacity-50 pointer-events-none" : "hover:bg-[#E8E0D0]"}`}
                        >
                          <span className={`text-[18px] mt-0.5 flex-shrink-0 ${item.iconColor}`}>{item.icon}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-inter text-[15px] font-semibold text-charcoal leading-snug">{item.title}</span>
                              {item.badge && (
                                <span className={`font-inter text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.muted ? "bg-sand text-muted" : "bg-warm-brown text-ivory"}`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span className="font-inter text-[13px] text-muted block mt-0.5">{item.sub}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="w-px bg-[rgba(0,0,0,0.08)] self-stretch mx-1 flex-shrink-0" />

                  {/* Group 2 */}
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-[11px] uppercase tracking-[0.12em] text-muted mb-2 px-1">What we design</p>
                    <div className="flex flex-col gap-0.5">
                      {serviceItems.map((item) => (
                        <a
                          key={item.title}
                          href={item.href}
                          onClick={() => services.setOpen(false)}
                          className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[#E8E0D0] transition-colors"
                        >
                          <span className="text-[18px] mt-0.5 flex-shrink-0 text-terracotta">{item.icon}</span>
                          <div className="min-w-0">
                            <span className="font-inter text-[15px] font-semibold text-charcoal block">{item.title}</span>
                            <span className="font-inter text-[13px] text-muted block mt-0.5">{item.sub}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── How It Works dropdown ── */}
            <div ref={how.ref} className="relative" onMouseEnter={how.enter} onMouseLeave={how.leave}>
              <button
                className="flex items-center gap-1.5 font-inter text-[15px] font-medium text-charcoal/70 hover:text-warm-brown transition-colors tracking-wide"
                aria-expanded={how.open}
              >
                How It Works <Chevron open={how.open} />
              </button>

              <div
                className={`${panelClass(how.open)} left-1/2 -translate-x-1/2 w-[400px]`}
                onMouseEnter={how.enter}
                onMouseLeave={how.leave}
              >
                <p className="font-inter text-[11px] uppercase tracking-[0.12em] text-muted mb-2 px-1">From enquiry to move-in</p>
                <div className="flex flex-col gap-0">
                  {steps.map((step, i) => (
                    <a
                      key={step.label}
                      href={step.href}
                      onClick={() => how.setOpen(false)}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[#E8E0D0] transition-colors group"
                    >
                      {/* Step number + connector */}
                      <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-inter flex-shrink-0 ${
                          step.highlight
                            ? "bg-terracotta text-ivory"
                            : "bg-warm-brown/10 text-warm-brown"
                        }`}>
                          {i + 1}
                        </div>
                        {i < steps.length - 1 && (
                          <div className="w-px h-3 bg-warm-brown/15 mt-0.5" />
                        )}
                      </div>
                      <div className="min-w-0 pb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px]">{step.icon}</span>
                          <span className="font-inter text-[15px] font-semibold text-charcoal leading-snug">{step.label}</span>
                        </div>
                        <span className={`font-inter text-[13px] block mt-0.5 ${step.highlight ? "text-terracotta font-medium" : "text-muted"}`}>
                          {step.sub}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-sand">
                  <a
                    href="#contact"
                    onClick={() => how.setOpen(false)}
                    className="block w-full text-center font-inter text-[13px] font-semibold bg-warm-brown text-ivory py-2.5 rounded-xl hover:bg-charcoal transition-colors"
                  >
                    Start My Project — Free 2D Layout →
                  </a>
                </div>
              </div>
            </div>

            <a href="#gallery" className="font-inter text-[15px] font-medium text-charcoal/70 hover:text-warm-brown transition-colors tracking-wide">Gallery</a>
            <a href="#contact" className="font-inter text-[15px] font-medium text-charcoal/70 hover:text-warm-brown transition-colors tracking-wide">Contact</a>
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <Button variant="primary" href="#contact" className="text-[15px] px-5 py-2.5 shadow-md shadow-warm-brown/20">
              Get Free Quote
            </Button>
          </div>

          {/* Hamburger */}
          <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-[700px]" : "max-h-0"}`}>
        <div className="bg-ivory border-t border-sand/60 px-4 py-4 flex flex-col gap-1">

          {/* Services accordion */}
          <button
            onClick={() => setServicesAccordion(!servicesAccordion)}
            className="flex items-center justify-between w-full font-inter text-base font-medium text-charcoal py-2 bg-transparent border-none text-left"
          >
            <span>Services</span>
            <span className="text-charcoal/50"><Chevron open={servicesAccordion} /></span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${servicesAccordion ? "max-h-[500px]" : "max-h-0"}`}>
            <div className="pl-3 pb-2 flex flex-col gap-0">
              <p className="font-inter text-[10px] uppercase tracking-widest text-muted pt-2 pb-1">How we work with you</p>
              {plans.map((item) => (
                <a key={item.title} href={item.href} onClick={closeAll} className={`flex items-center gap-2.5 py-2 ${item.muted ? "opacity-40 pointer-events-none" : ""}`}>
                  <span className="text-base">{item.icon}</span>
                  <div>
                    <span className="font-inter text-[14px] font-semibold text-charcoal">{item.title}</span>
                    {item.badge && <span className={`ml-2 font-inter text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${item.muted ? "bg-sand text-muted" : "bg-warm-brown text-ivory"}`}>{item.badge}</span>}
                  </div>
                </a>
              ))}
              <div className="h-px bg-sand my-2" />
              <p className="font-inter text-[10px] uppercase tracking-widest text-muted pb-1">What we design</p>
              {serviceItems.map((item) => (
                <a key={item.title} href={item.href} onClick={closeAll} className="flex items-center gap-2.5 py-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="font-inter text-[14px] font-semibold text-charcoal">{item.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* How It Works accordion */}
          <button
            onClick={() => setHowAccordion(!howAccordion)}
            className="flex items-center justify-between w-full font-inter text-base font-medium text-charcoal py-2 bg-transparent border-none text-left"
          >
            <span>How It Works</span>
            <span className="text-charcoal/50"><Chevron open={howAccordion} /></span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${howAccordion ? "max-h-[500px]" : "max-h-0"}`}>
            <div className="pl-3 pb-3 flex flex-col gap-0">
              {steps.map((step, i) => (
                <a key={step.label} href={step.href} onClick={closeAll} className="flex items-center gap-2.5 py-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-inter flex-shrink-0 ${step.highlight ? "bg-terracotta text-ivory" : "bg-warm-brown/10 text-warm-brown"}`}>
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-[13px] mr-1.5">{step.icon}</span>
                    <span className="font-inter text-[14px] font-semibold text-charcoal">{step.label}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <a href="#gallery" onClick={closeAll} className="font-inter text-base font-medium text-charcoal py-2 hover:text-warm-brown transition-colors">Gallery</a>
          <a href="#contact" onClick={closeAll} className="font-inter text-base font-medium text-charcoal py-2 hover:text-warm-brown transition-colors">Contact</a>

          <Button variant="primary" href="#contact" className="w-full mt-3">Get Free Quote</Button>
        </div>
      </div>
    </nav>
  );
}
