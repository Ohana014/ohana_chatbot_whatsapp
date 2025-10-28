import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendEmail({ subject, html, to, from }) {
  try {
    const info = await transporter.sendMail({
      from: from || process.env.RH_EMAIL_FROM || "no-reply@seudominio.com",
      to,
      subject,
      html
    });
    return info.messageId || "sent";
  } catch (e) {
    console.error("Email error:", e.toString());
    return null;
  }
}
