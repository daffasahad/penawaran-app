// lib/dashboard.ts
import { prisma } from "@/lib/prisma";

export async function getNotaStatusSummary() {
  const notas = await prisma.nota.findMany({
    select: { dp: true, sisa: true, total: true },
  });

  const summary = {
    LUNAS: { count: 0, total: 0 },
    DP: { count: 0, total: 0 },
    BELUM_BAYAR: { count: 0, total: 0 },
  };

  for (const nota of notas) {
    const dp = Number(nota.dp);
    const sisa = Number(nota.sisa);
    const total = Number(nota.total);

    if (sisa <= 0) {
      summary.LUNAS.count += 1;
      summary.LUNAS.total += total;
    } else if (dp > 0) {
      summary.DP.count += 1;
      summary.DP.total += total;
    } else {
      summary.BELUM_BAYAR.count += 1;
      summary.BELUM_BAYAR.total += total;
    }
  }

  const totalNota = notas.length;

  return { summary, totalNota };
}