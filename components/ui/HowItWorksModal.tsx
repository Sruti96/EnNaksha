"use client";
import { useEffect } from "react";

const steps = [
  {
    icon: "📐",
    label: "Share Your Floor Plan",
    sub: "Free",
    detail: "Upload your floor plan on our website. We collect your property type, location, timeline, and budget — no calls needed.",
  },
  {
    icon: "✏️",
    label: "We Create Your 2D Layout",
    sub: "Free · Within 48 hours",
    detail: "Our design team prepares a personalised 2D layout based on your space. Delivered to you before you spend a single rupee.",
  },
  {
    icon: "🎨",
    label: "3D Design & Full Quote",
    sub: "Token fee",
    detail: "Pay a small token amount to unlock a full 3D render of your home and a detailed, itemised cost breakdown (BOQ).",
  },
  {
    icon: "✅",
    label: "Lock the Budget",
    sub: "Zero surprises",
    detail: "Review and approve the quote. Your agreed scope is cost-locked. If you change the scope, we'll tell you the cost before proceeding — always in writing.",
  },
  {
    icon: "🔨",
    label: "We Manage Everything",
    sub: "End-to-end",
    detail: "Your contractors begin fabrication. We share precise measurements and material specs, and we inspect quality before any surface coating is applied.",
  },
  {
    icon: "🏡",
    label: "You Move In",
    sub: "On time",
    detail: "Your home is ready. We do a final walkthrough and quality check before you move in — and we stay on call for 30 days post-handover.",
  },
];

interface Props {
  onClose: () => void;
}

export default function HowItWorksModal({ onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-ivory rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-ivory/95 backdrop-blur-sm border-b border-sand px-8 py-5 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <p className="font-inter text-[11px] uppercase tracking-[0.18em] text-warm-brown/70 mb-1">Step by step</p>
            <h2 className="font-playfair text-[24px] font-bold text-charcoal leading-tight">
              The EnNaksha Journey
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-sand hover:bg-warm-brown/15 flex items-center justify-center text-charcoal/60 hover:text-charcoal transition-all text-lg"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Steps */}
        <div className="px-8 py-6 flex flex-col gap-0">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-5">
              {/* Left — icon + connector */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-warm-brown/30 bg-cream flex items-center justify-center text-2xl flex-shrink-0">
                  {step.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-warm-brown/20 my-2" />
                )}
              </div>

              {/* Right — content */}
              <div className={`pb-7 flex-1 ${i === steps.length - 1 ? "pb-2" : ""}`}>
                <div className="flex items-center gap-3 mb-1 mt-2.5">
                  <span className="font-playfair text-[17px] font-bold text-charcoal leading-snug">
                    {step.label}
                  </span>
                  <span className={`font-inter text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    i === 2
                      ? "bg-terracotta/15 text-terracotta border border-terracotta/20"
                      : "bg-warm-brown/10 text-warm-brown border border-warm-brown/15"
                  }`}>
                    {step.sub}
                  </span>
                </div>
                <p className="font-inter text-[14px] text-charcoal/65 leading-[1.75]">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="px-8 py-6 border-t border-sand bg-sand/30 rounded-b-3xl">
          <a
            href="#contact"
            onClick={onClose}
            className="flex items-center justify-center w-full font-inter font-semibold text-[15px] bg-warm-brown text-ivory py-4 rounded-xl shadow-lg shadow-warm-brown/20 hover:bg-charcoal transition-all duration-200 active:scale-95"
          >
            Start My Project — Get Free 2D Layout →
          </a>
        </div>
      </div>
    </div>
  );
}
