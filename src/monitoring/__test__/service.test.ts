import { LoggingService } from "../service";
import { LogModel } from "../models/url";
import { LogStatus } from "../types";

describe("LoggingService", () => {
  it("should create a log", async () => {
    const loggingService = new LoggingService(LogModel, {} as any, {} as any);
    const data = {
      checkId: "checkId",
      status: LogStatus.UP,
      url: "https://www.google.com",
      responseTime: 100,
      intervalInSeconds: 60,
    };
    const log = await loggingService.create(
      data.checkId,
      data.status,
      data.url,
      data.responseTime,
      data.intervalInSeconds
    );
    expect(log).toMatchObject(data);
  });
});
