import { redisCache } from "../cache/redis";
import { UrlCheck } from "../checks/types";
import { loggingService } from "./service";
import { emailNotificationService } from "../notifications/email";

export async function monitor() {
  redisCache.subscribe("create", async (message) => {
    const parsedMessage = JSON.parse(message as string) as UrlCheck;
    const key = String(parsedMessage._id) + parsedMessage.url;
    console.log({ key, value: parsedMessage.intervalInSeconds });

    await redisCache.set(key, parsedMessage.intervalInSeconds.toString());
    let isUp = true;
    const intervalId = setInterval(async () => {
      const checkInterval = await redisCache.get(key);
      if (
        !checkInterval ||
        Number(checkInterval) !== parsedMessage.intervalInSeconds
      ) {
        console.log(
          `Couldn't find interval in cache or was changed. ${key}=${checkInterval}`
        );
        clearInterval(intervalId);
      }
      let response = await loggingService.logUrl(parsedMessage);
      if (response !== isUp) {
        emailNotificationService.sendToUser(
          parsedMessage.userId,
          `Website ${parsedMessage.url} is ${response ? "UP" : "DOWN"}`
        );
        isUp = false;
      }
    }, parsedMessage.intervalInSeconds * 1000);
  });

  redisCache.subscribe("update", async (message) => {
    const parsedMessage = JSON.parse(message) as UrlCheck;
    const key = String(parsedMessage._id) + parsedMessage.url;
    await redisCache.set(key, parsedMessage.intervalInSeconds.toString());
    let isUp = true;
    const intervalId = setInterval(async () => {
      const checkInterval = await redisCache.get(key);
      if (
        !checkInterval ||
        Number(checkInterval) !== parsedMessage.intervalInSeconds
      ) {
        console.log(
          `Couldn't find interval in cache or was changed in update! ${key}=${checkInterval}`
        );
        clearInterval(intervalId);
      }
      let response = await loggingService.logUrl(parsedMessage);
      if (response !== isUp) {
        emailNotificationService.sendToUser(
          parsedMessage.userId,
          `Website ${parsedMessage.url} is ${response ? "UP" : "DOWN"}`
        );
        isUp = false;
      }
    }, parsedMessage.intervalInSeconds * 1000);
  });

  redisCache.subscribe("delete", async (message) => {
    console.log({ deleteMessage: JSON.stringify(message, null, 2) });
    const parsedMessage = JSON.parse(message) as UrlCheck;
    const key = String(parsedMessage._id) + parsedMessage.url;
    await redisCache.delete(key);
  });
}
