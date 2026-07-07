import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateNomorNota } from "@/lib/generate-nomor-nota";

// GET - List semua nota
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notas = await prisma.nota.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    return NextResponse.json(notas);
  } catch (error) {
    console.error("Error fetching notas:", error);
    return NextResponse.json(
      { error: "Failed to fetch notas" },
      { status: 500 }
    );
  }
}

// POST - Create nota baru
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { kepadaYth, noTelp, tanggal, items, dp } = body;

    // Validasi
    if (!kepadaYth || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Generate nomor nota
    const nomorNota = await generateNomorNota();

    // Hitung total
    const total = items.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.jumlah);
    }, 0);

    const dpAmount = dp ? parseFloat(dp) : 0;
    const sisa = total - dpAmount;

    // Create nota dengan items
    const nota = await prisma.nota.create({
      data: {
        nomorNota,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        kepadaYth,
        noTelp,
        total,
        dp: dpAmount,
        sisa,
        items: {
          create: items.map((item: any, index: number) => ({
            no: index + 1,
            jenisBarang: item.jenisBarang,
            qty: parseInt(item.qty),
            harga: parseFloat(item.harga),
            jumlah: parseFloat(item.jumlah),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(nota, { status: 201 });
  } catch (error) {
    console.error("Error creating nota:", error);
    return NextResponse.json(
      { error: "Failed to create nota" },
      { status: 500 }
    );
  }
}