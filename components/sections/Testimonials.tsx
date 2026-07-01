"use client";

import { useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

const INITIAL_REVIEWS = [
  {
    quote:
      "EnNaksha delivered our 3 BHK exactly on time with zero surprise costs. The WhatsApp updates meant we never had to visit the site once.",
    name: "Priya & Rahul S.",
    location: "Sarjapur Road",
    initials: "PR",
    rating: 5,
  },
  {
    quote:
      "As an NRI buying a home in Bangalore remotely, I was terrified. EnNaksha's photo updates and fixed pricing gave me complete peace of mind.",
    name: "Arun M.",
    location: "NRI — buying in Whitefield",
    initials: "AM",
    rating: 5,
  },
];

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
          className={`text-2xl transition-colors ${
            star <= (hovered || value) ? "text-yellow-400" : "text-gray-300"
          } ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: (typeof INITIAL_REVIEWS)[0] }) {
  return (
    <div className="bg-ivory rounded-xl p-8 border-l-4 border-warm-brown shadow-sm h-full flex flex-col">
      <StarRating value={review.rating} />
      <p className="font-inter text-base italic text-charcoal leading-relaxed my-5 flex-1">
        &ldquo;{review.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-warm-brown text-ivory flex items-center justify-center font-inter font-bold text-sm flex-shrink-0">
          {review.initials}
        </div>
        <div>
          <div className="font-inter font-bold text-charcoal text-sm">{review.name}</div>
          <div className="font-inter text-xs text-muted">{review.location}</div>
        </div>
      </div>
    </div>
  );
}

function WriteReviewModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: (typeof INITIAL_REVIEWS)[0]) => void }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;
    const initials = name
      .trim()
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    onSubmit({ name: name.trim(), location: location.trim(), quote: quote.trim(), initials, rating });
    setSubmitted(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(46,27,14,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-ivory rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-sand">
          <h3 className="font-playfair text-[22px] font-bold text-charcoal">Share Your Experience</h3>
          <button
            onClick={onClose}
            className="text-charcoal/40 hover:text-charcoal transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-12 text-center">
            <div className="text-5xl mb-4">🙏</div>
            <h4 className="font-playfair text-xl font-bold text-charcoal mb-2">Thank you!</h4>
            <p className="font-inter text-[14px] text-charcoal/70">
              Your review has been added. We truly appreciate you taking the time.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-warm-brown text-ivory font-inter font-semibold text-[13px] px-6 py-2.5 rounded-lg hover:bg-charcoal transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
            {/* Rating */}
            <div>
              <label className="font-inter text-[12px] font-semibold uppercase tracking-widest text-warm-brown block mb-1.5">
                Your Rating
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            {/* Name */}
            <div>
              <label className="font-inter text-[12px] font-semibold uppercase tracking-widest text-warm-brown block mb-1.5">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya S."
                className="w-full border border-sand rounded-lg px-4 py-2.5 font-inter text-[14px] text-charcoal bg-cream placeholder-charcoal/30 focus:outline-none focus:border-warm-brown transition-colors"
              />
            </div>

            {/* Location */}
            <div>
              <label className="font-inter text-[12px] font-semibold uppercase tracking-widest text-warm-brown block mb-1.5">
                Location / Context
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sarjapur Road, 3 BHK"
                className="w-full border border-sand rounded-lg px-4 py-2.5 font-inter text-[14px] text-charcoal bg-cream placeholder-charcoal/30 focus:outline-none focus:border-warm-brown transition-colors"
              />
            </div>

            {/* Review */}
            <div>
              <label className="font-inter text-[12px] font-semibold uppercase tracking-widest text-warm-brown block mb-1.5">
                Your Review *
              </label>
              <textarea
                required
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={4}
                placeholder="Tell us about your experience with EnNaksha..."
                className="w-full border border-sand rounded-lg px-4 py-2.5 font-inter text-[14px] text-charcoal bg-cream placeholder-charcoal/30 focus:outline-none focus:border-warm-brown transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="bg-warm-brown text-ivory font-inter font-semibold text-[14px] py-3 rounded-lg hover:bg-charcoal transition-colors"
            >
              Submit Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [allReviews, setAllReviews] = useState(INITIAL_REVIEWS);
  const [page, setPage] = useState(0); // 0 = first 2, 1 = next 2, etc.
  const [showAll, setShowAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const PER_PAGE = 2;
  const visibleReviews = showAll ? allReviews : allReviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const totalPages = Math.ceil(allReviews.length / PER_PAGE);

  function handleNewReview(r: (typeof INITIAL_REVIEWS)[0]) {
    setAllReviews((prev) => [...prev, r]);
    setShowAll(true); // show all so new review is visible
    setModalOpen(false);
  }

  return (
    <SectionWrapper className="bg-cream py-20">
      {modalOpen && (
        <WriteReviewModal onClose={() => setModalOpen(false)} onSubmit={handleNewReview} />
      )}

      <AnimatedSection>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-charcoal">
              What Our Clients Say
            </h2>
            <p className="font-inter text-[14px] text-muted mt-1">
              {allReviews.length} review{allReviews.length !== 1 ? "s" : ""} from happy homeowners
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 border-2 border-warm-brown text-warm-brown font-inter font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:bg-warm-brown hover:text-ivory transition-colors flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Write a Review
          </button>
        </div>
      </AnimatedSection>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleReviews.map((t, i) => (
          <AnimatedSection key={`${page}-${i}`}>
            <ReviewCard review={t} />
          </AnimatedSection>
        ))}
      </div>

      {/* Pagination / Show More */}
      {!showAll && (
        <div className="flex items-center justify-center gap-4 mt-10">
          {/* Prev/Next dots */}
          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-9 h-9 rounded-full border border-sand flex items-center justify-center text-charcoal/50 hover:border-warm-brown hover:text-warm-brown disabled:opacity-30 transition-colors"
              >
                ‹
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === page ? "bg-warm-brown" : "bg-sand"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="w-9 h-9 rounded-full border border-sand flex items-center justify-center text-charcoal/50 hover:border-warm-brown hover:text-warm-brown disabled:opacity-30 transition-colors"
              >
                ›
              </button>
            </div>
          )}

          {allReviews.length > PER_PAGE && (
            <button
              onClick={() => setShowAll(true)}
              className="font-inter text-[13px] font-semibold text-warm-brown hover:underline"
            >
              Show all {allReviews.length} reviews →
            </button>
          )}
        </div>
      )}

      {showAll && allReviews.length > PER_PAGE && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => { setShowAll(false); setPage(0); }}
            className="font-inter text-[13px] font-semibold text-warm-brown hover:underline"
          >
            Show less ↑
          </button>
        </div>
      )}
    </SectionWrapper>
  );
}
