import { NextResponse } from "next/server";
import { hasGoogleSheetsCredentials, saveLead, type Lead } from "@/lib/google-sheets";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json();
  const location = String(body.location ?? "").trim();
  const email = String(body.email ?? "").trim();

  if (!location || !email) {
    return NextResponse.json(
      { success: false, error: "Location and email are required" },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { success: false, error: "Enter a valid email address" },
      { status: 400 }
    );
  }

  const lead: Lead = {
    location,
    email,
    plan: body.plan,
    bhkType: body.bhkType,
    homeSize: body.homeSize,
    aesthetic: body.aesthetic,
    timeline: body.timeline,
    floorPlan: body.floorPlan,
    budget: body.budget,
    fullName: body.fullName,
    whatsapp: body.whatsapp,
    addOns: body.addOns,
    step: body.step,
  };

  try {
    await saveLead(lead);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save lead";

    return NextResponse.json(
      {
        success: false,
        error: hasGoogleSheetsCredentials()
          ? message
          : "Could not save to Google Sheet. Redeploy the Apps Script (new version) with access set to Anyone, or add Google Sheets credentials.",
        details: message,
      },
      { status: 502 }
    );
  }
}
