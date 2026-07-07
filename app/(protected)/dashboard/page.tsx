// app/(protected)/dashboard/page.tsx
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const totalPenawaran = await prisma.quotation.count();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-primary">
          Dashboard
        </h1>
        <p className="text-xs md:text-sm text-primary/70">
          Ringkasan sistem penawaran harga.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white border border-muted rounded-lg p-4 shadow-sm">
          <p className="text-xs text-primary/60">Total Penawaran</p>
          <p className="text-3xl font-semibold text-primary mt-1">
            {totalPenawaran}
          </p>
        </div>
      </div>
    </div>
  );
}
