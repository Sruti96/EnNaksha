import { NextResponse } from "next/server";
import { generateFloorPlan, hasClaudeCredentials, type FloorPlanInput } from "@/lib/floorplan";
import { generateFloorPlanArt } from "@/lib/floorplanArt";
import { getLeadByEmail, hasGoogleSheetsCredentials } from "@/lib/google-sheets";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (!hasClaudeCredentials()) {
    return NextResponse.json(
      {
        success: false,
        error: "ANTHROPIC_API_KEY is not configured on the server.",
      },
      { status: 500 }
    );
  }

  let input: FloorPlanInput = {
    bhkType: body.bhkType,
    homeSize: body.homeSize,
    aesthetic: body.aesthetic,
    plan: body.plan,
    budget: body.budget,
    location: body.location,
  };

  const email = typeof body.email === "string" ? body.email.trim() : "";

  // If an email is given (and we weren't handed a full set of fields already),
  // pull the client's actual entry back out of the Google Sheet.
  if (email && (!input.bhkType || !input.homeSize)) {
    if (!hasGoogleSheetsCredentials()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Looking up leads by email requires Google Sheets service-account credentials.",
        },
        { status: 500 }
      );
    }

    const lead = await getLeadByEmail(email);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: "No lead found in the sheet for that email." },
        { status: 404 }
      );
    }

    input = {
      bhkType: lead.bhkType,
      homeSize: lead.homeSize,
      aesthetic: lead.aesthetic,
      plan: lead.plan,
      budget: lead.budget,
      location: lead.location,
    };
  }

  // Try letting Claude draw the actual SVG artwork itself first (the same
  // approach claude.ai's Design feature uses). It's validated internally
  // against the same physical-correctness checks as the structured flow —
  // if it fails those, or can't be parsed at all, this returns null and we
  // fall back to the deterministic structured-JSON + FloorPlanSVG renderer.
  try {
    const art = await generateFloorPlanArt(input);
    if (art) {
      return NextResponse.json({
        success: true,
        mode: "art",
        svg: art.svg,
        title: art.title,
        notes: art.notes,
      });
    }
  } catch {
    // fall through to the structured flow below
  }

  try {
    const layout = await generateFloorPlan(input);
    return NextResponse.json({ success: true, mode: "structured", layout });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate design";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
