import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const generateEmailToAdmin = async (subject, message) => {
  try {
    console.log("subject", subject);
    console.log("message", message);

    // Create reusable transporter object
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Setup email data
    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // Set this in .env or use hardcoded email
      subject: subject,
      html: message,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to admin!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error; // Optional: rethrow so calling function can handle it
  }
};
