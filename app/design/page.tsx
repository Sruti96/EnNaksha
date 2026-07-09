"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import FloorPlanSVG, { type PlanStyle } from "@/components/ui/FloorPlanSVG";
import PlanStyleToggle from "@/components/ui/PlanStyleToggle";
import type { FloorPlanLayout } from "@/lib/floorplan";

export default function DesignLookupPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [layout, setLayout] = useState<FloorPlanLayout | null>(null);
  const [planStyle, setPlanStyle] = useState<PlanStyle>("blueprint");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError("");
    setLayout(null);

    try {
      const res = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        setLayout(result.layout);
      } else {
        setError(result.error || "Couldn't generate a design for that email.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-sand min-h-screen py-20">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="font-playfair text-3xl font-bold text-charcoal mb-2 text-center">
          Get Your 2D Design
        </h1>
        <p className="font-inter text-sm text-muted text-center mb-8">
          Already sent us an enquiry? Enter the same email to pull your details from our
          records and generate your instant 2D layout.
        </p>

        <form
          onSubmit={handleGenerate}
          className="bg-ivory rounded-2xl p-8 shadow-lg border border-sand flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            required
            placeholder="yourname@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-sand rounded-lg px-4 py-3 font-inter text-sm focus:outline-none focus:border-warm-brown bg-cream"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Generating…" : "Generate My Design"}
          </Button>
        </form>

        {error && (
          <p className="font-inter text-sm text-terracotta mt-4 text-center">{error}</p>
        )}

        {layout && (
          <div className="mt-8">
            <div className="flex justify-center mb-3">
              <PlanStyleToggle style={planStyle} onChange={setPlanStyle} />
            </div>
            <FloorPlanSVG layout={layout} style={planStyle} />
          </div>
        )}
      </div>
    </main>
  );
}
