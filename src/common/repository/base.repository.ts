import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export abstract class BaseRepository<T> {
  constructor(protected prisma: PrismaService) {}

  abstract create(data: any): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(skip?: number, take?: number): Promise<T[]>;
  abstract update(id: string, data: any): Promise<T>;
  abstract delete(id: string): Promise<T>;
}
