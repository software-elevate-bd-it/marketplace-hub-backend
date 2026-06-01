import {
  IsString,
  MinLength,
} from 'class-validator';

export class DisputeOrderDto {
  @IsString()
  reason: string;

  @IsString()
  @MinLength(10)
  detail: string;
}