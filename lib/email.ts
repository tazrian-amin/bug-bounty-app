import nodemailer from "nodemailer";
import { Resend } from "resend";

type SendPasswordResetEmailInput = {
  to: string;
  resetUrl: string;
};

function getFromAddress() {
  return process.env.EMAIL_FROM ?? "no-reply@mining-sentry.com";
}

async function sendWithResend(input: SendPasswordResetEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const resend = new Resend(apiKey);
  const from = getFromAddress();

  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: "Reset your Mining Sentry password",
    text: `We received a request to reset your password.\n\nReset your password: ${input.resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>We received a request to reset your password.</p><p><a href="${input.resetUrl}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.name}: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error("Resend send failed: missing message id");
  }
}

async function sendWithSmtp(input: SendPasswordResetEmailInput) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP settings are incomplete");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: getFromAddress(),
    to: input.to,
    subject: "Reset your Mining Sentry password",
    text: `We received a request to reset your password.\n\nReset your password: ${input.resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>We received a request to reset your password.</p><p><a href="${input.resetUrl}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });
}

export async function sendPasswordResetEmail(input: SendPasswordResetEmailInput) {
  const provider = (process.env.EMAIL_PROVIDER ?? "").toLowerCase();

  if (provider === "resend") {
    await sendWithResend(input);
    return;
  }

  if (provider === "smtp") {
    await sendWithSmtp(input);
    return;
  }

  // For local development only, avoid exposing URL in API response.
  if (process.env.NODE_ENV !== "production") {
    console.info(`[dev-email] Password reset for ${input.to}: ${input.resetUrl}`);
    return;
  }

  throw new Error("EMAIL_PROVIDER must be configured as 'resend' or 'smtp' in production");
}
