import { Global, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
