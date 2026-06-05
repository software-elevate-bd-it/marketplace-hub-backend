import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AdminRepository } from '../repository/admin.repository';
import { AdminLoginDto, AdminCreateDto, AdminUpdateDto } from '../dto/admin.dto';
import { SuccessResponse } from 'src/common/dto/response.dto';

@Injectable()
export class AdminService {
  constructor(
    private adminRepository: AdminRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: AdminLoginDto): Promise<SuccessResponse> {
    try {
      const admin = await this.adminRepository.findByEmail(loginDto.email);
      if (!admin) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!admin.isActive) {
        throw new UnauthorizedException('Admin account is disabled');
      }

      const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const authData = await this.generateAdminAuthResponse(admin);
      return new SuccessResponse('Admin login successful', authData);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      console.error('Admin login failed:', error);
      throw new InternalServerErrorException('Login failed');
    }
  }

  async createAdmin(createDto: AdminCreateDto): Promise<SuccessResponse> {
    try {
      const existingAdmin = await this.adminRepository.findByEmail(createDto.email);
      if (existingAdmin) {
        throw new ConflictException('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(createDto.password, 10);

      const admin = await this.adminRepository.createAdmin({
        email: createDto.email,
        password: hashedPassword,
        name: createDto.name,
        role: createDto.role,
        avatar: createDto.avatar,
      });

      const responseDto = this.mapToResponseDto(admin);
      return new SuccessResponse('Admin created successfully', responseDto);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.error('Admin creation failed:', error);
      throw new InternalServerErrorException('Failed to create admin');
    }
  }

  async updateAdmin(id: string | number | bigint, updateDto: AdminUpdateDto): Promise<SuccessResponse> {
    try {
      const admin = await this.adminRepository.findById(id);
      if (!admin) {
        throw new BadRequestException('Admin not found');
      }

      const updated = await this.adminRepository.updateAdmin(id, updateDto);
      const responseDto = this.mapToResponseDto(updated);
      return new SuccessResponse('Admin updated successfully', responseDto);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('Admin update failed:', error);
      throw new InternalServerErrorException('Failed to update admin');
    }
  }

  async deleteAdmin(id: string | number | bigint): Promise<SuccessResponse> {
    try {
      const admin = await this.adminRepository.findById(id);
      if (!admin) {
        throw new BadRequestException('Admin not found');
      }

      await this.adminRepository.deleteAdmin(id);
      return new SuccessResponse('Admin deleted successfully', { id });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('Admin deletion failed:', error);
      throw new InternalServerErrorException('Failed to delete admin');
    }
  }

  async getAllAdmins(page: number = 1, limit: number = 10): Promise<SuccessResponse> {
    try {
      const skip = (page - 1) * limit;
      const [admins, total] = await Promise.all([
        this.adminRepository.getAllAdmins(skip, limit),
        this.adminRepository.countAdmins(),
      ]);

      const data = {
        admins: admins.map((a) => this.mapToResponseDto(a)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };

      return new SuccessResponse('Admins retrieved', data);
    } catch (error) {
      console.error('Failed to retrieve admins:', error);
      throw new InternalServerErrorException('Failed to retrieve admins');
    }
  }

  private async generateAdminAuthResponse(admin: any): Promise<any> {
    try {
      const payload = {
        sub: admin.id.toString(),
        email: admin.email,
        role: admin.role,
      };

      const token = this.jwtService.sign(payload);
      const expiresIn = this.configService.get<number>('JWT_EXPIRATION') || 86400;

      return {
        token,
        expiresIn,
        admin: this.mapToResponseDto(admin),
      };
    } catch (error) {
      console.error('Auth response generation failed:', error);
      throw new InternalServerErrorException('Failed to generate token');
    }
  }

  private mapToResponseDto(admin: any): any {
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      avatar: admin.avatar,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
    };
  }
}
