
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export const sendEmail = async ({ to, subject, text }) => {
  await transporter.sendMail({
    from: '"Property App Support" <noreply@propertyapp.com>',
    to,
    subject,
    text,
  });
};