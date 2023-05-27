import { AbstractNotification, NotificationChannel } from "./types";
import { usersService, UsersService } from "../users/service";
import { emailNotificationService } from "./email";
export class NotificationsService {
  constructor(
    private readonly notifications: AbstractNotification[],
    private usersService: UsersService
  ) {}
  async notify(
    userId: string,
    channels: NotificationChannel[],
    message: string,
    subject?: string
  ): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      console.error(`User with ID ${userId} doesn't exist`);
      return false;
    }
    const notificationsChannelsToUse = this.notifications.filter(
      (notification) => {
        return channels.includes(notification.channel);
      }
    );
    const sentNotifications = await Promise.all(
      notificationsChannelsToUse.map((channel) => {
        switch (channel.channel) {
          case NotificationChannel.Email:
            return channel.send(user.email, message, subject);
          /* 
          We can add the rest of future channels here
          For example, to implement sending SMSs we add a phone number to user model,
          add the channel to NotificationChannel enum,
          implement the Notification interface for it, then
          add another switch case here, like this
          
          case NotificationChannel.SMS:
            return channel.send(user.phone, message);
          **/
          default:
            throw new Error(`Channel  ${channel.channel} not implemented`);
        }
      })
    );
    const areAllNotificationsSent = sentNotifications.every((n) => n === true);
    if (!areAllNotificationsSent) {
      console.error(
        `Some or all notifications channels failed to notify user ${user._id}`
      );
    }
    return areAllNotificationsSent;
  }
}

export const notificationsService = new NotificationsService(
  [emailNotificationService],
  usersService
);
