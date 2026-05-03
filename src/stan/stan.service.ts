import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateStanDto } from './dto/update-stan.dto';

@Injectable()
export class StanService {
  constructor(private readonly prisma: PrismaService) {}

  async findPending() {
    return this.prisma.stan.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async approve(id: number) {
    const stan = await this.prisma.stan.findUnique({
      where: { id },
    });

    if (!stan) {
      throw new NotFoundException('Stan tidak ditemukan');
    }

    return this.prisma.stan.update({
      where: { id },
      data: { status: 'diterima' },
    });
  }

  async reject(id: number) {
    const stan = await this.prisma.stan.findUnique({
      where: { id },
    });

    if (!stan) {
      throw new NotFoundException('Stan tidak ditemukan');
    }

    return this.prisma.stan.update({
      where: { id },
      data: { status: 'ditolak' },
    });
  }

  async getProfile(userId: number) {
    const stan = await this.prisma.stan.findFirst({
      where: { userId },
    });

    if (!stan) {
      throw new NotFoundException('Stan tidak ditemukan');
    }

    return stan;
  }

  async updateProfile(userId: number, dto: UpdateStanDto) {
    const stan = await this.prisma.stan.findFirst({
      where: { userId },
    });

    if (!stan) {
      throw new NotFoundException('Stan tidak ditemukan');
    }

    return this.prisma.stan.update({
      where: { id: stan.id },
      data: dto,
    });
  }
}
