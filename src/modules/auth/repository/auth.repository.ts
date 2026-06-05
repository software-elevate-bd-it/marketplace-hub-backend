import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { toPrismaId } from 'src/common/utils/prisma-helpers';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string | number | bigint) {
    return this.prisma.user.findUnique({
      where: { id: toPrismaId(id) },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    avatar?: string;
    country?: string;
    language?: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        avatar: data.avatar,
        country: data.country,
        language: data.language || 'en',
        isVerified: false,
      },
    });
  }

  async updateUser(id: string | number | bigint, data: any) {
    return this.prisma.user.update({
      where: { id: toPrismaId(id) },
      data,
    });
  }

  async updatePassword(id: string | number | bigint, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id: toPrismaId(id) },
      data: { password: hashedPassword },
    });
  }

  async updateOtp(email: string, otpCode: string, otpExpires: Date) {
    return this.prisma.user.update({
      where: { email },
      data: {
        otpCode,
        otpExpires,
      },
    });
  }

  async verifyOtp(email: string, otpCode: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    if (user.otpCode !== otpCode) return null;
    if (!user.otpExpires || user.otpExpires < new Date()) return null;

    // Clear OTP after verification
    await this.prisma.user.update({
      where: { email },
      data: {
        otpCode: null,
        otpExpires: null,
        isVerified: true,
      },
    });

    return user;
  }

  async clearOtp(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: {
        otpCode: null,
        otpExpires: null,
      },
    });
  }
}
