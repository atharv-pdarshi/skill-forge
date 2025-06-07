const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure the email transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

/**
 * Sends an email.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} htmlContent - The HTML content of the email.
 * @param {string} textContent - (Optional) The plain text content of the email for clients that don't support HTML.
 */
const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    const mailOptions = {
      from: `"SkillForge Platform" <${process.env.EMAIL_USER}>`, 
      to: to, 
      subject: subject, 
      text: textContent || htmlContent.replace(/<[^>]*>?/gm, ''),
      html: htmlContent, 
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: %s', info.messageId);
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; 
  }
};

module.exports = { sendEmail };