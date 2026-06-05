// LOCALIZATION MODULE
import { Module } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SuccessResponse } from 'src/common/dto/response.dto';

// Repository
@Injectable()
export class LocalizationRepository {
  constructor(private prisma: PrismaService) {}

  async getAllCountries() {
    return this.prisma.country.findMany({ where: { isActive: true } });
  }

  async getAllLanguages() {
    return this.prisma.language.findMany({ where: { isActive: true } });
  }

  async getAllCurrencies() {
    return this.prisma.currency.findMany({ where: { isActive: true } });
  }
}

// Service
@Injectable()
export class LocalizationService {
  constructor(private localizationRepository: LocalizationRepository) {}

  async getCountries(): Promise<SuccessResponse> {
    const countries = await this.localizationRepository.getAllCountries();
    return new SuccessResponse('Countries retrieved', countries);
  }

  async getLanguages(): Promise<SuccessResponse> {
    const languages = await this.localizationRepository.getAllLanguages();
    return new SuccessResponse('Languages retrieved', languages);
  }

  async getCurrencies(): Promise<SuccessResponse> {
    const currencies = await this.localizationRepository.getAllCurrencies();
    return new SuccessResponse('Currencies retrieved', currencies);
  }
}

// Controller
@ApiTags('Localization')
@Controller('localization')
export class LocalizationController {
  constructor(private localizationService: LocalizationService) {}

  @Get('countries')
  @ApiOperation({ summary: 'Get all countries' })
  async getCountries() {
    return this.localizationService.getCountries();
  }

  @Get('languages')
  @ApiOperation({ summary: 'Get all languages' })
  async getLanguages() {
    return this.localizationService.getLanguages();
  }

  @Get('currencies')
  @ApiOperation({ summary: 'Get all currencies' })
  async getCurrencies() {
    return this.localizationService.getCurrencies();
  }
}

@Module({
  controllers: [LocalizationController],
  providers: [LocalizationService, LocalizationRepository],
  exports: [LocalizationService],
})
export class LocalizationModule {}
