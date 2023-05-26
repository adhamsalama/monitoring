import nodemailer from "nodemailer";
import { AbstractNotification } from "./types";
import { usersService } from "../users/service";

export class EmailNotification implements AbstractNotification {
  async send(to: string, content: string, subject?: string) {
    console.log("alooooo");

    let testAccount = await nodemailer.createTestAccount();
    console.log({ testAccount });

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      logger: true,
      debug: true,
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: testAccount.user, // sender address
      to, // list of receivers
      subject, // Subject line
      text: content, // plain text body
      // html: "<b>Hello world?</b>", // html body
    });
    console.log({ info });

    // Preview only available when sending through an Ethereal account
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

    return true;
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
