import Redis from "ioredis";
import { Cache } from "./cache";
import { Optional } from "../types";

export class RedisCache implements Cache {
  private readonly pub: Redis;
  private readonly sub: Redis;
  constructor(private readonly redis: Redis) {
    this.pub = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
    });
    this.sub = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
    });
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
}

export const redisCache = new RedisCache(
  new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
  })
);
