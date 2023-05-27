import Redis from "ioredis";
import { Cache } from "./cache";
import { Optional } from "../types";

export class RedisCache implements Cache {
  private readonly pub: Redis;
  private readonly sub: Redis;
  constructor(private readonly redis: Redis) {
    this.pub = new Redis();
    this.sub = new Redis();
  }

  async get(key: string): Promise<Optional<string>> {
    return this.redis.get(key);
  }

  async set(key: string, value: string): Promise<boolean> {
    const result = await this.redis.set(key, value);
    console.log({ result });

    if (result !== "OK") {
      console.error(`Failed to set key ${key} in Redis`);
      return false;
    }
    return true;
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.redis.del(key);
    return result === 0 ? false : true;
  }

  async publish(channel: "create" | "update" | "delete", message: string) {
    await this.pub.publish(channel, message);
    console.log({ channel, message });
  }
  async subscribe(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    this.sub.subscribe(channel, (err, count) => {
      if (err) {
        console.error(`Error while subscribing to channel ${channel}`);
      } else {
        console.log(`Subscribed to ${count} channels for channel ${channel}`);
      }
      this.sub.on("message", (channelName, message) => {
        console.log(`Redis got message on channel ${channel}`);

        if (channelName === channel) {
          callback(message);
        }
      });
    });
  }
}

export const redisCache = new RedisCache(new Redis());
