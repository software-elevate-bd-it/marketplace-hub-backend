import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClient;
  private readonly subscriber: RedisClient;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.client = new Redis({ host, port });
    this.subscriber = new Redis({ host, port });

    this.subscriber.on('message', (channel, message) => {
      this.logger.debug(`Redis subscriber received message on ${channel}`);
    });

    this.client.on('error', (error) => this.logger.error('Redis client error', error));
    this.subscriber.on('error', (error) => this.logger.error('Redis subscriber error', error));
  }

  async get<T = any>(key: string): Promise<T | undefined> {
    const value = await this.client.get(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, payload, 'EX', ttlSeconds);
      return;
    }
    await this.client.set(key, payload);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incr(key: string, ttlSeconds?: number): Promise<number> {
    const count = await this.client.incr(key);
    if (ttlSeconds) {
      await this.client.expire(key, ttlSeconds);
    }
    return count;
  }

  async publish(channel: string, payload: unknown): Promise<number> {
    return this.client.publish(channel, JSON.stringify(payload));
  }

  async subscribe(channel: string, listener: (message: unknown) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (_channel, message) => {
      try {
        listener(JSON.parse(message));
      } catch {
        listener(message);
      }
    });
  }
}
