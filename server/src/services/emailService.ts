import nodemailer from "nodemailer";

const SMTP_USER = process.env.EMAIL_USER;
const SMTP_PASS = process.env.EMAIL_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "FLORA Beauty <alihamzabhatti@gmail.com>";

let transporter: nodemailer.Transporter | null = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  if (transporter) {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });
  } else {
    // Console fallback for easy development!
    console.log("=========================================");
    console.log(`[DEVELOPMENT EMAIL SERVICE]`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY:`);
    console.log(html);
    console.log("=========================================");
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #c5a880; text-align: center;">Welcome to FLORA</h2>
      <p>Thank you for joining the Glow Community. Please verify your email address to activate your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #121212; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p style="font-size: 12px; color: #777;">If the button above doesn't work, copy and paste this link into your browser: <br>${verifyUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999; text-align: center;">FLORA Skincare Rituals & Beauty</p>
    </div>
  `;
  await sendEmail({
    to: email,
    subject: "Verify your email - FLORA",
    html,
  });
}

export async function sendResetPasswordEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #c5a880; text-align: center;">Reset Your Password</h2>
      <p>You are receiving this email because you (or someone else) requested a password reset for your account. Please click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #121212; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #777;">This link will expire in 1 hour. If you did not request this reset, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999; text-align: center;">FLORA Skincare Rituals & Beauty</p>
    </div>
  `;
  await sendEmail({
    to: email,
    subject: "Password Reset - FLORA",
    html,
  });
}
