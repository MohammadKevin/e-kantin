import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import { RegisterSiswaDto } from './dto/register-siswa.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';

import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/siswa')
  @ApiOperation({ summary: 'Register siswa' })
  @ApiBody({ type: RegisterSiswaDto })
  @ApiResponse({ status: 201, description: 'Register berhasil' })
  registerSiswa(@Body() dto: RegisterSiswaDto) {
    return this.authService.registerSiswa(dto);
  }

  @Post('register/admin')
  @ApiOperation({ summary: 'Register admin stan (pending approval)' })
  @ApiBody({ type: RegisterAdminDto })
  @ApiResponse({ status: 201, description: 'Register admin berhasil' })
  registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login berhasil (JWT)' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
