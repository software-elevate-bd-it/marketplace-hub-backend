import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, JobsOptions } from 'bullmq';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private readonly connection: { host: string; port: number };
  private readonly emailQueue: Queue;
  private readonly imageQueue: Queue;
  private readonly notificationQueue: Queue;

  constructor(private configService: ConfigService) {
    this.connection = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    };

    this.emailQueue = new Queue('email-queue', { connection: this.connection });
    this.imageQueue = new Queue('image-processing-queue', { connection: this.connection });
    this.notificationQueue = new Queue('notification-queue', { connection: this.connection });

    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    new Worker(
      'email-queue',
      async (job) => {
        this.logger.log(`Processing email job ${job.id}`);
        // TODO: integrate actual email provider such as Mailgun, SendGrid, SES.
        return { success: true, payload: job.data };
      },
      { connection: this.connection },
    );

    new Worker(
      'image-processing-queue',
      async (job) => {
        this.logger.log(`Processing image job ${job.id}`);
        // TODO: implement resize, optimization, CDN upload.
        return { success: true, payload: job.data };
      },
      { connection: this.connection },
    );

    new Worker(
      'notification-queue',
      async (job) => {
        this.logger.log(`Dispatching notification job ${job.id}`);
        return { success: true, payload: job.data };
      },
      { connection: this.connection },
    );
  }

  async addEmailJob(data: unknown, options?: JobsOptions) {
    return this.emailQueue.add('send-email', data, options);
  }

  async addImageProcessingJob(data: unknown, options?: JobsOptions) {
    return this.imageQueue.add('process-image', data, options);
  }

  async addNotificationJob(data: unknown, options?: JobsOptions) {
    return this.notificationQueue.add('send-notification', data, options);
  }
}
