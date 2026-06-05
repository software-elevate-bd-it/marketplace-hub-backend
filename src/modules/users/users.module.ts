import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UserService } from './service/user.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UserRepository, UserService],
  controllers: [UsersController],
  exports: [UserService],
})
export class UsersModule {}
