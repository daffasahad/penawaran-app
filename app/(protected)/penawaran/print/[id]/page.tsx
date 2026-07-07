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
    <div className="bg-white print:bg-white flex justify-center">
      {/* kertas A4 */}
      <div className="print-page text-gray-900">
        {/* === KOP SURAT === */}
        <div className="flex items-center mb-3">
          {/* Logo lebih besar di kiri */}
          <div className="w-24 h-24 flex items-center justify-start">
            <Image
              src="/logo/logo.png"
              alt="Logo Kreasi Mandiri Glass"
              width={96}
              height={96}
              className="object-contain"
            />
          </div>

          {/* Judul & alamat di tengah */}
          <div className="flex-1 text-center leading-tight">
            <h1 className="text-2xl font-extrabold tracking-wide uppercase">
              KREASI MANDIRI GLASS
            </h1>
            <p className="text-sm mt-1">
              Mengerjakan: Kaca, Aluminium, dan Subkontraktor
            </p>
            <p className="text-[11px] mt-1">
              Central Legenda Point Blok I No 6 Batam Centre
              <br />
              Telp 0811 7799 69 &nbsp;|&nbsp; kreasimandiriglass69@gmail.com
            </p>
          </div>

          {/* Spacer kanan untuk menyeimbangkan flex (supaya teks tetap center) */}
          <div className="w-24" />
        </div>

        {/* Garis pemisah kop */}
        <hr className="border-t-2 border-gray-800 mb-6" />

        {/* === ISI SURAT === */}
        {/* Info surat */}
        <div className="text-sm space-y-1 mb-4">
          <p>Nomor : {quotation.nomor}</p>
          <p>Lampiran : {quotation.lampiran}</p>
          <p>
            Tanggal :{" "}
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

        {/* Tabel penawaran */}
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
        <div className="text-sm space-y-2 mb-10">
          <p>
            Demikian penawaran ini kami sampaikan, besar harapan kami dapat
            mempertimbangkan penawaran ini. Atas perhatian dan kerjasamanya kami
            ucapkan terima kasih.
          </p>
        </div>

        {/* Tanda tangan */}
        <div className="text-sm text-gray-900 flex justify-end">
          <div className="text-center">
            <p className="font-medium mb-12">Hormat Saya,</p>
            <p className="font-semibold border-t-2 border-black pt-1 inline-block px-8">
              Samsir
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
