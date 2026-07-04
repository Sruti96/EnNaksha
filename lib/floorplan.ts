import Anthropic from "@anthropic-ai/sdk";
import { extractProjectName, findProjectLayout } from "@/lib/projectLayouts";

export type RoomCategory =
  | "bedroom"
  | "master_bedroom"
  | "living"
  | "family"
  | "kitchen"
  | "bathroom"
  | "powder"
  | "dining"
  | "foyer"
  | "balcony"
  | "terrace"
  | "utility"
  | "pantry"
  | "pooja"
  | "office"
  | "study"
  | "theater"
  | "gym"
  | "servant"
  | "store"
  | "staircase"
  | "lift"
  | "garage"
  | "other";

export type Room = {
  name: string;
  type?: RoomCategory;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FloorPlanLayout = {
  title: string;
  totalWidth: number;
  totalHeight: number;
  rooms: Room[];
  notes?: string;
};

export type FloorPlanInput = {
  bhkType?: string;
  homeSize?: number | string;
  aesthetic?: string;
  plan?: string;
  budget?: number | string;
  location?: string;
};

export const CLAUDE_MODEL = "claude-sonnet-4-5";

export function planDimensions(homeSizeSqFt: number) {
  // Assume a roughly 5:4 rectangular plot envelope sized off total sq ft.
  const width = Math.round(Math.sqrt(homeSizeSqFt * 1.25));
  const height = Math.round(homeSizeSqFt / width);
  return { width: Math.max(width, 10), height: Math.max(height, 10) };
}

export function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}

export function hasClaudeCredentials() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getClaudeClient() {
  if (!hasClaudeCredentials()) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ---------------------------------------------------------------------------
// Shared geometry helpers — used by both FloorPlanSVG (rendering) and
// architecturalPlan.ts (door/window schedules). Kept here so both can share
// one source of truth instead of duplicating adjacency math.
// ---------------------------------------------------------------------------

export function categoryOf(room: Room): RoomCategory {
  if (room.type) return room.type;
  const n = room.name.toLowerCase();
  if (n.includes("master")) return "master_bedroom";
  if (n.includes("bed")) return "bedroom";
  if (n.includes("family")) return "family";
  if (n.includes("living") || n.includes("hall")) return "living";
  if (n.includes("kitchen") || n.includes("pantry")) return "kitchen";
  if (n.includes("powder")) return "powder";
  if (n.includes("bath") || n.includes("toilet") || n.includes("wc")) return "bathroom";
  if (n.includes("dining")) return "dining";
  if (n.includes("foyer") || n.includes("entrance")) return "foyer";
  if (n.includes("terrace")) return "terrace";
  if (n.includes("balcony")) return "balcony";
  if (n.includes("pooja") || n.includes("puja")) return "pooja";
  if (n.includes("office")) return "office";
  if (n.includes("study")) return "study";
  if (n.includes("theater") || n.includes("theatre")) return "theater";
  if (n.includes("gym")) return "gym";
  if (n.includes("servant")) return "servant";
  if (n.includes("store")) return "store";
  if (n.includes("stair")) return "staircase";
  if (n.includes("lift") || n.includes("elevator")) return "lift";
  if (n.includes("garage") || n.includes("parking")) return "garage";
  if (n.includes("utility") || n.includes("wash") || n.includes("laundry")) return "utility";
  return "other";
}

const ADJACENCY_TOL = 1.5; // ft tolerance for shared-wall / boundary checks
export const DOOR_LENGTH_FT = 2.6;

export type DoorSpec = {
  x: number;
  y: number;
  orientation: "h" | "v";
  len: number;
  swing: 1 | -1;
  roomA?: string;
  roomB?: string;
  exterior?: boolean;
};

export type WindowSpec = {
  x: number;
  y: number;
  orientation: "h" | "v";
  len: number;
  room?: string;
};

const ENSUITE_NAME_RE = /attach|ensuite|en-suite|en suite|master.*(bath|wash|toilet)/i;

/** A private/ensuite bathroom should only ever connect to the one bedroom it belongs to. */
export function isEnsuiteBathroom(room: Room): boolean {
  const cat = categoryOf(room);
  return (cat === "bathroom" || cat === "powder") && ENSUITE_NAME_RE.test(room.name);
}

function sharedWallLength(a: Room, b: Room): number {
  if (Math.abs(a.x + a.width - b.x) < ADJACENCY_TOL || Math.abs(b.x + b.width - a.x) < ADJACENCY_TOL) {
    const overlapStart = Math.max(a.y, b.y);
    const overlapEnd = Math.min(a.y + a.height, b.y + b.height);
    return Math.max(0, overlapEnd - overlapStart);
  }
  if (Math.abs(a.y + a.height - b.y) < ADJACENCY_TOL || Math.abs(b.y + b.height - a.y) < ADJACENCY_TOL) {
    const overlapStart = Math.max(a.x, b.x);
    const overlapEnd = Math.min(a.x + a.width, b.x + b.width);
    return Math.max(0, overlapEnd - overlapStart);
  }
  return 0;
}

export function findDoors(rooms: Room[], totalWidth: number, totalHeight: number): DoorSpec[] {
  const doors: DoorSpec[] = [];
  const doorLen = DOOR_LENGTH_FT;

  // Ensuite/attached bathrooms only get a door to the one bedroom they serve —
  // never to a hallway or another bedroom they happen to also touch — so they
  // read as genuinely private rather than a shared/common bathroom.
  const ensuiteToBedroom = new Map<Room, Room>();
  for (const room of rooms) {
    if (!isEnsuiteBathroom(room)) continue;
    let bestBedroom: Room | null = null;
    let bestOverlap = 0;
    for (const other of rooms) {
      if (other === room) continue;
      const cat = categoryOf(other);
      if (cat !== "bedroom" && cat !== "master_bedroom") continue;
      const overlap = sharedWallLength(room, other);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestBedroom = other;
      }
    }
    if (bestBedroom && bestOverlap >= doorLen) {
      ensuiteToBedroom.set(room, bestBedroom);
    }
  }

  for (const [ensuite, bedroom] of ensuiteToBedroom) {
    if (Math.abs(ensuite.x + ensuite.width - bedroom.x) < ADJACENCY_TOL || Math.abs(bedroom.x + bedroom.width - ensuite.x) < ADJACENCY_TOL) {
      const wallX = Math.abs(ensuite.x + ensuite.width - bedroom.x) < ADJACENCY_TOL ? ensuite.x + ensuite.width : bedroom.x + bedroom.width;
      const overlapStart = Math.max(ensuite.y, bedroom.y);
      const overlapEnd = Math.min(ensuite.y + ensuite.height, bedroom.y + bedroom.height);
      const midY = (overlapStart + overlapEnd) / 2;
      doors.push({ x: wallX, y: midY - doorLen / 2, orientation: "v", len: doorLen, swing: 1, roomA: bedroom.name, roomB: ensuite.name });
    } else {
      const wallY = Math.abs(ensuite.y + ensuite.height - bedroom.y) < ADJACENCY_TOL ? ensuite.y + ensuite.height : bedroom.y + bedroom.height;
      const overlapStart = Math.max(ensuite.x, bedroom.x);
      const overlapEnd = Math.min(ensuite.x + ensuite.width, bedroom.x + bedroom.width);
      const midX = (overlapStart + overlapEnd) / 2;
      doors.push({ x: midX - doorLen / 2, y: wallY, orientation: "h", len: doorLen, swing: 1, roomA: bedroom.name, roomB: ensuite.name });
    }
  }

  const handledEnsuites = new Set(ensuiteToBedroom.keys());

  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const a = rooms[i];
      const b = rooms[j];
      if (categoryOf(a) === "staircase" || categoryOf(b) === "staircase") continue;
      if (handledEnsuites.has(a) || handledEnsuites.has(b)) continue;

      if (Math.abs(a.x + a.width - b.x) < ADJACENCY_TOL || Math.abs(b.x + b.width - a.x) < ADJACENCY_TOL) {
        const wallX = Math.abs(a.x + a.width - b.x) < ADJACENCY_TOL ? a.x + a.width : b.x + b.width;
        const overlapStart = Math.max(a.y, b.y);
        const overlapEnd = Math.min(a.y + a.height, b.y + b.height);
        if (overlapEnd - overlapStart >= doorLen) {
          const midY = (overlapStart + overlapEnd) / 2;
          doors.push({ x: wallX, y: midY - doorLen / 2, orientation: "v", len: doorLen, swing: 1, roomA: a.name, roomB: b.name });
        }
      }

      if (Math.abs(a.y + a.height - b.y) < ADJACENCY_TOL || Math.abs(b.y + b.height - a.y) < ADJACENCY_TOL) {
        const wallY = Math.abs(a.y + a.height - b.y) < ADJACENCY_TOL ? a.y + a.height : b.y + b.height;
        const overlapStart = Math.max(a.x, b.x);
        const overlapEnd = Math.min(a.x + a.width, b.x + b.width);
        if (overlapEnd - overlapStart >= doorLen) {
          const midX = (overlapStart + overlapEnd) / 2;
          doors.push({ x: midX - doorLen / 2, y: wallY, orientation: "h", len: doorLen, swing: 1, roomA: a.name, roomB: b.name });
        }
      }
    }
  }

  const foyer = rooms.find((r) => categoryOf(r) === "foyer") || rooms[0];
  if (foyer) {
    const nearLeft = foyer.x < ADJACENCY_TOL;
    const nearRight = Math.abs(foyer.x + foyer.width - totalWidth) < ADJACENCY_TOL;
    const nearTop = foyer.y < ADJACENCY_TOL;
    const nearBottom = Math.abs(foyer.y + foyer.height - totalHeight) < ADJACENCY_TOL;

    if (nearBottom) {
      doors.push({ x: foyer.x + foyer.width / 2 - doorLen / 2, y: totalHeight - 0.01, orientation: "h", len: doorLen, swing: -1, roomA: foyer.name, exterior: true });
    } else if (nearTop) {
      doors.push({ x: foyer.x + foyer.width / 2 - doorLen / 2, y: 0.01, orientation: "h", len: doorLen, swing: 1, roomA: foyer.name, exterior: true });
    } else if (nearLeft) {
      doors.push({ x: 0.01, y: foyer.y + foyer.height / 2 - doorLen / 2, orientation: "v", len: doorLen, swing: 1, roomA: foyer.name, exterior: true });
    } else if (nearRight) {
      doors.push({ x: totalWidth - 0.01, y: foyer.y + foyer.height / 2 - doorLen / 2, orientation: "v", len: doorLen, swing: -1, roomA: foyer.name, exterior: true });
    }
  }

  return doors;
}

export function findWindows(rooms: Room[], totalWidth: number, totalHeight: number): WindowSpec[] {
  const windows: WindowSpec[] = [];
  const skip: RoomCategory[] = ["foyer", "utility", "staircase", "lift", "garage", "store"];

  for (const r of rooms) {
    const cat = categoryOf(r);
    if (skip.includes(cat)) continue;
    const winLen = Math.min(Math.max(r.width, r.height) * (cat === "bathroom" || cat === "powder" ? 0.25 : 0.4), 6);
    if (winLen < 1.5) continue;

    if (r.y < ADJACENCY_TOL && r.width >= winLen) {
      windows.push({ x: r.x + r.width / 2 - winLen / 2, y: 0, orientation: "h", len: winLen, room: r.name });
    } else if (Math.abs(r.y + r.height - totalHeight) < ADJACENCY_TOL && r.width >= winLen) {
      windows.push({ x: r.x + r.width / 2 - winLen / 2, y: totalHeight, orientation: "h", len: winLen, room: r.name });
    } else if (r.x < ADJACENCY_TOL && r.height >= winLen) {
      windows.push({ x: 0, y: r.y + r.height / 2 - winLen / 2, orientation: "v", len: winLen, room: r.name });
    } else if (Math.abs(r.x + r.width - totalWidth) < ADJACENCY_TOL && r.height >= winLen) {
      windows.push({ x: totalWidth, y: r.y + r.height / 2 - winLen / 2, orientation: "v", len: winLen, room: r.name });
    }
  }

  return windows;
}

export async function generateFloorPlan(
  input: FloorPlanInput
): Promise<FloorPlanLayout> {
  // A real, verified layout for the specific building the visitor picked
  // beats an AI guess — check that first before generating anything.
  if (input.location) {
    const projectName = extractProjectName(input.location);
    const known = findProjectLayout(projectName, input.bhkType);
    if (known) {
      return {
        ...known,
        notes: known.notes
          ? `${known.notes} Based on ${projectName}'s actual verified unit layout.`
          : `Based on ${projectName}'s actual verified unit layout.`,
      };
    }
  }

  const homeSize = Number(input.homeSize) || 1000;
  const { width, height } = planDimensions(homeSize);
  const client = getClaudeClient();

  const prompt = `You are an architectural planner for EnNaksha, a home design company in India.

Design a 2D floor plan layout for this client:
- BHK type: ${input.bhkType || "not specified"}
- Total home size: ${homeSize} sq ft
- Design aesthetic: ${input.aesthetic || "not specified"}
- Plan tier: ${input.plan || "not specified"}
- Budget: ${input.budget || "not specified"}
- Location: ${input.location || "not specified"}

The plot envelope is exactly ${width} ft (width) x ${height} ft (height). Origin (0,0) is the top-left corner, x increases to the right, y increases downward. All measurements are in feet.

Place every room required for the given BHK type (bedrooms, hall/living room, kitchen, bathrooms, dining area, foyer/entrance, balcony and utility area if space allows) as non-overlapping rectangles that together fill the envelope reasonably (small gaps for walls are fine, but do not let rooms overlap or extend outside the envelope). Include exactly one foyer/entrance room touching the outer boundary — that is where the main entrance door will be drawn. Room sizes should be realistic for Indian homes of this size and reflect the requested aesthetic in the "notes" field.

If the home has 2 or more bedrooms, designate exactly one as the Master Bedroom (name it "Master Bedroom", type "master_bedroom") and give it its own private attached bathroom: a bathroom room sharing a wall ONLY with the master bedroom (not with any other bedroom, hallway, or shared circulation space), named exactly "Attached Bathroom" so it reads as a private ensuite rather than a shared/common bathroom. Any remaining bathrooms serve the other bedrooms as usual.

Every room must have a "type" set to exactly one of: "bedroom", "master_bedroom", "living", "kitchen", "bathroom", "dining", "foyer", "balcony", "utility", "other" — this controls which furniture icons get drawn, so pick the closest match even if the room name is more specific.

Respond with ONLY strict JSON, no markdown fences, no commentary, matching exactly this schema:
{
  "title": string,
  "totalWidth": ${width},
  "totalHeight": ${height},
  "rooms": [ { "name": string, "type": string, "x": number, "y": number, "width": number, "height": number } ],
  "notes": string
}`;

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";
  const json = extractJson(raw);

  let layout: FloorPlanLayout;
  try {
    layout = JSON.parse(json);
  } catch {
    throw new Error("Claude returned a floor plan response that could not be parsed as JSON");
  }

  if (!layout.rooms || !Array.isArray(layout.rooms) || layout.rooms.length === 0) {
    throw new Error("Claude returned a floor plan with no rooms");
  }

  return {
    title: layout.title || `${input.bhkType || "Custom"} Floor Plan`,
    totalWidth: layout.totalWidth || width,
    totalHeight: layout.totalHeight || height,
    rooms: layout.rooms,
    notes: layout.notes,
  };
}
