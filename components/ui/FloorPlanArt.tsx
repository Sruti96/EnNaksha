"use client";

/**
 * Renders an SVG floor plan that Claude drew directly (the "art" flow —
 * see lib/floorplanArt.ts), as opposed to FloorPlanSVG which draws rooms
 * from structured coordinates itself. The markup has already been
 * sanitized server-side (scripts/event-handlers/foreign objects stripped)
 * before it reaches this component.
 */
export default function FloorPlanArt({
  svg,
  title,
  notes,
}: {
  svg: string;
  title?: string;
  notes?: string;
}) {
  return (
    <div className="w-full bg-cream rounded-xl border border-sand p-4">
      {title && <h4 className="font-playfair text-base font-bold text-charcoal mb-2">{title}</h4>}
      <div
        className="w-full overflow-auto [&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
        style={{ maxHeight: 640 }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {notes && <p className="font-inter text-xs text-muted mt-3 italic">{notes}</p>}
    </div>
  );
}
