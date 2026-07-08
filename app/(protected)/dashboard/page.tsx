// app/(protected)/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { getNotaStatusSummary } from "@/lib/dashboard";

export default async function DashboardPage() {
  const totalPenawaran = await prisma.quotation.count();
  const { summary, totalNota } = await getNotaStatusSummary();

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-primary">
          Dashboard
        </h1>
        <p className="text-xs md:text-sm text-primary/70">
          Ringkasan sistem penawaran harga.
        </p>
      </div>

      {/* Section: Penawaran */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-primary/80">
          Penawaran
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white border border-muted rounded-lg p-4 shadow-sm">
            <p className="text-xs text-primary/60">Total Penawaran</p>
            <p className="text-3xl font-semibold text-primary mt-1">
              {totalPenawaran}
            </p>
          </div>
        </div>
      </div>

      {/* Section: Nota */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-primary/80">
          Nota
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white border border-muted rounded-lg p-4 shadow-sm">
            <p className="text-xs text-primary/60">Total Nota</p>
            <p className="text-3xl font-semibold text-primary mt-1">
              {totalNota}
            </p>
          </div>

          <div className="bg-white border-l-4 border-l-green-500 border border-muted rounded-lg p-4 shadow-sm">
            <p className="text-xs text-primary/60">Lunas</p>
            <p className="text-2xl font-semibold text-green-600 mt-1">
              {summary.LUNAS.count}
            </p>
            <p className="text-xs text-primary/50 mt-1">
              {formatRupiah(summary.LUNAS.total)}
            </p>
          </div>

          <div className="bg-white border-l-4 border-l-yellow-500 border border-muted rounded-lg p-4 shadow-sm">
            <p className="text-xs text-primary/60">DP</p>
            <p className="text-2xl font-semibold text-yellow-600 mt-1">
              {summary.DP.count}
            </p>
            <p className="text-xs text-primary/50 mt-1">
              {formatRupiah(summary.DP.total)}
            </p>
          </div>

          <div className="bg-white border-l-4 border-l-red-500 border border-muted rounded-lg p-4 shadow-sm">
            <p className="text-xs text-primary/60">Belum Bayar</p>
            <p className="text-2xl font-semibold text-red-600 mt-1">
              {summary.BELUM_BAYAR.count}
            </p>
            <p className="text-xs text-primary/50 mt-1">
              {formatRupiah(summary.BELUM_BAYAR.total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}