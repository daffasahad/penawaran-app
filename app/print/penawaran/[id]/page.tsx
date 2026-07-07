// app/print/penawaran/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";

type RouteParams = Promise<{ id: string }>;

type QuotationItemType = {
  id: number;
  deskripsi: string;
  ukuran: string | null;
  harga: number;
  pcs: number;
  total: number;
  keterangan: string | null;
};

export default async function PenawaranPrintPage({
  params,
}: {
  params: RouteParams;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) notFound();

  const quotation = await prisma.quotation.findUnique({
    where: { id: numericId },
    include: { items: true },
  });

  if (!quotation) notFound();

  const items = quotation.items as QuotationItemType[];
  const totalSemua = items.reduce(
    (sum: number, item: QuotationItemType) => sum + item.total,
    0
  );

  return (
    <div className="bg-white print:bg-white">
      <div className="print-area max-w-3xl mx-auto bg-white p-10 text-gray-900">
        {/* Header */}
        <div className="flex items-center mb-6">
        {/* Logo di kiri */}
        <div className="w-1/4 flex justify-start">
        <img
            src="/logo/logo.png"
            alt="Logo Kreasi Mandiri Glass"
            className="h-36 w-auto object-contain"
        />
        </div>

        {/* Teks di tengah */}
        <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-900 uppercase">
            KREASI MANDIRI GLASS
        </h1>

        <p className="text-sm mt-1">
            Mengerjakan: Kaca, Aluminium, dan Sunblasting
        </p>

        <p className="text-sm">
            Central Legenda Point Blok I No 6 Batam Centre
        </p>

        <p className="text-sm">
            Telp : 0811779969 | Email : kreasimandiriglass69@gmail.com
        </p>
        </div>

        {/* Spacer kanan supaya layout seimbang */}
        <div className="w-1/4"></div>
        </div>

        <hr className="border border-gray-800 my-4" />

        {/* Info surat */}
        <div className="text-sm space-y-1 mb-4">
          <p>Nomor : {quotation.nomor}</p>
          <p>Lampiran : {quotation.lampiran}</p>
          <p>
            Tanggal:{" "}
            {quotation.tanggal.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p>Hal : Penawaran Harga</p>
        </div>

        {/* Tujuan */}
        <div className="text-sm space-y-1 mb-4">
          <p>Kepada Yth,</p>
          <p className="font-medium">{quotation.kepadaYth}</p>
          <p>Di tempat</p>
        </div>

        {/* Pembuka */}
        <div className="text-sm space-y-2 mb-4">
          <p>Dengan hormat,</p>
          <p>
            Dengan ini kami mengajukan penawaran harga. Adapun perincian
            sebagai berikut:
          </p>
        </div>

        {/* Tabel */}
        <table className="w-full text-xs border border-black mb-4">
          <thead>
            <tr className="bg-gray-100 print:bg-white">
              <th className="border border-black px-2 py-1 text-left">No</th>
              <th className="border border-black px-2 py-1 text-left">
                Deskripsi
              </th>
              <th className="border border-black px-2 py-1 text-left w-24">
                Ukuran
              </th>
              <th className="border border-black px-2 py-1 text-right w-28">
                Harga
              </th>
              <th className="border border-black px-2 py-1 text-right w-16">
                Pcs
              </th>
              <th className="border border-black px-2 py-1 text-right w-32">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-black px-2 py-1">{index + 1}</td>
                <td className="border border-black px-2 py-1">
                  {item.deskripsi}
                </td>
                <td className="border border-black px-2 py-1">
                  {item.ukuran || "-"}
                </td>
                <td className="border border-black px-2 py-1 text-right">
                  Rp {item.harga.toLocaleString("id-ID")}
                </td>
                <td className="border border-black px-2 py-1 text-right">
                  {item.pcs}
                </td>
                <td className="border border-black px-2 py-1 text-right">
                  Rp {item.total.toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td
                colSpan={5}
                className="border border-black px-2 py-1 text-right"
              >
                Total
              </td>
              <td className="border border-black px-2 py-1 text-right">
                Rp {totalSemua.toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Penutup */}
        <div className="text-sm space-y-2 mb-6">
          <p>
            Demikian penawaran ini kami sampaikan, besar harapan kami dapat
            mempertimbangkan penawaran ini. Atas perhatian dan kerjasamanya
            kami ucapkan terima kasih.
          </p>
        </div>

        {/* Catatan Pembayaran */}
        <div className="text-sm mt-4 mb-10">
          <p className="font-semibold text-red-500">Catatan Pembayaran:</p>
          <p className="mt-1">
            Pembayaran dilakukan dengan ketentuan sebagai berikut:
          </p>
          <ul className="mt-2 list-disc ml-6 space-y-1">
            <li>DP 30% dibayarkan di muka sebelum pekerjaan dimulai.</li>
            <li>
              Sisa 70% dibayarkan setelah pekerjaan selesai dan disetujui.
            </li>
          </ul>
        </div>

        {/* Tanda tangan */}
        <div className="text-sm text-gray-900 flex justify-end">
          <div className="text-center">
            <p className="font-medium">Hormat Saya,</p>
            <div className="mt-12">
              <p className="font-semibold border-t-2 border-black pt-1 inline-block px-8">
                Samsir
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
