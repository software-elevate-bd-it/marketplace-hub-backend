import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword, IsEnum, IsOptional } from 'class-validator';

export enum AdminRoleEnum {
  SUPER_ADMIN = 'super_admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
}

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class AdminCreateDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1 })
  password: string;

  @ApiProperty({ example: 'Admin Name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: AdminRoleEnum, example: AdminRoleEnum.MODERATOR })
  @IsEnum(AdminRoleEnum)
  role: AdminRoleEnum;

  @ApiPropertyOptional()
  @IsOptional()
  avatar?: string;
}

export class AdminUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AdminRoleEnum)
  role?: AdminRoleEnum;

  @ApiPropertyOptional()
  @IsOptional()
  avatar?: string;
}

export class AdminResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: AdminRoleEnum;

  @ApiProperty()
  avatar: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class AdminAuthResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  admin: AdminResponseDto;
}
