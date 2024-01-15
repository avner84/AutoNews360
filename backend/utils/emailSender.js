const nodemailer = require("nodemailer");
const {EMAIL_PASSWORD} = require('../config/vars');
const { api: API_URL, origin: CLIENT_URL } = require('../config/default');


// Setting up the transporter for nodemailer using Gmail service
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: "autonews360news@gmail.com", // Gmail email address to send from
    pass: EMAIL_PASSWORD, // Gmail password or app-specific password
  },
});

// Function to send initial verification email
const sendInitialVerificationEmail = (email, token) => {
  // Email options including from, to, subject, and html body
  const mailOptions = {
    from: "autonews360news@gmail.com", // Sender address
    // to: email, // Recipient address
    to: "avner84@gmail.com",
    subject: "Welcome to AutoNews360 – Please Verify Your Account",
    html: `
        <p>Hello and welcome to AutoNews360!</p>
        <p>We are thrilled to have you with us. Before you can start enjoying all of our content and services, we need you to take one more small step - verify your account.</p>
        <p>To verify your account, simply click on the following link: <a href="${API_URL}/auth/verify?token=${token}">Verify Your Account</a></p>
        <p><b>Important:</b> The link to verify your account will be valid for 24 hours from the moment you receive this email. If you do not click on the link within this time frame, you will need to request a new verification.</p>
        <p>If more than 24 hours have passed since you received this email and you have not verified your account, don't worry! You can request a new verification link. Simply click here: <a href="${CLIENT_URL}/verification-results?status=expired&email=${email}">Request New Verification Link</a></p>
        <p>Thank you for joining AutoNews360! We look forward to seeing you explore and enjoy our unique services.</p>
        <p>Best regards,<br>The AutoNews360 Team</p>`,
  };

  // Sending the email using the transporter
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};

// Function to resend the verification email
const sendResendVerificationEmail = (email, token) => {
  // Email options similar to the initial verification email
  // This email is triggered when a user requests to resend the verification link
  const mailOptions = {
    from: "autonews360news@gmail.com",
    to: "avner84@gmail.com",
    subject: "AutoNews360 – Verification Link Resent",
    html: `
        <p>Hi there,</p>
        <p>We've noticed you requested to resend your account verification link for AutoNews360.</p>
        <p>To complete the verification of your account, please click on the link below:</p>
        <p><a href="${API_URL}/auth/update-verification?token=${token}">Verify Your Account</a></p>
        <p><b>Note:</b> This verification link will be valid for 24 hours. If you do not verify your account within this timeframe, you will need to request another verification link.</p>
        <p>If you didn't request this, please ignore this email or contact us if you feel something is wrong.</p>
        <p>Thanks for being with us,<br>The AutoNews360 Team</p>`,
  };

  // Sending the email using the transporter
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};

module.exports = {
  sendInitialVerificationEmail,
  sendResendVerificationEmail,
};
