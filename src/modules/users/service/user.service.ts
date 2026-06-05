import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/create-user.dto';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private readonly cacheService: CacheService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = await this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
      country: createUserDto.country,
    });

    return this.mapToResponseDto(user);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const cacheKey = `seller-profile:${id}`;
    return this.cacheService.getOrSet(cacheKey, 600, async () => {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return this.mapToResponseDto(user);
    });
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.userRepository.update(id, updateUserDto);
    return this.mapToResponseDto(updated);
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(id);
    return true;
  }

  async getAllUsers(page: number = 1, perPage: number = 20) {
    const skip = (page - 1) * perPage;
    const [users, total] = await Promise.all([
      this.userRepository.findAll(skip, perPage),
      this.userRepository.count(),
    ]);

    return {
      data: users.map((user) => this.mapToResponseDto(user)),
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  private mapToResponseDto(user: any): UserResponseDto {
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
  }
}
