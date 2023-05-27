import axios from "axios";
import { UrlCheck } from "../checks/types";
import { LogModel } from "./models/url";
import { timeoutPromise } from "./timeout-promise";
import { Log, LogStatus } from "./types";
import https from "https";

export class LoggingService {
  constructor(private logModel: typeof LogModel) {}
  async create(
    checkId: string,
    status: LogStatus,
    url: string,
    responseTime: number
  ): Promise<Log> {
    const log = await this.logModel.create({
      checkId,
      status,
      url,
      responseTime,
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
    const response = await timeoutPromise(
      url.timeoutInSeconds * 1000,
      axios
        .get(url.url, {
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
      responseTime
    );
    console.log({ log: log });
    return response;
  }
}

export const loggingService = new LoggingService(LogModel);
