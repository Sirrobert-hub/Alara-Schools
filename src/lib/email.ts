import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(email: string, token: string) {
  // If SMTP is not configured, we just log the link to the console for testing
  const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/reset-password?token=${token}`;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("==========================================");
    console.log("PASSWORD RESET REQUESTED");
    console.log(`Email/Username: ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log("==========================================");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Alara SMIS" <noreply@alaraschools.ac.ke>',
    to: email, // Note: For username-based users (no email), this will fail if real SMTP is used. 
    // Usually teachers have email in their Teacher record. We'll pass the correct email.
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password for your Alara SMIS account.</p>
      <p>Click the link below to set a new password. This link is valid for 1 hour.</p>
      <a href="${resetLink}">Reset Password</a>
      <br/><br/>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send password reset email.");
  }
}
