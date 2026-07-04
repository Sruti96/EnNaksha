"use client";

import type { FloorPlanLayout } from "@/lib/floorplan";

const PALETTE = [
  "#EFE4D6",
  "#E3D4BE",
  "#D9C2A0",
  "#C9B18C",
  "#F3ECE1",
  "#DCCBB0",
  "#E8DAC4",
  "#EAD9C2",
];

export default function FloorPlanSVG({ layout }: { layout: FloorPlanLayout }) {
  const scale = 20; // pixels per foot
  const padding = 30;
  const canvasWidth = layout.totalWidth * scale + padding * 2;
  const canvasHeight = layout.totalHeight * scale + padding * 2;

  return (
    <div className="w-full bg-cream rounded-xl border border-sand p-4">
      {layout.title && (
        <h4 className="font-playfair text-base font-bold text-charcoal mb-2">
          {layout.title}
        </h4>
      )}
      <div className="w-full overflow-auto">
        <svg
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          width="100%"
          style={{ maxHeight: 520 }}
        >
          {/* Outer plot boundary */}
          <rect
            x={padding}
            y={padding}
            width={layout.totalWidth * scale}
            height={layout.totalHeight * scale}
            fill="none"
            stroke="#7C4A1E"
            strokeWidth={3}
          />

          {layout.rooms.map((room, i) => (
            <g key={`${room.name}-${i}`}>
              <rect
                x={padding + room.x * scale}
                y={padding + room.y * scale}
                width={Math.max(room.width * scale, 1)}
                height={Math.max(room.height * scale, 1)}
                fill={PALETTE[i % PALETTE.length]}
                stroke="#B5651D"
                strokeWidth={1.5}
              />
              <text
                x={padding + (room.x + room.width / 2) * scale}
                y={padding + (room.y + room.height / 2) * scale - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fontFamily="Inter, sans-serif"
                fontWeight={600}
                fill="#2E1B0E"
              >
                {room.name}
              </text>
              <text
                x={padding + (room.x + room.width / 2) * scale}
                y={padding + (room.y + room.height / 2) * scale + 12}
                textAnchor="middle"
                fontSize={9}
                fontFamily="Inter, sans-serif"
                fill="#5c4632"
              >
                {room.width}&apos; x {room.height}&apos;
              </text>
            </g>
          ))}
        </svg>
      </div>
      {layout.notes && (
        <p className="font-inter text-xs text-muted mt-3 italic">{layout.notes}</p>
      )}
    </div>
  );
}
