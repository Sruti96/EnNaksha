import {
  getClaudeClient,
  CLAUDE_MODEL,
  extractJson,
  categoryOf,
  findDoors,
  findWindows,
  hasClaudeCredentials,
  type Room,
  type FloorPlanLayout,
} from "@/lib/floorplan";
import type { StructuralColumn, StructuralBeam, UtilityMarker } from "@/components/ui/FloorPlanSVG";

export { hasClaudeCredentials };

export type RoadSide = "north" | "south" | "east" | "west";

export type DetailedDesignInput = {
  email?: string;
  fullName?: string;
  plotWidth: number;
  plotDepth: number;
  roadSide: RoadSide;
  roadWidth?: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces?: number;
  wantsBalcony?: boolean;
  wantsTerrace?: boolean;
  staircaseType?: "straight" | "dogleg" | "spiral" | "none";
  specialRooms?: string[];
  vastu?: boolean;
  budget?: number | string;
  preferences?: string;
  aesthetic?: string;
};

export type SitePlan = {
  plotWidth: number;
  plotDepth: number;
  roadSide: RoadSide;
  roadWidth: number;
  setbacks: { front: number; rear: number; left: number; right: number };
  footprint: { x: number; y: number; width: number; height: number };
  driveway: { x: number; y: number; width: number; height: number };
  parking?: { x: number; y: number; width: number; height: number; capacity: number };
  entrance: { x: number; y: number };
};

export type AreaScheduleRow = { room: string; floor: string; length: number; width: number; area: number };
export type DoorScheduleRow = { id: string; location: string; width: number; opening: string };
export type WindowScheduleRow = { id: string; location: string; width: number; type: string };

export type FloorData = {
  level: number;
  label: string;
  layout: FloorPlanLayout;
  columns: StructuralColumn[];
  beams: StructuralBeam[];
  utilities: UtilityMarker[];
};

export type ArchitecturalPlan = {
  title: string;
  preparedFor?: string;
  date: string;
  scaleLabel: string;
  sitePlan: SitePlan;
  floors: FloorData[];
  areaSchedule: AreaScheduleRow[];
  carpetAreaSqFt: number;
  builtUpAreaSqFt: number;
  superBuiltUpAreaSqFt: number;
  doorSchedule: DoorScheduleRow[];
  windowSchedule: WindowScheduleRow[];
  vastuNotes?: string;
  designNotes?: string;
  disclaimer: string;
};

const DISCLAIMER =
  "This is an AI-generated concept plan for early design discussion only. It is not a construction document. " +
  "Room layouts, structural grid, and utility locations are schematic and must be verified, engineered, and finalized " +
  "by a licensed architect and structural engineer — including compliance with local building bye-laws, setback norms, " +
  "and soil/structural conditions — before any construction begins.";

const FLOOR_LABELS = ["Ground Floor", "First Floor", "Second Floor", "Third Floor"];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizeInput(input: DetailedDesignInput): Required<Pick<
  DetailedDesignInput,
  "plotWidth" | "plotDepth" | "floors" | "bedrooms" | "bathrooms" | "roadWidth" | "parkingSpaces"
>> & DetailedDesignInput {
  return {
    ...input,
    plotWidth: clamp(Number(input.plotWidth) || 30, 15, 200),
    plotDepth: clamp(Number(input.plotDepth) || 40, 15, 200),
    floors: clamp(Math.round(Number(input.floors) || 1), 1, 4),
    bedrooms: clamp(Math.round(Number(input.bedrooms) || 2), 1, 8),
    bathrooms: clamp(Math.round(Number(input.bathrooms) || 2), 1, 8),
    roadWidth: clamp(Number(input.roadWidth) || 30, 10, 100),
    parkingSpaces: clamp(Math.round(Number(input.parkingSpaces) || 1), 0, 4),
  };
}

function computeSitePlan(input: ReturnType<typeof normalizeInput>): SitePlan {
  const { plotWidth, plotDepth, roadSide, roadWidth } = input;

  const front = plotDepth >= 40 ? 10 : 6;
  const rear = 5;
  const side = plotWidth >= 30 ? 4 : 3;

  let footprint: SitePlan["footprint"];
  let entrance: SitePlan["entrance"];
  let driveway: SitePlan["driveway"];

  if (roadSide === "south") {
    footprint = { x: side, y: rear, width: plotWidth - side * 2, height: plotDepth - rear - front };
    entrance = { x: plotWidth / 2, y: footprint.y + footprint.height };
    driveway = { x: plotWidth / 2 - 5, y: footprint.y + footprint.height, width: 10, height: front };
  } else if (roadSide === "north") {
    footprint = { x: side, y: front, width: plotWidth - side * 2, height: plotDepth - rear - front };
    entrance = { x: plotWidth / 2, y: footprint.y };
    driveway = { x: plotWidth / 2 - 5, y: 0, width: 10, height: front };
  } else if (roadSide === "east") {
    footprint = { x: rear, y: side, width: plotWidth - rear - front, height: plotDepth - side * 2 };
    entrance = { x: footprint.x + footprint.width, y: plotDepth / 2 };
    driveway = { x: footprint.x + footprint.width, y: plotDepth / 2 - 5, width: front, height: 10 };
  } else {
    footprint = { x: front, y: side, width: plotWidth - rear - front, height: plotDepth - side * 2 };
    entrance = { x: footprint.x, y: plotDepth / 2 };
    driveway = { x: 0, y: plotDepth / 2 - 5, width: front, height: 10 };
  }

  const parking =
    input.parkingSpaces > 0
      ? {
          x: roadSide === "east" ? footprint.x + footprint.width - 18 : footprint.x + 1,
          y: roadSide === "south" ? footprint.y + footprint.height - 9 : footprint.y + 1,
          width: Math.min(9 * input.parkingSpaces, footprint.width - 2),
          height: 18,
          capacity: input.parkingSpaces,
        }
      : undefined;

  return {
    plotWidth,
    plotDepth,
    roadSide,
    roadWidth,
    setbacks: { front, rear, left: side, right: side },
    footprint,
    driveway,
    parking,
    entrance,
  };
}

function computeStructuralGrid(footprint: { width: number; height: number }): {
  columns: StructuralColumn[];
  beams: StructuralBeam[];
} {
  const { width: w, height: h } = footprint;
  const spacing = 13;

  const xs = [0];
  let x = 0;
  while (x + spacing < w) {
    x += spacing;
    xs.push(x);
  }
  xs.push(w);

  const ys = [0];
  let y = 0;
  while (y + spacing < h) {
    y += spacing;
    ys.push(y);
  }
  ys.push(h);

  const columns: StructuralColumn[] = [];
  for (const xv of xs) {
    columns.push({ x: xv, y: 0 });
    columns.push({ x: xv, y: h });
  }
  for (const yv of ys) {
    columns.push({ x: 0, y: yv });
    columns.push({ x: w, y: yv });
  }
  const seen = new Set<string>();
  const uniqueColumns = columns.filter((c) => {
    const key = `${c.x.toFixed(1)},${c.y.toFixed(1)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const beams: StructuralBeam[] = [];
  for (let i = 0; i < xs.length - 1; i++) {
    beams.push({ x1: xs[i], y1: 0, x2: xs[i + 1], y2: 0 });
    beams.push({ x1: xs[i], y1: h, x2: xs[i + 1], y2: h });
  }
  for (let i = 0; i < ys.length - 1; i++) {
    beams.push({ x1: 0, y1: ys[i], x2: 0, y2: ys[i + 1] });
    beams.push({ x1: w, y1: ys[i], x2: w, y2: ys[i + 1] });
  }

  return { columns: uniqueColumns, beams };
}

function computeUtilities(rooms: Room[], level: number, topLevel: number): UtilityMarker[] {
  const utilities: UtilityMarker[] = [];

  if (level === 0) {
    const foyer = rooms.find((r) => categoryOf(r) === "foyer");
    if (foyer) {
      utilities.push({ x: foyer.x + 0.8, y: foyer.y + 0.8, label: "Electrical panel", icon: "electrical" });
    }
    const wetRooms = rooms.filter((r) => ["bathroom", "powder", "kitchen", "utility"].includes(categoryOf(r)));
    if (wetRooms.length > 0) {
      const cx = wetRooms.reduce((s, r) => s + r.x + r.width / 2, 0) / wetRooms.length;
      const cy = wetRooms.reduce((s, r) => s + r.y + r.height / 2, 0) / wetRooms.length;
      utilities.push({ x: cx, y: cy, label: "Plumbing shaft", icon: "plumbing" });
    }
  }

  if (level === topLevel) {
    const corner = rooms[0];
    if (corner) {
      utilities.push({
        x: corner.x + corner.width - 1,
        y: corner.y + 1,
        label: "Overhead water tank (roof)",
        icon: "water",
      });
    }
  }

  return utilities;
}

function buildStaircaseRoom(footprint: { width: number; height: number }): Room {
  const width = 4;
  const length = 11;
  return {
    name: "Staircase",
    type: "staircase",
    x: Math.max(0, footprint.width - width - 1),
    y: Math.max(0, footprint.height / 2 - length / 2),
    width,
    height: length,
  };
}

async function requestRoomLayout(
  input: ReturnType<typeof normalizeInput>,
  footprint: { width: number; height: number },
  staircaseRoom: Room | null
): Promise<{ floors: { level: number; rooms: Room[] }[]; vastuNotes?: string; designNotes?: string; title?: string }> {
  const client = getClaudeClient();

  const specialRooms = (input.specialRooms || []).join(", ") || "none requested";
  const staircaseNote = staircaseRoom
    ? `A staircase MUST be included on every floor as a room named "Staircase" with type "staircase" at exactly x=${staircaseRoom.x.toFixed(1)}, y=${staircaseRoom.y.toFixed(1)}, width=${staircaseRoom.width}, height=${staircaseRoom.height} (same position on every floor, since it's one continuous stairwell). Do not place any other room on top of it.`
    : "This is a single-storey home — no staircase is needed.";

  const prompt = `You are a senior residential architect designing a home for EnNaksha, a home design company in India. Analyze the brief below and produce an efficient, livable layout optimizing for natural light, cross-ventilation, privacy between public and private zones, and (if requested) Vastu guidance.

Client brief:
- Building footprint available for construction: ${footprint.width.toFixed(1)} ft (width) x ${footprint.height.toFixed(1)} ft (depth). Origin (0,0) is the top-left corner of this footprint, x increases right, y increases downward, all measurements in feet. Do not place anything outside this envelope.
- Number of floors: ${input.floors} (${FLOOR_LABELS.slice(0, input.floors).join(", ")})
- Bedrooms required (total across all floors): ${input.bedrooms}
- Bathrooms required (total across all floors): ${input.bathrooms}
- Balcony requested: ${input.wantsBalcony ? "yes" : "no"}
- Terrace requested (top floor): ${input.wantsTerrace ? "yes" : "no"}
- Special rooms requested: ${specialRooms}
- Follow Vastu Shastra guidance: ${input.vastu ? "yes — e.g. pooja room in north-east, kitchen in south-east, master bedroom in south-west where the layout allows" : "no particular preference"}
- Aesthetic: ${input.aesthetic || "not specified"}
- Budget: ${input.budget || "not specified"}
- Mandatory preferences: ${input.preferences || "none"}
- ${staircaseNote}

Distribute rooms sensibly across floors: put shared/public rooms (foyer, living/family room, dining, kitchen, one guest bedroom, powder room, utility) on the ground floor along with parking/garage access; put most bedrooms with attached bathrooms on upper floors for privacy; place special rooms wherever they best fit (e.g. home office/study on a quieter floor, pooja room per Vastu guidance if requested, terrace on the top floor).

The Master Bedroom always gets its own private attached bathroom — this is mandatory. Include exactly one room named "Master Bedroom" (type "master_bedroom"), and place a bathroom sharing a wall ONLY with that master bedroom (never also touching a hallway, another bedroom, or shared circulation space), named exactly "Attached Bathroom". Every other bedroom should ideally also get its own attached bathroom named "Attached Bathroom" (again sharing a wall only with that one bedroom) if the bathroom count allows; otherwise remaining bedrooms share a common bathroom.

Every room needs a "type" set to exactly one of: "bedroom", "master_bedroom", "living", "family", "kitchen", "bathroom", "powder", "dining", "foyer", "balcony", "terrace", "utility", "pantry", "pooja", "office", "study", "theater", "gym", "servant", "store", "staircase", "lift", "garage", "other".

Respond with ONLY strict JSON, no markdown fences, no commentary, matching exactly this schema:
{
  "title": string,
  "vastuNotes": string,
  "designNotes": string,
  "floors": [
    {
      "level": number,
      "rooms": [ { "name": string, "type": string, "x": number, "y": number, "width": number, "height": number } ]
    }
  ]
}
There must be exactly ${input.floors} entries in "floors", with "level" 0 to ${input.floors - 1}.`;

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";
  const json = extractJson(raw);

  let parsed: { title?: string; vastuNotes?: string; designNotes?: string; floors: { level: number; rooms: Room[] }[] };
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Claude returned a plan that could not be parsed as JSON");
  }

  if (!parsed.floors || !Array.isArray(parsed.floors) || parsed.floors.length === 0) {
    throw new Error("Claude returned a plan with no floors");
  }

  return parsed as { floors: { level: number; rooms: Room[] }[]; vastuNotes?: string; designNotes?: string; title?: string };
}

function buildAreaSchedule(floors: FloorData[]): {
  areaSchedule: AreaScheduleRow[];
  carpetAreaSqFt: number;
  builtUpAreaSqFt: number;
  superBuiltUpAreaSqFt: number;
} {
  const areaSchedule: AreaScheduleRow[] = [];
  let carpet = 0;

  for (const floor of floors) {
    for (const room of floor.layout.rooms) {
      const area = room.width * room.height;
      areaSchedule.push({ room: room.name, floor: floor.label, length: room.height, width: room.width, area });

      const cat = categoryOf(room);
      if (cat === "garage") continue;
      if (cat === "balcony" || cat === "terrace") {
        carpet += area * 0.5;
      } else {
        carpet += area;
      }
    }
  }

  const carpetAreaSqFt = Math.round(carpet);
  const builtUpAreaSqFt = Math.round(carpetAreaSqFt / 0.82);
  const superBuiltUpAreaSqFt = builtUpAreaSqFt; // same for an independent home (no shared common areas)

  return { areaSchedule, carpetAreaSqFt, builtUpAreaSqFt, superBuiltUpAreaSqFt };
}

function buildSchedules(floors: FloorData[]): { doorSchedule: DoorScheduleRow[]; windowSchedule: WindowScheduleRow[] } {
  const doorSchedule: DoorScheduleRow[] = [];
  const windowSchedule: WindowScheduleRow[] = [];
  let doorCount = 0;
  let winCount = 0;

  for (const floor of floors) {
    const doors = findDoors(floor.layout.rooms, floor.layout.totalWidth, floor.layout.totalHeight);
    const windows = findWindows(floor.layout.rooms, floor.layout.totalWidth, floor.layout.totalHeight);

    for (const d of doors) {
      doorCount += 1;
      const location = d.exterior
        ? `${d.roomA} (Main Entrance) — ${floor.label}`
        : `${d.roomA} / ${d.roomB} — ${floor.label}`;
      doorSchedule.push({
        id: `D${doorCount}`,
        location,
        width: d.len,
        opening: d.exterior ? "Outward opening" : "Inward opening",
      });
    }

    for (const w of windows) {
      winCount += 1;
      const room = floor.layout.rooms.find((r) => r.name === w.room);
      const cat = room ? categoryOf(room) : "other";
      const type = cat === "bathroom" || cat === "powder" ? "Ventilator" : "Sliding";
      windowSchedule.push({
        id: `W${winCount}`,
        location: `${w.room} — ${floor.label}`,
        width: w.len,
        type,
      });
    }
  }

  return { doorSchedule, windowSchedule };
}

export async function generateArchitecturalPlan(rawInput: DetailedDesignInput): Promise<ArchitecturalPlan> {
  if (!hasClaudeCredentials()) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const input = normalizeInput(rawInput);
  const sitePlan = computeSitePlan(input);
  const staircaseRoom = input.floors > 1 ? buildStaircaseRoom(sitePlan.footprint) : null;

  const generated = await requestRoomLayout(input, sitePlan.footprint, staircaseRoom);

  const floors: FloorData[] = generated.floors
    .sort((a, b) => a.level - b.level)
    .map((f) => {
      const rooms = Array.isArray(f.rooms) ? f.rooms : [];
      const grid = computeStructuralGrid(sitePlan.footprint);
      const utilities = computeUtilities(rooms, f.level, input.floors - 1);
      return {
        level: f.level,
        label: FLOOR_LABELS[f.level] || `Floor ${f.level}`,
        layout: {
          title: FLOOR_LABELS[f.level] || `Floor ${f.level}`,
          totalWidth: sitePlan.footprint.width,
          totalHeight: sitePlan.footprint.height,
          rooms,
        },
        columns: grid.columns,
        beams: grid.beams,
        utilities,
      };
    });

  if (floors.length === 0) {
    throw new Error("No floors were generated");
  }

  const { areaSchedule, carpetAreaSqFt, builtUpAreaSqFt, superBuiltUpAreaSqFt } = buildAreaSchedule(floors);
  const { doorSchedule, windowSchedule } = buildSchedules(floors);

  return {
    title: generated.title || "Residential Concept Plan",
    preparedFor: input.fullName,
    date: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }),
    scaleLabel: "Schematic diagram — not to engineering scale",
    sitePlan,
    floors,
    areaSchedule,
    carpetAreaSqFt,
    builtUpAreaSqFt,
    superBuiltUpAreaSqFt,
    doorSchedule,
    windowSchedule,
    vastuNotes: generated.vastuNotes,
    designNotes: generated.designNotes,
    disclaimer: DISCLAIMER,
  };
}
