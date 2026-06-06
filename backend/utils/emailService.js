const nodemailer = require('nodemailer');

// Configure the transporter
// For the purpose of development/hackathon, we'll use a local setup or etheral if undefined
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  auth: {
    user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email', // Add real ones in .env
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
    // We log the error but we don't necessarily want this to crash the whole PO process 
    // if email credentials aren't properly set up yet
    console.error('Error sending invoice email:', error);
    throw error;
  }
};


const sendInvoiceEmail = async (vendorEmail, invoicePdfBuffer) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your SMTP provider
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: vendorEmail,
    subject: 'VendorBridge: Your Invoice',
    text: 'Please find the attached invoice generated via VendorBridge.',
    attachments: [{ filename: 'invoice.pdf', content: invoicePdfBuffer }]
  });
};
module.exports = { sendInvoiceEmail };