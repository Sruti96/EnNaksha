import { NextResponse } from "next/server";
import { generateArchitecturalPlan, hasClaudeCredentials, type DetailedDesignInput, type RoadSide } from "@/lib/architecturalPlan";

const ROAD_SIDES: RoadSide[] = ["north", "south", "east", "west"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (!hasClaudeCredentials()) {
    return NextResponse.json(
      { success: false, error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const plotWidth = Number(body.plotWidth);
  const plotDepth = Number(body.plotDepth);
  if (!plotWidth || !plotDepth) {
    return NextResponse.json(
      { success: false, error: "Plot width and depth are required." },
      { status: 400 }
    );
  }

  const roadSide: RoadSide = ROAD_SIDES.includes(body.roadSide) ? body.roadSide : "south";

  const input: DetailedDesignInput = {
    email: body.email,
    fullName: body.fullName,
    plotWidth,
    plotDepth,
    roadSide,
    roadWidth: body.roadWidth,
    floors: body.floors,
    bedrooms: body.bedrooms,
    bathrooms: body.bathrooms,
    parkingSpaces: body.parkingSpaces,
    wantsBalcony: Boolean(body.wantsBalcony),
    wantsTerrace: Boolean(body.wantsTerrace),
    staircaseType: body.staircaseType,
    specialRooms: Array.isArray(body.specialRooms) ? body.specialRooms : [],
    vastu: Boolean(body.vastu),
    budget: body.budget,
    preferences: body.preferences,
    aesthetic: body.aesthetic,
  };

  try {
    const plan = await generateArchitecturalPlan(input);
    return NextResponse.json({ success: true, plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate the detailed plan";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
