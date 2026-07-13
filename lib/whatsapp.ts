const GRAPH_API_VERSION = "v22.0";

export function hasWhatsAppCredentials(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/**
 * Normalizes a phone number the way a lead typically types it into our form
 * (a bare 10-digit Indian mobile number, sometimes with a leading 0, a "+",
 * spaces, or dashes) into the digits-only E.164 format the WhatsApp Cloud
 * API expects (country code + number, no "+"). Defaults to India (91) when
 * no country code is present, since EnNaksha's leads are India-based.
 */
export function normalizeWhatsAppNumber(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export type WhatsAppSendResult = { success: true; messageId?: string } | { success: false; error: string };

/**
 * Sends a WhatsApp template message via Meta's WhatsApp Cloud API. Business-
 * initiated messages to someone who hasn't messaged you first MUST use a
 * pre-approved template (free-form text will be rejected) — see
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started
 *
 * Requires env vars WHATSAPP_ACCESS_TOKEN (a permanent System User token)
 * and WHATSAPP_PHONE_NUMBER_ID (from the WhatsApp > API Setup panel in your
 * Meta app dashboard).
 */
export async function sendWhatsAppTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  bodyParams: string[] = []
): Promise<WhatsAppSendResult> {
  if (!hasWhatsAppCredentials()) {
    return { success: false, error: "WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID are not configured" };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(bodyParams.length > 0
        ? { components: [{ type: "body", parameters: bodyParams.map((text) => ({ type: "text", text })) }] }
        : {}),
    },
  };

  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        (data && typeof data === "object" && "error" in data && (data as { error?: { message?: string } }).error?.message) ||
        `WhatsApp API returned HTTP ${res.status}`;
      return { success: false, error: message };
    }

    const messageId = data?.messages?.[0]?.id as string | undefined;
    return { success: true, messageId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to reach the WhatsApp API" };
  }
}
