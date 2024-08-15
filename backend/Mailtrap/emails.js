import { MailtrapClients, sender } from "../Mailtrap/mailtrap.config.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "../Mailtrap/emailtempletes.js";
export const sendverificationmail = async (email, verificationToken) => {
  const recipient = [{ email }];
  try {
    const response = await MailtrapClients.send({
      from: sender,
      to: recipient,
      subject: "Verfiy your  account",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
    console.log("email send successfully", response);
  } catch (err) {
    throw new Error("Failed to send email", err);
  }
};
export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    const response = await MailtrapClients.send({
      from: sender,
      to: recipient,
      template_uuid: "6d452c4a-4681-48b9-8b99-7a512ce540ff",
      template_variables: {
        name: "Sujal Company",
      },
    });

    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.error(`Error sending welcome email`, error);

    throw new Error(`Error sending welcome email: ${error}`);
  }
};
export const sendPasswordResetMail = async (email, resetUrl) => {
  const recipient = [{ email }]; // Ensure email is passed correctly

  try {
    const response = await MailtrapClients.send({
      from: sender, // Ensure 'sender' is defined
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
      category: "Password Reset",
    });

    console.log("Email sent successfully:", response);
  } catch (err) {
    console.error("Failed to send email:", err);
    throw new Error("Failed to send email");
  }
};

export const sendPasswordResetSuccessfull = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await MailtrapClients.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    console.log("Password reset email sent successfully", response);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);

    throw new Error(`Error sending password reset success email: ${error}`);
  }
};
