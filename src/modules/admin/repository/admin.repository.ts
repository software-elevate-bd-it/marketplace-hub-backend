import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminRoleEnum } from '../dto/admin.dto';

@Injectable()
export class AdminRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.admin.findUnique({
      where: { email },
    });
  }

  async findById(id: string | number | bigint) {
    return this.prisma.admin.findUnique({
      where: { id: BigInt(id) },
    });
  }

  async createAdmin(data: {
    email: string;
    password: string;
    name: string;
    role: AdminRoleEnum;
    avatar?: string;
  }) {
    return this.prisma.admin.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        avatar: data.avatar,
        isActive: true,
      },
    });
  }

  async updateAdmin(id: string | number | bigint, data: any) {
    return this.prisma.admin.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  async deleteAdmin(id: string | number | bigint) {
    return this.prisma.admin.delete({
      where: { id: BigInt(id) },
    });
  }

  async getAllAdmins(skip: number = 0, take: number = 10) {
    return this.prisma.admin.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countAdmins() {
    return this.prisma.admin.count();
  }
}
