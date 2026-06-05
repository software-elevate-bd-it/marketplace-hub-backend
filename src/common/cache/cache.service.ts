import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.redisService.get<T>(key);
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.redisService.set(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redisService.del(key);
  }

  async getOrSet<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}
