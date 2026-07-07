import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Detail nota by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const nota = await prisma.nota.findUnique({
      where: { id: params.id },
      include: {
        items: {
          orderBy: { no: "asc" },
        },
      },
    });

    if (!nota) {
      return NextResponse.json({ error: "Nota not found" }, { status: 404 });
    }

    return NextResponse.json(nota);
  } catch (error) {
    console.error("Error fetching nota:", error);
    return NextResponse.json(
      { error: "Failed to fetch nota" },
      { status: 500 }
    );
  }
}

// PUT - Update nota
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { kepadaYth, noTelp, tanggal, items, dp } = body;

    // Hitung total
    const total = items.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.jumlah);
    }, 0);

    const dpAmount = dp ? parseFloat(dp) : 0;
    const sisa = total - dpAmount;

    // Delete items lama, create items baru
    await prisma.notaItem.deleteMany({
      where: { notaId: params.id },
    });

    const nota = await prisma.nota.update({
      where: { id: params.id },
      data: {
        tanggal: tanggal ? new Date(tanggal) : undefined,
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

    return NextResponse.json(nota);
  } catch (error) {
    console.error("Error updating nota:", error);
    return NextResponse.json(
      { error: "Failed to update nota" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus nota
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.nota.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Nota deleted successfully" });
  } catch (error) {
    console.error("Error deleting nota:", error);
    return NextResponse.json(
      { error: "Failed to delete nota" },
      { status: 500 }
    );
  }
}