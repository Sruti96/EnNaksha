"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";

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
  const [dragging, setDragging] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="contact" className="bg-cream py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-ivory rounded-2xl p-10 shadow-lg border border-sand">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="font-playfair text-3xl font-bold text-charcoal mb-4">
              We've received your details!
            </h2>
            <p className="font-inter text-muted leading-relaxed">
              Our design team will WhatsApp you within 24 hours. Sit back —
              your dream home is in good hands.
            </p>
            <div
              className="mt-8 h-32 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, #C4622D22, #8B691422, #E8E0D0)",
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="bg-cream py-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-charcoal mb-3">
            Engineer My Naksha
          </h2>
          <p className="font-inter text-muted">
            Tell us about your dream home. Our design team will reach out within 24 hours.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => (
              <span
                key={i}
                className={`text-xs font-inter font-semibold ${
                  i <= step ? "text-warm-brown" : "text-muted"
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
          <div className="bg-ivory rounded-2xl p-8 shadow-md border border-sand min-h-[280px] relative overflow-hidden">
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
                  <input
                    type="text"
                    placeholder="e.g., Prestige Lakeside, Sarjapur Road"
                    value={data.location}
                    onChange={(e) => setData({ ...data, location: e.target.value })}
                    className="w-full border border-sand rounded-lg px-4 py-3 font-inter text-sm focus:outline-none focus:border-warm-brown bg-cream"
                    required
                  />
                </div>
                <div>
                  <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                    Gmail address
                  </label>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="w-full border border-sand rounded-lg px-4 py-3 font-inter text-sm focus:outline-none focus:border-warm-brown bg-cream"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <h3 className="font-playfair text-xl font-bold text-charcoal">
                  Space Configuration
                </h3>
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
                      swatch: "linear-gradient(135deg, #e0e7ef, #f8f9fa, #b0bec5)",
                    },
                    {
                      label: "Warm & Traditional",
                      swatch: "linear-gradient(135deg, #C4622D, #8B6914, #E8D5B0)",
                    },
                    {
                      label: "Bold & Premium",
                      swatch: "linear-gradient(135deg, #1a237e, #c8a600, #263238)",
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
                  <div className="flex items-center border border-sand rounded-lg overflow-hidden focus-within:border-warm-brown">
                    <span className="bg-sand px-3 py-3 font-inter text-sm text-charcoal font-semibold border-r border-sand">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={data.whatsapp}
                      onChange={(e) =>
                        setData({ ...data, whatsapp: e.target.value })
                      }
                      className="flex-1 px-4 py-3 font-inter text-sm focus:outline-none bg-cream"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
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
              <Button type="button" variant="primary" onClick={next}>
                Continue →
              </Button>
            ) : (
              <Button type="submit" variant="primary" className="w-full">
                Engineer My Naksha →
              </Button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
