"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { saveLeadFull } from "@/lib/leads";
import FloorPlanSVG, { type PlanStyle } from "@/components/ui/FloorPlanSVG";
import FloorPlanArt from "@/components/ui/FloorPlanArt";
import PlanStyleToggle from "@/components/ui/PlanStyleToggle";
import LocationAutocomplete from "@/components/ui/LocationAutocomplete";
import GenerationProgress from "@/components/ui/GenerationProgress";
import Sparkles from "@/components/ui/Sparkles";
import BackgroundSlideshow from "@/components/ui/BackgroundSlideshow";
import type { FloorPlanLayout } from "@/lib/floorplan";

// All real project photos (same folders the "Our Work Speaks" gallery uses),
// combined into one list for the success-screen background slideshow.
const ALL_PROJECT_IMAGES = [
  ...Array.from(
    { length: 8 },
    (_, i) => `/gallery/uber-verdant-sarjapur-road/photo-${String(i + 1).padStart(2, "0")}.png`
  ),
  ...Array.from(
    { length: 13 },
    (_, i) => `/gallery/amrutha-platinum-whitefield/photo-${String(i + 1).padStart(2, "0")}.jpg`
  ),
];

type DesignResult =
  | { mode: "art"; svg: string; title?: string; notes?: string }
  | { mode: "structured"; layout: FloorPlanLayout };

type FormData = {
  location: string;
  email: string;
  bhkType: string;
  homeSize: number;
  aesthetic: string;
  timeline: string;
  floorPlan: File | null;
  budget: number;
  fullName: string;
  whatsapp: string;
};

const PLANS = [
  { label: "Naksha Design Plan", sub: "₹175–200/sqft" },
  { label: "PMC Plan", sub: "₹350–450/sqft" },
  { label: "Not sure yet", sub: "" },
];

const ADD_ONS = [
  "Painting work (interior / exterior)",
  "Electrical fixtures and wiring",
  "Balcony or outdoor setup",
  "POP / false ceiling only",
];

const initialData: FormData = {
  location: "",
  email: "",
  bhkType: "",
  homeSize: 1000,
  aesthetic: "",
  timeline: "",
  floorPlan: null,
  budget: 1000000,
  fullName: "",
  whatsapp: "",
};

const STEPS = [
  "Location",
  "Space",
  "Aesthetic",
  "Timeline",
  "Floor Plan",
  "Budget",
];

// Temporarily disabled per request: skip the Claude-generated instant 2D
// design preview on submit — just show the success screen. Flip to true to
// re-enable calling /api/design after a lead is saved.
const ENABLE_INSTANT_DESIGN = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indian mobile numbers: 10 digits, starting with 6-9 (matches how
// normalizeWhatsAppNumber in lib/whatsapp.ts expects bare local numbers).
const PHONE_RE = /^[6-9]\d{9}$/;

function formatBudget(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
  const lakh = val / 100000;
  return `₹${lakh.toLocaleString("en-IN")}L`;
}

function formatSize(val: number) {
  return `${val.toLocaleString("en-IN")} sq ft`;
}

export default function LeadForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("PMC Plan");
  const [addOns, setAddOns] = useState<string[]>([]);
  const [designResult, setDesignResult] = useState<DesignResult | null>(null);
  const [designLoading, setDesignLoading] = useState(false);
  const [designError, setDesignError] = useState("");
  const [planStyle, setPlanStyle] = useState<PlanStyle>("blueprint");
  const [errors, setErrors] = useState<{ email?: string; whatsapp?: string }>({});

  const progress = ((step + 1) / STEPS.length) * 100;

  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 1);
  const nextMonth = nextDate.toLocaleString("en-IN", { month: "long" });

  const next = () => {
    if (step === 0) {
      const email = data.email.trim();
      if (!data.location.trim() || !email) return;
      if (!EMAIL_RE.test(email)) {
        setErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
        return;
      }
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const whatsapp = data.whatsapp.trim();
    if (!PHONE_RE.test(whatsapp)) {
      setErrors((prev) => ({ ...prev, whatsapp: "Enter a valid 10-digit mobile number" }));
      return;
    }
    setErrors((prev) => ({ ...prev, whatsapp: undefined }));

    setSubmitting(true);
    try {
      await saveLeadFull({
        location: data.location.trim(),
        email: data.email.trim(),
        plan: selectedPlan,
        bhkType: data.bhkType,
        homeSize: data.homeSize,
        aesthetic: data.aesthetic,
        timeline: data.timeline,
        floorPlan: data.floorPlan?.name ?? "",
        budget: data.budget,
        fullName: data.fullName.trim(),
        whatsapp: data.whatsapp.trim(),
        addOns,
      });
    } catch {
      // Still show success — data is best-effort captured on the server
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }

    // Instant 2D design preview on submit is temporarily disabled — the
    // success screen shows on its own for now. Flip ENABLE_INSTANT_DESIGN
    // back to true to re-enable the Claude-generated preview.
    if (!ENABLE_INSTANT_DESIGN) return;

    // Kick off the Claude-generated 2D design in the background using the
    // same inputs the client just entered (mirrors what's saved to the sheet).
    setDesignLoading(true);
    setDesignError("");
    try {
      const res = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bhkType: data.bhkType,
          homeSize: data.homeSize,
          aesthetic: data.aesthetic,
          plan: selectedPlan,
          budget: data.budget,
          location: data.location.trim(),
        }),
      });
      const result = await res.json();
      if (result.success) {
        if (result.mode === "art") {
          setDesignResult({ mode: "art", svg: result.svg, title: result.title, notes: result.notes });
        } else {
          setDesignResult({ mode: "structured", layout: result.layout });
        }
      } else {
        setDesignError(result.error || "Couldn't generate your design right now.");
      }
    } catch {
      setDesignError("Couldn't generate your design right now.");
    } finally {
      setDesignLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="contact" className="relative py-20 overflow-hidden">
        <BackgroundSlideshow images={ALL_PROJECT_IMAGES} />
        <div className="absolute inset-0 bg-sand/90" />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <div className="relative bg-ivory rounded-3xl p-12 shadow-lg border border-sand">
            <Sparkles />
            <div className="text-6xl mb-5">🏡</div>
            <h2 className="font-playfair text-3xl font-bold text-charcoal mb-3">
              Your dream home journey has begun!
            </h2>
            <p className="font-inter text-muted leading-relaxed mb-6">
              We&apos;ve received your enquiry! Our team will WhatsApp you <strong className="text-charcoal">within 24 hours</strong> with a free initial assessment. No sales pressure — just a conversation about your home.
            </p>
            <div className="flex justify-center gap-8 py-5 border-t border-b border-sand mb-6">
              {[["📐", "Free 2D layout"], ["📸", "Daily photo updates"], ["💰", "₹0 hidden charges"]].map(([icon, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="font-inter text-[11px] text-muted">{label}</div>
                </div>
              ))}
            </div>
            <p className="font-inter text-xs text-muted/60">
              While you wait, explore our{" "}
              <a href="#gallery" className="text-warm-brown underline">recent projects →</a>
            </p>

            {designLoading && <GenerationProgress active={designLoading} className="mt-6" />}

            {designResult && (
              <div className="mt-8 text-left">
                <h3 className="font-playfair text-lg font-bold text-charcoal mb-3 text-center">
                  Your Instant 2D Layout Preview
                </h3>
                {designResult.mode === "structured" && (
                  <div className="flex justify-center mb-3">
                    <PlanStyleToggle style={planStyle} onChange={setPlanStyle} />
                  </div>
                )}
                {designResult.mode === "art" ? (
                  <FloorPlanArt svg={designResult.svg} title={designResult.title} notes={designResult.notes} />
                ) : (
                  <FloorPlanSVG layout={designResult.layout} style={planStyle} />
                )}
                <p className="font-inter text-[11px] text-muted/70 mt-2 text-center">
                  A draft only — our designers will refine this with you before finalizing.
                </p>
              </div>
            )}

            {!designLoading && designError && (
              <p className="font-inter text-xs text-muted/60 mt-6">
                {designError}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="bg-sand py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-12 items-start">

          {/* Left — persuasion column */}
          <div className="lg:pt-2">
            <div className="inline-flex items-center gap-2 bg-warm-brown/10 border border-warm-brown/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
              <span className="font-inter text-[11px] font-semibold text-warm-brown uppercase tracking-[0.15em]">
                Free — Decide After You See Our Work
              </span>
            </div>
            <h2 className="font-playfair text-[34px] sm:text-[42px] font-bold text-charcoal leading-tight mb-4">
              Get Your Free<br />
              <span className="text-warm-brown italic">2D Home Design</span><br />
              in 48 Hours.
            </h2>
            <p className="font-inter text-[15px] text-muted leading-relaxed mb-7">
              Tell us about your space. We study your floor plan and connect you with the right professionals — with a personalised layout ready before you spend a single rupee.
            </p>

            <div className="flex flex-col gap-4 mb-7">
              {[
                { icon: "🔒", title: "Scope-locked pricing — documented in writing before work begins", sub: "No surprise costs on your agreed scope." },
                { icon: "📸", title: "Daily WhatsApp photo updates", sub: "Track your project from anywhere." },
                { icon: "⏱️", title: "On-time delivery, guaranteed", sub: "We hold vendors accountable so you don't have to." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="text-xl mt-0.5 flex-shrink-0">{item.icon}</div>
                  <div>
                    <div className="font-inter text-[14px] font-semibold text-charcoal">{item.title}</div>
                    <div className="font-inter text-[12px] text-muted">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-sand pt-5">
              <div className="flex gap-0.5 mb-1.5">
                {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-500 text-base">★</span>)}
                <span className="font-inter text-[12px] text-muted ml-2">4.9 / 5 · 180+ happy homeowners</span>
              </div>
              <p className="font-inter text-[13px] text-muted italic leading-snug">
                &ldquo;EnNaksha handled everything — I didn&apos;t visit the site even once. Worth every rupee.&rdquo;
              </p>
              <p className="font-inter text-[11px] text-muted/60 mt-1">— Arun M., NRI — Whitefield</p>
            </div>
          </div>

          {/* Right — form card */}
          <div>
            {/* Urgency + step indicator */}
            <div className="flex justify-between items-center mb-4">
              <span className="font-inter text-[11px] text-muted uppercase tracking-wider">
                Step {step + 1} of {STEPS.length}
              </span>
              <span className="font-inter text-[11px] text-terracotta font-semibold bg-terracotta/10 border border-terracotta/20 px-3 py-1 rounded-full">
                🔥 4 slots left for {nextMonth}
              </span>
            </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => (
              <span
                key={i}
                className={`text-[11px] font-inter font-semibold ${
                  i <= step ? "text-warm-brown" : "text-muted/50"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
          <div className="w-full h-1.5 bg-sand rounded-full overflow-hidden">
            <div
              className="h-full bg-warm-brown rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-ivory rounded-2xl p-8 shadow-lg border border-sand min-h-[280px] relative overflow-hidden">
            {/* Step 1 */}
            {step === 0 && (
              <div className="flex flex-col gap-5 animate-[fadeIn_0.3s_ease]">
                <h3 className="font-playfair text-xl font-bold text-charcoal">
                  Location & Identity
                </h3>
                <div>
                  <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                    Where is your new dream home located?
                  </label>
                  <LocationAutocomplete
                    placeholder="e.g., Prestige Lakeside, Sarjapur Road"
                    value={data.location}
                    onChange={(value) => setData({ ...data, location: value })}
                    className="w-full border border-sand rounded-lg px-4 py-3 font-inter text-sm focus:outline-none focus:border-warm-brown bg-cream"
                    required
                  />
                  <p className="font-inter text-[11px] text-muted mt-1">
                    Pick your apartment or project from the list if it appears — we&apos;ll check for its real layout.
                  </p>
                </div>
                <div>
                  <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                    Gmail address
                  </label>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={data.email}
                    onChange={(e) => {
                      setData({ ...data, email: e.target.value });
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`w-full border rounded-lg px-4 py-3 font-inter text-sm focus:outline-none bg-cream ${
                      errors.email ? "border-red-400 focus:border-red-500" : "border-sand focus:border-warm-brown"
                    }`}
                    required
                  />
                  {errors.email && (
                    <p className="font-inter text-[11px] text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <h3 className="font-playfair text-xl font-bold text-charcoal">
                  Space Configuration
                </h3>
                <div>
                  <label className="block font-inter text-sm font-medium text-charcoal mb-2">
                    Which plan are you interested in?
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {PLANS.map((plan) => (
                      <button
                        key={plan.label}
                        type="button"
                        onClick={() => setSelectedPlan(plan.label)}
                        className={`flex-1 border rounded-xl p-3 cursor-pointer text-left transition-all ${
                          selectedPlan === plan.label
                            ? "border-warm-brown bg-warm-brown/10 text-warm-brown"
                            : "border-sand text-charcoal hover:border-warm-brown/50"
                        }`}
                      >
                        <div className="font-inter text-sm font-semibold">{plan.label}</div>
                        {plan.sub && <div className="font-inter text-[11px] text-muted">{plan.sub}</div>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["2 BHK", "3 BHK", "4 BHK / Penthouse", "Independent Villa"].map(
                    (opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setData({ ...data, bhkType: opt })}
                        className={`border-2 rounded-xl p-4 font-inter text-sm font-semibold transition-all ${
                          data.bhkType === opt
                            ? "border-warm-brown bg-warm-brown/10 text-warm-brown"
                            : "border-sand text-charcoal hover:border-warm-brown/50"
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  )}
                </div>
                <div>
                  <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                    Home size:{" "}
                    <span className="text-warm-brown font-bold text-base">
                      {formatSize(data.homeSize)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={500}
                    max={3000}
                    step={50}
                    value={data.homeSize}
                    onChange={(e) =>
                      setData({ ...data, homeSize: Number(e.target.value) })
                    }
                    className="w-full accent-warm-brown"
                  />
                  <div className="flex justify-between text-xs text-muted font-inter mt-1">
                    <span>500 sq ft</span>
                    <span>3000+ sq ft</span>
                  </div>
                </div>
                <p className="text-xs text-muted font-inter">
                  Don't worry if it's not exact — upload your floor plan and we'll calculate it.
                </p>
              </div>
            )}

            {/* Step 3 */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <h3 className="font-playfair text-xl font-bold text-charcoal">
                  Design Aesthetic
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      label: "Sleek & Minimal",
                      swatch: "linear-gradient(135deg, #e8e0d4, #f8f4ee, #c8bfb0)",
                    },
                    {
                      label: "Warm & Traditional",
                      swatch: "linear-gradient(135deg, #7C4A1E, #B5651D, #E0CCAA)",
                    },
                    {
                      label: "Bold & Premium",
                      swatch: "linear-gradient(135deg, #2E1B0E, #B5651D, #7C4A1E)",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setData({ ...data, aesthetic: opt.label })}
                      className={`flex items-center gap-4 border-2 rounded-xl p-4 font-inter text-sm font-semibold transition-all ${
                        data.aesthetic === opt.label
                          ? "border-warm-brown bg-warm-brown/10 text-warm-brown"
                          : "border-sand text-charcoal hover:border-warm-brown/50"
                      }`}
                    >
                      <div
                        className="w-12 h-8 rounded-lg flex-shrink-0"
                        style={{ background: opt.swatch }}
                      />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                <h3 className="font-playfair text-xl font-bold text-charcoal">
                  Delivery Timeline
                </h3>
                <div className="flex flex-col gap-3">
                  {["Ready to Move In", "Within 3 Months", "6 Months+"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setData({ ...data, timeline: opt })}
                      className={`border-2 rounded-xl p-5 font-inter text-sm font-semibold transition-all text-left ${
                        data.timeline === opt
                          ? "border-warm-brown bg-warm-brown/10 text-warm-brown"
                          : "border-sand text-charcoal hover:border-warm-brown/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5 */}
            {step === 4 && (
              <div className="flex flex-col gap-5">
                <h3 className="font-playfair text-xl font-bold text-charcoal">
                  Floor Plan Upload{" "}
                  <span className="text-muted text-sm font-inter font-normal">
                    (Optional)
                  </span>
                </h3>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) setData({ ...data, floorPlan: file });
                  }}
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                    dragging
                      ? "border-warm-brown bg-warm-brown/5"
                      : "border-warm-brown/40 hover:border-warm-brown"
                  }`}
                >
                  {data.floorPlan ? (
                    <div>
                      <div className="text-4xl mb-2">📄</div>
                      <p className="font-inter text-sm font-semibold text-warm-brown">
                        {data.floorPlan.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => setData({ ...data, floorPlan: null })}
                        className="text-xs text-muted mt-2 underline font-inter"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-3">📁</div>
                      <p className="font-inter text-sm text-charcoal font-semibold mb-1">
                        Drag & drop your floor plan here
                      </p>
                      <p className="font-inter text-xs text-muted mb-4">
                        Accepts PDF or JPEG
                      </p>
                      <label className="cursor-pointer inline-block border border-warm-brown text-warm-brown font-inter text-sm font-semibold px-4 py-2 rounded-lg hover:bg-warm-brown hover:text-ivory transition-all">
                        Browse Files
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setData({ ...data, floorPlan: file });
                          }}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 6 */}
            {step === 5 && (
              <div className="flex flex-col gap-5">
                <h3 className="font-playfair text-xl font-bold text-charcoal">
                  Budget & Contact
                </h3>
                <div>
                  <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                    Budget:{" "}
                    <span className="text-warm-brown font-bold text-base">
                      {formatBudget(data.budget)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={300000}
                    max={3000000}
                    step={50000}
                    value={data.budget}
                    onChange={(e) =>
                      setData({ ...data, budget: Number(e.target.value) })
                    }
                    className="w-full accent-warm-brown"
                  />
                  <div className="flex justify-between text-xs text-muted font-inter mt-1">
                    <span>₹3L</span>
                    <span>₹30L+</span>
                  </div>
                </div>
                <div>
                  <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={data.fullName}
                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                    className="w-full border border-sand rounded-lg px-4 py-3 font-inter text-sm focus:outline-none focus:border-warm-brown bg-cream"
                    required
                  />
                </div>
                <div>
                  <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                    WhatsApp Number
                  </label>
                  <div
                    className={`flex items-center border rounded-lg overflow-hidden focus-within:border-warm-brown ${
                      errors.whatsapp ? "border-red-400" : "border-sand"
                    }`}
                  >
                    <span className="bg-sand px-3 py-3 font-inter text-sm text-charcoal font-semibold border-r border-sand">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={data.whatsapp}
                      onChange={(e) => {
                        setData({ ...data, whatsapp: e.target.value });
                        if (errors.whatsapp) setErrors((prev) => ({ ...prev, whatsapp: undefined }));
                      }}
                      className="flex-1 px-4 py-3 font-inter text-sm focus:outline-none bg-cream"
                      required
                    />
                  </div>
                  {errors.whatsapp && (
                    <p className="font-inter text-[11px] text-red-600 mt-1">{errors.whatsapp}</p>
                  )}
                </div>
                <div>
                  <label className="block font-inter text-sm font-medium text-charcoal mb-2">
                    Any additional work needed? <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ADD_ONS.map((addon) => (
                      <label key={addon} className="flex items-start gap-2 cursor-pointer font-inter text-[13px] text-charcoal/70 select-none">
                        <input
                          type="checkbox"
                          checked={addOns.includes(addon)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAddOns([...addOns, addon]);
                            } else {
                              setAddOns(addOns.filter((a) => a !== addon));
                            }
                          }}
                          className="accent-warm-brown mt-0.5 flex-shrink-0"
                        />
                        <span>{addon}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-5">
            {step > 0 ? (
              <button
                type="button"
                onClick={prev}
                className="font-inter text-sm text-muted hover:text-charcoal transition-colors px-4 py-2"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                onClick={next}
                className="shadow-lg shadow-warm-brown/30"
              >
                Continue →
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full shadow-lg shadow-warm-brown/30 py-4 text-[15px]"
              >
                {submitting ? "Submitting..." : "Engineer My Naksha →"}
              </Button>
            )}
          </div>
          {step === STEPS.length - 1 && (
            <p className="font-inter text-[11px] text-muted text-center mt-3">
              🔒 Your details are private. No spam, ever.
            </p>
          )}
        </form>
          </div>
        </div>
      </div>
    </section>
  );
}
