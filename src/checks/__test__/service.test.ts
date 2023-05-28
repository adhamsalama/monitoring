import { usersService } from "../../users/service";
import { CheckModel } from "../models/check";
import { ChecksService } from "../service";
import { Protocol } from "../types";
import { LoggingService } from "../../monitoring/service";
import { LogModel } from "../../monitoring/models/url";
import { NotificationsService } from "../../notifications/service";
import { NotificationChannel } from "../../notifications/types";
import { Cache } from "../../cache/cache";

const setMock = jest.fn();
const getMock = jest.fn();
const deleteMock = jest.fn();

const cacheMock: Cache = {
  set: setMock,
  get: getMock,
  delete: deleteMock,
};
const sendMock = jest.fn();
const emailNotification = {
  channel: NotificationChannel.Email,
  send: sendMock,
};
const notificationsService = new NotificationsService(
  [emailNotification],
  usersService
);
const loggingService = new LoggingService(
  LogModel,
  notificationsService,
  cacheMock
);
const checksService = new ChecksService(CheckModel, loggingService);
describe("tests creating checks", () => {
  it("should create check successfully", async () => {
    const checkData = {
      url: "https://google.com",
      name: "test google",
      path: "/",
      protocol: Protocol.HTTPS,
      port: 443,
      webhook: "https://google.com",
      timeout: 5,
      intervalInSeconds: 10,
      threshold: 1,
      authentication: {
        username: "test",
        password: "test",
      },
      httpHeaders: [
        {
          key: "test",
          value: "test",
        },
      ],
      assert: {
        statusCode: 200,
      },
      tags: ["test"],
      ignoreSSL: false,
    };
    const user = await usersService.create({
      email: "test@test.test",
      name: "test",
      password: "123456",
    });
    const check = await checksService.create(String(user._id), checkData);

    expect(setMock).toBeCalledTimes(1);
    expect(check).toBeDefined();
    expect(check.url).toEqual(checkData.url);
    expect(check.path).toEqual(checkData.path);
    expect(check.protocol).toEqual(checkData.protocol);
    expect(check.port).toEqual(checkData.port);
    expect(check.webhook).toEqual(checkData.webhook);
    expect(check.timeoutInSeconds).toEqual(checkData.timeout);
    expect(check.intervalInSeconds).toEqual(checkData.intervalInSeconds);
    expect(check.threshold).toEqual(checkData.threshold);
    expect(check.authentication).toEqual(checkData.authentication);
    expect(check.httpHeaders).toEqual(checkData.httpHeaders);
    expect(check.assert).toEqual(checkData.assert);
    expect(check.tags).toEqual(checkData.tags);
    expect(check.ignoreSSL).toEqual(checkData.ignoreSSL);
    expect(check.userId).toEqual(String(user._id));
    const checkInDB = await CheckModel.findById(check._id).lean();
    expect(checkInDB).toBeDefined();
    expect(checkInDB!.url).toEqual(checkData.url);
    expect(checkInDB!.path).toEqual(checkData.path);
    expect(checkInDB!.protocol).toEqual(checkData.protocol);
    expect(checkInDB!.port).toEqual(checkData.port);
    expect(checkInDB!.webhook).toEqual(checkData.webhook);
    expect(checkInDB!.timeoutInSeconds).toEqual(checkData.timeout);
    expect(checkInDB!.intervalInSeconds).toEqual(checkData.intervalInSeconds);
    expect(checkInDB!.threshold).toEqual(checkData.threshold);
    expect(checkInDB!.authentication).toEqual(checkData.authentication);
    expect(checkInDB!.httpHeaders).toEqual(checkData.httpHeaders);
    expect(checkInDB!.assert).toEqual(checkData.assert);
    expect(checkInDB!.tags).toEqual(checkData.tags);
    expect(checkInDB!.ignoreSSL).toEqual;
    expect(checkInDB!.userId).toEqual(String(user._id));
  });

  it("should create check successfully with default values", async () => {
    const checkData = {
      url: "https://google.com",
      name: "test google",
      protocol: Protocol.HTTPS,
    };
    const user = await usersService.create({
      email: "tesaasd@asda.com",
      name: "test",
      password: "123456",
    });
    const check = await checksService.create(String(user._id), checkData);

    expect(check).toBeDefined();
    expect(check.url).toEqual(checkData.url);
    expect(check.path).toBeUndefined();
    expect(check.protocol).toEqual(checkData.protocol);
    expect(check.port).toBeUndefined();
    expect(check.webhook).toBeUndefined();
    expect(check.timeoutInSeconds).toEqual(5);
    expect(check.intervalInSeconds).toEqual(60 * 10);
    expect(check.threshold).toEqual(1);
    expect(check.authentication).toBeUndefined();
    expect(check.httpHeaders).toEqual([]);
    expect(check.assert).toBeUndefined();
    expect(check.tags).toEqual([]);
    expect(check.ignoreSSL).toBeUndefined();
    expect(check.userId).toEqual(String(user._id));
  });
});
