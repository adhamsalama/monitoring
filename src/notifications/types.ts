export abstract class AbstractNotification {
  abstract send(
    to: string,
    content: string,
    subject?: string
  ): Promise<boolean>;
}

export enum NotificationChannel {
  Email = "email",
  Webhook = "webhook",
}
