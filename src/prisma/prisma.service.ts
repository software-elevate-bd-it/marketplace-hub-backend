import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Expose prisma property for any repositories explicitly calling this.prisma
  public prisma: PrismaClient = this;

  constructor() {
    const connectionString = process.env.PRISMA_ACCELERATE_URL || process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('❌ Database connection string is missing in environment variables.');
    }

    super({
      datasources: {
        db: {
          url: connectionString,
        },
      },
      errorFormat: 'pretty',
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        console.log('✅ Prisma connected successfully to MySQL');
        return;
      } catch (err) {
        retries--;
        console.error(`❌ Prisma connection failed. Retries left: ${retries}`, err);
        if (retries === 0) {
          throw err;
        }
        // Wait 3 seconds before retrying connection
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  get client() {
    return this;
  }
}