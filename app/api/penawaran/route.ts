// app/api/penawaran/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        items: true,
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    const listWithTotal = quotations.map((q) => {
    // Pastikan q.items ada dan merupakan array
    const total = (q.items || []).reduce((sum: number, item: any) => {
        // Gunakan nilai 0 jika item.total tidak ada atau bukan angka
        const itemTotal = typeof item.total === 'number' ? item.total : 0;
        return sum + itemTotal;
    }, 0);

    return {
        id: q.id,
        nomor: q.nomor,
        tanggal: q.tanggal,
        kepadaYth: q.kepadaYth,
        total: total,
    };
});
    
    return NextResponse.json(listWithTotal, { status: 200 });
  } catch (error) {
    console.error("GET /api/penawaran error:", error);
    return NextResponse.json(
      { message: "Gagal memuat daftar penawaran", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tanggal, kepadaYth, lampiran, items } = body as {
      tanggal: string;
      kepadaYth: string;
      lampiran?: string;
      items: {
        deskripsi: string;
        ukuran?: string;
        harga: number;
        pcs: number;
        keterangan?: string;
      }[];
    };

    if (!tanggal || !kepadaYth || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const tglObj = new Date(tanggal);
    
    // Generate nomor otomatis: PN-XXX/KMG/MM/YYYY
    const year = tglObj.getFullYear();
    const monthNames = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const monthRoman = monthNames[tglObj.getMonth()];
    const monthNumber = String(tglObj.getMonth() + 1).padStart(2, '0');
    
    // Cari nomor terakhir di bulan yang sama
    const lastQuotation = await prisma.quotation.findFirst({
      where: {
        nomor: {
          contains: `/KMG/${monthRoman}/${year}`,
        },
      },
      orderBy: {
        nomor: 'desc',
      },
    });

    let newNumber = 1;
    if (lastQuotation) {
      // Extract nomor dari format PN-XXX/KMG/XI/2025
      const match = lastQuotation.nomor.match(/^PN-(\d+)\//);
      if (match) {
        newNumber = parseInt(match[1]) + 1;
      }
    }

    const nomor = `PN-${String(newNumber).padStart(3, '0')}/KMG/${monthRoman}/${year}`;

    const newQuotation = await prisma.quotation.create({
      data: {
        nomor,
        tanggal: tglObj,
        kepadaYth,
        lampiran: lampiran || "-",
        items: {
          create: items.map((item) => ({
            deskripsi: item.deskripsi,
            ukuran: item.ukuran || "",
            harga: item.harga,
            pcs: item.pcs,
            total: item.harga * item.pcs,
            keterangan: item.keterangan || "",
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(newQuotation, { status: 201 });
  } catch (error) {
    console.error("POST /api/penawaran error:", error);
    return NextResponse.json(
      { message: "Gagal membuat penawaran", error: String(error) },
      { status: 500 }
    );
  }
}