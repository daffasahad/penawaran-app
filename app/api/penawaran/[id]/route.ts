// app/api/penawaran/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { id: string };

export async function GET(
  req: Request,
  { params }: { params: RouteParams }
) {
  const { id } = params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
  }

  const quotation = await prisma.quotation.findUnique({
    where: { id: numericId },
    include: { items: true },
  });

  if (!quotation) {
    return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(quotation);
}

// PUT /api/penawaran/:id  -> update penawaran dari form modal
export async function PUT(
  req: Request,
  { params }: { params: RouteParams }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
  }

  const body = await req.json();

  const { tanggal, kepadaYth, lampiran, items } = body as {
    tanggal: string;
    kepadaYth: string;
    lampiran: string;
    items: {
      deskripsi: string;
      ukuran: string;
      harga: number;
      pcs: number;
      keterangan: string;
    }[];
  };

  const tanggalDate = new Date(tanggal);

  const quotation = await prisma.quotation.update({
    where: { id: numericId },
    data: {
      tanggal: tanggalDate,
      kepadaYth,
      lampiran,
      items: {
        // hapus semua item lama lalu buat ulang dari payload
        deleteMany: {},
        create: items.map((item) => ({
          deskripsi: item.deskripsi,
          ukuran: item.ukuran,
          harga: item.harga,
          pcs: item.pcs,
          total: item.harga * item.pcs,
          keterangan: item.keterangan,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(quotation);
}

// DELETE /api/penawaran/:id  -> hapus penawaran
export async function DELETE(
  req: Request,
  { params }: { params: RouteParams }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
  }

  await prisma.quotation.delete({
    where: { id: numericId },
  });

  return NextResponse.json({ success: true });
}
