// Brevo transactional email via their REST API (stable across SDK versions).
const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

const senderEmail = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SENDER_EMAIL || "no-reply@example.com";
const senderName = process.env.BREVO_FROM_NAME || process.env.BREVO_SENDER_NAME || "Maseray Temne Blogger Fund";

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

// Professional email templates
export const emailTemplates = {
  requestSubmitted: (memberName: string, requestCode: string, title: string) =>
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f8fafc;border-radius:12px">
      <div style="background:linear-gradient(135deg,#1c9366,#0f7652);color:white;padding:30px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="margin:0;font-size:24px">✅ Request Received</h1>
        <p>Your assistance request is being reviewed</p>
      </div>
      <div style="background:white;padding:30px">
        <p>Hello ${escapeHtml(memberName)},</p>
        <p>Thank you for submitting your assistance request. We've received it and our team is reviewing your application.</p>
        <div style="background:#f0fdf4;border:1px solid #86efac;padding:15px;border-radius:8px;margin:20px 0">
          <strong>Request Code:</strong> ${escapeHtml(requestCode)}<br>
          <strong>Title:</strong> ${escapeHtml(title)}<br>
          <strong>Status:</strong> <span style="color:#0f7652;font-weight:600">Under Review</span>
        </div>
        <p>Most requests are reviewed within 5-7 business days. You'll receive an email notification when a decision has been made.</p>
      </div>
    </div>`,

  requestApproved: (memberName: string, requestCode: string, amount: number) =>
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f8fafc;border-radius:12px">
      <div style="background:linear-gradient(135deg,#1c9366,#0f7652);color:white;padding:30px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="margin:0;font-size:24px">🎉 Request Approved!</h1>
        <p>Your assistance has been approved</p>
      </div>
      <div style="background:white;padding:30px">
        <p>Hello ${escapeHtml(memberName)},</p>
        <p>Great news! Your assistance request has been approved by the MTB Fund review committee.</p>
        <div style="background:#f0fdf4;border:2px solid #86efac;padding:20px;border-radius:8px;margin:20px 0;text-align:center">
          <p style="margin:0 0 10px;color:#64748b;font-size:14px">Approved Amount</p>
          <p style="margin:0;font-size:32px;font-weight:800;color:#1c9366">SLE ${amount.toLocaleString()}</p>
          <p style="margin:10px 0 0;color:#64748b;font-size:13px">Request Code: <strong>${escapeHtml(requestCode)}</strong></p>
        </div>
        <p>Your payment has been processed through your registered payment method. It should arrive within 1-3 business days.</p>
      </div>
    </div>`,

  announcementNotification: (title: string, message: string) =>
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f8fafc;border-radius:12px">
      <div style="background:linear-gradient(135deg,#0f1f3d,#1a3464);color:white;padding:30px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="margin:0;font-size:24px">📢 Important Announcement</h1>
      </div>
      <div style="background:white;padding:30px">
        <div style="background:#eff6ff;border-left:4px solid #0891b2;padding:15px;border-radius:6px;margin:20px 0">
          <h2 style="margin-top:0;color:#0891b2">${escapeHtml(title)}</h2>
          <p style="white-space:pre-line;color:#0f1f3d">${escapeHtml(message)}</p>
        </div>
        <p style="color:#64748b;font-size:13px">Please share this announcement with other community members if needed.</p>
      </div>
    </div>`,
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
