const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = require("../config/env");

let transporter;
const user = EMAIL_USER || SMTP_USER;
const pass = EMAIL_PASS || SMTP_PASS;

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });
} else if (SMTP_HOST && user && pass) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user, pass }
  });
}

const sendVerificationCode = async (toEmail, code) => {
  if (!transporter) {
    // eslint-disable-next-line no-console
    console.warn("Mail transporter is not configured. Code is:", code);
    return;
  }
  await transporter.sendMail({
    from: `"DaNangLongTermRent" <${user}>`,
    to: toEmail,
    subject: "DaNangLongTermRent - Verify your email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0284c7; text-align: center;">Xác thực tài khoản DaNangLongTermRent</h2>
        <p>Xin chào,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại DaNangLongTermRent. Mã xác thực (OTP) của bạn là:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0f172a; border: 2px dashed #0284c7; padding: 10px 20px; background-color: #f0f9ff; border-radius: 5px;">${code}</span>
        </div>
        <p>Mã OTP này có hiệu lực trong vòng <b>5 phút</b> và chỉ sử dụng được 1 lần duy nhất.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">Đây là email tự động từ hệ thống DaNangLongTermRent. Vui lòng không trả lời email này.</p>
      </div>
    `
  });
};

module.exports = { sendVerificationCode };
