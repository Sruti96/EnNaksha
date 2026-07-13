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

  // Claude draws the actual SVG artwork itself (the same approach claude.ai's
  // Design feature uses) — this is the only rendering path for a normal
  // request; generateFloorPlanArt keeps redrawing internally rather than
  // silently swapping to a different-looking renderer over a failed check.
  // It only returns null for a known/verified project layout (real data
  // beats any generated drawing) or a genuine total generation failure —
  // both of which fall back to the deterministic structured flow below.
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
