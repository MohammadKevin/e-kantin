import {
  IsArray,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MetodePembayaran {
  qris = 'qris',
  cash = 'cash',
}

export enum TipeDiskon {
  nominal = 'nominal',
  persen = 'persen',
}

class DetailItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  menuId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  qty!: number;
}

class DiskonDto {
  @ApiProperty({ enum: TipeDiskon })
  @IsEnum(TipeDiskon)
  tipe!: TipeDiskon;

  @ApiProperty({ example: 10 })
  @IsInt()
  nilai!: number;

  @ApiPropertyOptional({ example: 20000 })
  @IsOptional()
  @IsInt()
  minimal_pembelian?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsInt()
  maksimal_diskon?: number;
}

export class CreateTransaksiDto {
  @ApiProperty({ type: [DetailItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailItemDto)
  items!: DetailItemDto[];

  @ApiProperty({ enum: MetodePembayaran })
  @IsEnum(MetodePembayaran)
  metode_pembayaran!: MetodePembayaran;

  @ApiPropertyOptional({ type: DiskonDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DiskonDto)
  diskon?: DiskonDto;
}
