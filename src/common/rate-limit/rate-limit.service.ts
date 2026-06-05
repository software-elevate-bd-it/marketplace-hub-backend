import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RateLimitService {
  constructor(private readonly redisService: RedisService) {}

  async isAllowed(key: string, limit: number, ttlSeconds: number): Promise<boolean> {
    const current = await this.redisService.incr(key, ttlSeconds);
    return current <= limit;
  }

  getLoginKey(email: string): string {
    return `ratelimit:login:${email.toLowerCase()}`;
  }

  getOtpKey(email: string): string {
    return `ratelimit:otp:${email.toLowerCase()}`;
  }

  getIpKey(ip: string): string {
    return `ratelimit:ip:${ip}`;
  }
}
