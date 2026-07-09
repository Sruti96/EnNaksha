"use client";

import { createContext, useContext, type ReactNode } from "react";
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

export type PlanStyle = "warm" | "blueprint";

const SCALE = 22; // px per foot
const WALL = 8; // wall stroke thickness (px)
const PAD_LEFT = 70;
const PAD_TOP = 50;
const PAD_RIGHT = 30;
const PAD_BOTTOM = 130;

export type StructuralColumn = { x: number; y: number };
export type StructuralBeam = { x1: number; y1: number; x2: number; y2: number };
export type UtilityMarker = {
  x: number;
  y: number;
  label: string;
  icon?: "electrical" | "plumbing" | "water";
};

type Theme = {
  bg: string;
  ink: string;
  line: string;
  wetLine: string;
  railLine: string;
  utilityStroke: string;
  accentFill: string;
  labelFill: string;
  subLabelFill: string;
  legendBorder: string;
  useGrid: boolean;
  dark: boolean;
  headingFont: string;
  monoFont: string;
  categoryColors: Record<RoomCategory, string>;
};

const WARM_CATEGORY_COLORS: Record<RoomCategory, string> = {
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

const BLUEPRINT_CATEGORY_COLORS: Record<RoomCategory, string> = {
  bedroom: "none",
  master_bedroom: "none",
  living: "none",
  family: "none",
  kitchen: "none",
  bathroom: "none",
  powder: "none",
  dining: "none",
  foyer: "none",
  balcony: "none",
  terrace: "none",
  utility: "none",
  pantry: "none",
  pooja: "none",
  office: "none",
  study: "none",
  theater: "none",
  gym: "none",
  servant: "none",
  store: "none",
  staircase: "none",
  lift: "none",
  garage: "none",
  other: "none",
};

const THEMES: Record<PlanStyle, Theme> = {
  warm: {
    bg: "#FBF6EE",
    ink: "#3a2a1a",
    line: "#7C4A1E",
    wetLine: "#4a7a9c",
    railLine: "#7a9c7a",
    utilityStroke: "#8a5a2b",
    accentFill: "#EAD9C2",
    labelFill: "#2E1B0E",
    subLabelFill: "#5c4632",
    legendBorder: "#c9b18c",
    useGrid: false,
    dark: false,
    headingFont: "Inter, sans-serif",
    monoFont: "Inter, sans-serif",
    categoryColors: WARM_CATEGORY_COLORS,
  },
  blueprint: {
    bg: "#0d2f63",
    ink: "#eaf2ff",
    line: "#dbe8ff",
    wetLine: "#9fc4f5",
    railLine: "#9fc4f5",
    utilityStroke: "#7fb0ef",
    accentFill: "#dbe8ff",
    labelFill: "#eef4ff",
    subLabelFill: "#9fc4f5",
    legendBorder: "#7fb0ef",
    useGrid: true,
    dark: true,
    headingFont: "'Barlow Condensed', sans-serif",
    monoFont: "'Space Mono', monospace",
    categoryColors: BLUEPRINT_CATEGORY_COLORS,
  },
};

const PlanStyleContext = createContext<PlanStyle>("warm");
function useTheme(): Theme {
  const style = useContext(PlanStyleContext);
  return THEMES[style];
}

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
  const theme = useTheme();
  const lenPx = toPx(door.len);
  const dir = door.swing;

  if (door.orientation === "v") {
    const x = X(door.x);
    const y1 = Y(door.y);
    const y2 = y1 + lenPx;
    const openX = x + dir * lenPx;
    return (
      <g>
        <rect x={x - WALL} y={y1} width={WALL * 2} height={lenPx} fill={theme.bg} />
        <line x1={x} y1={y1} x2={openX} y2={y1} stroke={theme.line} strokeWidth={1.5} />
        <path
          d={`M ${x} ${y2} A ${lenPx} ${lenPx} 0 0 ${dir > 0 ? 0 : 1} ${openX} ${y1}`}
          fill="none"
          stroke={theme.line}
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
      <rect x={x1} y={y - WALL} width={lenPx} height={WALL * 2} fill={theme.bg} />
      <line x1={x1} y1={y} x2={x1} y2={openY} stroke={theme.line} strokeWidth={1.5} />
      <path
        d={`M ${x2} ${y} A ${lenPx} ${lenPx} 0 0 ${dir > 0 ? 1 : 0} ${x1} ${openY}`}
        fill="none"
        stroke={theme.line}
        strokeWidth={1}
        strokeDasharray="3,2"
      />
    </g>
  );
}

function WindowIcon({ win }: { win: WindowSpec }) {
  const theme = useTheme();
  const lenPx = toPx(win.len);
  if (win.orientation === "h") {
    const x = X(win.x);
    const y = Y(win.y);
    return (
      <g>
        <rect x={x} y={y - WALL} width={lenPx} height={WALL * 2} fill={theme.bg} />
        <line x1={x} y1={y - 2} x2={x + lenPx} y2={y - 2} stroke={theme.wetLine} strokeWidth={2} />
        <line x1={x} y1={y + 2} x2={x + lenPx} y2={y + 2} stroke={theme.wetLine} strokeWidth={2} />
      </g>
    );
  }
  const x = X(win.x);
  const y = Y(win.y);
  return (
    <g>
      <rect x={x - WALL} y={y} width={WALL * 2} height={lenPx} fill={theme.bg} />
      <line x1={x - 2} y1={y} x2={x - 2} y2={y + lenPx} stroke={theme.wetLine} strokeWidth={2} />
      <line x1={x + 2} y1={y} x2={x + 2} y2={y + lenPx} stroke={theme.wetLine} strokeWidth={2} />
    </g>
  );
}

function BedIcon({ room }: { room: Room }) {
  const theme = useTheme();
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
      <rect x={x0} y={y0} width={w} height={h} rx={4} fill="#fff" stroke={theme.line} strokeWidth={1} />
      <rect x={x0 + w * 0.08} y={y0 + h * 0.06} width={w * 0.36} height={pillowH} rx={4} fill={theme.accentFill} stroke={theme.line} strokeWidth={0.75} />
      <rect x={x0 + w * 0.56} y={y0 + h * 0.06} width={w * 0.36} height={pillowH} rx={4} fill={theme.accentFill} stroke={theme.line} strokeWidth={0.75} />
      <line x1={x0 + w * 0.06} y1={y0 + h * 0.62} x2={x0 + w * 0.94} y2={y0 + h * 0.62} stroke={theme.line} strokeWidth={0.75} />
    </g>
  );
}

function SofaIcon({ room }: { room: Room }) {
  const theme = useTheme();
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
      <rect x={x0} y={y0} width={pw} height={ph} rx={4} fill="#fff" stroke={theme.line} strokeWidth={1} />
      <rect x={x0} y={y0} width={pw * 0.12} height={ph} rx={3} fill={theme.accentFill} stroke={theme.line} strokeWidth={0.75} />
      <rect x={x0 + pw * 0.88} y={y0} width={pw * 0.12} height={ph} rx={3} fill={theme.accentFill} stroke={theme.line} strokeWidth={0.75} />
      <line x1={x0 + pw * 0.14} y1={y0 + ph * 0.15} x2={x0 + pw * 0.86} y2={y0 + ph * 0.15} stroke={theme.line} strokeWidth={0.75} />
    </g>
  );
}

function DiningIcon({ room }: { room: Room }) {
  const theme = useTheme();
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
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={theme.line} strokeWidth={1} />
      {offsets.map(([dx, dy], i) => (
        <rect
          key={i}
          x={cx + dx * (r + chair * 0.6) - chair / 2}
          y={cy + dy * (r + chair * 0.6) - chair / 2}
          width={chair}
          height={chair}
          fill={theme.accentFill}
          stroke={theme.line}
          strokeWidth={0.75}
        />
      ))}
    </g>
  );
}

function KitchenIcon({ room }: { room: Room }) {
  const theme = useTheme();
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
      <rect x={x0} y={y0} width={pw} height={ph} fill="#fff" stroke={theme.line} strokeWidth={1} />
      <circle cx={x0 + pw * 0.22} cy={y0 + ph / 2} r={ph * 0.28} fill="none" stroke={theme.line} strokeWidth={0.75} />
      {[0.6, 0.72, 0.84].map((f, i) => (
        <circle key={i} cx={x0 + pw * f} cy={y0 + ph / 2} r={ph * 0.16} fill="none" stroke={theme.line} strokeWidth={0.75} />
      ))}
    </g>
  );
}

function BathroomIcon({ room }: { room: Room }) {
  const theme = useTheme();
  const x0 = X(room.x + 0.6);
  const y0 = Y(room.y + 0.6);
  const w = toPx(Math.min(room.width, 4));
  return (
    <g>
      <rect x={x0} y={y0} width={w * 0.4} height={w * 0.22} fill="#fff" stroke={theme.wetLine} strokeWidth={1} />
      <ellipse cx={x0 + w * 0.2} cy={y0 + w * 0.42} rx={w * 0.22} ry={w * 0.18} fill="#fff" stroke={theme.wetLine} strokeWidth={1} />
      <circle cx={X(room.x + room.width - 0.9)} cy={y0} r={toPx(0.5)} fill="none" stroke={theme.wetLine} strokeWidth={1} />
    </g>
  );
}

function BalconyIcon({ room }: { room: Room }) {
  const theme = useTheme();
  const y = Y(room.y + room.height - 0.3);
  const x0 = X(room.x + 0.3);
  const x1 = X(room.x + room.width - 0.3);
  const count = Math.max(3, Math.floor((x1 - x0) / 10));
  const lines: ReactNode[] = [];
  for (let i = 0; i <= count; i++) {
    const x = x0 + ((x1 - x0) * i) / count;
    lines.push(<line key={i} x1={x} y1={y - 8} x2={x} y2={y} stroke={theme.railLine} strokeWidth={1} />);
  }
  return (
    <g>
      {lines}
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={theme.railLine} strokeWidth={1.5} />
    </g>
  );
}

function UtilityIcon({ room }: { room: Room }) {
  const theme = useTheme();
  const x0 = X(room.x + 0.6);
  const y0 = Y(room.y + 0.6);
  const s = toPx(Math.min(room.width, room.height) * 0.4);
  return (
    <g>
      <rect x={x0} y={y0} width={s} height={s} fill="#fff" stroke={theme.line} strokeWidth={1} />
      <circle cx={x0 + s / 2} cy={y0 + s / 2} r={s * 0.32} fill="none" stroke={theme.line} strokeWidth={1} />
    </g>
  );
}

function ShelfIcon({ room }: { room: Room }) {
  const theme = useTheme();
  const x0 = X(room.x + 0.5);
  const y0 = Y(room.y + 0.5);
  const w = toPx(Math.min(room.width - 1, 5));
  const h = toPx(Math.min(room.height - 1, 2.2));
  if (w < 20 || h < 15) return null;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} fill="#fff" stroke={theme.line} strokeWidth={1} />
      {[0.33, 0.66].map((f, i) => (
        <line key={i} x1={x0} y1={y0 + h * f} x2={x0 + w} y2={y0 + h * f} stroke={theme.line} strokeWidth={0.75} />
      ))}
    </g>
  );
}

function PoojaIcon({ room }: { room: Room }) {
  const theme = useTheme();
  const cx = X(room.x + room.width / 2);
  const baseY = Y(room.y + room.height - 0.6);
  const w = toPx(Math.min(room.width - 1, 2.5));
  const h = toPx(1.6);
  if (w < 10) return null;
  return (
    <g>
      <rect x={cx - w / 2} y={baseY - h} width={w} height={h} fill="#fff" stroke={theme.line} strokeWidth={1} />
      <path
        d={`M ${cx - w / 2 - 3} ${baseY - h} L ${cx} ${baseY - h - 12} L ${cx + w / 2 + 3} ${baseY - h} Z`}
        fill={theme.accentFill}
        stroke={theme.line}
        strokeWidth={0.75}
      />
    </g>
  );
}

function DeskIcon({ room }: { room: Room }) {
  const theme = useTheme();
  const x0 = X(room.x + 0.6);
  const y0 = Y(room.y + 0.6);
  const w = toPx(Math.min(room.width - 1.2, 4));
  const d = toPx(1.6);
  if (w < 20) return null;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={d} fill="#fff" stroke={theme.line} strokeWidth={1} />
      <rect x={x0 + w * 0.35} y={y0 + d + 4} width={w * 0.3} height={d * 0.7} fill={theme.accentFill} stroke={theme.line} strokeWidth={0.75} />
    </g>
  );
}

function TheaterIcon({ room }: { room: Room }) {
  const theme = useTheme();
  const y0 = Y(room.y + room.height - 1.6);
  const x0 = X(room.x + 0.8);
  const seatW = toPx(1.2);
  const gap = toPx(0.3);
  const count = Math.min(4, Math.max(2, Math.floor(room.width / 1.8)));
  const seats: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    seats.push(
      <rect key={i} x={x0 + i * (seatW + gap)} y={y0} width={seatW} height={toPx(1.2)} rx={2} fill="#fff" stroke={theme.line} strokeWidth={0.75} />
    );
  }
  const screenY = Y(room.y + 0.5);
  return (
    <g>
      <line x1={X(room.x + 0.6)} y1={screenY} x2={X(room.x + room.width - 0.6)} y2={screenY} stroke={theme.ink} strokeWidth={3} />
      {seats}
    </g>
  );
}

function GymIcon({ room }: { room: Room }) {
  const theme = useTheme();
  const x0 = X(room.x + 0.6);
  const y0 = Y(room.y + 0.6);
  const w = toPx(Math.min(room.width - 1.2, 3));
  const h = toPx(1.2);
  if (w < 15) return null;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} rx={2} fill="#fff" stroke={theme.line} strokeWidth={1} />
      <circle cx={x0 + w + 14} cy={y0 + h / 2} r={7} fill="none" stroke={theme.line} strokeWidth={1} />
    </g>
  );
}

function GarageIcon({ room }: { room: Room }) {
  const theme = useTheme();
  const x0 = X(room.x + 0.8);
  const y0 = Y(room.y + 0.8);
  const w = toPx(Math.min(room.width - 1.6, 8));
  const h = toPx(Math.min(room.height - 1.6, 5));
  if (w < 20 || h < 20) return null;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} rx={h * 0.25} fill="#fff" stroke={theme.line} strokeWidth={1} />
      <circle cx={x0 + w * 0.2} cy={y0 + h} r={h * 0.12} fill={theme.ink} />
      <circle cx={x0 + w * 0.8} cy={y0 + h} r={h * 0.12} fill={theme.ink} />
    </g>
  );
}

function LiftIcon({ room }: { room: Room }) {
  const theme = useTheme();
  const x0 = X(room.x + 0.4);
  const y0 = Y(room.y + 0.4);
  const w = toPx(Math.min(room.width - 0.8, room.height - 0.8, 4));
  if (w < 15) return null;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={w} fill="#fff" stroke={theme.line} strokeWidth={1} />
      <line x1={x0} y1={y0} x2={x0 + w} y2={y0 + w} stroke={theme.line} strokeWidth={0.75} />
      <line x1={x0 + w} y1={y0} x2={x0} y2={y0 + w} stroke={theme.line} strokeWidth={0.75} />
    </g>
  );
}

function StaircaseIcon({ room }: { room: Room }) {
  const theme = useTheme();
  const x0 = X(room.x);
  const y0 = Y(room.y);
  const w = toPx(room.width);
  const h = toPx(room.height);
  const treads = Math.max(6, Math.min(14, Math.round(room.height * 1.2)));
  const lines: ReactNode[] = [];
  for (let i = 1; i < treads; i++) {
    const ty = y0 + (h * i) / treads;
    lines.push(<line key={i} x1={x0} y1={ty} x2={x0 + w} y2={ty} stroke={theme.line} strokeWidth={0.5} />);
  }
  return (
    <g>
      {lines}
      <path
        d={`M ${x0 + w / 2} ${y0 + h * 0.85} L ${x0 + w / 2} ${y0 + h * 0.2} M ${x0 + w / 2 - 5} ${y0 + h * 0.3} L ${x0 + w / 2} ${y0 + h * 0.2} L ${x0 + w / 2 + 5} ${y0 + h * 0.3}`}
        fill="none"
        stroke={theme.ink}
        strokeWidth={1.5}
      />
      <text x={x0 + w / 2} y={y0 + h * 0.95} textAnchor="middle" fontSize={8} fontFamily="Inter, sans-serif" fill={theme.ink}>
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
  const theme = useTheme();
  const items: [string, (px: number, py: number) => ReactNode][] = [
    [
      "Door",
      (px, py) => (
        <g>
          <line x1={px} y1={py} x2={px + 14} y2={py} stroke={theme.line} strokeWidth={1.5} />
          <path d={`M ${px} ${py + 14} A 14 14 0 0 0 ${px + 14} ${py}`} fill="none" stroke={theme.line} strokeWidth={1} strokeDasharray="2,2" />
        </g>
      ),
    ],
    [
      "Window",
      (px, py) => (
        <g>
          <line x1={px} y1={py + 3} x2={px + 18} y2={py + 3} stroke={theme.wetLine} strokeWidth={2} />
          <line x1={px} y1={py + 7} x2={px + 18} y2={py + 7} stroke={theme.wetLine} strokeWidth={2} />
        </g>
      ),
    ],
    ["Furniture", (px, py) => <rect x={px} y={py} width={18} height={10} rx={2} fill="#fff" stroke={theme.line} strokeWidth={1} />],
    ["Appliances", (px, py) => <circle cx={px + 8} cy={py + 5} r={6} fill="none" stroke={theme.line} strokeWidth={1} />],
  ];

  return (
    <g fontFamily={theme.headingFont} fontSize={10} fill={theme.ink}>
      <rect
        x={x}
        y={y}
        width={130}
        height={items.length * 22 + 14}
        fill={theme.dark ? theme.bg : "#fff"}
        stroke={theme.legendBorder}
        strokeWidth={1}
        rx={4}
      />
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
  const theme = useTheme();
  return (
    <g fontFamily={theme.headingFont} fontSize={9} fill={theme.ink}>
      <circle cx={x + 15} cy={y + 15} r={15} fill={theme.dark ? "none" : "#fff"} stroke={theme.line} strokeWidth={1} />
      <path d={`M ${x + 15} ${y + 4} L ${x + 20} ${y + 18} L ${x + 15} ${y + 14} L ${x + 10} ${y + 18} Z`} fill={theme.line} />
      <text x={x + 15} y={y + 34} textAnchor="middle" fontWeight={700}>
        N
      </text>

      {theme.dark ? (
        <g transform={`translate(${x - 5}, ${y + 52})`} fontFamily={theme.monoFont}>
          <text x={40} y={-4} textAnchor="middle" fontSize={7.5} fill={theme.subLabelFill} letterSpacing={1}>
            SCALE (FT)
          </text>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 20}
              y={0}
              width={20}
              height={5}
              fill={i % 2 === 0 ? theme.accentFill : "none"}
              stroke={theme.legendBorder}
              strokeWidth={0.7}
            />
          ))}
          <text x={0} y={16} textAnchor="middle" fontSize={8} fill={theme.subLabelFill}>
            0
          </text>
          <text x={40} y={16} textAnchor="middle" fontSize={8} fill={theme.subLabelFill}>
            10
          </text>
          <text x={80} y={16} textAnchor="middle" fontSize={8} fill={theme.subLabelFill}>
            20
          </text>
        </g>
      ) : (
        <g transform={`translate(${x - 5}, ${y + 52})`}>
          <line x1={0} y1={0} x2={toPx(5)} y2={0} stroke={theme.ink} strokeWidth={1.5} />
          {[0, 5].map((ft) => (
            <g key={ft}>
              <line x1={toPx(ft)} y1={-4} x2={toPx(ft)} y2={4} stroke={theme.ink} strokeWidth={1} />
              <text x={toPx(ft)} y={16} textAnchor="middle">
                {ft}ft
              </text>
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

function TitleBlock({
  x,
  y,
  width,
  plotWidth,
  plotHeight,
  totalAreaSqFt,
  bedCount,
  bathCount,
}: {
  x: number;
  y: number;
  width: number;
  plotWidth: number;
  plotHeight: number;
  totalAreaSqFt: number;
  bedCount: number;
  bathCount: number;
}) {
  const theme = useTheme();
  const height = 60;
  const colW = width / 3;
  const today = new Date()
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
  const fields: [string, string][] = [
    ["PLOT SIZE", `${plotWidth}' × ${plotHeight}'`],
    ["APPROX AREA", `${totalAreaSqFt} SQ.FT`],
    ["CONFIG", `${bedCount} BED · ${bathCount} BATH`],
  ];

  return (
    <g fontFamily={theme.headingFont}>
      <rect x={x} y={y} width={width} height={height} fill="none" stroke={theme.legendBorder} strokeWidth={1} />
      {[1, 2].map((i) => (
        <line
          key={i}
          x1={x + colW * i}
          y1={y}
          x2={x + colW * i}
          y2={y + height}
          stroke={theme.legendBorder}
          strokeWidth={0.6}
          strokeOpacity={0.6}
        />
      ))}
      {fields.map(([label, value], i) => (
        <g key={label}>
          <text x={x + colW * i + 14} y={y + 22} fill={theme.subLabelFill} fontSize={8} fontFamily={theme.monoFont} letterSpacing={1}>
            {label}
          </text>
          <text x={x + colW * i + 14} y={y + 42} fill={theme.labelFill} fontSize={13} fontWeight={700} letterSpacing={0.5}>
            {value}
          </text>
        </g>
      ))}
      <text
        x={x + width - 12}
        y={y + height + 14}
        textAnchor="end"
        fill={theme.subLabelFill}
        fontSize={8}
        fontFamily={theme.monoFont}
        letterSpacing={1}
      >
        AI-GENERATED SCHEMATIC CONCEPT — {today}
      </text>
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
  const theme = useTheme();
  return (
    <g fontFamily="Inter, sans-serif" fontSize={8} fill={theme.labelFill}>
      {utilities.map((u, i) => (
        <g key={i}>
          <circle cx={X(u.x)} cy={Y(u.y)} r={9} fill="#fff" stroke={theme.utilityStroke} strokeWidth={1.25} />
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

function PlanCanvas({
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
  const theme = useTheme();
  const rooms = layout.rooms;
  const doors = findDoors(rooms, layout.totalWidth, layout.totalHeight);
  const windows = findWindows(rooms, layout.totalWidth, layout.totalHeight);
  const hasStructuralGrid = Boolean(columns?.length || beams?.length);

  const padBottom = theme.dark ? 220 : PAD_BOTTOM;
  const canvasWidth = PAD_LEFT + toPx(layout.totalWidth) + PAD_RIGHT;
  const canvasHeight = PAD_TOP + toPx(layout.totalHeight) + padBottom;
  const gridId = "floorplan-grid";
  const gridBoldId = "floorplan-grid-bold";
  const vigId = "floorplan-vignette";

  const totalAreaSqFt = Math.round(rooms.reduce((s, r) => s + r.width * r.height, 0));
  const bedCount = rooms.filter((r) => {
    const c = categoryOf(r);
    return c === "bedroom" || c === "master_bedroom";
  }).length;
  const bathCount = rooms.filter((r) => {
    const c = categoryOf(r);
    return c === "bathroom" || c === "powder";
  }).length;

  return (
    <div className="w-full overflow-auto">
      <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} width="100%" style={{ maxHeight: 640 }}>
        {theme.useGrid ? (
          <>
            <defs>
              <pattern id={gridId} width={18} height={18} patternUnits="userSpaceOnUse">
                <path d="M18 0H0V18" fill="none" stroke="#ffffff" strokeOpacity={0.05} strokeWidth={0.6} />
              </pattern>
              <pattern id={gridBoldId} width={90} height={90} patternUnits="userSpaceOnUse">
                <path d="M90 0H0V90" fill="none" stroke="#ffffff" strokeOpacity={0.09} strokeWidth={0.7} />
              </pattern>
              <radialGradient id={vigId} cx="50%" cy="42%" r="75%">
                <stop offset="0%" stopColor="#12386f" />
                <stop offset="70%" stopColor={theme.bg} />
                <stop offset="100%" stopColor="#082249" />
              </radialGradient>
            </defs>
            <rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={`url(#${vigId})`} />
            <rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={`url(#${gridId})`} />
            <rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={`url(#${gridBoldId})`} />
            <rect x={10} y={10} width={canvasWidth - 20} height={canvasHeight - 20} fill="none" stroke={theme.legendBorder} strokeWidth={1} strokeOpacity={0.6} />
            <rect x={16} y={16} width={canvasWidth - 32} height={canvasHeight - 32} fill="none" stroke={theme.subLabelFill} strokeWidth={0.5} strokeOpacity={0.7} />
          </>
        ) : (
          <rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={theme.bg} />
        )}

        {/* overall dimension lines */}
        <g stroke={theme.line} strokeWidth={0.75} fontFamily={theme.monoFont} fontSize={10} fill={theme.line}>
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
          stroke={theme.ink}
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
            fill={theme.categoryColors[categoryOf(room)]}
            stroke={theme.ink}
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

        {rooms.map((room, i) => {
          const labelY = Y(room.y + room.height / 2) - toPx(room.height) * 0.28;
          return (
            <g key={`f-${room.name}-${i}`}>
              <Furniture room={room} />
              <text
                x={X(room.x + room.width / 2)}
                y={labelY}
                textAnchor="middle"
                fontFamily={theme.headingFont}
                fontSize={11}
                fontWeight={700}
                letterSpacing={theme.dark ? 0.6 : undefined}
                fill={theme.labelFill}
              >
                {room.name}
              </text>
              <text
                x={X(room.x + room.width / 2)}
                y={labelY + 12}
                textAnchor="middle"
                fontFamily={theme.monoFont}
                fontSize={9}
                fill={theme.subLabelFill}
              >
                {room.width}&apos; x {room.height}&apos;
              </text>
              {theme.dark && (
                <text
                  x={X(room.x + room.width / 2)}
                  y={labelY + 23}
                  textAnchor="middle"
                  fontFamily={theme.monoFont}
                  fontSize={7.5}
                  letterSpacing={0.5}
                  fill={theme.utilityStroke}
                >
                  {Math.round(room.width * room.height)} SFT
                </text>
              )}
            </g>
          );
        })}

        {utilities && utilities.length > 0 && <UtilityMarkers utilities={utilities} />}

        {theme.dark && (
          <TitleBlock
            x={X(0)}
            y={Y(layout.totalHeight) + 20}
            width={toPx(layout.totalWidth)}
            plotWidth={layout.totalWidth}
            plotHeight={layout.totalHeight}
            totalAreaSqFt={totalAreaSqFt}
            bedCount={bedCount}
            bathCount={bathCount}
          />
        )}

        <Legend x={PAD_LEFT} y={Y(layout.totalHeight) + (theme.dark ? 100 : 30)} />
        <CompassAndScale x={canvasWidth - 130} y={Y(layout.totalHeight) + (theme.dark ? 85 : 15)} />

        {hasStructuralGrid && (
          <text x={X(0)} y={canvasHeight - 8} fontFamily={theme.headingFont} fontSize={9} fill={theme.utilityStroke} fontStyle="italic">
            Structural grid shown is indicative only — verify with a licensed structural engineer.
          </text>
        )}
      </svg>
    </div>
  );
}

export default function FloorPlanSVG({
  layout,
  columns,
  beams,
  utilities,
  style = "warm",
}: {
  layout: FloorPlanLayout;
  columns?: StructuralColumn[];
  beams?: StructuralBeam[];
  utilities?: UtilityMarker[];
  style?: PlanStyle;
}) {
  return (
    <div className="w-full bg-cream rounded-xl border border-sand p-4">
      {layout.title && <h4 className="font-playfair text-base font-bold text-charcoal mb-2">{layout.title}</h4>}
      <PlanStyleContext.Provider value={style}>
        <PlanCanvas layout={layout} columns={columns} beams={beams} utilities={utilities} />
      </PlanStyleContext.Provider>
      {layout.notes && <p className="font-inter text-xs text-muted mt-3 italic">{layout.notes}</p>}
    </div>
  );
}
