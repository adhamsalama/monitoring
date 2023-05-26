import axios from "axios";
import { UrlCheck } from "../checks/types";
import { LogModel } from "./models/url";
import { timeoutPromise } from "./timeout-promise";
import { Log, LogStatus } from "./types";

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
  async logUrl(url: UrlCheck) {
    console.log(`Checking ${url.url}`);
    const startTime = new Date();
    const response = await timeoutPromise(
      url.timeoutInSeconds * 1000,
      axios.get(url.url).then((res) => {
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
  }
}

export const loggingService = new LoggingService(LogModel);
