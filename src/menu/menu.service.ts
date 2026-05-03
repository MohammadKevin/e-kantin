import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateMenuDto) {
    const stan = await this.prisma.stan.findFirst({
      where: { userId },
    });

    if (!stan) {
      throw new NotFoundException('Stan tidak ditemukan');
    }

    return this.prisma.menu.create({
      data: {
        ...dto,
        stanId: stan.id,
      },
    });
  }

  async findAll() {
    return this.prisma.menu.findMany({
      include: {
        stan: {
          select: {
            id: true,
            nama_stan: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        stan: true,
      },
    });

    if (!menu) {
      throw new NotFoundException('Menu tidak ditemukan');
    }

    return menu;
  }

  async update(userId: number, id: number, dto: UpdateMenuDto) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: { stan: true },
    });

    if (!menu) {
      throw new NotFoundException('Menu tidak ditemukan');
    }

    if (menu.stan.userId !== userId) {
      throw new ForbiddenException('Tidak punya akses ke menu ini');
    }

    return this.prisma.menu.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: number, id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: { stan: true },
    });

    if (!menu) {
      throw new NotFoundException('Menu tidak ditemukan');
    }

    if (menu.stan.userId !== userId) {
      throw new ForbiddenException('Tidak punya akses ke menu ini');
    }

    return this.prisma.menu.delete({
      where: { id },
    });
  }
}
