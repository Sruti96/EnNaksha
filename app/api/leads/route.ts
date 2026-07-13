import { NextResponse } from "next/server";
import { hasGoogleSheetsCredentials, saveLead, type Lead } from "@/lib/google-sheets";
import { hasWhatsAppCredentials, normalizeWhatsAppNumber, sendWhatsAppTemplateMessage } from "@/lib/whatsapp";

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

    // Best-effort: send a WhatsApp confirmation to the lead's number once
    // the full form is submitted. Never let a WhatsApp failure (missing
    // credentials, bad number, unapproved template, etc.) take down the
    // lead-save itself — the sheet write above is the source of truth.
    let whatsapp: { attempted: boolean; success?: boolean; error?: string } = { attempted: false };
    if (lead.step === "Complete" && lead.whatsapp && hasWhatsAppCredentials()) {
      const to = normalizeWhatsAppNumber(String(lead.whatsapp));
      if (to) {
        const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "lead_confirmation";
        const languageCode = process.env.WHATSAPP_TEMPLATE_LANG || "en";
        const firstName = (lead.fullName || "").trim().split(/\s+/)[0] || "there";
        try {
          const result = await sendWhatsAppTemplateMessage(to, templateName, languageCode, [firstName]);
          whatsapp = result.success
            ? { attempted: true, success: true }
            : { attempted: true, success: false, error: result.error };
        } catch (err) {
          whatsapp = { attempted: true, success: false, error: err instanceof Error ? err.message : "Unknown error" };
        }
      }
    }

    return NextResponse.json({ success: true, whatsapp });
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
