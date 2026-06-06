const nodemailer = require('nodemailer');

// Create a single reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  auth: {
    user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
    pass: process.env.EMAIL_PASS || 'ethereal.password'
  }
});

exports.sendInvoiceEmail = async (vendorEmail, invoicePdfBuffer, invoiceNumber) => {
  try {
    const mailOptions = {
      from: '"VendorBridge Procurement" <procurement@vendorbridge.local>',
      to: vendorEmail,
      subject: `Invoice Generated: ${invoiceNumber}`,
      text: `Please find attached the invoice ${invoiceNumber} for your recent purchase order fulfillment.`,
      attachments: [
        {
          filename: `Invoice_${invoiceNumber}.pdf`,
          content: invoicePdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Invoice email sent successfully. Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
};
