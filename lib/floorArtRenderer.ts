import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, getClaudeClient, type Room } from "@/lib/floorplan";

const SCALE = 22; // px per foot — matches FloorPlanSVG's own SCALE constant

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

function extractSvg(raw: string): string | null {
  const text = stripFences(raw);
  const m = text.match(/<svg[\s\S]*<\/svg>/i);
  return m ? sanitizeSvg(m[0]) : null;
}

function extractMetaRooms(svg: string): Room[] | null {
  const metaMatch = svg.match(/<metadata[^>]*>[\s\S]*?<!\[CDATA\[([\s\S]*?)\]\]>[\s\S]*?<\/metadata>/i);
  if (!metaMatch) return null;
  try {
    const parsed = JSON.parse(metaMatch[1].trim());
    return Array.isArray(parsed.rooms) ? parsed.rooms : null;
  } catch {
    return null;
  }
}

function roomsMatch(given: Room[], echoed: Room[] | null, tol = 1): boolean {
  if (!echoed || given.length !== echoed.length) return false;
  return given.every((r) => {
    const match = echoed.find((e) => e.name === r.name);
    if (!match) return false;
    return (
      Math.abs(r.x - match.x) <= tol &&
      Math.abs(r.y - match.y) <= tol &&
      Math.abs(r.width - match.width) <= tol &&
      Math.abs(r.height - match.height) <= tol
    );
  });
}

/**
 * Given an already-decided, already-validated room layout (positions
 * computed and checked by the existing deterministic pipeline — exterior
 * walls, no overlaps, space utilization, ensuite bathrooms — all still
 * enforced by lib/architecturalPlan.ts before this is ever called), this
 * asks Claude to draw the finished SVG artwork for it directly, the way
 * claude.ai's Design feature would — instead of our own FloorPlanSVG React
 * component mechanically drawing the rectangles.
 *
 * Claude isn't free to reposition rooms here; that stays deterministic and
 * validated. This function is purely the illustration/rendering pass. If
 * Claude can't produce a drawing whose echoed room list matches what it was
 * given (after one retry), this returns null and the caller should fall
 * back to rendering that floor with FloorPlanSVG instead.
 */
export async function drawFloorArt(
  rooms: Room[],
  totalWidth: number,
  totalHeight: number,
  floorLabel: string,
  title: string
): Promise<string | null> {
  const client = getClaudeClient();
  const roomList = rooms
    .map(
      (r) =>
        `- "${r.name}" (${r.type || "other"}): x=${r.x.toFixed(1)}, y=${r.y.toFixed(1)}, width=${r.width.toFixed(
          1
        )}, height=${r.height.toFixed(1)}`
    )
    .join("\n");

  const prompt = `You are a technical illustrator drawing a professional architectural concept sheet for EnNaksha, a home design company in India.

Draw the "${floorLabel}" of "${title}" as a single self-contained SVG. The room layout is ALREADY DECIDED and validated — use these EXACT coordinates, do not move, resize, add, or remove any room:

Envelope: ${totalWidth.toFixed(1)} ft (width) x ${totalHeight.toFixed(1)} ft (height). Origin (0,0) top-left, x increases right, y increases downward, all in feet.

Rooms:
${roomList}

=== DRAWING SPECIFICATION ===
- Canvas: viewBox "0 0 ${totalWidth * SCALE + 140} ${totalHeight * SCALE + 340}". Envelope top-left corner at pixel (70, 60); 1 foot = ${SCALE} px, so a room at feet (x,y,w,h) draws at pixel rect (70+x*${SCALE}, 60+y*${SCALE}, w*${SCALE}, h*${SCALE}).
- Dark navy "blueprint" drafting-sheet style: background #0d2f63 with a subtle grid (white lines ~5% opacity every 18px, bolder white lines ~9% opacity every 90px) and a soft radial vignette (lighter navy #12386f center fading to #082249 edges), plus a thin double-line sheet border frame near the canvas edges.
- Exterior wall: white/near-white (#eaf2ff) stroke ~4-5px, drawn as the envelope rectangle outline. Interior walls: light blue-white (#dbe8ff) stroke ~2-3px, one line per shared wall between adjacent rooms (infer shared walls from the given coordinates).
- Doors: a short gap in the wall between logically-connected/adjacent rooms plus a quarter-circle swing arc (#9fc4f5, thin) and a straight door-leaf line. Every room needs at least one door reachable from another room or the exterior; infer sensible placement from adjacency.
- Windows: a short double parallel line (#9fc4f5) across exterior-wall segments of habitable rooms only (skip bathrooms, utility, staircase, garage).
- Furniture (light blue/white outline icons, fill="none" or very light — no solid color blocks): bed + nightstands in bedrooms, a wardrobe outline, a sofa in living/family rooms, a dining table with chair marks, an L-shaped kitchen counter with a stove (circles) and sink, a WC + wash basin + shower area in bathrooms, a railing in balconies/terraces, stair treads if a "Staircase" room is present.
- Room labels: centered in each room, three stacked lines — name (bold, uppercase, font-family "'Barlow Condensed', sans-serif", ~13-15px, fill #eef4ff), dimensions like 12'-0" × 10'-6" (font-family "'Space Mono', monospace", ~10px, fill #9fc4f5), and area like "150 SFT" (same mono font, ~8px, fill #6f9fdd).
- Overall dimension lines along the top and left edges outside the envelope, with tick marks and feet-inch labels, mono font, fill #bcd6ff.
- A compass rose (circle + filled N arrow) top-right, a graphic scale bar (alternating filled/unfilled short rectangles) near the bottom, and a title block strip near the bottom with PLOT SIZE (${totalWidth.toFixed(0)}' × ${totalHeight.toFixed(0)}'), APPROX AREA, and the floor label "${floorLabel}".
- Do NOT use <script>, <iframe>, <foreignObject>, <image>, or any external URL references — fully self-contained and inert (no JavaScript).

=== REQUIRED MACHINE-READABLE BLOCK ===
After all visible drawing, include exactly one metadata element (it will not render visually, it's for our internal QA — it must echo back the exact same room list you were given above, unchanged):

<metadata id="room-data"><![CDATA[
{"rooms": [{"name": string, "type": string, "x": number, "y": number, "width": number, "height": number}]}
]]></metadata>

Respond with ONLY the raw <svg>...</svg> markup (including the metadata block inside it) — no markdown code fences, no explanation before or after.`;

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const message = await client.messages.create({ model: CLAUDE_MODEL, max_tokens: 8000, messages });
      const textBlock = message.content.find((b) => b.type === "text");
      const raw = textBlock && "text" in textBlock ? textBlock.text : "";
      const svg = extractSvg(raw);
      if (svg) {
        const echoed = extractMetaRooms(svg);
        if (roomsMatch(rooms, echoed)) return svg;
      }
      messages.push({ role: "assistant", content: raw.slice(0, 4000) });
      messages.push({
        role: "user",
        content:
          "That didn't come back as a valid self-contained <svg>...</svg> with a metadata block that exactly echoes the given room list. Please redraw it, following the same specification, including the required metadata block matching the given rooms exactly.",
      });
    } catch {
      break;
    }
  }
  return null;
}
