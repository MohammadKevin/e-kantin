import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStanDto {
  @ApiPropertyOptional({ example: 'Warung Bu Siti' })
  @IsOptional()
  @IsString()
  nama_stan?: string;

  @ApiPropertyOptional({ example: 'Siti' })
  @IsOptional()
  @IsString()
  nama_pemilik?: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsOptional()
  @IsString()
  telp?: string;
}
