import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum Role {
  super_admin = 'super_admin',
  admin_stan = 'admin_stan',
  siswa = 'siswa',
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
