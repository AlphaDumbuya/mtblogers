// Brevo transactional email via their REST API (stable across SDK versions).
const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@example.com";
const senderName = process.env.BREVO_SENDER_NAME || "Maseray Temne Blogger Fund";

type SendArgs = {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
};

/** Sends an email via Brevo. Silently no-ops if not configured. */
export async function sendEmail({ to, subject, html }: SendArgs) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[email] BREVO_API_KEY not set — skipping email:", subject);
    return { skipped: true };
  }

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to,
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[email] Brevo returned", res.status, body);
      return { error: true };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { error: true };
  }
}

export function receiptEmailHtml(opts: {
  name: string;
  amount: number;
  currency: string;
  contributionType: string;
  reference: string;
}) {
  const { name, amount, currency, contributionType, reference } = opts;
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#14202e">
    <h2 style="color:#163a5c">Thank you, ${escapeHtml(name)}!</h2>
    <p>We've received your contribution to the <strong>Maseray Temne Blogger</strong> community fund.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px 0;color:#64748b">Type</td><td style="padding:8px 0;text-align:right"><strong>${escapeHtml(contributionType)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Amount</td><td style="padding:8px 0;text-align:right"><strong>${currency} ${amount.toFixed(2)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Reference</td><td style="padding:8px 0;text-align:right"><strong>${escapeHtml(reference)}</strong></td></tr>
    </table>
    <p style="color:#64748b;font-size:13px">Your gift joins the fund that helps members through hardship. We rise by lifting each other.</p>
  </div>`;
}

export function adminAlertHtml(opts: {
  contributorName: string;
  amount: number;
  currency: string;
  contributionType: string;
  reference: string;
}) {
  const { contributorName, amount, currency, contributionType, reference } =
    opts;
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#14202e">
    <h3 style="color:#163a5c">New contribution received</h3>
    <p><strong>${escapeHtml(contributorName)}</strong> contributed <strong>${currency} ${amount.toFixed(2)}</strong>.</p>
    <p style="color:#64748b">Type: ${escapeHtml(contributionType)}<br/>Reference: ${escapeHtml(reference)}</p>
  </div>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
