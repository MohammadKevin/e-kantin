import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatusTransaksi {
  dimasak = 'dimasak',
  diantar = 'diantar',
  sampai = 'sampai',
}

export class UpdateStatusDto {
  @ApiProperty({ enum: StatusTransaksi })
  @IsEnum(StatusTransaksi)
  status!: StatusTransaksi;
}
