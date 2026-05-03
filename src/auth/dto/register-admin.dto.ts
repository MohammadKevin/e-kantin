import { IsString, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @IsString()
  username!: string;

  @MinLength(6)
  password!: string;

  @IsString()
  nama_stan!: string;

  @IsString()
  nama_pemilik!: string;

  @IsString()
  telp!: string;
}
