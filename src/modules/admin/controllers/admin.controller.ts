import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from '../service/admin.service';
import { AdminLoginDto, AdminCreateDto, AdminUpdateDto } from '../dto/admin.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Admin')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  async login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto);
  }
}

@ApiTags('Admin Management')
@Controller('admin/admins')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminManagementController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new admin' })
  async create(@Body() dto: AdminCreateDto) {
    return this.adminService.createAdmin(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getAllAdmins(page, limit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin' })
  async update(@Param('id') id: string, @Body() dto: AdminUpdateDto) {
    return this.adminService.updateAdmin(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin' })
  async delete(@Param('id') id: string) {
    return this.adminService.deleteAdmin(id);
  }
}
