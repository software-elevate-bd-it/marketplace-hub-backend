import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../repository/auth.repository';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { SuccessResponse } from 'src/common/dto/response.dto';
import { RateLimitService } from 'src/common/rate-limit/rate-limit.service';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async register(registerDto: RegisterDto): Promise<SuccessResponse> {
    // 1. Check if user exists
    try {
      const existingUser = await this.authRepository.findByEmail(registerDto.email);
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.error('Registration look-up error:', error);
      throw new InternalServerErrorException('Database communication failed');
    }

    // 2. Hash password
    let hashedPassword = '';
    try {
      hashedPassword = await bcrypt.hash(registerDto.password, 10);
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new InternalServerErrorException('Encryption processing failure');
    }

    // 3. Create user and payload response
    try {
      const user = await this.authRepository.createUser({
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.fullName,
        country: registerDto.country,
        language: 'en',
      });

      // Generate raw authentication credentials payload
      const authData = await this.generateAuthResponse(user);

      // ✨ Wrap output inside your unified SuccessResponse constructor
      return new SuccessResponse('User registered successfully', authData);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      if (error instanceof ConflictException) throw error;
      console.error('Registration database transaction failed:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred during registration',
      );
    }
  }

  async login(loginDto: LoginDto): Promise<SuccessResponse> {
    try {
      const ipLimitKey = this.rateLimitService.getLoginKey(loginDto.email);
      const isLoginAllowed = await this.rateLimitService.isAllowed(ipLimitKey, 5, 900);
      if (!isLoginAllowed) {
        throw new HttpException('Too many login attempts. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
      }

      const user = await this.authRepository.findByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password ?? '');
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const authData = await this.generateAuthResponse(user);
      return new SuccessResponse('Login successful', authData);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof HttpException) throw error;
      console.error('Login process failure:', error);
      throw new InternalServerErrorException('An error occurred during verification');
    }
  }

  async getMe(userId: string): Promise<SuccessResponse> {
    try {
      const user = await this.authRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const profileData = await this.mapUserToAuthUserDto(user);

      // ✨ Wrap output inside your unified SuccessResponse constructor
      return new SuccessResponse('Profile retrieved', profileData);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      console.error('Get profile failed:', error);
      throw new InternalServerErrorException('Failed to fetch user context');
    }
  }

  async refreshToken(userId: string): Promise<SuccessResponse> {
    try {
      const user = await this.authRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const authData = await this.generateAuthResponse(user);

      // ✨ Wrap output inside your unified SuccessResponse constructor
      return new SuccessResponse('Token refreshed', authData);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      console.error('Token refreshing failed:', error);
      throw new InternalServerErrorException('Failed to issue refreshed application key');
    }
  }

  async requestOtp(email: string): Promise<SuccessResponse> {
    try {
      const otpLimitKey = this.rateLimitService.getOtpKey(email);
      const isOtpAllowed = await this.rateLimitService.isAllowed(otpLimitKey, 3, 3600);
      if (!isOtpAllowed) {
        throw new HttpException('OTP request limit reached. Please try again after one hour.', HttpStatus.TOO_MANY_REQUESTS);
      }

      const user = await this.authRepository.findByEmail(email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await this.authRepository.updateOtp(email, otpCode, otpExpires);

      // TODO: Send OTP via email/SMS
      console.log(`OTP for ${email}: ${otpCode}`);

      return new SuccessResponse('OTP sent successfully', { ttl: 600 });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof HttpException) throw error;
      console.error('OTP request failed:', error);
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }

  async verifyOtp(email: string, code: string): Promise<SuccessResponse> {
    try {
      const user = await this.authRepository.verifyOtp(email, code);
      if (!user) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      const authData = await this.generateAuthResponse(user);
      return new SuccessResponse('OTP verified successfully', authData);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('OTP verification failed:', error);
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }

  // 🔒 Kept as regular private helper structures (Returning raw data models internally)
  private async generateAuthResponse(user: any): Promise<any> {
    try {
      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
      };

      const token = this.jwtService.sign(payload);
      const expiresIn = this.configService.get<number>('JWT_EXPIRATION') || 86400;

      return {
        token,
        expiresIn,
        user: await this.mapUserToAuthUserDto(user),
      };
    } catch (error) {
      console.error('JWT Token generation crash:', error);
      throw new InternalServerErrorException('Identity signing token mismatch');
    }
  }

  private async mapUserToAuthUserDto(user: any): Promise<any> {
    try {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        country: user.country,
        language: user.language,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      };
    } catch (error) {
      console.error('User mapping serialization crash:', error);
      throw new InternalServerErrorException('Data formatting layout discrepancy');
    }
  }
}
