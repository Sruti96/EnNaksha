"use client";

import type { ReactNode } from "react";
import {
  categoryOf,
  findDoors,
  findWindows,
  type FloorPlanLayout,
  type Room,
  type RoomCategory,
  type DoorSpec,
  type WindowSpec,
} from "@/lib/floorplan";

const SCALE = 22; // px per foot
const WALL = 8; // wall stroke thickness (px)
const PAD_LEFT = 70;
const PAD_TOP = 50;
const PAD_RIGHT = 30;
const PAD_BOTTOM = 130;
const BG = "#FBF6EE";
const INK = "#3a2a1a";
const LINE = "#7C4A1E";

export type StructuralColumn = { x: number; y: number };
export type StructuralBeam = { x1: number; y1: number; x2: number; y2: number };
export type UtilityMarker = {
  x: number;
  y: number;
  label: string;
  icon?: "electrical" | "plumbing" | "water";
};

const CATEGORY_COLORS: Record<RoomCategory, string> = {
  bedroom: "#F3ECE1",
  master_bedroom: "#F0E7D8",
  living: "#EFE4D6",
  family: "#EFE4D6",
  kitchen: "#E3D4BE",
  bathroom: "#E4ECEC",
  powder: "#E4ECEC",
  dining: "#E8DAC4",
  foyer: "#EDE7DD",
  balcony: "#E3EAE2",
  terrace: "#E3EAE2",
  utility: "#E5DED0",
  pantry: "#E5DED0",
  pooja: "#F5EFE0",
  office: "#EDE3D2",
  study: "#EDE3D2",
  theater: "#E6DED2",
  gym: "#E8E2D4",
  servant: "#F0EAE0",
  store: "#E5DED0",
  staircase: "#DCD5C8",
  lift: "#DCD5C8",
  garage: "#DAD4C8",
  other: "#EDE7DD",
};

function toPx(ft: number) {
  return ft * SCALE;
}
function X(ft: number) {
  return PAD_LEFT + toPx(ft);
}
function Y(ft: number) {
  return PAD_TOP + toPx(ft);
}

function DoorIcon({ door }: { door: DoorSpec }) {
  const lenPx = toPx(door.len);
  const dir = door.swing;

  if (door.orientation === "v") {
    const x = X(door.x);
    const y1 = Y(door.y);
    const y2 = y1 + lenPx;
    const openX = x + dir * lenPx;
    return (
      <g>
        <rect x={x - WALL} y={y1} width={WALL * 2} height={lenPx} fill={BG} />
        <line x1={x} y1={y1} x2={openX} y2={y1} stroke={LINE} strokeWidth={1.5} />
        <path
          d={`M ${x} ${y2} A ${lenPx} ${lenPx} 0 0 ${dir > 0 ? 0 : 1} ${openX} ${y1}`}
          fill="none"
          stroke={LINE}
          strokeWidth={1}
          strokeDasharray="3,2"
        />
      </g>
    );
  }

  const y = Y(door.y);
  const x1 = X(door.x);
  const x2 = x1 + lenPx;
  const openY = y + dir * lenPx;
  return (
    <g>
      <rect x={x1} y={y - WALL} width={lenPx} height={WALL * 2} fill={BG} />
      <line x1={x1} y1={y} x2={x1} y2={openY} stroke={LINE} strokeWidth={1.5} />
      <path
        d={`M ${x2} ${y} A ${lenPx} ${lenPx} 0 0 ${dir > 0 ? 1 : 0} ${x1} ${openY}`}
        fill="none"
        stroke={LINE}
        strokeWidth={1}
        strokeDasharray="3,2"
      />
    </g>
  );
}

function WindowIcon({ win }: { win: WindowSpec }) {
  const lenPx = toPx(win.len);
  if (win.orientation === "h") {
    const x = X(win.x);
    const y = Y(win.y);
    return (
      <g>
        <rect x={x} y={y - WALL} width={lenPx} height={WALL * 2} fill={BG} />
        <line x1={x} y1={y - 2} x2={x + lenPx} y2={y - 2} stroke="#4a7a9c" strokeWidth={2} />
        <line x1={x} y1={y + 2} x2={x + lenPx} y2={y + 2} stroke="#4a7a9c" strokeWidth={2} />
      </g>
    );
  }
  const x = X(win.x);
  const y = Y(win.y);
  return (
    <g>
      <rect x={x - WALL} y={y} width={WALL * 2} height={lenPx} fill={BG} />
      <line x1={x - 2} y1={y} x2={x - 2} y2={y + lenPx} stroke="#4a7a9c" strokeWidth={2} />
      <line x1={x + 2} y1={y} x2={x + 2} y2={y + lenPx} stroke="#4a7a9c" strokeWidth={2} />
    </g>
  );
}

function BedIcon({ room }: { room: Room }) {
  const margin = 0.8;
  const bedW = Math.min(room.width - margin * 2, 6.5);
  const bedH = Math.min(room.height - margin * 2, 6.5, room.height * 0.6);
  if (bedW < 3 || bedH < 3) return null;
  const bx = room.x + (room.width - bedW) / 2;
  const by = room.y + margin;
  const x0 = X(bx);
  const y0 = Y(by);
  const w = toPx(bedW);
  const h = toPx(bedH);
  const pillowH = h * 0.22;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} rx={4} fill="#fff" stroke={LINE} strokeWidth={1} />
      <rect x={x0 + w * 0.08} y={y0 + h * 0.06} width={w * 0.36} height={pillowH} rx={4} fill="#EAD9C2" stroke={LINE} strokeWidth={0.75} />
      <rect x={x0 + w * 0.56} y={y0 + h * 0.06} width={w * 0.36} height={pillowH} rx={4} fill="#EAD9C2" stroke={LINE} strokeWidth={0.75} />
      <line x1={x0 + w * 0.06} y1={y0 + h * 0.62} x2={x0 + w * 0.94} y2={y0 + h * 0.62} stroke={LINE} strokeWidth={0.75} />
    </g>
  );
}

function SofaIcon({ room }: { room: Room }) {
  const margin = 0.8;
  const w = Math.min(room.width - margin * 2, 7);
  const depth = 2.2;
  if (w < 3) return null;
  const sx = room.x + (room.width - w) / 2;
  const sy = room.y + room.height - margin - depth;
  const x0 = X(sx);
  const y0 = Y(sy);
  const pw = toPx(w);
  const ph = toPx(depth);
  return (
    <g>
      <rect x={x0} y={y0} width={pw} height={ph} rx={4} fill="#fff" stroke={LINE} strokeWidth={1} />
      <rect x={x0} y={y0} width={pw * 0.12} height={ph} rx={3} fill="#EAD9C2" stroke={LINE} strokeWidth={0.75} />
      <rect x={x0 + pw * 0.88} y={y0} width={pw * 0.12} height={ph} rx={3} fill="#EAD9C2" stroke={LINE} strokeWidth={0.75} />
      <line x1={x0 + pw * 0.14} y1={y0 + ph * 0.15} x2={x0 + pw * 0.86} y2={y0 + ph * 0.15} stroke={LINE} strokeWidth={0.75} />
    </g>
  );
}

function DiningIcon({ room }: { room: Room }) {
  const cx = X(room.x + room.width / 2);
  const cy = Y(room.y + room.height / 2);
  const r = toPx(Math.min(room.width, room.height) * 0.28);
  if (r < 10) return null;
  const chair = r * 0.5;
  const offsets: [number, number][] = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={LINE} strokeWidth={1} />
      {offsets.map(([dx, dy], i) => (
        <rect
          key={i}
          x={cx + dx * (r + chair * 0.6) - chair / 2}
          y={cy + dy * (r + chair * 0.6) - chair / 2}
          width={chair}
          height={chair}
          fill="#EAD9C2"
          stroke={LINE}
          strokeWidth={0.75}
        />
      ))}
    </g>
  );
}

function KitchenIcon({ room }: { room: Room }) {
  const margin = 0.6;
  const w = Math.min(room.width - margin * 2, 8);
  const depth = 1.8;
  if (w < 3) return null;
  const kx = room.x + margin;
  const ky = room.y + margin;
  const x0 = X(kx);
  const y0 = Y(ky);
  const pw = toPx(w);
  const ph = toPx(depth);
  return (
    <g>
      <rect x={x0} y={y0} width={pw} height={ph} fill="#fff" stroke={LINE} strokeWidth={1} />
      <circle cx={x0 + pw * 0.22} cy={y0 + ph / 2} r={ph * 0.28} fill="none" stroke={LINE} strokeWidth={0.75} />
      {[0.6, 0.72, 0.84].map((f, i) => (
        <circle key={i} cx={x0 + pw * f} cy={y0 + ph / 2} r={ph * 0.16} fill="none" stroke={LINE} strokeWidth={0.75} />
      ))}
    </g>
  );
}

function BathroomIcon({ room }: { room: Room }) {
  const x0 = X(room.x + 0.6);
  const y0 = Y(room.y + 0.6);
  const w = toPx(Math.min(room.width, 4));
  return (
    <g>
      <rect x={x0} y={y0} width={w * 0.4} height={w * 0.22} fill="#fff" stroke="#4a7a9c" strokeWidth={1} />
      <ellipse cx={x0 + w * 0.2} cy={y0 + w * 0.42} rx={w * 0.22} ry={w * 0.18} fill="#fff" stroke="#4a7a9c" strokeWidth={1} />
      <circle cx={X(room.x + room.width - 0.9)} cy={y0} r={toPx(0.5)} fill="none" stroke="#4a7a9c" strokeWidth={1} />
    </g>
  );
}

function BalconyIcon({ room }: { room: Room }) {
  const y = Y(room.y + room.height - 0.3);
  const x0 = X(room.x + 0.3);
  const x1 = X(room.x + room.width - 0.3);
  const count = Math.max(3, Math.floor((x1 - x0) / 10));
  const lines: ReactNode[] = [];
  for (let i = 0; i <= count; i++) {
    const x = x0 + ((x1 - x0) * i) / count;
    lines.push(<line key={i} x1={x} y1={y - 8} x2={x} y2={y} stroke="#7a9c7a" strokeWidth={1} />);
  }
  return (
    <g>
      {lines}
      <line x1={x0} y1={y} x2={x1} y2={y} stroke="#7a9c7a" strokeWidth={1.5} />
    </g>
  );
}

function UtilityIcon({ room }: { room: Room }) {
  const x0 = X(room.x + 0.6);
  const y0 = Y(room.y + 0.6);
  const s = toPx(Math.min(room.width, room.height) * 0.4);
  return (
    <g>
      <rect x={x0} y={y0} width={s} height={s} fill="#fff" stroke={LINE} strokeWidth={1} />
      <circle cx={x0 + s / 2} cy={y0 + s / 2} r={s * 0.32} fill="none" stroke={LINE} strokeWidth={1} />
    </g>
  );
}

function ShelfIcon({ room }: { room: Room }) {
  const x0 = X(room.x + 0.5);
  const y0 = Y(room.y + 0.5);
  const w = toPx(Math.min(room.width - 1, 5));
  const h = toPx(Math.min(room.height - 1, 2.2));
  if (w < 20 || h < 15) return null;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} fill="#fff" stroke={LINE} strokeWidth={1} />
      {[0.33, 0.66].map((f, i) => (
        <line key={i} x1={x0} y1={y0 + h * f} x2={x0 + w} y2={y0 + h * f} stroke={LINE} strokeWidth={0.75} />
      ))}
    </g>
  );
}

function PoojaIcon({ room }: { room: Room }) {
  const cx = X(room.x + room.width / 2);
  const baseY = Y(room.y + room.height - 0.6);
  const w = toPx(Math.min(room.width - 1, 2.5));
  const h = toPx(1.6);
  if (w < 10) return null;
  return (
    <g>
      <rect x={cx - w / 2} y={baseY - h} width={w} height={h} fill="#fff" stroke="#B5651D" strokeWidth={1} />
      <path
        d={`M ${cx - w / 2 - 3} ${baseY - h} L ${cx} ${baseY - h - 12} L ${cx + w / 2 + 3} ${baseY - h} Z`}
        fill="#EAD9C2"
        stroke="#B5651D"
        strokeWidth={0.75}
      />
    </g>
  );
}

function DeskIcon({ room }: { room: Room }) {
  const x0 = X(room.x + 0.6);
  const y0 = Y(room.y + 0.6);
  const w = toPx(Math.min(room.width - 1.2, 4));
  const d = toPx(1.6);
  if (w < 20) return null;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={d} fill="#fff" stroke={LINE} strokeWidth={1} />
      <rect x={x0 + w * 0.35} y={y0 + d + 4} width={w * 0.3} height={d * 0.7} fill="#EAD9C2" stroke={LINE} strokeWidth={0.75} />
    </g>
  );
}

function TheaterIcon({ room }: { room: Room }) {
  const y0 = Y(room.y + room.height - 1.6);
  const x0 = X(room.x + 0.8);
  const seatW = toPx(1.2);
  const gap = toPx(0.3);
  const count = Math.min(4, Math.max(2, Math.floor(room.width / 1.8)));
  const seats: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    seats.push(
      <rect key={i} x={x0 + i * (seatW + gap)} y={y0} width={seatW} height={toPx(1.2)} rx={2} fill="#fff" stroke={LINE} strokeWidth={0.75} />
    );
  }
  const screenY = Y(room.y + 0.5);
  return (
    <g>
      <line x1={X(room.x + 0.6)} y1={screenY} x2={X(room.x + room.width - 0.6)} y2={screenY} stroke={INK} strokeWidth={3} />
      {seats}
    </g>
  );
}

function GymIcon({ room }: { room: Room }) {
  const x0 = X(room.x + 0.6);
  const y0 = Y(room.y + 0.6);
  const w = toPx(Math.min(room.width - 1.2, 3));
  const h = toPx(1.2);
  if (w < 15) return null;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} rx={2} fill="#fff" stroke={LINE} strokeWidth={1} />
      <circle cx={x0 + w + 14} cy={y0 + h / 2} r={7} fill="none" stroke={LINE} strokeWidth={1} />
    </g>
  );
}

function GarageIcon({ room }: { room: Room }) {
  const x0 = X(room.x + 0.8);
  const y0 = Y(room.y + 0.8);
  const w = toPx(Math.min(room.width - 1.6, 8));
  const h = toPx(Math.min(room.height - 1.6, 5));
  if (w < 20 || h < 20) return null;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} rx={h * 0.25} fill="#fff" stroke={LINE} strokeWidth={1} />
      <circle cx={x0 + w * 0.2} cy={y0 + h} r={h * 0.12} fill={INK} />
      <circle cx={x0 + w * 0.8} cy={y0 + h} r={h * 0.12} fill={INK} />
    </g>
  );
}

function LiftIcon({ room }: { room: Room }) {
  const x0 = X(room.x + 0.4);
  const y0 = Y(room.y + 0.4);
  const w = toPx(Math.min(room.width - 0.8, room.height - 0.8, 4));
  if (w < 15) return null;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={w} fill="#fff" stroke={LINE} strokeWidth={1} />
      <line x1={x0} y1={y0} x2={x0 + w} y2={y0 + w} stroke={LINE} strokeWidth={0.75} />
      <line x1={x0 + w} y1={y0} x2={x0} y2={y0 + w} stroke={LINE} strokeWidth={0.75} />
    </g>
  );
}

function StaircaseIcon({ room }: { room: Room }) {
  const x0 = X(room.x);
  const y0 = Y(room.y);
  const w = toPx(room.width);
  const h = toPx(room.height);
  const treads = Math.max(6, Math.min(14, Math.round(room.height * 1.2)));
  const lines: ReactNode[] = [];
  for (let i = 1; i < treads; i++) {
    const ty = y0 + (h * i) / treads;
    lines.push(<line key={i} x1={x0} y1={ty} x2={x0 + w} y2={ty} stroke={LINE} strokeWidth={0.5} />);
  }
  return (
    <g>
      {lines}
      <path
        d={`M ${x0 + w / 2} ${y0 + h * 0.85} L ${x0 + w / 2} ${y0 + h * 0.2} M ${x0 + w / 2 - 5} ${y0 + h * 0.3} L ${x0 + w / 2} ${y0 + h * 0.2} L ${x0 + w / 2 + 5} ${y0 + h * 0.3}`}
        fill="none"
        stroke={INK}
        strokeWidth={1.5}
      />
      <text x={x0 + w / 2} y={y0 + h * 0.95} textAnchor="middle" fontSize={8} fontFamily="Inter, sans-serif" fill={INK}>
        UP
      </text>
    </g>
  );
}

function Furniture({ room }: { room: Room }) {
  switch (categoryOf(room)) {
    case "bedroom":
    case "master_bedroom":
    case "servant":
      return <BedIcon room={room} />;
    case "living":
    case "family":
      return <SofaIcon room={room} />;
    case "dining":
      return <DiningIcon room={room} />;
    case "kitchen":
      return <KitchenIcon room={room} />;
    case "bathroom":
    case "powder":
      return <BathroomIcon room={room} />;
    case "balcony":
    case "terrace":
      return <BalconyIcon room={room} />;
    case "utility":
      return <UtilityIcon room={room} />;
    case "pantry":
    case "store":
      return <ShelfIcon room={room} />;
    case "pooja":
      return <PoojaIcon room={room} />;
    case "office":
    case "study":
      return <DeskIcon room={room} />;
    case "theater":
      return <TheaterIcon room={room} />;
    case "gym":
      return <GymIcon room={room} />;
    case "garage":
      return <GarageIcon room={room} />;
    case "lift":
      return <LiftIcon room={room} />;
    case "staircase":
      return <StaircaseIcon room={room} />;
    default:
      return null;
  }
}

function Legend({ x, y }: { x: number; y: number }) {
  const items: [string, (px: number, py: number) => ReactNode][] = [
    [
      "Door",
      (px, py) => (
        <g>
          <line x1={px} y1={py} x2={px + 14} y2={py} stroke={LINE} strokeWidth={1.5} />
          <path d={`M ${px} ${py + 14} A 14 14 0 0 0 ${px + 14} ${py}`} fill="none" stroke={LINE} strokeWidth={1} strokeDasharray="2,2" />
        </g>
      ),
    ],
    [
      "Window",
      (px, py) => (
        <g>
          <line x1={px} y1={py + 3} x2={px + 18} y2={py + 3} stroke="#4a7a9c" strokeWidth={2} />
          <line x1={px} y1={py + 7} x2={px + 18} y2={py + 7} stroke="#4a7a9c" strokeWidth={2} />
        </g>
      ),
    ],
    ["Furniture", (px, py) => <rect x={px} y={py} width={18} height={10} rx={2} fill="#fff" stroke={LINE} strokeWidth={1} />],
    ["Appliances", (px, py) => <circle cx={px + 8} cy={py + 5} r={6} fill="none" stroke={LINE} strokeWidth={1} />],
  ];

  return (
    <g fontFamily="Inter, sans-serif" fontSize={10} fill={INK}>
      <rect x={x} y={y} width={130} height={items.length * 22 + 14} fill="#fff" stroke="#c9b18c" strokeWidth={1} rx={4} />
      {items.map(([label, icon], i) => (
        <g key={label}>
          {icon(x + 10, y + 14 + i * 22)}
          <text x={x + 34} y={y + 22 + i * 22}>
            {label}
          </text>
        </g>
      ))}
    </g>
  );
}

function CompassAndScale({ x, y }: { x: number; y: number }) {
  return (
    <g fontFamily="Inter, sans-serif" fontSize={9} fill={INK}>
      <circle cx={x + 15} cy={y + 15} r={15} fill="#fff" stroke={LINE} strokeWidth={1} />
      <path d={`M ${x + 15} ${y + 4} L ${x + 20} ${y + 18} L ${x + 15} ${y + 14} L ${x + 10} ${y + 18} Z`} fill={LINE} />
      <text x={x + 15} y={y + 34} textAnchor="middle" fontWeight={700}>
        N
      </text>

      <g transform={`translate(${x - 5}, ${y + 52})`}>
        <line x1={0} y1={0} x2={toPx(5)} y2={0} stroke={INK} strokeWidth={1.5} />
        {[0, 5].map((ft) => (
          <g key={ft}>
            <line x1={toPx(ft)} y1={-4} x2={toPx(ft)} y2={4} stroke={INK} strokeWidth={1} />
            <text x={toPx(ft)} y={16} textAnchor="middle">
              {ft}ft
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}

function StructuralGrid({ columns, beams }: { columns: StructuralColumn[]; beams: StructuralBeam[] }) {
  return (
    <g>
      {beams.map((b, i) => (
        <line
          key={i}
          x1={X(b.x1)}
          y1={Y(b.y1)}
          x2={X(b.x2)}
          y2={Y(b.y2)}
          stroke="#8a8478"
          strokeWidth={1}
          strokeDasharray="5,3"
          opacity={0.7}
        />
      ))}
      {columns.map((c, i) => (
        <rect key={i} x={X(c.x) - 4} y={Y(c.y) - 4} width={8} height={8} fill="#6b6459" opacity={0.85} />
      ))}
    </g>
  );
}

const UTILITY_GLYPH: Record<NonNullable<UtilityMarker["icon"]>, string> = {
  electrical: "EP",
  plumbing: "PS",
  water: "WT",
};

function UtilityMarkers({ utilities }: { utilities: UtilityMarker[] }) {
  return (
    <g fontFamily="Inter, sans-serif" fontSize={8} fill="#2E1B0E">
      {utilities.map((u, i) => (
        <g key={i}>
          <circle cx={X(u.x)} cy={Y(u.y)} r={9} fill="#fff" stroke="#8a5a2b" strokeWidth={1.25} />
          <text x={X(u.x)} y={Y(u.y) + 3} textAnchor="middle" fontWeight={700}>
            {u.icon ? UTILITY_GLYPH[u.icon] : "U"}
          </text>
          <text x={X(u.x)} y={Y(u.y) + 20} textAnchor="middle" fontSize={7}>
            {u.label}
          </text>
        </g>
      ))}
    </g>
  );
}

export default function FloorPlanSVG({
  layout,
  columns,
  beams,
  utilities,
}: {
  layout: FloorPlanLayout;
  columns?: StructuralColumn[];
  beams?: StructuralBeam[];
  utilities?: UtilityMarker[];
}) {
  const rooms = layout.rooms;
  const doors = findDoors(rooms, layout.totalWidth, layout.totalHeight);
  const windows = findWindows(rooms, layout.totalWidth, layout.totalHeight);
  const hasStructuralGrid = Boolean(columns?.length || beams?.length);

  const canvasWidth = PAD_LEFT + toPx(layout.totalWidth) + PAD_RIGHT;
  const canvasHeight = PAD_TOP + toPx(layout.totalHeight) + PAD_BOTTOM;

  return (
    <div className="w-full bg-cream rounded-xl border border-sand p-4">
      {layout.title && (
        <h4 className="font-playfair text-base font-bold text-charcoal mb-2">{layout.title}</h4>
      )}
      <div className="w-full overflow-auto">
        <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} width="100%" style={{ maxHeight: 640 }}>
          <rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={BG} />

          {/* overall dimension lines */}
          <g stroke={LINE} strokeWidth={0.75} fontFamily="Inter, sans-serif" fontSize={10} fill={LINE}>
            <line x1={X(0)} y1={PAD_TOP - 18} x2={X(layout.totalWidth)} y2={PAD_TOP - 18} />
            <line x1={X(0)} y1={PAD_TOP - 22} x2={X(0)} y2={PAD_TOP - 14} />
            <line x1={X(layout.totalWidth)} y1={PAD_TOP - 22} x2={X(layout.totalWidth)} y2={PAD_TOP - 14} />
            <text x={(X(0) + X(layout.totalWidth)) / 2} y={PAD_TOP - 24} textAnchor="middle">
              {layout.totalWidth}&apos;
            </text>

            <line x1={PAD_LEFT - 18} y1={Y(0)} x2={PAD_LEFT - 18} y2={Y(layout.totalHeight)} />
            <line x1={PAD_LEFT - 22} y1={Y(0)} x2={PAD_LEFT - 14} y2={Y(0)} />
            <line x1={PAD_LEFT - 22} y1={Y(layout.totalHeight)} x2={PAD_LEFT - 14} y2={Y(layout.totalHeight)} />
            <text
              x={PAD_LEFT - 26}
              y={(Y(0) + Y(layout.totalHeight)) / 2}
              textAnchor="middle"
              transform={`rotate(-90 ${PAD_LEFT - 26} ${(Y(0) + Y(layout.totalHeight)) / 2})`}
            >
              {layout.totalHeight}&apos;
            </text>
          </g>

          {/* exterior wall */}
          <rect
            x={X(0)}
            y={Y(0)}
            width={toPx(layout.totalWidth)}
            height={toPx(layout.totalHeight)}
            fill="none"
            stroke={INK}
            strokeWidth={WALL}
          />

          {/* room fills + interior walls */}
          {rooms.map((room, i) => (
            <rect
              key={`${room.name}-${i}`}
              x={X(room.x)}
              y={Y(room.y)}
              width={toPx(room.width)}
              height={toPx(room.height)}
              fill={CATEGORY_COLORS[categoryOf(room)]}
              stroke={INK}
              strokeWidth={WALL * 0.6}
            />
          ))}

          {hasStructuralGrid && <StructuralGrid columns={columns ?? []} beams={beams ?? []} />}

          {windows.map((w, i) => (
            <WindowIcon key={i} win={w} />
          ))}

          {doors.map((d, i) => (
            <DoorIcon key={i} door={d} />
          ))}

          {rooms.map((room, i) => (
            <g key={`f-${room.name}-${i}`}>
              <Furniture room={room} />
              <text
                x={X(room.x + room.width / 2)}
                y={Y(room.y + room.height / 2) - toPx(room.height) * 0.28}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize={11}
                fontWeight={700}
                fill="#2E1B0E"
              >
                {room.name}
              </text>
              <text
                x={X(room.x + room.width / 2)}
                y={Y(room.y + room.height / 2) - toPx(room.height) * 0.28 + 12}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize={9}
                fill="#5c4632"
              >
                {room.width}&apos; x {room.height}&apos;
              </text>
            </g>
          ))}

          {utilities && utilities.length > 0 && <UtilityMarkers utilities={utilities} />}

          <Legend x={PAD_LEFT} y={Y(layout.totalHeight) + 30} />
          <CompassAndScale x={canvasWidth - 130} y={Y(layout.totalHeight) + 15} />

          {hasStructuralGrid && (
            <text
              x={X(0)}
              y={canvasHeight - 8}
              fontFamily="Inter, sans-serif"
              fontSize={9}
              fill="#8a5a2b"
              fontStyle="italic"
            >
              Structural grid shown is indicative only — verify with a licensed structural engineer.
            </text>
          )}
        </svg>
      </div>
      {layout.notes && <p className="font-inter text-xs text-muted mt-3 italic">{layout.notes}</p>}
    </div>
  );
}
