const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // If environment variables are set for a real SMTP service
  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('✨ Real SMTP mail service configured.');
    return transporter;
  }

  // Fallback: Automatic Ethereal (fake test mailer) for seamless local development
  try {
    console.log('🔄 Creating Ethereal Test Account for automatic local email previews...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`✨ Ethereal SMTP mail service configured (User: ${testAccount.user}).`);
    return transporter;
  } catch (err) {
    console.error('❌ Failed to configure mail service, falling back to Console Log transport:', err);
    // Console fallback
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n==================================================');
        console.log('📧 CONSOLE EMAIL SERVICE (FALLBACK)');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log('--------------------------------------------------');
        console.log(mailOptions.text);
        console.log('==================================================\n');
        return { messageId: 'console-log-id' };
      }
    };
    return transporter;
  }
};

const sendResetEmail = async (email, resetToken, origin) => {
  const mailTransporter = await getTransporter();
  const resetUrl = `${origin}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Hirenova Team" <no-reply@hirenova.com>',
    to: email,
    subject: '🔒 Reset Your Hirenova Account Password',
    text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
Please click on the following link, or paste this into your browser to complete the process within 1 hour:\n\n
${resetUrl}\n\n
If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; font-size: 24px; font-weight: 900; background: linear-gradient(135deg, #4F46E5, #06B6D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Hirenova
          </div>
        </div>
        <h2 style="font-size: 18px; font-weight: 800; text-align: center; color: #0f172a; margin-top: 0;">🔒 Reset Your Password</h2>
        <p style="font-size: 13px; color: #64748b; line-height: 1.6; text-align: center;">
          You requested to reset your Hirenova account password. Use the secure button below to choose a new password. This link will expire in 1 hour.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 12px; font-size: 13px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);">
            Reset Password
          </a>
        </div>
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">
          If the button doesn't work, copy and paste the link below into your browser:
        </p>
        <p style="font-size: 11px; color: #4F46E5; text-align: center; word-break: break-all;">
          ${resetUrl}
        </p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
        <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-bottom: 0;">
          If you did not request this password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  const info = await mailTransporter.sendMail(mailOptions);
  
  // If Ethereal test account was used, print the test preview link
  if (nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info)) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('\n==================================================');
    console.log('✉️  AI RECOVERY EMAIL TRIGGERED SUCCESSFULLY!');
    console.log(`👉 Preview Sent Email: ${previewUrl}`);
    console.log(`🔗 Token Reset Url: ${resetUrl}`);
    console.log('==================================================\n');
    return previewUrl;
  }
  
  console.log(`📧 Secure recovery email sent to ${email} (ID: ${info.messageId})`);
  return resetUrl;
};

module.exports = {
  sendResetEmail,
};
