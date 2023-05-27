export abstract class AbstractNotification {
  constructor(readonly channel: NotificationChannel) {}
  abstract send(
    to: string,
    content: string,
    subject?: string
  ): Promise<boolean>;
}

export enum NotificationChannel {
  Email = "email",
}
