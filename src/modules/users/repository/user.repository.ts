import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { toPrismaId } from 'src/common/utils/prisma-helpers';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.user.create({ data });
  }

  async findById(id: string | number | bigint) {
    return this.prisma.user.findUnique({ where: { id: toPrismaId(id) } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll(skip: number = 0, take: number = 20) {
    return this.prisma.user.findMany({ skip, take });
  }

  async update(id: string | number | bigint, data: any) {
    return this.prisma.user.update({ where: { id: toPrismaId(id) }, data });
  }

  async delete(id: string | number | bigint) {
    return this.prisma.user.delete({ where: { id: toPrismaId(id) } });
  }

  async count() {
    return this.prisma.user.count();
  }
}
