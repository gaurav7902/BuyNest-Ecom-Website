import nodemailer from "nodemailer";
const sendEmail = async (to, subject, message) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: message,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;
