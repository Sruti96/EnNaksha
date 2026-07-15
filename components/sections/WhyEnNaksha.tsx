"use client";

import { useState, useEffect } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const SHEET_API = "https://script.google.com/macros/s/AKfycbyZg7sTQPYcNmE0Dayde82QUdjp7ONRrxpjHGK50A6-nY5I6qiZ9S4erTHadSfLhfxl1g/exec";

const pillars = [
  {
    num: "01",
    title: "Software Delivery Discipline",
    body: "We run your home project like a tech sprint — milestones, accountability, and zero surprises.",
  },
  {
    num: "02",
    title: "Absolute Financial Transparency",
    body: "Transparent BOQ agreed before work starts. Every rupee documented — no surprise costs on your agreed scope.",
  },
  {
    num: "03",
    title: "Async Project Tracking",
    body: "Daily photo updates replace weekend site visits. Check progress from anywhere in the world.",
  },
];

type Review = { name: string; location: string; quote: string; initials: string; rating: number };


function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`text-[20px] transition-colors ${
            star <= (hovered || value) ? "text-yellow-500" : "text-gray-300"
          } ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const NEGATIVE_WORDS = [
  "bad","worst","terrible","horrible","awful","disgusting","pathetic","useless","waste","fraud",
  "cheat","scam","cheated","liar","lied","dishonest","unprofessional","incompetent","rude","disrespectful",
  "delay","delayed","overcharged","overcharge","regret","disappointed","disappointing","poor","never again",
  "do not recommend","don't recommend","not recommend","avoid","money wasted","wasted money","ruined",
  "nightmare","disaster","broke","broken","damaged","careless","negligent","ignored","ignored us",
  "no response","no updates","no communication","miss","missed","incomplete","unfinished","substandard",
];

function isNegative(text: string): boolean {
  const lower = text.toLowerCase();
  return NEGATIVE_WORDS.some((w) => lower.includes(w));
}

function WriteReviewModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: Review) => Promise<void> }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;

    const approved = rating >= 4 && !isNegative(quote);
    if (approved) {
      const initials = name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
      await onSubmit({ name: name.trim(), location: location.trim(), quote: quote.trim(), initials, rating });
    }
    // Always show thank you — negative/low-rated reviews are silently dropped
    setSubmitted(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(46,27,14,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-ivory rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-sand">
          <h3 className="font-playfair text-[22px] font-bold text-charcoal">Share Your Experience</h3>
          <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal text-2xl leading-none transition-colors">×</button>
        </div>

        {submitted ? (
          <div className="px-6 py-12 text-center">
            <div className="text-5xl mb-4">🙏</div>
            <h4 className="font-playfair text-xl font-bold text-charcoal mb-2">Thank you!</h4>
            <p className="font-inter text-[14px] text-charcoal/70">Your review has been added. We truly appreciate you taking the time.</p>
            <button onClick={onClose} className="mt-6 bg-warm-brown text-ivory font-inter font-semibold text-[13px] px-6 py-2.5 rounded-lg hover:bg-charcoal transition-colors">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
            <div>
              <label className="font-inter text-[11px] font-semibold uppercase tracking-widest text-warm-brown block mb-1.5">Your Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="font-inter text-[11px] font-semibold uppercase tracking-widest text-warm-brown block mb-1.5">Your Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya S."
                className="w-full border border-sand rounded-lg px-4 py-2.5 font-inter text-[14px] text-charcoal bg-cream placeholder-charcoal/30 focus:outline-none focus:border-warm-brown transition-colors" />
            </div>
            <div>
              <label className="font-inter text-[11px] font-semibold uppercase tracking-widest text-warm-brown block mb-1.5">Location / Context</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Sarjapur Road, 3 BHK"
                className="w-full border border-sand rounded-lg px-4 py-2.5 font-inter text-[14px] text-charcoal bg-cream placeholder-charcoal/30 focus:outline-none focus:border-warm-brown transition-colors" />
            </div>
            <div>
              <label className="font-inter text-[11px] font-semibold uppercase tracking-widest text-warm-brown block mb-1.5">Your Review *</label>
              <textarea required value={quote} onChange={(e) => setQuote(e.target.value)} rows={4}
                placeholder="Tell us about your experience with EnNaksha..."
                className="w-full border border-sand rounded-lg px-4 py-2.5 font-inter text-[14px] text-charcoal bg-cream placeholder-charcoal/30 focus:outline-none focus:border-warm-brown transition-colors resize-none" />
            </div>
            <button type="submit" className="bg-warm-brown text-ivory font-inter font-semibold text-[14px] py-3 rounded-lg hover:bg-charcoal transition-colors">
              Submit Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function WhyEnNaksha() {
  const [extraReviews, setExtraReviews] = useState<Review[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch(SHEET_API)
      .then((res) => res.json())
      .then((data: Array<{ name: string; location: string; quote: string; rating: number }>) => {
        const loaded: Review[] = data.map((r) => ({
          name: r.name,
          location: r.location,
          quote: r.quote,
          rating: Number(r.rating),
          initials: r.name.trim().split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2),
        }));
        setExtraReviews(loaded);
      })
      .catch(() => {}); // silently fail if sheet is unreachable
  }, []);

  return (
    <SectionWrapper id="reviews" className="bg-sand py-20">
      {modalOpen && (
        <WriteReviewModal
          onClose={() => setModalOpen(false)}
          onSubmit={async (r) => {
    try {
      await fetch(SHEET_API, {
        method: "POST",
        body: JSON.stringify({ name: r.name, location: r.location, quote: r.quote, rating: r.rating }),
      });
    } catch {}
    // Don't add to UI — only shows after you approve in Google Sheet
    setModalOpen(false);
  }}
        />
      )}

      {/* Header */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <span className="font-inter text-[11px] uppercase tracking-[0.18em] text-warm-brown/70 mb-3 block">
              What sets us apart
            </span>
            <h2 className="font-playfair text-3xl sm:text-[42px] font-bold text-charcoal leading-tight">
              Why Homeowners Trust EnNaksha
            </h2>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 border-2 border-warm-brown text-warm-brown font-inter font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:bg-warm-brown hover:text-ivory transition-colors flex-shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Write a Review
          </button>
        </div>
      </AnimatedSection>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillars.map((p, i) => (
          <AnimatedSection key={i}>
            <div className="bg-ivory rounded-2xl border border-sand shadow-sm hover:shadow-md transition-shadow px-7 pt-8 pb-7 h-full">
              <div className="font-playfair text-[60px] font-bold text-terracotta leading-none mb-5">{p.num}</div>
              <h3 className="font-playfair text-[20px] font-bold text-charcoal mb-3 leading-snug">{p.title}</h3>
              <p className="font-inter text-[15px] text-charcoal/65 leading-[1.75]">{p.body}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      {/* Extra reviews — always collapsed until "Show more" is clicked */}
      {extraReviews.length > 0 && (
        <div className="mt-10">
          {!showAll ? (
            <div className="flex justify-center">
              <button
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-2 font-inter text-[13px] font-semibold text-warm-brown border border-warm-brown/40 px-5 py-2.5 rounded-lg hover:bg-warm-brown hover:text-ivory transition-colors"
              >
                Show {extraReviews.length} more review{extraReviews.length !== 1 ? "s" : ""} ↓
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {extraReviews.map((r, i) => (
                  <AnimatedSection key={i}>
                    <div className="bg-ivory rounded-xl p-6 border-l-4 border-warm-brown shadow-sm">
                      <StarRating value={r.rating} />
                      <p className="font-inter text-[15px] italic text-charcoal/80 leading-[1.75] my-4">&ldquo;{r.quote}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-warm-brown text-ivory flex items-center justify-center font-inter font-bold text-sm flex-shrink-0">{r.initials}</div>
                        <div>
                          <div className="font-inter font-semibold text-charcoal text-[14px]">{r.name}</div>
                          {r.location && <div className="font-inter text-[13px] text-charcoal/55">{r.location}</div>}
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setShowAll(false)}
                  className="font-inter text-[13px] font-semibold text-warm-brown hover:underline"
                >
                  Show less ↑
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </SectionWrapper>
  );
}
