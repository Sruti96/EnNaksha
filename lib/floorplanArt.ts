import Anthropic from "@anthropic-ai/sdk";
import { extractProjectName, findProjectLayout } from "@/lib/projectLayouts";
import {
  CLAUDE_MODEL,
  MIN_SPACE_UTILIZATION,
  computeSpaceUtilization,
  describeLayoutStrategy,
  findVentilationViolations,
  getClaudeClient,
  planDimensions,
  type FloorPlanInput,
  type Room,
} from "@/lib/floorplan";

/**
 * The "art" flow — Claude draws the actual SVG artwork itself (the way the
 * claude.ai Design/Artifacts feature does), instead of just returning room
 * coordinates for our own renderer to draw. This is the ONLY rendering path
 * for a normal request — there's no silent swap to a differently-styled
 * deterministic render just because a physical check didn't pass on the
 * first try.
 *
 * To avoid re-introducing the class of bug we already fixed once (rooms —
 * especially balconies — placed with no exterior wall), Claude embeds a
 * machine-readable <metadata> block listing every room it drew; we run that
 * through the same deterministic checks the old structured flow used
 * (findVentilationViolations / computeSpaceUtilization) and, if something's
 * off, send up to two corrective redraw requests. We keep whichever attempt
 * scored best and ship it — always Claude's own drawing.
 *
 * This only returns null when there's a known/verified project layout for
 * the given location (real data beats any generated drawing, art or
 * otherwise — the caller should use that instead), or when every single
 * attempt failed to even produce a parseable SVG (a genuine API/parsing
 * failure, not a design-quality issue) — the caller should treat that as an
 * error rather than a routine fallback.
 */
export type FloorPlanArt = {
  svg: string;
  title: string;
  notes?: string;
  totalWidth: number;
  totalHeight: number;
  rooms: Room[];
};

const SCALE = 22; // px per foot — matches FloorPlanSVG's own SCALE constant

type ArtMetadata = {
  title?: string;
  notes?: string;
  totalWidth: number;
  totalHeight: number;
  rooms: Room[];
};

function stripFences(text: string): string {
  const fenced = text.match(/```(?:svg|xml|html)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

function sanitizeSvg(svg: string): string {
  let out = svg;
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/\son\w+\s*=\s*"(?:[^"\\]|\\.)*"/gi, "");
  out = out.replace(/\son\w+\s*=\s*'(?:[^'\\]|\\.)*'/gi, "");
  out = out.replace(/(href|xlink:href)\s*=\s*"\s*javascript:[^"]*"/gi, '$1="#"');
  out = out.replace(/(href|xlink:href)\s*=\s*'\s*javascript:[^']*'/gi, "$1='#'");
  out = out.replace(/<(foreignObject|iframe|object|embed|image|link|style)[\s\S]*?<\/\1>/gi, "");
  out = out.replace(/<(foreignObject|iframe|object|embed|image|link)[^>]*\/?>/gi, "");
  return out;
}

function extractSvgAndMetadata(raw: string): { svg: string; meta: ArtMetadata } | null {
  const text = stripFences(raw);
  const svgMatch = text.match(/<svg[\s\S]*<\/svg>/i);
  if (!svgMatch) return null;
  const rawSvg = svgMatch[0];

  const metaMatch = rawSvg.match(/<metadata[^>]*>[\s\S]*?<!\[CDATA\[([\s\S]*?)\]\]>[\s\S]*?<\/metadata>/i);
  if (!metaMatch) return null;

  let meta: ArtMetadata;
  try {
    meta = JSON.parse(metaMatch[1].trim());
  } catch {
    return null;
  }
  if (!meta || !Array.isArray(meta.rooms) || meta.rooms.length === 0 || !meta.totalWidth || !meta.totalHeight) {
    return null;
  }

  return { svg: sanitizeSvg(rawSvg), meta };
}

function buildPrompt(input: FloorPlanInput, width: number, height: number): string {
  return `You are an architectural planner and technical illustrator for EnNaksha, a home design company in India. You draw floor plans the way a real architect's drafting sheet looks — not an abstract diagram.

Design AND DRAW a 2D floor plan for this client:
- BHK type: ${input.bhkType || "not specified"}
- Total home size: ${Number(input.homeSize) || 1000} sq ft
- Design aesthetic: ${input.aesthetic || "not specified"}
- Plan tier: ${input.plan || "not specified"}
- Budget: ${input.budget || "not specified"}
- Location: ${input.location || "not specified"}

The plot envelope is exactly ${width} ft (width) x ${height} ft (height). Origin (0,0) is the top-left corner, x increases to the right, y increases downward. All room placement is in feet.

${describeLayoutStrategy(width, height)}

Place every room required for the given BHK type (bedrooms, hall/living room, kitchen, bathrooms, dining area, foyer/entrance, balcony and utility area if space allows) as non-overlapping rectangles that together fill the envelope reasonably. Use these real, research-based Indian residential room size standards (aligned with National Building Code / RERA norms):
- Bedroom: minimum 10x10 ft, ideal 12x15 ft
- Master Bedroom: minimum 12x12 ft, ideal 12x15 ft or larger
- Living/Hall: minimum 12x15 ft, ideal up to 15x20 ft
- Kitchen: minimum 8x10 ft, ideal 10x12 ft
- Bathroom: minimum 5x7 ft, ideal 7x10 ft
- Dining area: at least 10x10 ft where space allows

Fill the envelope — rooms together should cover at least 90% of the total envelope area. Never leave a gap that isn't part of any room.

Zoning rules (sketch the bubble diagram mentally before placing rectangles):
- PUBLIC ZONE: foyer + living/hall + dining clustered nearest the entrance. Living and dining are ONE continuous open-plan zone sharing a long common wall (at least 8 ft), no door between them.
- SERVICE ZONE: kitchen directly adjacent to dining, NOT directly adjacent to any bedroom.
- PRIVATE ZONE: bedrooms + attached bathrooms grouped together, away from the entrance and kitchen. Master Bedroom goes in the corner farthest from the foyer/entrance.
- The foyer/entrance MUST touch the outer boundary and open into the living/hall — never directly into a bedroom or bathroom.

Physical requirements (hard constraints, verify each before finalizing):
- Every bedroom, the living/hall, the kitchen, and the dining area MUST have at least one full side flush against the outer boundary (x=0, x=${width}, y=0, or y=${height}) for a real window.
- A balcony (if included) MUST be flush against one full side of the outer boundary, directly adjacent to the room it serves — it is physically impossible for a balcony to sit landlocked in the interior.
- Bathrooms may be interior (windowless, exhaust-fan ventilated) but keep them clustered near the kitchen for short plumbing runs.
- Avoid sliver rooms — bedrooms/living room at least 8 ft in their narrowest dimension, bathrooms at least 4.5 ft.
- If 2+ bedrooms: exactly one Master Bedroom, with its OWN private attached bathroom sharing a wall only with it (not with any other bedroom or hallway) — this reads as a private ensuite, not a shared bathroom.

=== DRAWING SPECIFICATION ===

Draw this as a single self-contained SVG, in the style of a professional architectural concept sheet — a dark navy "blueprint" drafting-table look, matching this reference (which you should treat as your house style):

- Canvas: viewBox "0 0 ${width * SCALE + 140} ${height * SCALE + 340}". Building envelope top-left corner sits at pixel (70, 60); 1 foot = ${SCALE} px, so a room at feet (x,y,w,h) draws at pixel rect (70+x*${SCALE}, 60+y*${SCALE}, w*${SCALE}, h*${SCALE}). Worked example: a room at feet x=5, y=10, width=12, height=13 draws as <rect x="${70 + 5 * SCALE}" y="${60 + 10 * SCALE}" width="${12 * SCALE}" height="${13 * SCALE}">. Before drawing, first privately list out every room's feet rectangle and double-check none of them overlap and every room that needs an exterior wall actually touches x=0, x=${width}, y=0, or y=${height} — only then convert each to its pixel rect and draw.
- Background: fill #0d2f63 navy. Add a subtle grid (thin white lines at ~5% opacity every 18px, bolder white lines at ~9% opacity every 90px) and a soft radial vignette (lighter navy #12386f center fading to #082249 edges) behind everything, plus a thin double-line sheet border frame near the canvas edges.
- Exterior wall: white/near-white (#eaf2ff) stroke, width ~4-5px, drawn as the building envelope rectangle outline.
- Interior walls: light blue-white (#dbe8ff) stroke, width ~2-3px, one line per shared wall between rooms.
- Doors: a short gap in the wall plus a quarter-circle swing arc (light blue #9fc4f5, thin, dashed is fine) and a straight door-leaf line — never just a plain gap.
- Windows: a short double parallel line (light blue #9fc4f5) across the wall gap, only on exterior walls.
- Furniture (light blue/white outline icons, fill="none" or very light, no solid color blocks): a bed + two nightstands in each bedroom, a wardrobe outline, a sofa in the living room, a round or rectangular dining table with chair marks, an L-shaped kitchen counter with a stove (circles) and sink, a WC (small ellipse) + wash basin (ellipse) + shower area (dashed rect) in bathrooms, a railing in balconies.
- Room labels: centered in each room, three stacked lines — room name (bold, uppercase, font-family "'Barlow Condensed', sans-serif", ~13-15px, fill #eef4ff), dimensions like 12'-0" × 10'-6" (font-family "'Space Mono', monospace", ~10px, fill #9fc4f5), and area like "150 SFT" (same mono font, ~8px, fill #6f9fdd).
- Overall dimension lines: along the top and left edges outside the envelope, with small tick marks at each segment boundary and the length labeled in feet-inches, font-family "'Space Mono', monospace", fill #bcd6ff.
- A compass rose (circle + filled N arrow) in the top-right area.
- A graphic scale bar (alternating filled/unfilled short rectangles) near the bottom.
- A title block: a bordered strip near the bottom of the canvas with 3 columns — PLOT SIZE (${width}' × ${height}'), APPROX AREA (sum of all room areas in sq ft), and CONFIG (e.g. "2 BED · 2 BATH") — labels in small caps mono font (#9fc4f5), values in bold Barlow Condensed (#eef4ff).
- Do NOT use <script>, <iframe>, <foreignObject>, <image>, or any external URL references — the SVG must be fully self-contained and inert (no JavaScript).

=== REQUIRED MACHINE-READABLE BLOCK ===

After all visible drawing, include exactly one metadata element (it will not render visually, it's for our internal QA — it must exactly match every room you actually drew):

<metadata id="room-data"><![CDATA[
{"title": string, "notes": string, "totalWidth": ${width}, "totalHeight": ${height}, "rooms": [{"name": string, "type": "bedroom"|"master_bedroom"|"living"|"kitchen"|"bathroom"|"dining"|"foyer"|"balcony"|"utility"|"other", "x": number, "y": number, "width": number, "height": number}]}
]]></metadata>

Respond with ONLY the raw <svg>...</svg> markup (including the metadata block inside it) — no markdown code fences, no explanation before or after.`;
}

async function requestArt(
  client: Anthropic,
  messages: Anthropic.MessageParam[]
): Promise<{ svg: string; meta: ArtMetadata } | null> {
  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8000,
    messages,
  });
  const textBlock = message.content.find((block) => block.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";
  return extractSvgAndMetadata(raw);
}

export async function generateFloorPlanArt(input: FloorPlanInput): Promise<FloorPlanArt | null> {
  // A known/verified project layout is more trustworthy than any AI drawing —
  // let the caller fall back to the structured flow, which already handles it.
  if (input.location) {
    const projectName = extractProjectName(input.location);
    if (findProjectLayout(projectName, input.bhkType)) return null;
  }

  const homeSize = Number(input.homeSize) || 1000;
  const { width, height } = planDimensions(homeSize);
  const client = getClaudeClient();

  const prompt = buildPrompt(input, width, height);
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];

  let result: { svg: string; meta: ArtMetadata } | null;
  try {
    result = await requestArt(client, messages);
  } catch {
    return null;
  }
  if (!result) return null;

  let violations = findVentilationViolations(result.meta.rooms, result.meta.totalWidth, result.meta.totalHeight);
  let utilization = computeSpaceUtilization(result.meta.rooms, result.meta.totalWidth, result.meta.totalHeight);
  let underfilled = utilization < MIN_SPACE_UTILIZATION;
  let best = result;
  let bestViolationCount = violations.length;
  let bestUtilization = utilization;

  // Up to two corrective passes — Claude keeps redrawing until the physical
  // checks pass, or we run out of attempts. Every attempt is still Claude's
  // own drawing; we never substitute a different renderer here. We keep
  // whichever attempt scored best in case the last one doesn't improve.
  const MAX_CORRECTIONS = 2;
  for (let correction = 0; correction < MAX_CORRECTIONS && (violations.length > 0 || underfilled); correction++) {
    const issues: string[] = [];
    if (violations.length > 0) {
      issues.push(
        `${violations.map((v) => `"${v.name}"`).join(", ")} ${violations.length > 1 ? "are" : "is"} not touching any exterior wall, but a room of that type must be open to the outside — a balcony especially cannot be landlocked in the interior. Redraw the SVG (and matching metadata) with the affected room(s) moved/resized so each has a full side flush against an exterior boundary (x=0, x=${result.meta.totalWidth}, y=0, or y=${result.meta.totalHeight}).`
      );
    }
    if (underfilled) {
      issues.push(
        `Only about ${Math.round(utilization * 100)}% of the envelope is covered by rooms — fill at least 90%. Redraw the SVG (and matching metadata) with rooms enlarged toward their ideal sizes, or add a sensible extra room.`
      );
    }

    messages.push({ role: "assistant", content: result.svg });
    messages.push({
      role: "user",
      content: `This drawing needs fixes: ${issues.join(
        " "
      )} Keep everything else the same. Respond with ONLY the corrected raw <svg>...</svg> markup including an updated metadata block, no markdown fences, no commentary.`,
    });

    try {
      const corrected = await requestArt(client, messages);
      if (corrected) {
        const correctedViolations = findVentilationViolations(
          corrected.meta.rooms,
          corrected.meta.totalWidth,
          corrected.meta.totalHeight
        ).length;
        const correctedUtilization = computeSpaceUtilization(
          corrected.meta.rooms,
          corrected.meta.totalWidth,
          corrected.meta.totalHeight
        );
        result = corrected;
        violations = findVentilationViolations(corrected.meta.rooms, corrected.meta.totalWidth, corrected.meta.totalHeight);
        utilization = correctedUtilization;
        underfilled = utilization < MIN_SPACE_UTILIZATION;

        if (correctedViolations < bestViolationCount || (correctedViolations === bestViolationCount && correctedUtilization > bestUtilization)) {
          best = corrected;
          bestViolationCount = correctedViolations;
          bestUtilization = correctedUtilization;
        }
      } else {
        break; // couldn't even parse a corrected attempt — stop trying, use best so far
      }
    } catch {
      break; // keep the best drawing seen so far if a correction pass errors out
    }
  }

  // We always ship Claude's own drawing — never silently swap in a
  // differently-styled deterministic render. `best` holds whichever attempt
  // scored lowest on violations / highest on utilization, even if it isn't
  // a perfect 0-violations, ≥90%-filled result.
  return {
    svg: best.svg,
    title: best.meta.title || `${input.bhkType || "Custom"} Floor Plan`,
    notes: best.meta.notes,
    totalWidth: best.meta.totalWidth,
    totalHeight: best.meta.totalHeight,
    rooms: best.meta.rooms,
  };
}
