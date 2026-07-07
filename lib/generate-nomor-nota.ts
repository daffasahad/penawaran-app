// lib/generate-nomor-nota.ts
import { prisma } from "@/lib/prisma";

export async function generateNomorNota(): Promise<number> {
  const lastNota = await prisma.nota.findFirst({
    orderBy: { nomorNota: 'desc'},
    select: { nomorNota: true }
  });
  
  return lastNota ? lastNota.nomorNota + 1 : 0;
}