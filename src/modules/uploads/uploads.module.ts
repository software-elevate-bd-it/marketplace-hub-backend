import { Module } from '@nestjs/common';
import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SuccessResponse } from 'src/common/dto/response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Repository
@Injectable()
export class UploadRepository {
  constructor(private prisma: PrismaService) {}

  async createUpload(data: any) {
    return this.prisma.upload.create({ data });
  }

  async findUploadById(id: bigint) {
    return this.prisma.upload.findUnique({ where: { id } });
  }

  async deleteUpload(id: bigint) {
    return this.prisma.upload.delete({ where: { id } });
  }
}

// Service
@Injectable()
export class UploadService {
  constructor(private uploadRepository: UploadRepository) {}

  async handleFileUpload(file: any, userId: string | number | bigint): Promise<SuccessResponse> {
    const upload = await this.uploadRepository.createUpload({
      userId: BigInt(userId),
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      path: file.path,
      url: `/uploads/${file.filename}`,
      storageType: 'local',
      isPublic: true,
    });
    return new SuccessResponse('File uploaded', { id: upload.id, url: upload.url });
  }

  async deleteUpload(id: string | number | bigint): Promise<SuccessResponse> {
    await this.uploadRepository.deleteUpload(BigInt(id));
    return new SuccessResponse('File deleted', { id });
  }
}

// Controller
@ApiTags('Uploads')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload image' })
  async uploadImage(@UploadedFile() file: any, @CurrentUser() user: any) {
    return this.uploadService.handleFileUpload(file, user.id);
  }
}

@Module({
  controllers: [UploadController],
  providers: [UploadService, UploadRepository],
  exports: [UploadService],
})
export class UploadsModule {}
