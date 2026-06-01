import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    const exists = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (exists) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      10,
    );

    const otp = '123456';

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        otpCode: otp,
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      pending: true,
    };
  }

  async login(data: any) {
  const user =
    await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

  if (!user) {
    throw new UnauthorizedException(
      'Invalid credentials',
    );
  }

  const matched =
    await bcrypt.compare(
      data.password,
      user.password!,
    );

  if (!matched) {
    throw new UnauthorizedException(
      'Invalid credentials',
    );
  }

  const token =
    await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },

    token,
  };
}
}