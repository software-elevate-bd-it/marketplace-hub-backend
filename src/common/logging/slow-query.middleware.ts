import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SlowQueryMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SlowQueryMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      if (durationMs > 500) {
        this.logger.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${durationMs.toFixed(2)}ms`);
      }
    });
    next();
  }
}
