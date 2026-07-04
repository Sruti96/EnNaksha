import Anthropic from "@anthropic-ai/sdk";

export type Room = {
  name: string;
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

const MODEL = "claude-sonnet-4-5";

function planDimensions(homeSizeSqFt: number) {
  // Assume a roughly 5:4 rectangular plot envelope sized off total sq ft.
  const width = Math.round(Math.sqrt(homeSizeSqFt * 1.25));
  const height = Math.round(homeSizeSqFt / width);
  return { width: Math.max(width, 10), height: Math.max(height, 10) };
}

function extractJson(text: string): string {
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

export async function generateFloorPlan(
  input: FloorPlanInput
): Promise<FloorPlanLayout> {
  if (!hasClaudeCredentials()) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const homeSize = Number(input.homeSize) || 1000;
  const { width, height } = planDimensions(homeSize);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are an architectural planner for EnNaksha, a home design company in India.

Design a 2D floor plan layout for this client:
- BHK type: ${input.bhkType || "not specified"}
- Total home size: ${homeSize} sq ft
- Design aesthetic: ${input.aesthetic || "not specified"}
- Plan tier: ${input.plan || "not specified"}
- Budget: ${input.budget || "not specified"}
- Location: ${input.location || "not specified"}

The plot envelope is exactly ${width} ft (width) x ${height} ft (height). Origin (0,0) is the top-left corner, x increases to the right, y increases downward. All measurements are in feet.

Place every room required for the given BHK type (bedrooms, hall/living room, kitchen, bathrooms, balcony if space allows) as non-overlapping rectangles that together fill the envelope reasonably (small gaps for walls are fine, but do not let rooms overlap or extend outside the envelope). Room sizes should be realistic for Indian homes of this size and reflect the requested aesthetic in the "notes" field.

Respond with ONLY strict JSON, no markdown fences, no commentary, matching exactly this schema:
{
  "title": string,
  "totalWidth": ${width},
  "totalHeight": ${height},
  "rooms": [ { "name": string, "x": number, "y": number, "width": number, "height": number } ],
  "notes": string
}`;

  const message = await client.messages.create({
    model: MODEL,
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
