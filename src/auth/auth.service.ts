import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

import { RegisterSiswaDto } from './dto/register-siswa.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerSiswa(dto: RegisterSiswaDto) {
    const exist = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (exist) {
      throw new BadRequestException('Username sudah digunakan');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: hashedPassword,
        role: 'siswa',
        siswa: {
          create: {
            nama: dto.nama,
            alamat: dto.alamat,
            telp: dto.telp,
          },
        },
      },
    });

    return this.generateToken(user);
  }

  async registerAdmin(dto: RegisterAdminDto) {
    const exist = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (exist) {
      throw new BadRequestException('Username sudah digunakan');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: hashedPassword,
        role: 'admin_stan',
        stan: {
          create: {
            nama_stan: dto.nama_stan,
            nama_pemilik: dto.nama_pemilik,
            telp: dto.telp,
            status: 'pending',
          },
        },
      },
    });

    return {
      message: 'Pendaftaran berhasil, tunggu persetujuan super admin',
    };
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { username: username.trim() },
      include: { stan: true },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isMatch = await bcrypt.compare(password.trim(), user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Password salah');
    }

    if (user.role === 'admin_stan') {
      if (!user.stan || user.stan.status !== 'diterima') {
        throw new UnauthorizedException(
          'Stan belum disetujui oleh super admin',
        );
      }
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.username, dto.password);
    return this.generateToken(user);
  }

  private generateToken(user: User) {
    return {
      message: 'Berhasil',
      access_token: this.jwtService.sign({
        sub: user.id,
        username: user.username,
        role: user.role,
      }),
    };
  }

  async initSuperAdmin() {
    const exist = await this.prisma.user.findFirst({
      where: { role: 'super_admin' },
    });
    console.log('INIT SUPER ADMIN JALAN');

    if (!exist) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const hashed = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD!, 10);

      await this.prisma.user.create({
        data: {
          username: process.env.SUPERADMIN_USERNAME!,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          password: hashed,
          role: 'super_admin',
        },
      });
    }
  }
}
