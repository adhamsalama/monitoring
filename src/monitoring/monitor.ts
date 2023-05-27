import { redisCache } from "../cache/redis";
import { UrlCheck } from "../checks/types";
import { loggingService } from "./service";
import { emailNotificationService } from "../notifications/email";

export async function monitor() {
  redisCache.subscribe("create", async (message) => {
    const parsedMessage = JSON.parse(message as string) as UrlCheck;
    poll(parsedMessage);
  });

  redisCache.subscribe("update", async (message) => {
    const parsedMessage = JSON.parse(message) as UrlCheck;
    poll(parsedMessage);
  });

  redisCache.subscribe("delete", async (message) => {
    console.log({ deleteMessage: JSON.stringify(message, null, 2) });
    const parsedMessage = JSON.parse(message) as UrlCheck;
    const key = String(parsedMessage._id) + parsedMessage.url;
    await redisCache.delete(key);
  });
}

async function poll(check: UrlCheck) {
  const key = String(check._id) + check.url;
  await redisCache.set(key, check.intervalInSeconds.toString());
  let isUp = true;
  const intervalId = setInterval(async () => {
    const checkInterval = await redisCache.get(key);
    if (!checkInterval || Number(checkInterval) !== check.intervalInSeconds) {
      console.log(
        `Couldn't find interval in cache or was changed. ${key}=${checkInterval}`
      );
      clearInterval(intervalId);
    }
    let response = await loggingService.logUrl(check);
    if (response !== isUp) {
      emailNotificationService.sendToUser(
        check.userId,
        `Website ${check.url} is ${response ? "UP" : "DOWN"}`
      );
      isUp = false;
    }
  }, check.intervalInSeconds * 1000);
}
