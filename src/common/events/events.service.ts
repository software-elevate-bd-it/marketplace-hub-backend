import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly redisService: RedisService) {}

  async publish(channel: string, payload: unknown): Promise<number> {
    this.logger.debug(`Publishing event ${channel}`);
    return this.redisService.publish(channel, payload);
  }

  async subscribe(channel: string, listener: (payload: unknown) => void): Promise<void> {
    this.logger.debug(`Subscribing to event ${channel}`);
    await this.redisService.subscribe(channel, listener);
  }
}
