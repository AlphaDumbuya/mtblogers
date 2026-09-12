import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contribution Received — Thank You" };

export default function SuccessPage() {
  return (
    <div className="success-shell">
      <div className="success-icon-wrap">✓</div>
      <h1>Thank you!</h1>
      <p>
        Your contribution has been received and a payment record has been created for
        reconciliation. Your gift joins the fund that helps members through hardship.
      </p>
      <div className="form-notice" style={{ textAlign: "left", marginBottom: 24 }}>
        <span>🤝</span>
        <span>We rise by lifting each other. You may close this page or make another contribution below.</span>
      </div>
      <Link href="/contribute" className="btn-primary" style={{ display: "inline-flex", justifyContent: "center" }}>
        💳 Make Another Contribution
      </Link>
      <br />
      <Link href="/" style={{ display: "block", marginTop: 16, color: "var(--gray-500)", fontSize: 14 }}>
        ← Back to Home
      </Link>
    </div>
  );
}
