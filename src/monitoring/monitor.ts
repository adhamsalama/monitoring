import { redisCache } from "../cache/redis";
import { UrlCheck } from "../checks/types";
import { loggingService } from "./service";
import { NotificationsService } from "../notifications/service";
import axios from "axios";
import { LogStatus } from "./types";
import { NotificationChannel } from "../notifications/types";

export async function monitor(notificationsService: NotificationsService) {
  redisCache.subscribe("create", async (message) => {
    const parsedMessage = JSON.parse(message) as UrlCheck;
    poll(parsedMessage, notificationsService);
  });

  redisCache.subscribe("update", async (message) => {
    const parsedMessage = JSON.parse(message) as UrlCheck;
    poll(parsedMessage, notificationsService);
  });

  redisCache.subscribe("delete", async (message) => {
    const parsedMessage = JSON.parse(message) as UrlCheck;
    const key = String(parsedMessage._id) + parsedMessage.url;
    await redisCache.delete(key);
  });
}

async function poll(
  check: UrlCheck,
  notificationsService: NotificationsService
) {
  const key = String(check._id) + check.url;
  await redisCache.set(key, check.intervalInSeconds.toString());
  let isUp = true;
  const pollAndLog = async () => {
    const checkInterval = await redisCache.get(key);
    if (!checkInterval || Number(checkInterval) !== check.intervalInSeconds) {
      console.log(
        `Couldn't find interval in cache or was changed. ${key}=${checkInterval}`
      );
      clearInterval(intervalId);
    }
    const response = await loggingService.logUrl(check);
    if (response !== isUp) {
      notificationsService.notify(
        check.userId,
        [NotificationChannel.Email],
        `Website ${check.url} is ${response ? LogStatus.UP : LogStatus.DOWN}`,
        "Alert for your URL check"
      );
      if (check.webhook) {
        axios
          .post(check.url, {
            url: `${check.url}${check.path ?? ""}`,
            status: response ? LogStatus.UP : LogStatus.DOWN,
          })
          .catch((err) => {
            console.log(
              `Error while trying to notify the user using a webhook for check ${check._id}`,
              err
            );
          });
      }
      isUp = false;
    }
  };
  pollAndLog();
  const intervalId = setInterval(pollAndLog, check.intervalInSeconds * 1000);
}
