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

/**
 * Real floor plans aren't one-size-fits-all — a narrow, deep plot needs a
 * different room-arrangement strategy than a near-square one. Picks the
 * right typology (linear / L-shaped-clustered / hybrid) based on how
 * elongated the envelope is, so Claude isn't guessing at a layout pattern
 * that doesn't suit the plot's actual proportions.
 */
export function describeLayoutStrategy(width: number, height: number): string {
  const long = Math.max(width, height);
  const short = Math.min(width, height);
  const ratio = long / short;

  if (ratio >= 1.6) {
    return `This plot is narrow and long (long side is ~${ratio.toFixed(
      1
    )}x the short side) — use a LINEAR layout strategy: arrange rooms in a front-to-back sequence along the long axis (foyer, then the open living/dining zone, then kitchen/utility, then bedrooms toward the rear), each room spanning close to the full short dimension so every room still reaches an exterior wall on one of the long sides. Don't place a staircase or any room in a dead-center block with no exterior wall — that breaks circulation and blocks light on a narrow plan.`;
  }
  if (ratio <= 1.25) {
    return `This plot is close to square (roughly ${ratio.toFixed(
      1
    )}:1) — use an L-SHAPED/CLUSTERED layout strategy: cluster the public zone (foyer, living, dining, kitchen) around two adjoining sides forming an L, freeing up the opposite corner(s) of the envelope for the private bedroom zone.`;
  }
  return `This plot is moderately rectangular (roughly ${ratio.toFixed(
    1
  )}:1) — a hybrid layout works well: run the public zone along one full side, the private bedroom zone along the opposite side, with the kitchen/service zone at one end connecting them.`;
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

/**
 * Room types that are habitable/occupied spaces and, in a real home, need
 * their own exterior wall for a window (natural light + ventilation).
 * Bathrooms/utility/store/staircase/lift/garage are deliberately excluded —
 * interior bathrooms with an exhaust fan are completely normal in Indian
 * homes, so we don't flag those.
 */
const NEEDS_EXTERIOR_WALL: RoomCategory[] = [
  "bedroom",
  "master_bedroom",
  "living",
  "family",
  "kitchen",
  "dining",
  "balcony",
  "terrace",
  "study",
  "office",
  "gym",
  "theater",
  "pooja",
  "servant",
];

export function isOnExteriorBoundary(room: Room, totalWidth: number, totalHeight: number, tol = ADJACENCY_TOL): boolean {
  return (
    room.x < tol ||
    Math.abs(room.x + room.width - totalWidth) < tol ||
    room.y < tol ||
    Math.abs(room.y + room.height - totalHeight) < tol
  );
}

/**
 * Finds rooms that Claude placed fully inside the envelope with no exterior
 * wall, even though their type requires one (most importantly balconies/
 * terraces, which are physically impossible landlocked in the middle of a
 * floor plan — they have to open to the outside).
 */
export function findVentilationViolations(rooms: Room[], totalWidth: number, totalHeight: number): Room[] {
  return rooms.filter((r) => {
    const cat = categoryOf(r);
    if (!NEEDS_EXTERIOR_WALL.includes(cat)) return false;
    return !isOnExteriorBoundary(r, totalWidth, totalHeight);
  });
}

/** Minimum fraction of the envelope that should be covered by named rooms. */
export const MIN_SPACE_UTILIZATION = 0.85;

/**
 * Fraction of the envelope's area that's actually covered by rooms. Real
 * Indian homes use the plot efficiently — leftover "dead" floor area beyond
 * what walls/corridors need is a sign Claude under-filled the plan.
 */
export function computeSpaceUtilization(rooms: Room[], totalWidth: number, totalHeight: number): number {
  const envelopeArea = totalWidth * totalHeight;
  if (envelopeArea <= 0) return 1;
  const roomArea = rooms.reduce((sum, r) => sum + r.width * r.height, 0);
  return roomArea / envelopeArea;
}

/**
 * Real Indian floor plans almost never wall off the living room from the
 * dining area — they're one continuous open-plan zone with a wide shared
 * opening, not a swinging door. Any pair of categories listed here gets no
 * door drawn between them at all (just the plain shared-wall line).
 */
const OPEN_PLAN_PAIRS: [RoomCategory, RoomCategory][] = [
  ["living", "dining"],
  ["family", "dining"],
];

function isOpenPlanPair(a: Room, b: Room): boolean {
  const catA = categoryOf(a);
  const catB = categoryOf(b);
  return OPEN_PLAN_PAIRS.some(([x, y]) => (catA === x && catB === y) || (catA === y && catB === x));
}

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
      if (isOpenPlanPair(a, b)) continue;

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

  const prompt = `You are an architectural planner for EnNaksha, a home design company in India, working from real residential design conventions used by Indian architects — not an idealized abstract layout.

Design a 2D floor plan layout for this client:
- BHK type: ${input.bhkType || "not specified"}
- Total home size: ${homeSize} sq ft
- Design aesthetic: ${input.aesthetic || "not specified"}
- Plan tier: ${input.plan || "not specified"}
- Budget: ${input.budget || "not specified"}
- Location: ${input.location || "not specified"}

The plot envelope is exactly ${width} ft (width) x ${height} ft (height). Origin (0,0) is the top-left corner, x increases to the right, y increases downward. All measurements are in feet.

${describeLayoutStrategy(width, height)}

Place every room required for the given BHK type (bedrooms, hall/living room, kitchen, bathrooms, dining area, foyer/entrance, balcony and utility area if space allows) as non-overlapping rectangles that together fill the envelope reasonably (small gaps for walls are fine, but do not let rooms overlap or extend outside the envelope). Room sizes should be realistic for Indian homes of this size and reflect the requested aesthetic in the "notes" field.

Use these real, research-based Indian residential room size standards (aligned with National Building Code / RERA norms) as your baseline — size rooms at least at the minimum, and prefer the ideal size where the envelope allows, rather than shrinking every room to leave gaps:
- Bedroom: minimum 10x10 ft, ideal 12x15 ft
- Master Bedroom: minimum 12x12 ft, ideal 12x15 ft or larger
- Living/Hall: minimum 12x15 ft, ideal up to 15x20 ft
- Kitchen: minimum 8x10 ft, ideal 10x12 ft
- Bathroom: minimum 5x7 ft, ideal 7x10 ft
- Dining area: at least 10x10 ft where space allows

Fill the envelope — do not leave unused/dead floor area. Rooms together should cover at least 90% of the total envelope area (the rest accounts for walls/circulation). If there's leftover space after placing the required rooms, enlarge the living room, kitchen, dining area, or bedrooms toward the ideal sizes above, or add a sensible extra room (store, utility nook, larger balcony) — never leave a gap that isn't part of any room.

Plan the zoning the way an architect would — sketch the bubble diagram/adjacency matrix mentally before placing rectangles:
- PUBLIC ZONE: foyer + living/hall + dining, clustered together nearest the entrance. Living and dining should be ONE continuous open-plan zone sharing a long common wall (at least 8 ft) with no door between them — real Indian homes almost never wall these off from each other, it should read as a single open L-shaped space.
- SERVICE ZONE: kitchen sits directly adjacent to the dining area (short serving distance) but should NOT be directly adjacent to any bedroom — cooking noise/smell shouldn't bleed into a bedroom.
- PRIVATE ZONE: bedrooms + their attached bathrooms are grouped together, away from the entrance and away from the kitchen, for quiet and privacy. Put the Master Bedroom in whichever corner of the envelope is farthest from the foyer/entrance — that's the most private position, the same way real 2/3 BHK plans put the master bedroom at the opposite end of the home from the front door.
- The foyer/entrance MUST touch the outer boundary (that's where the main entrance door is drawn), and must open into the living/hall — never directly into a bedroom or bathroom.
- Size the kitchen so a real kitchen work triangle fits: the fridge, stove, and sink should be able to sit 4-9 ft apart from each other (roughly 26 ft combined), so keep it compact and roughly proportioned (not a long thin sliver), and don't let it become a walkway other rooms have to pass through.

Other physical requirements:
- Every bedroom, the living/hall, the kitchen, and the dining area MUST have at least one full side flush against the building's outer boundary (x=0, x=${width}, y=0, or y=${height}) so it can have a real window — a habitable room sealed on all four sides with no exterior wall is not a valid design.
- A balcony (if included) is an open-air space attached to an exterior wall — it is physically impossible for a balcony to sit in the interior of the plan with no exterior edge. Always place it flush against one full side of the outer boundary, directly adjacent to the room it serves (bedroom or living room).
- Bathrooms may be interior (windowless, exhaust-fan ventilated) — that's normal — but keep them clustered near each other and near the kitchen where possible, since it keeps plumbing runs short and realistic.
- Avoid long thin unusable sliver rooms — bedrooms and the living room should be at least 8 ft in their narrowest dimension, bathrooms at least 4.5 ft.

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

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  let layout = await requestFloorPlanCompletion(client, messages, input, width, height);

  const violations = findVentilationViolations(layout.rooms, layout.totalWidth, layout.totalHeight);
  const utilization = computeSpaceUtilization(layout.rooms, layout.totalWidth, layout.totalHeight);
  const underfilled = utilization < MIN_SPACE_UTILIZATION;

  if (violations.length > 0 || underfilled) {
    const issues: string[] = [];
    if (violations.length > 0) {
      issues.push(
        `${violations.map((v) => `"${v.name}"`).join(", ")} ${violations.length > 1 ? "are" : "is"} not touching any exterior wall (x=0, x=${width}, y=0, or y=${height}), but a room of that type must have a real window/be open to the outside — a balcony in particular cannot be landlocked in the interior. Fix the position/size of the affected room(s) so each has a full side flush against an exterior boundary.`
      );
    }
    if (underfilled) {
      issues.push(
        `Only about ${Math.round(utilization * 100)}% of the ${width}x${height} ft envelope is covered by rooms — real Indian homes use at least ~90% of the plot (per NBC/RERA-aligned planning norms). Enlarge the living room, kitchen, dining area, and/or bedrooms toward their ideal sizes, or add a sensible extra room, to fill the remaining floor area.`
      );
    }

    messages.push({ role: "assistant", content: JSON.stringify(layout) });
    messages.push({
      role: "user",
      content: `This layout needs fixes: ${issues.join(" ")} Keep every other room that's already fine unchanged and make sure rooms still don't overlap. Respond with ONLY the corrected strict JSON, same schema as before, no commentary.`,
    });

    try {
      const corrected = await requestFloorPlanCompletion(client, messages, input, width, height);
      const correctedViolations = findVentilationViolations(corrected.rooms, corrected.totalWidth, corrected.totalHeight).length;
      const correctedUtilization = computeSpaceUtilization(corrected.rooms, corrected.totalWidth, corrected.totalHeight);
      if (correctedViolations <= violations.length && correctedUtilization >= utilization) {
        layout = corrected;
      }
    } catch {
      // keep the original layout if the correction pass fails
    }
  }

  return layout;
}

async function requestFloorPlanCompletion(
  client: Anthropic,
  messages: Anthropic.MessageParam[],
  input: FloorPlanInput,
  width: number,
  height: number
): Promise<FloorPlanLayout> {
  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2000,
    messages,
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
