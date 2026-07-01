"use client";
import { useState } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import InteriorCarousel from "@/components/ui/InteriorCarousel";
import HowItWorksModal from "@/components/ui/HowItWorksModal";

const journey = [
  { icon: "📐", label: "Share Floor Plan", sub: "Free" },
  { icon: "✏️", label: "2D Layout", sub: "Free · 48h" },
  { icon: "🎨", label: "3D Design & Quote", sub: "Token fee" },
  { icon: "✅", label: "Lock the Budget", sub: "Zero surprises" },
  { icon: "🔨", label: "We Manage It", sub: "End-to-end" },
  { icon: "🏡", label: "You Move In", sub: "On time" },
];

const stats = [
  { value: "200+", label: "Homes Delivered" },
  { value: "4.9★", label: "Client Rating" },
  { value: "₹0", label: "Hidden Charges" },
  { value: "48h", label: "Free Design" },
];

const trustBadges = [
  "✓ Transparent BOQ — costs locked before work starts",
  "✓ Weekly photo updates",
  "✓ Free 2D layout — decide after you see our work",
];

export default function Hero() {
  const [modalOpen, setModalOpen] = useState(false);

  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  const nextMonth = next.toLocaleString("en-IN", { month: "long" });

  return (
    <>
      <section className="bg-cream min-h-[92vh] flex flex-col justify-center relative overflow-hidden">
        {/* Subtle warm glow */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(181,101,29,0.08) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-14 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center pb-14">

            {/* Left column */}
            <AnimatedSection>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 bg-warm-brown/10 border border-warm-brown/20 rounded-full px-4 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                <span className="font-inter text-[11px] font-semibold text-warm-brown uppercase tracking-[0.15em]">
                  Free 2D Layout in 48 Hours
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-playfair font-bold leading-[1.1] text-charcoal tracking-tight mb-5">
                <span className="block text-[38px] sm:text-[52px] lg:text-[58px]">Your Dream Space.</span>
                <span className="relative inline-block text-[38px] sm:text-[52px] lg:text-[60px]">
                  <span className="text-warm-brown italic">Zero Stress.</span>
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-warm-brown/40 rounded-full" />
                </span>
              </h1>

              <p className="font-inter text-[17px] text-charcoal/65 leading-[1.85] mb-9 max-w-lg">
                Transparent pricing, no hidden costs, zero surprises — from design to handover.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-5">
                <a
                  href="#plans"
                  className="inline-flex items-center justify-center font-inter font-semibold px-8 py-4 rounded-xl bg-warm-brown text-ivory text-[15px] shadow-lg shadow-warm-brown/25 hover:bg-charcoal transition-all duration-200 active:scale-95"
                >
                  See Our Plans →
                </a>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center justify-center font-inter font-semibold px-8 py-4 rounded-xl border border-charcoal/20 text-charcoal text-[15px] hover:border-warm-brown hover:text-warm-brown transition-all duration-200"
                >
                  How It Works
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2 mb-9">
                {trustBadges.map((badge) => (
                  <span
                    key={badge}
                    className="bg-sand text-charcoal text-[12px] px-3 py-1 rounded-full font-inter"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Stat pills */}
              <div className="grid grid-cols-4 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="bg-ivory border border-sand rounded-xl px-3 py-3 text-center shadow-sm">
                    <div className="font-playfair text-[20px] font-bold text-warm-brown leading-none mb-1">{s.value}</div>
                    <div className="font-inter text-[10px] text-muted leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {/* Right column */}
            <AnimatedSection className="relative lg:py-6">
              <InteriorCarousel />

              {/* Floating review chip */}
              <a
                href="#reviews"
                className="absolute -bottom-4 -left-4 bg-ivory rounded-2xl shadow-xl px-4 py-3.5 border border-sand max-w-[210px] hover:shadow-2xl hover:border-warm-brown/30 transition-all duration-200 block group"
              >
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-500 text-sm">★</span>)}
                </div>
                <p className="font-inter text-[11px] text-charcoal font-semibold leading-snug group-hover:text-warm-brown transition-colors">
                  &quot;Zero surprise costs. Delivered on time.&quot;
                </p>
                <p className="font-inter text-[10px] text-muted mt-1">— Priya S., Sarjapur Rd</p>
              </a>

              {/* Floating urgency chip */}
              <div className="absolute -top-4 -right-2 bg-terracotta text-ivory rounded-xl shadow-lg px-4 py-2.5 text-center">
                <div className="font-inter text-[10px] font-semibold uppercase tracking-wider opacity-80">{nextMonth}</div>
                <div className="font-playfair text-lg font-bold leading-none">4 slots left</div>
              </div>
            </AnimatedSection>
          </div>

          {/* Journey strip */}
          <AnimatedSection>
            <div className="border-t border-sand/60 pt-8 pb-10">
              <p className="font-inter text-[11px] uppercase tracking-[0.18em] text-charcoal/40 text-center mb-8">
                From enquiry to move-in — here&apos;s how it works
              </p>

              {/* Desktop */}
              <div className="hidden sm:flex justify-center">
                <div className="relative flex items-start">
                  <div className="absolute top-[22px] left-[96px] right-[96px] h-px bg-warm-brown/30" />
                  {journey.map((item, i) => (
                    <div key={i} className="flex flex-col items-center text-center w-[148px] relative z-10">
                      <div className="w-11 h-11 rounded-full border-2 border-warm-brown/30 flex items-center justify-center text-lg bg-cream">
                        {item.icon}
                      </div>
                      <div className="font-inter text-[12px] font-semibold mt-2 leading-snug px-1 text-charcoal">
                        {item.label}
                      </div>
                      <div className="font-inter text-[11px] mt-0.5 text-charcoal/45">
                        {item.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-3 sm:hidden">
                {journey.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-warm-brown/30 bg-cream flex items-center justify-center text-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-inter text-[13px] font-semibold text-charcoal">
                        {item.label}
                      </div>
                      <div className="font-inter text-[11px] text-muted/60">
                        {item.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {modalOpen && <HowItWorksModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
