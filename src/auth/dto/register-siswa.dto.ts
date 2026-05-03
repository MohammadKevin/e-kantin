import { IsString, MinLength } from 'class-validator';

export class RegisterSiswaDto {
  @IsString()
  username!: string;

  @MinLength(6)
  password!: string;

  @IsString()
  nama!: string;

  @IsString()
  alamat!: string;

  @IsString()
  telp!: string;
}
