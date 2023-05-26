import { AbstractNotification, NotificationChannel } from "./types";
import { EmailNotification } from "./email";
export class NotificationsFactory {
  static create(channel: NotificationChannel): AbstractNotification {
    switch (channel) {
      case "email":
        return new EmailNotification();
      case "webhook":
        throw new Error("Not implemented");
      default:
        throw new Error("Unkown or not implemented channel");
    }
  }
}

export const notificationsFactory = new NotificationsFactory();
