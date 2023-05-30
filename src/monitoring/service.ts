import axios from "axios";
import { UrlCheck } from "../checks/types";
import { LogModel } from "./models/url";
import { timeoutPromise } from "./timeout-promise";
import { Log, LogStatus } from "./types";
import https from "https";
import { Cache } from "../cache/cache";
import {
  NotificationsService,
  notificationsService,
} from "../notifications/service";
import { NotificationChannel } from "../notifications/types";
import { redisCache } from "../cache/redis";

export class MonitoringService {
  constructor(
    private logModel: typeof LogModel,
    private notificationsService: NotificationsService,
    private cache: Cache
  ) {}
  async create(
    checkId: string,
    status: LogStatus,
    url: string,
    responseTime: number,
    intervalInSeconds: number
  ): Promise<Log> {
    const log = await this.logModel.create({
      checkId,
      status,
      url,
      responseTime,
      intervalInSeconds,
    });
    return log;
  }
  async logUrl(url: UrlCheck): Promise<boolean> {
    console.log(`Checking ${url.url}`);
    const startTime = new Date();
    let headers: Record<string, string> = {};
    if (url.httpHeaders) {
      headers = url.httpHeaders.reduce((acc, curr) => {
        return { ...acc, [curr.key]: curr.value };
      }, {});
    }
    if (url.authentication) {
      const token = Buffer.from(
        `${url.authentication.username}:${url.authentication.password}`
      ).toString("base64");
      headers.authorization = `Basic ${token}`;
    }
    let fullUrl = url.url;
    if (url.path) {
      fullUrl += url.path;
    }

    const response = await timeoutPromise(
      url.timeoutInSeconds * 1000,
      axios
        .get(fullUrl, {
          headers,
          ...(url.ignoreSSL && {
            httpAgent: new https.Agent({
              rejectUnauthorized: true,
            }),
          }),
        })
        .then((res) => {
          if (url.assert?.statusCode && url.assert?.statusCode !== res.status) {
            return false;
          }
          return true;
        })
    ).catch((err) => {
      console.error(`Failed to check ${url.url}: ${err}`);
      return false;
    });
    const endTime = new Date();
    // use .valueOf() to make TypeScript stop crying
    const responseTime = endTime.valueOf() - startTime.valueOf();
    const log = await this.create(
      String(url._id),
      response ? LogStatus.UP : LogStatus.DOWN,
      url.url,
      responseTime,
      url.intervalInSeconds
    );
    console.log({ log: log });
    return response;
  }

  async monitor(check: UrlCheck) {
    const key = String(check._id) + check.url;
    await this.cache.set(key, check.intervalInSeconds.toString());
    let threshhold = 0;
    const pollAndLog = async () => {
      const checkInterval = await this.cache.get(key);
      if (!checkInterval || Number(checkInterval) !== check.intervalInSeconds) {
        console.log(
          `Couldn't find interval in cache or was changed. ${key}=${checkInterval}`
        );
        clearInterval(intervalId);
      }
      const response = await monitoringService.logUrl(check);
      if (!response) {
        threshhold++;
      }
      if (threshhold >= check.threshold) {
        console.log(
          `Threshold reached for check ${check._id} (${check.threshold}) times`
        );
        threshhold = 0;
        this.notificationsService.notify(
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
      }
    };
    pollAndLog();
    const intervalId = setInterval(pollAndLog, check.intervalInSeconds * 1000);
  }

  async stopMonitoring(check: UrlCheck) {
    const key = String(check._id) + check.url;
    await redisCache.delete(key);
  }
}

export const monitoringService = new MonitoringService(
  LogModel,
  notificationsService,
  redisCache
);
