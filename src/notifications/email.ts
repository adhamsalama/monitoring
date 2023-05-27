import { AbstractNotification, NotificationChannel } from "./types";
import { usersService } from "../users/service";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class EmailNotification implements AbstractNotification {
  channel = NotificationChannel.Email;
  async send(to: string, content: string, subject?: string) {
    const msg = {
      to,
      from: process.env.SENDER_EMAIL!,
      subject: subject ?? "Hello from our monitoring app",
      text: content,
    };
    const sentSuccessfully = sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
        return response[0].statusCode < 300;
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
    return sentSuccessfully;
  }
  async sendToUser(userId: string, content: string, subject?: string) {
    const user = await usersService.findById(userId);
    if (!user) {
      throw new Error(`User ${userId} doesn't exist`);
    }
    return this.send(user.email, content, subject);
  }
}

export const emailNotificationService = new EmailNotification();
