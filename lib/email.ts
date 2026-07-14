import type { Lead } from "@/lib/google-sheets";

const SENDGRID_ENDPOINT = "https://api.sendgrid.com/v3/mail/send";

export function hasEmailCredentials(): boolean {
  return Boolean(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
}

export type EmailSendResult = { success: true } | { success: false; error: string };

/**
 * Sends a single email via SendGrid's v3 Mail Send API. Requires
 * SENDGRID_API_KEY and a SENDGRID_FROM_EMAIL that's been verified in your
 * SendGrid account (Settings -> Sender Authentication) — SendGrid rejects
 * sends from an unverified "from" address.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailSendResult> {
  if (!hasEmailCredentials()) {
    return { success: false, error: "SENDGRID_API_KEY / SENDGRID_FROM_EMAIL are not configured" };
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL as string;
  const fromName = process.env.SENDGRID_FROM_NAME || "EnNaksha";

  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: fromEmail, name: fromName },
    subject,
    content: [
      { type: "text/plain", value: text },
      { type: "text/html", value: html },
    ],
  };

  try {
    const res = await fetch(SENDGRID_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 202) {
      return { success: true };
    }

    const data = await res.json().catch(() => ({}));
    const message =
      (data && typeof data === "object" && "errors" in data && Array.isArray((data as { errors?: unknown[] }).errors)
        ? (data as { errors: { message?: string }[] }).errors.map((e) => e.message).join("; ")
        : "") || `SendGrid returned HTTP ${res.status}`;
    return { success: false, error: message };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to reach SendGrid" };
  }
}

/** Builds and sends the "we got your enquiry" confirmation email for a completed lead. */
export async function sendLeadConfirmationEmail(lead: Lead): Promise<EmailSendResult> {
  const firstName = (lead.fullName || "").trim().split(/\s+/)[0] || "there";

  const text = `Hi ${firstName},

Thanks for reaching out to EnNaksha! We've received your enquiry and our team will WhatsApp you within 24 hours with a free initial assessment — no sales pressure, just a conversation about your home.

What happens next:
- Free 2D layout
- Daily photo updates once your project starts
- Transparent, scope-locked pricing with zero hidden charges

If you have any questions in the meantime, just reply to this email.

— The EnNaksha Team`;

  const html = `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2E1B0E;">
    <h2 style="color: #2E1B0E;">Your dream home journey has begun, ${escapeHtml(firstName)}! 🏡</h2>
    <p style="line-height: 1.6;">
      Thanks for reaching out to <strong>EnNaksha</strong>! We've received your enquiry and our team will
      WhatsApp you <strong>within 24 hours</strong> with a free initial assessment — no sales pressure,
      just a conversation about your home.
    </p>
    <table style="width: 100%; margin: 24px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 12px; text-align: center; border: 1px solid #eee;">📐<br/><small>Free 2D layout</small></td>
        <td style="padding: 12px; text-align: center; border: 1px solid #eee;">📸<br/><small>Daily photo updates</small></td>
        <td style="padding: 12px; text-align: center; border: 1px solid #eee;">💰<br/><small>₹0 hidden charges</small></td>
      </tr>
    </table>
    <p style="line-height: 1.6; font-size: 13px; color: #777;">
      Questions in the meantime? Just reply to this email.
    </p>
    <p style="line-height: 1.6;">— The EnNaksha Team</p>
  </div>`;

  return sendEmail({
    to: lead.email,
    subject: "We've received your enquiry — EnNaksha",
    html,
    text,
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}
