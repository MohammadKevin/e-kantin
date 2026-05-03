import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransaksiDto, TipeDiskon } from './dto/create-transaksi.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  private formatRupiah(angka: number) {
    return `Rp ${angka.toLocaleString('id-ID')}`;
  }

  async create(userId: number, dto: CreateTransaksiDto) {
    const siswa = await this.prisma.siswa.findFirst({
      where: { userId },
    });

    if (!siswa) throw new NotFoundException('Siswa tidak ditemukan');
    if (!dto.items.length)
      throw new BadRequestException('Item tidak boleh kosong');

    let total = 0;
    let stanId: number | null = null;

    const detailData: {
      menuId: number;
      qty: number;
      harga_beli: number;
    }[] = [];

    for (const item of dto.items) {
      const menu = await this.prisma.menu.findUnique({
        where: { id: item.menuId },
      });

      if (!menu)
        throw new NotFoundException(`Menu ${item.menuId} tidak ditemukan`);

      if (!stanId) stanId = menu.stanId;

      if (stanId !== menu.stanId)
        throw new BadRequestException('Semua menu harus dari stan yang sama');

      const subtotal = menu.harga * item.qty;
      total += subtotal;

      detailData.push({
        menuId: menu.id,
        qty: item.qty,
        harga_beli: menu.harga,
      });
    }

    let totalAkhir = total;

    if (dto.diskon) {
      const { tipe, nilai, minimal_pembelian, maksimal_diskon } = dto.diskon;

      if (!minimal_pembelian || total >= minimal_pembelian) {
        let potongan = 0;

        if (tipe === TipeDiskon.persen) {
          potongan = (total * nilai) / 100;

          if (maksimal_diskon && potongan > maksimal_diskon) {
            potongan = maksimal_diskon;
          }
        } else {
          potongan = nilai;
        }

        totalAkhir -= potongan;
      }

      if (totalAkhir < 0) totalAkhir = 0;
    }

    return this.prisma.transaksi.create({
      data: {
        siswaId: siswa.id,
        stanId: stanId!,
        metode_pembayaran: dto.metode_pembayaran,
        total_harga: totalAkhir,
        detail: {
          create: detailData,
        },
      },
      include: {
        detail: true,
      },
    });
  }

  async findAll() {
    return this.prisma.transaksi.findMany({
      include: {
        detail: true,
        siswa: true,
        stan: true,
      },
      orderBy: {
        tanggal: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const transaksi = await this.prisma.transaksi.findUnique({
      where: { id },
      include: {
        detail: {
          include: { menu: true },
        },
        siswa: true,
        stan: true,
      },
    });

    if (!transaksi) throw new NotFoundException('Transaksi tidak ditemukan');

    return transaksi;
  }

  async updateStatus(userId: number, id: number, dto: UpdateStatusDto) {
    const transaksi = await this.prisma.transaksi.findUnique({
      where: { id },
      include: { stan: true },
    });

    if (!transaksi) throw new NotFoundException('Transaksi tidak ditemukan');

    if (transaksi.stan.userId !== userId)
      throw new ForbiddenException('Tidak punya akses');

    return this.prisma.transaksi.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async bayar(userId: number, id: number) {
    const transaksi = await this.prisma.transaksi.findUnique({
      where: { id },
      include: { siswa: true },
    });

    if (!transaksi) throw new NotFoundException('Transaksi tidak ditemukan');

    if (transaksi.siswa.userId !== userId)
      throw new ForbiddenException('Bukan transaksi milik kamu');

    if (transaksi.metode_pembayaran === 'cash')
      throw new BadRequestException('Cash dibayar di tempat');

    return this.prisma.transaksi.update({
      where: { id },
      data: {
        status_pembayaran: 'menunggu_konfirmasi',
      },
    });
  }

  async konfirmasiPembayaran(userId: number, id: number) {
    const transaksi = await this.prisma.transaksi.findUnique({
      where: { id },
      include: { stan: true },
    });

    if (!transaksi) throw new NotFoundException('Transaksi tidak ditemukan');

    if (transaksi.stan.userId !== userId)
      throw new ForbiddenException('Tidak punya akses');

    return this.prisma.transaksi.update({
      where: { id },
      data: {
        status_pembayaran: 'dibayar',
      },
    });
  }

  async bayarCash(userId: number, id: number) {
    const transaksi = await this.prisma.transaksi.findUnique({
      where: { id },
      include: { stan: true },
    });

    if (!transaksi) throw new NotFoundException('Transaksi tidak ditemukan');

    if (transaksi.stan.userId !== userId)
      throw new ForbiddenException('Tidak punya akses');

    return this.prisma.transaksi.update({
      where: { id },
      data: {
        status_pembayaran: 'dibayar',
      },
    });
  }

  async generateStrukPdf(id: number, res: Response) {
    const transaksi = await this.prisma.transaksi.findUnique({
      where: { id },
      include: {
        stan: true,
        detail: {
          include: { menu: true },
        },
      },
    });

    if (!transaksi) throw new NotFoundException('Transaksi tidak ditemukan');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const doc = new PDFDocument({ size: 'A6', margin: 10 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=struk-${id}.pdf`);

    doc.pipe(res);

    doc.fontSize(14).text('e-KANTIN', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).text(`Stan: ${transaksi.stan.nama_stan}`);
    doc.text(`Tanggal: ${transaksi.tanggal.toLocaleString()}`);
    doc.moveDown();

    doc.text('--------------------------');

    transaksi.detail.forEach((item) => {
      const subtotal = item.qty * item.harga_beli;

      doc.text(item.menu.nama);
      doc.text(
        `${item.qty} x ${this.formatRupiah(item.harga_beli)} = ${this.formatRupiah(subtotal)}`,
      );
    });

    doc.text('--------------------------');
    doc.moveDown();

    doc.text(`Total: ${this.formatRupiah(transaksi.total_harga)}`);
    doc.text(`Metode: ${transaksi.metode_pembayaran}`);
    doc.text(`Status: ${transaksi.status_pembayaran}`);

    doc.end();
  }
}
