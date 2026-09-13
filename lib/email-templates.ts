// Professional HTML email templates for Brevo

export const emailTemplates = {
  // Admin account created
  adminWelcome: (email: string, tempPassword: string) => ({
    subject: "🔐 Welcome to MTB Fund Admin Dashboard",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px; }
    .header { background: linear-gradient(135deg, #060d1f 0%, #1a3464 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: white; padding: 30px; }
    .button { background: #1c9366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 12px 12px; }
    .alert { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ Welcome to MTB Fund Admin</h1>
      <p>Community Fund Management System</p>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Your admin account has been created for the Maseray Temne Blogger Fund platform.</p>
      
      <div class="alert">
        <strong>🔐 Temporary Credentials</strong><br>
        Email: <code>${email}</code><br>
        Temporary Password: <code>${tempPassword}</code>
      </div>

      <p><strong>Important:</strong> Your temporary password is valid for one login only. You'll be prompted to set a new password upon first login.</p>

      <p>
        <a href="https://mtbfund.com/admin/login" class="button">Go to Admin Dashboard</a>
      </p>

      <h3>What You Can Do:</h3>
      <ul>
        <li>📊 View fund statistics and analytics</li>
        <li>👥 Manage community members</li>
        <li>💰 Track contributions and payouts</li>
        <li>📋 Review assistance requests</li>
        <li>📢 Publish announcements and news</li>
        <li>⚙️ Configure fund settings</li>
      </ul>

      <p>If you have any questions or need assistance, contact the fund administrators.</p>
      
      <p>Best regards,<br><strong>MTB Fund Admin</strong></p>
    </div>
    <div class="footer">
      <p>© 2025 Maseray Temne Blogger Fund. All rights reserved.</p>
      <p>Support the Temne community, together 🤝</p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  // Member assistance request submitted
  requestSubmitted: (memberName: string, requestCode: string, title: string) => ({
    subject: "✅ Your Assistance Request Has Been Received",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px; }
    .header { background: linear-gradient(135deg, #1c9366 0%, #0f7652 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: white; padding: 30px; }
    .info-box { background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 12px 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Request Received</h1>
      <p>Your assistance request is being reviewed</p>
    </div>
    <div class="content">
      <p>Hello ${memberName},</p>
      <p>Thank you for submitting your assistance request to the MTB Fund. We've received it and our team is reviewing your application.</p>

      <div class="info-box">
        <strong>Request Details:</strong><br>
        <strong>Request Code:</strong> ${requestCode}<br>
        <strong>Title:</strong> ${title}<br>
        <strong>Status:</strong> <span style="color: #0f7652; font-weight: 600;">Under Review</span>
      </div>

      <h3>What Happens Next:</h3>
      <ol>
        <li>Our review committee will examine your request and supporting documents</li>
        <li>We'll verify all information and contact you if we need additional details</li>
        <li>You'll receive an email notification when a decision has been made</li>
        <li>If approved, payment will be processed according to your specified method</li>
      </ol>

      <p><strong>Timeline:</strong> Most requests are reviewed within 5-7 business days. You can check the status of your request at any time by logging into your member portal.</p>

      <p>If you have any questions about your request, please reach out to the fund administrators.</p>

      <p>We appreciate your trust in the MTB Fund community!<br><strong>The MTB Fund Team</strong></p>
    </div>
    <div class="footer">
      <p>© 2025 Maseray Temne Blogger Fund. All rights reserved.</p>
      <p>Support the Temne community, together 🤝</p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  // Request approved
  requestApproved: (memberName: string, requestCode: string, amount: number) => ({
    subject: "🎉 Your Assistance Request Has Been Approved!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px; }
    .header { background: linear-gradient(135deg, #1c9366 0%, #0f7652 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: white; padding: 30px; }
    .success-box { background: #f0fdf4; border: 2px solid #86efac; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .amount { font-size: 32px; font-weight: 800; color: #1c9366; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 12px 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Request Approved!</h1>
      <p>Your assistance has been approved</p>
    </div>
    <div class="content">
      <p>Hello ${memberName},</p>
      <p>Great news! Your assistance request has been approved by the MTB Fund review committee.</p>

      <div class="success-box">
        <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">Approved Amount</p>
        <p class="amount">SLE ${amount.toLocaleString()}</p>
        <p style="margin: 10px 0 0; color: #64748b; font-size: 13px;">Request Code: <strong>${requestCode}</strong></p>
      </div>

      <h3>Payment Information:</h3>
      <p>Your payment has been processed through your registered payment method. Depending on your payment preference, it should arrive within 1-3 business days.</p>

      <p><strong>If you haven't received your payment after 3 days, please contact the fund administrators with your request code.</strong></p>

      <h3>Next Steps:</h3>
      <ul>
        <li>Check your account for the credit</li>
        <li>If using Mobile Money, you may receive an SMS confirmation</li>
        <li>Keep your request code for reference</li>
      </ul>

      <p>We're honored to support you during this time. If you need further assistance, don't hesitate to reach out.</p>

      <p>With gratitude,<br><strong>The MTB Fund Community</strong></p>
    </div>
    <div class="footer">
      <p>© 2025 Maseray Temne Blogger Fund. All rights reserved.</p>
      <p>Support the Temne community, together 🤝</p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  // Request rejected
  requestRejected: (memberName: string, requestCode: string, reason: string) => ({
    subject: "📋 Update on Your Assistance Request",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px; }
    .header { background: linear-gradient(135deg, #0f1f3d 0%, #1a3464 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: white; padding: 30px; }
    .info-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 12px 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Request Decision</h1>
      <p>Update on your assistance request</p>
    </div>
    <div class="content">
      <p>Hello ${memberName},</p>
      <p>Thank you for submitting your assistance request to the MTB Fund. Our review committee has completed their assessment.</p>

      <div class="info-box">
        <strong>Request Code:</strong> ${requestCode}<br>
        <strong>Decision:</strong> <span style="color: #d97706; font-weight: 600;">Not Approved</span>
      </div>

      <h3>Reason:</h3>
      <p>${reason}</p>

      <h3>What You Can Do:</h3>
      <ul>
        <li>Review the reason provided above</li>
        <li>If you believe this decision was made in error, you can contact the fund administrators</li>
        <li>You may resubmit your request with additional information or after addressing the concerns raised</li>
      </ul>

      <p>The MTB Fund operates on principles of fairness and community support. If you have questions about this decision, we encourage you to reach out.</p>

      <p>We remain committed to supporting you in any way we can.<br><strong>The MTB Fund Team</strong></p>
    </div>
    <div class="footer">
      <p>© 2025 Maseray Temne Blogger Fund. All rights reserved.</p>
      <p>Support the Temne community, together 🤝</p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  // Contribution receipt
  contributionReceipt: (memberName: string, amount: number, date: string, reference: string) => ({
    subject: "💰 Your Contribution Has Been Received",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px; }
    .header { background: linear-gradient(135deg, #e8650a 0%, #f97316 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: white; padding: 30px; }
    .receipt { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 12px 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; }
    th { background: #e8faff; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Thank You!</h1>
      <p>Your contribution has been received</p>
    </div>
    <div class="content">
      <p>Hello ${memberName},</p>
      <p>Thank you for your contribution to the MTB Fund! Your generosity helps us support our community members in times of need.</p>

      <div class="receipt">
        <table>
          <tr>
            <th>Item</th>
            <th>Details</th>
          </tr>
          <tr>
            <td><strong>Amount</strong></td>
            <td>SLE ${amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td><strong>Date</strong></td>
            <td>${date}</td>
          </tr>
          <tr>
            <td><strong>Reference</strong></td>
            <td><code>${reference}</code></td>
          </tr>
          <tr>
            <td><strong>Status</strong></td>
            <td><span style="color: #1c9366; font-weight: 600;">✓ Confirmed</span></td>
          </tr>
        </table>
      </div>

      <h3>About Your Contribution:</h3>
      <p>Your contribution is now part of the community fund and will be used to help members facing hardship, medical emergencies, funerals, education costs, and other critical needs.</p>

      <p>You can view your contribution history and fund statistics anytime by logging into your member portal.</p>

      <p>Thank you for being part of this incredible community of mutual support!<br><strong>The MTB Fund Community</strong></p>
    </div>
    <div class="footer">
      <p>© 2025 Maseray Temne Blogger Fund. All rights reserved.</p>
      <p>Support the Temne community, together 🤝</p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  // Announcement notification
  announcementNotification: (title: string, message: string) => ({
    subject: `📢 Important Announcement: ${title}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px; }
    .header { background: linear-gradient(135deg, #0f1f3d 0%, #1a3464 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: white; padding: 30px; }
    .announcement { background: #eff6ff; border-left: 4px solid #0891b2; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 12px 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📢 Important Announcement</h1>
      <p>From Maseray Temne Blogger Fund</p>
    </div>
    <div class="content">
      <div class="announcement">
        <h2 style="margin-top: 0;">${title}</h2>
        <p style="white-space: pre-line;">${message}</p>
      </div>

      <p>Please review this announcement carefully and share with other community members if needed.</p>

      <p>For more information, visit our website or contact the fund administrators.</p>

      <p>United in community support,<br><strong>The MTB Fund Team</strong></p>
    </div>
    <div class="footer">
      <p>© 2025 Maseray Temne Blogger Fund. All rights reserved.</p>
      <p>Support the Temne community, together 🤝</p>
    </div>
  </div>
</body>
</html>
    `,
  }),
};
