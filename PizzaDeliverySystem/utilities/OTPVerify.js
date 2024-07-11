const nodeMailer = require("nodemailer");
const transporter = nodeMailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});
const sendVerificationEmail = async (email, OTP) => {
  const mailOptions = {
    from: {
        name: "kunal",
        address: process.env.EMAIL
    },
    to: email,
    subject: "Email Verification",
    html: `<h3>This is the OTP for verification : <b>${OTP}</b></h3>`,
  };
  await transporter.sendMail(mailOptions);
};
module.exports = sendVerificationEmail;
