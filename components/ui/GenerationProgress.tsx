"use client";

import { useEffect, useState } from "react";

const STAGES = [
  { at: 0, label: "Reading your requirements…" },
  { at: 20, label: "Planning room layout & zoning…" },
  { at: 45, label: "Placing walls, doors & windows…" },
  { at: 70, label: "Drawing furniture & dimensions…" },
  { at: 88, label: "Finishing touches…" },
];

/**
 * A simulated (not literal) progress bar for the Claude generation calls,
 * which don't stream token-level progress back to the client. Fills toward
 * ~92% while `active` is true and slows down as it approaches the cap, so it
 * never falsely claims to be finished before the request actually resolves —
 * the parent simply stops rendering this once loading flips to false.
 */
export default function GenerationProgress({ active, className = "" }: { active: boolean; className?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    setProgress(4);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p;
        const remaining = 92 - p;
        const step = Math.max(0.4, remaining * 0.06);
        return Math.min(92, p + step);
      });
    }, 300);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  const stage = [...STAGES].reverse().find((s) => progress >= s.at) ?? STAGES[0];

  return (
    <div className={`w-full ${className}`}>
      <p className="font-inter text-sm text-muted mb-2 text-center">{stage.label}</p>
      <div className="w-full h-2 bg-sand rounded-full overflow-hidden">
        <div
          className="h-full bg-warm-brown rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
