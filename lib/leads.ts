// Posts directly to the Google Apps Script Web App — no backend needed.
// Set NEXT_PUBLIC_LEADS_SHEET_API in .env.local to your deployed /exec URL.
const LEADS_API = process.env.NEXT_PUBLIC_LEADS_SHEET_API || "";

export type LeadPayload = {
  location: string;
  email: string;
  plan?: string;
  bhkType?: string;
  homeSize?: number | string;
  aesthetic?: string;
  timeline?: string;
  floorPlan?: File | null;
  budget?: number | string;
  fullName?: string;
  whatsapp?: string;
  addOns?: string[];
  step?: number | string;
};

async function fileToBase64(file: File): Promise<{ base64: string; mime: string; ext: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      const mime = file.type || "image/jpeg";
      const ext = file.name.split(".").pop() || "jpg";
      resolve({ base64, mime, ext });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function postLead(payload: LeadPayload) {
  if (!LEADS_API) {
    console.warn("NEXT_PUBLIC_LEADS_SHEET_API is not set — lead not saved.");
    return;
  }

  let floorPlanBase64 = "";
  let floorPlanMime = "";
  let floorPlanExt = "";
  if (payload.floorPlan instanceof File) {
    const converted = await fileToBase64(payload.floorPlan);
    floorPlanBase64 = converted.base64;
    floorPlanMime = converted.mime;
    floorPlanExt = converted.ext;
  }

  const body = {
    location:       payload.location,
    email:          payload.email,
    plan:           payload.plan,
    bhkType:        payload.bhkType,
    homeSize:       payload.homeSize,
    aesthetic:      payload.aesthetic,
    timeline:       payload.timeline,
    budget:         payload.budget,
    fullName:       payload.fullName,
    whatsapp:       payload.whatsapp,
    addOns:         payload.addOns,
    step:           payload.step,
    floorPlanBase64,
    floorPlanMime,
    floorPlanExt,
  };

  await fetch(LEADS_API, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function saveLeadStep1(location: string, email: string) {
  return postLead({ location, email, step: 1 });
}

export function saveLeadFull(payload: LeadPayload) {
  return postLead({ ...payload, step: "Complete" });
}
