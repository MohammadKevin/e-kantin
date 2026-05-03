import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum JenisMenu {
  makanan = 'makanan',
  minuman = 'minuman',
}

export class CreateMenuDto {
  @ApiProperty({ example: 'Nasi Goreng' })
  @IsString()
  nama!: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  harga!: number;

  @ApiProperty({ enum: JenisMenu, example: 'makanan' })
  @IsEnum(JenisMenu)
  jenis!: JenisMenu;

  @ApiPropertyOptional({ example: 'nasi-goreng.jpg' })
  @IsOptional()
  @IsString()
  foto?: string;

  @ApiPropertyOptional({ example: 'Nasi goreng spesial dengan telur' })
  @IsOptional()
  @IsString()
  deskripsi?: string;
}
