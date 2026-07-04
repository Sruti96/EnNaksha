"use client";

import type { PlanStyle } from "@/components/ui/FloorPlanSVG";

export default function PlanStyleToggle({
  style,
  onChange,
}: {
  style: PlanStyle;
  onChange: (style: PlanStyle) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-sand overflow-hidden text-xs font-inter font-semibold">
      <button
        type="button"
        onClick={() => onChange("warm")}
        className={`px-3 py-1.5 transition-colors ${
          style === "warm" ? "bg-warm-brown text-ivory" : "bg-ivory text-charcoal hover:bg-sand/50"
        }`}
      >
        Warm Concept
      </button>
      <button
        type="button"
        onClick={() => onChange("blueprint")}
        className={`px-3 py-1.5 transition-colors ${
          style === "blueprint" ? "bg-warm-brown text-ivory" : "bg-ivory text-charcoal hover:bg-sand/50"
        }`}
      >
        Blueprint
      </button>
    </div>
  );
}
