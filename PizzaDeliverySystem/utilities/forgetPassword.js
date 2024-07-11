const nodeMailer = require("nodemailer");
const transporter = nodeMailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});
const sendForgetPasswordMail = async (email) => {
  const mailOptions = {
    from: {
        name: "kunal",
        address: process.env.EMAIL
    },
    to: email,
    subject: "Change Password",
    html: `<h3>This is the link for changing Password : <a href="http://localhost:3000/changePassword">Click Here</a></h3>`,
  };
  await transporter.sendMail(mailOptions);
};
module.exports = sendForgetPasswordMail;
