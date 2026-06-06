import nodemailer from 'nodemailer';
import config from '../config/index.js';

const parseFrom = (fromString) => {
  const match = fromString.match(/"?([^"<]+)"?\s*<([^>]+)>/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: "VendorBridge", email: "teamclickjack@gmail.com" };
};

// Check if we are using the Brevo API Key
const isBrevoApiKey = config.smtp.pass && config.smtp.pass.startsWith('xkeysib-');

const transporter = isBrevoApiKey ? null : nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

const sendEmailViaBrevo = async (toEmail, subject, htmlContent, attachments = []) => {
  const sender = parseFrom(config.smtp.from);
  const body = {
    sender,
    to: [{ email: toEmail }],
    subject,
    htmlContent,
  };

  if (attachments.length > 0) {
    body.attachment = attachments.map(att => ({
      name: att.filename,
      content: att.content.toString('base64'),
    }));
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': config.smtp.pass,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Brevo API Error: ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
  }
};

export const sendOtpEmail = async (email, otp) => {
  const subject = 'VendorBridge — Verify Your Account';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Verify Your Email</h2>
      <p>Thank you for registering with VendorBridge ERP. Please use the following One-Time Password (OTP) to complete your verification. This code is valid for 5 minutes.</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #f59e0b; padding: 10px 20px; background-color: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 4px;">${otp}</span>
      </div>
      <p>If you did not request this, please ignore this email.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated message from VendorBridge ERP system.</p>
    </div>
  `;

  if (isBrevoApiKey) {
    await sendEmailViaBrevo(email, subject, html);
  } else {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject,
      html,
    });
  }
};

export const sendResetOtpEmail = async (email, otp) => {
  const subject = 'VendorBridge — Reset Your Password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Reset Password Request</h2>
      <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to verify your identity. This code is valid for 5 minutes.</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ef4444; padding: 10px 20px; background-color: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 4px;">${otp}</span>
      </div>
      <p>If you did not request this, please secure your account immediately.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated message from VendorBridge ERP system.</p>
    </div>
  `;

  if (isBrevoApiKey) {
    await sendEmailViaBrevo(email, subject, html);
  } else {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject,
      html,
    });
  }
};

export const sendInvoiceEmail = async (email, invoice, pdfBuffer, filename) => {
  const subject = `VendorBridge — Invoice ${invoice.invoiceNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #10b981; padding-bottom: 10px;">New Tax Invoice Issued</h2>
      <p>Dear Vendor/Partner,</p>
      <p>Please find attached the tax invoice <b>${invoice.invoiceNumber}</b> issued for your recent purchase order.</p>
      <ul>
        <li><b>Invoice Number:</b> ${invoice.invoiceNumber}</li>
        <li><b>Due Date:</b> ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</li>
        <li><b>Grand Total:</b> ₹${invoice.grandTotal.toLocaleString('en-IN')}</li>
      </ul>
      <p>The PDF invoice is attached to this email for your records.</p>
      <p>Thank you for your business!</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated message from VendorBridge ERP system.</p>
    </div>
  `;

  if (isBrevoApiKey) {
    await sendEmailViaBrevo(email, subject, html, [
      {
        filename: filename || `${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
      }
    ]);
  } else {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject,
      html,
      attachments: [
        {
          filename: filename || `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
        }
      ]
    });
  }
};
