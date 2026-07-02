export type LeadPayload = {
  location: string;
  email: string;
  plan?: string;
  bhkType?: string;
  homeSize?: number | string;
  aesthetic?: string;
  timeline?: string;
  floorPlan?: string;
  budget?: number | string;
  fullName?: string;
  whatsapp?: string;
  addOns?: string[];
  step?: number | string;
};

async function postLead(payload: LeadPayload) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to save lead");
  }

  return response.json();
}

export function saveLeadStep1(location: string, email: string) {
  return postLead({ location, email, step: 1 });
}

export function saveLeadFull(payload: LeadPayload) {
  return postLead({ ...payload, step: "Complete" });
}
