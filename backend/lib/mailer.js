const nodemailer = require("nodemailer");

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SENDER_EMAIL, SENDER_NAME } = process.env;

let transporter = null;

function isConfigured() {
  return Boolean(SMTP_USER && SMTP_PASS && SENDER_EMAIL);
}

function getTransporter() {
  if (!isConfigured()) {
    const err = new Error("Email is not set up on the server yet");
    err.status = 503;
    throw err;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST || "smtp-relay.brevo.com",
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Sends a plain-looking reply. `quote` is the customer's original message shown underneath.
async function sendReply({ to, subject, text, quote }) {
  const from = `"${SENDER_NAME || "Mandi Fresh"}" <${SENDER_EMAIL}>`;
  const plain = quote ? `${text}\n\n---\nYou wrote:\n${quote}` : text;
  const html =
    `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1e2a20">` +
    `<p style="white-space:pre-wrap;margin:0">${escapeHtml(text)}</p>` +
    (quote
      ? `<blockquote style="margin:24px 0 0;padding:0 0 0 14px;border-left:3px solid #d8d2c5;color:#667">` +
        `<p style="margin:0 0 4px;font-size:12px">You wrote:</p>` +
        `<p style="white-space:pre-wrap;margin:0">${escapeHtml(quote)}</p></blockquote>`
      : "") +
    `</div>`;

  return getTransporter().sendMail({ from, to, replyTo: SENDER_EMAIL, subject, text: plain, html });
}

module.exports = { sendReply, isConfigured, getTransporter };
