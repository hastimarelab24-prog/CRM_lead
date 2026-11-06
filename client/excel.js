const nodemailer = require("nodemailer");

// 1. Gmail SMTP Transporter Configuration using App Password
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Port 465 SSL connection for security
  auth: {
    user: process.env.EMAIL_USER, // hastimarelab24@gmail.com
    pass: process.env.EMAIL_PASS, // 16-digit App Password from .env
  },
});

exports.sendEmailToLead = async (req, res) => {
  try {
    const { email, name, company } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Recipient email is required.",
      });
    }

    // Fix: Properly define leadName and companyName here to avoid "is not defined" error
    const leadName = name ? name.trim() : "Valued Lead";
    const companyName = company ? company.trim() : "Your Company";

    // 2. High-Quality Professional HTML Email Template
    const mailOptions = {
      from: `"LeadSphere CRM" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Official Notification: Welcome to LeadSphere, ${leadName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>LeadSphere Corporate Email</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f9; padding: 40px 0;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                  
                  <!-- Header Section -->
                  <tr>
                    <td align="center" style="background-color: #1e40af; padding: 30px 20px;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">LeadSphere CRM</h1>
                      <p style="color: #93c5fd; margin: 5px 0 0 0; font-size: 13px;">Official Enterprise Lead Communication</p>
                    </td>
                  </tr>

                  <!-- Body Section -->
                  <tr>
                    <td style="padding: 35px 30px; color: #334155;">
                      <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Dear ${leadName},</h2>
                      
                      <p style="font-size: 15px; line-height: 1.6; color: #475569;">
                        Thank you for your interest in <strong>LeadSphere Solutions</strong>. We have successfully registered your details in our CRM system, and our dedicated team is currently reviewing your project requirements.
                      </p>

                      <!-- Lead Detail Card -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 25px 0; padding: 15px 20px;">
                        <tr>
                          <td style="padding: 6px 0; font-size: 14px; color: #64748b;"><strong>Recipient Email:</strong></td>
                          <td style="padding: 6px 0; font-size: 14px; color: #0f172a; text-align: right;">${email}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 14px; color: #64748b;"><strong>Associated Company:</strong></td>
                          <td style="padding: 6px 0; font-size: 14px; color: #0f172a; text-align: right;">${companyName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 14px; color: #64748b;"><strong>Status:</strong></td>
                          <td style="padding: 6px 0; font-size: 14px; color: #16a34a; font-weight: 600; text-align: right;">Verified & Active</td>
                        </tr>
                      </table>

                      <p style="font-size: 15px; line-height: 1.6; color: #475569;">
                        An assigned representative will get in touch with you shortly to schedule a detailed follow-up discussion. Should you have any immediate queries, feel free to reply directly to this message.
                      </p>

                      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #cbd5e1;">
                        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0f172a;">Best Regards,</p>
                        <p style="margin: 4px 0 0 0; font-size: 14px; color: #2563eb; font-weight: 700;">LeadSphere Operations Team</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer Section -->
                  <tr>
                    <td align="center" style="background-color: #f1f5f9; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0;">This is an automated system notification sent from <strong>LeadSphere CRM</strong>.</p>
                      <p style="margin: 4px 0 0 0;">© ${new Date().getFullYear()} LeadSphere Inc. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // 3. Dispatch Live Email
    let info = await transporter.sendMail(mailOptions);

    console.log("\n=================== LIVE EMAIL DISPATCH ===================");
    console.log(`MESSAGE ID : ${info.messageId}`);
    console.log(`TO         : ${email}`);
    console.log(`STATUS     : 200 OK - Email Delivered Successfully`);
    console.log("===========================================================\n");

    return res.status(200).json({
      success: true,
      message: `Email has been sent successfully from ${process.env.EMAIL_USER}!`,
      messageId: info.messageId,
    });
  } catch (err) {
    console.error("Professional Email Dispatch Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to dispatch professional email.",
    });
  }
};