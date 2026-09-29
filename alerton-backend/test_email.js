require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  logger: true,
  debug: true
});

async function testEmail() {
  console.log('Using EMAIL_USER:', process.env.EMAIL_USER);
  console.log('Using EMAIL_PASS:', process.env.EMAIL_PASS ? '****' : 'undefined');

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'jatinsinghrautela@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email from Nodemailer.'
    });
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Failed to send test email:', error);
  }
}

testEmail();