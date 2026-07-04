"use client";

import { useState } from "react";
import FloorPlanSVG, { type PlanStyle } from "@/components/ui/FloorPlanSVG";
import PlanStyleToggle from "@/components/ui/PlanStyleToggle";
import type { ArchitecturalPlan } from "@/lib/architecturalPlan";

const SITE_SCALE = 10; // px per foot — smaller than the floor-plan scale since plots are larger
const SITE_PAD = 50;

const SITE_THEMES: Record<
  PlanStyle,
  {
    bg: string;
    plotFill: string;
    ink: string;
    line: string;
    roadLine: string;
    footprintFill: string;
    drivewayFill: string;
    parkingFill: string;
    entryFill: string;
  }
> = {
  warm: {
    bg: "#FBF6EE",
    plotFill: "#eef2ea",
    ink: "#3a2a1a",
    line: "#7C4A1E",
    roadLine: "#8a8478",
    footprintFill: "#fff",
    drivewayFill: "#ddd6c8",
    parkingFill: "#e8e2d4",
    entryFill: "#B5651D",
  },
  blueprint: {
    bg: "#F2F7FB",
    plotFill: "#ffffff",
    ink: "#0f2438",
    line: "#0f2438",
    roadLine: "#7691a8",
    footprintFill: "#ffffff",
    drivewayFill: "#eaf1f7",
    parkingFill: "#eaf1f7",
    entryFill: "#0f2438",
  },
};

function siteToPx(ft: number) {
  return ft * SITE_SCALE;
}

function SitePlanSVG({ plan, style }: { plan: ArchitecturalPlan; style: PlanStyle }) {
  const { sitePlan } = plan;
  const theme = SITE_THEMES[style];
  const canvasWidth = SITE_PAD * 2 + siteToPx(sitePlan.plotWidth);
  const canvasHeight = SITE_PAD * 2 + siteToPx(sitePlan.plotDepth);
  const X = (ft: number) => SITE_PAD + siteToPx(ft);
  const Y = (ft: number) => SITE_PAD + siteToPx(ft);

  let roadEdge: { x1: number; y1: number; x2: number; y2: number };
  let labelOffset: { x: number; y: number };
  switch (sitePlan.roadSide) {
    case "north":
      roadEdge = { x1: X(0), y1: Y(0), x2: X(sitePlan.plotWidth), y2: Y(0) };
      labelOffset = { x: 0, y: -12 };
      break;
    case "east":
      roadEdge = { x1: X(sitePlan.plotWidth), y1: Y(0), x2: X(sitePlan.plotWidth), y2: Y(sitePlan.plotDepth) };
      labelOffset = { x: 30, y: 0 };
      break;
    case "west":
      roadEdge = { x1: X(0), y1: Y(0), x2: X(0), y2: Y(sitePlan.plotDepth) };
      labelOffset = { x: -30, y: 0 };
      break;
    default:
      roadEdge = { x1: X(0), y1: Y(sitePlan.plotDepth), x2: X(sitePlan.plotWidth), y2: Y(sitePlan.plotDepth) };
      labelOffset = { x: 0, y: 20 };
  }

  const gridId = "siteplan-grid";

  return (
    <div className="w-full bg-cream rounded-xl border border-sand p-4">
      <h4 className="font-playfair text-base font-bold text-charcoal mb-2">Site Plan</h4>
      <div className="w-full overflow-auto">
        <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} width="100%" style={{ maxHeight: 480 }}>
          {style === "blueprint" && (
            <defs>
              <pattern id={gridId} width={SITE_SCALE} height={SITE_SCALE} patternUnits="userSpaceOnUse">
                <path d={`M ${SITE_SCALE} 0 L 0 0 0 ${SITE_SCALE}`} fill="none" stroke="#c7d9e8" strokeWidth={0.5} />
              </pattern>
            </defs>
          )}
          <rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={style === "blueprint" ? `url(#${gridId})` : theme.bg} />
          {style === "blueprint" && <rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={theme.bg} opacity={0.35} />}

          <rect
            x={X(0)}
            y={Y(0)}
            width={siteToPx(sitePlan.plotWidth)}
            height={siteToPx(sitePlan.plotDepth)}
            fill={theme.plotFill}
            stroke={theme.ink}
            strokeWidth={2}
          />

          <line x1={roadEdge.x1} y1={roadEdge.y1} x2={roadEdge.x2} y2={roadEdge.y2} stroke={theme.roadLine} strokeWidth={10} strokeDasharray="2,6" />
          <text
            x={(roadEdge.x1 + roadEdge.x2) / 2 + labelOffset.x}
            y={(roadEdge.y1 + roadEdge.y2) / 2 + labelOffset.y}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize={10}
            fill={theme.ink}
          >
            Road ({sitePlan.roadWidth}&apos; wide)
          </text>

          <rect
            x={X(sitePlan.footprint.x)}
            y={Y(sitePlan.footprint.y)}
            width={siteToPx(sitePlan.footprint.width)}
            height={siteToPx(sitePlan.footprint.height)}
            fill={theme.footprintFill}
            stroke={theme.line}
            strokeWidth={1.5}
            strokeDasharray="6,3"
          />
          <text x={X(sitePlan.footprint.x) + 6} y={Y(sitePlan.footprint.y) + 14} fontFamily="Inter, sans-serif" fontSize={10} fill={theme.line}>
            Building footprint
          </text>

          <rect
            x={X(sitePlan.driveway.x)}
            y={Y(sitePlan.driveway.y)}
            width={siteToPx(sitePlan.driveway.width)}
            height={siteToPx(sitePlan.driveway.height)}
            fill={theme.drivewayFill}
            stroke={theme.roadLine}
            strokeWidth={1}
          />

          {sitePlan.parking && (
            <g>
              <rect
                x={X(sitePlan.parking.x)}
                y={Y(sitePlan.parking.y)}
                width={siteToPx(sitePlan.parking.width)}
                height={siteToPx(sitePlan.parking.height)}
                fill={theme.parkingFill}
                stroke={theme.line}
                strokeWidth={1}
                strokeDasharray="3,2"
              />
              <text x={X(sitePlan.parking.x) + 4} y={Y(sitePlan.parking.y) + 12} fontFamily="Inter, sans-serif" fontSize={9} fill={theme.line}>
                Parking x{sitePlan.parking.capacity}
              </text>
            </g>
          )}

          <circle cx={X(sitePlan.entrance.x)} cy={Y(sitePlan.entrance.y)} r={5} fill={theme.entryFill} />
          <text x={X(sitePlan.entrance.x) + 8} y={Y(sitePlan.entrance.y) + 4} fontFamily="Inter, sans-serif" fontSize={9} fill={theme.ink}>
            Entry
          </text>

          <g transform={`translate(${canvasWidth - 50}, 20)`}>
            <circle cx={15} cy={15} r={15} fill="#fff" stroke={theme.line} strokeWidth={1} />
            <path d="M 15 4 L 20 18 L 15 14 L 10 18 Z" fill={theme.line} />
            <text x={15} y={34} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={9} fontWeight={700} fill={theme.ink}>
              N
            </text>
          </g>

          <text x={(X(0) + X(sitePlan.plotWidth)) / 2} y={Y(0) - 10} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10} fill={theme.line}>
            {sitePlan.plotWidth}&apos;
          </text>
          <text
            x={X(0) - 12}
            y={(Y(0) + Y(sitePlan.plotDepth)) / 2}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize={10}
            fill={theme.line}
            transform={`rotate(-90 ${X(0) - 12} ${(Y(0) + Y(sitePlan.plotDepth)) / 2})`}
          >
            {sitePlan.plotDepth}&apos;
          </text>
        </svg>
      </div>
      <p className="font-inter text-xs text-muted mt-2">
        Setbacks — front {sitePlan.setbacks.front}&apos;, rear {sitePlan.setbacks.rear}&apos;, sides {sitePlan.setbacks.left}&apos; — are typical
        assumptions; confirm exact norms with your local municipal authority.
      </p>
    </div>
  );
}

function ScheduleTable<T extends Record<string, unknown>>({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: { key: keyof T; label: string; render?: (row: T) => string }[];
  rows: T[];
}) {
  return (
    <div className="bg-ivory border border-sand rounded-xl p-4 overflow-auto">
      <h4 className="font-playfair text-sm font-bold text-charcoal mb-3">{title}</h4>
      <table className="w-full text-xs font-inter">
        <thead>
          <tr className="text-left text-muted border-b border-sand">
            {columns.map((c) => (
              <th key={String(c.key)} className="py-1 pr-4 whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-sand/50">
              {columns.map((c) => (
                <td key={String(c.key)} className="py-1 pr-4 whitespace-nowrap">
                  {c.render ? c.render(row) : String(row[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ArchitecturalPlanView({ plan }: { plan: ArchitecturalPlan }) {
  const [style, setStyle] = useState<PlanStyle>("warm");

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-ivory border border-sand rounded-xl p-5 flex flex-wrap justify-between gap-4">
        <div>
          <h3 className="font-playfair text-xl font-bold text-charcoal">{plan.title}</h3>
          {plan.preparedFor && <p className="font-inter text-sm text-muted">Prepared for: {plan.preparedFor}</p>}
        </div>
        <div className="text-right font-inter text-xs text-muted">
          <p>{plan.date}</p>
          <p>{plan.scaleLabel}</p>
          <p>
            Plot: {plan.sitePlan.plotWidth}&apos; x {plan.sitePlan.plotDepth}&apos;
          </p>
        </div>
      </div>

      <div className="bg-terracotta/10 border border-terracotta/30 rounded-xl p-4">
        <p className="font-inter text-xs text-charcoal leading-relaxed">
          <strong>Concept design only:</strong> {plan.disclaimer}
        </p>
      </div>

      <div className="flex justify-center">
        <PlanStyleToggle style={style} onChange={setStyle} />
      </div>

      <SitePlanSVG plan={plan} style={style} />

      {plan.floors.map((floor) => (
        <FloorPlanSVG
          key={floor.level}
          layout={floor.layout}
          columns={floor.columns}
          beams={floor.beams}
          utilities={floor.utilities}
          style={style}
        />
      ))}

      {plan.vastuNotes && (
        <div className="bg-ivory border border-sand rounded-xl p-4">
          <h4 className="font-playfair text-sm font-bold text-charcoal mb-1">Vastu Notes</h4>
          <p className="font-inter text-xs text-muted">{plan.vastuNotes}</p>
        </div>
      )}

      {plan.designNotes && (
        <div className="bg-ivory border border-sand rounded-xl p-4">
          <h4 className="font-playfair text-sm font-bold text-charcoal mb-1">Design Notes</h4>
          <p className="font-inter text-xs text-muted">{plan.designNotes}</p>
        </div>
      )}

      <div className="bg-ivory border border-sand rounded-xl p-4 overflow-auto">
        <h4 className="font-playfair text-sm font-bold text-charcoal mb-3">Area Schedule</h4>
        <table className="w-full text-xs font-inter">
          <thead>
            <tr className="text-left text-muted border-b border-sand">
              <th className="py-1 pr-4">Room</th>
              <th className="py-1 pr-4">Floor</th>
              <th className="py-1 pr-4">Length</th>
              <th className="py-1 pr-4">Width</th>
              <th className="py-1 pr-4">Area</th>
            </tr>
          </thead>
          <tbody>
            {plan.areaSchedule.map((row, i) => (
              <tr key={i} className="border-b border-sand/50">
                <td className="py-1 pr-4">{row.room}</td>
                <td className="py-1 pr-4">{row.floor}</td>
                <td className="py-1 pr-4">{row.length.toFixed(1)}&apos;</td>
                <td className="py-1 pr-4">{row.width.toFixed(1)}&apos;</td>
                <td className="py-1 pr-4">{Math.round(row.area)} sq ft</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 font-inter text-xs text-charcoal flex flex-wrap gap-x-6 gap-y-1">
          <span>
            <strong>Carpet Area:</strong> {plan.carpetAreaSqFt} sq ft
          </span>
          <span>
            <strong>Built-up Area:</strong> {plan.builtUpAreaSqFt} sq ft
          </span>
          <span>
            <strong>Super Built-up Area:</strong> {plan.superBuiltUpAreaSqFt} sq ft
          </span>
        </div>
      </div>

      <ScheduleTable
        title="Door Schedule"
        rows={plan.doorSchedule}
        columns={[
          { key: "id", label: "ID" },
          { key: "location", label: "Location" },
          { key: "width", label: "Width", render: (r) => `${r.width.toFixed(1)}'` },
          { key: "opening", label: "Opening" },
        ]}
      />

      <ScheduleTable
        title="Window Schedule"
        rows={plan.windowSchedule}
        columns={[
          { key: "id", label: "ID" },
          { key: "location", label: "Location" },
          { key: "width", label: "Size", render: (r) => `${r.width.toFixed(1)}'` },
          { key: "type", label: "Type" },
        ]}
      />
    </div>
  );
}
