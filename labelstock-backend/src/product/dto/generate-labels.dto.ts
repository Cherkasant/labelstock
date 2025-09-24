import { IsArray, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class GenerateLabelsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  productIds: number[];

  @IsOptional()
  @IsBoolean()
  includeQrCodes?: boolean;
}