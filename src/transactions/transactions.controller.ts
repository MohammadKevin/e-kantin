import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransaksiDto } from './dto/create-transaksi.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

import type { Response } from 'express';

@ApiTags('Transaksi')
@ApiBearerAuth()
@Controller('transaksi')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('siswa')
  @ApiOperation({ summary: 'Checkout transaksi (siswa)' })
  @ApiBody({ type: CreateTransaksiDto })
  create(@Req() req: any, @Body() dto: CreateTransaksiDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.transactionsService.create(req.user.sub, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List semua transaksi' })
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Detail transaksi' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_stan')
  @ApiOperation({ summary: 'Update status pesanan (admin stan)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateStatusDto })
  updateStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.transactionsService.updateStatus(req.user.sub, id, dto);
  }

  @Patch(':id/bayar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('siswa')
  @ApiOperation({ summary: 'Bayar QRIS (siswa)' })
  @ApiParam({ name: 'id', example: 1 })
  bayar(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.transactionsService.bayar(req.user.sub, id);
  }

  @Patch(':id/konfirmasi')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_stan')
  @ApiOperation({ summary: 'Konfirmasi pembayaran (admin stan)' })
  @ApiParam({ name: 'id', example: 1 })
  konfirmasi(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.transactionsService.konfirmasiPembayaran(req.user.sub, id);
  }

  @Patch(':id/bayar-cash')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_stan')
  @ApiOperation({ summary: 'Bayar cash (admin stan)' })
  @ApiParam({ name: 'id', example: 1 })
  bayarCash(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.transactionsService.bayarCash(req.user.sub, id);
  }

  @Get(':id/struk/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Download struk PDF' })
  @ApiParam({ name: 'id', example: 1 })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  getStrukPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.transactionsService.generateStrukPdf(id, res);
  }
}
