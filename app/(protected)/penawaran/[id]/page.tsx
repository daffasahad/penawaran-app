// app/(protected)/penawaran/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";

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

export default async function PenawaranDetailPage({
  params,
}: {
  params: RouteParams;
}) {
  // params adalah Promise → harus di-await
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

  // 🔹 Gabungkan semua keterangan item jadi satu blok teks
  const keteranganGabung = items
    .map((it) => it.keterangan?.trim())
    .filter(Boolean)
    .join("\n");

  return (
    <div className="max-w-4xl mx-auto bg-white border border-[#bdbdbd] rounded-lg p-8 space-y-4 print:border-none print:rounded-none print:max-w-full">
      {/* Header + tombol cetak (disembunyikan saat print) */}
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-lg font-semibold text-primary">
          Surat Penawaran Harga
        </h1>
        <PrintButton className="px-3 py-1 text-xs rounded bg-primary text-light hover:bg-secondary" />
      </div>

      {/* Header perusahaan */}
      <div className="text-center text-xs leading-tight mb-4">
        <p className="font-semibold text-primary text-sm tracking-wide">
          KREASI MANDIRI GLASS
        </p>
        <p>Mengerjakan Kaca, Aluminium, dan Stainless</p>
        <p>
          Cempaka Ligar Barat Blok 11 No. 5B Bandung
        </p>
        <p>Telp: 08117777969 | Email: kreasimandiriglass@gmail.com</p>
      </div>

      <hr className="border-t border-[#bdbdbd] mb-4" />

      {/* Header surat */}
      <div className="text-sm space-y-1 text-[#333]">
        <p>Nomor : {quotation.nomor}</p>
        <p>Lampiran : {quotation.lampiran}</p>
        <p>
          Tanggal :{" "}
          {quotation.tanggal.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p>Hal : Penawaran Harga</p>
      </div>

      {/* Tujuan surat */}
      <div className="text-sm space-y-1 mt-4 text-[#333]">
        <p>Kepada Yth,</p>
        <p>{quotation.kepadaYth}</p>
        <p>Di tempat</p>
      </div>

      {/* Teks pembuka */}
      <div className="text-sm space-y-2 mt-4 text-[#333]">
        <p>Dengan hormat,</p>
        <p>
          Dengan ini kami mengajukan penawaran harga. Adapun perincian
          sebagai berikut:
        </p>
      </div>

      {/* Tabel item */}
      <div className="mt-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[#e6e6e6] text-[#444] font-semibold">
              <th className="border border-[#bdbdbd] px-2 py-1 text-left w-8">
                No
              </th>
              <th className="border border-[#bdbdbd] px-2 py-1 text-left">
                Deskripsi
              </th>
              <th className="border border-[#bdbdbd] px-2 py-1 text-left w-28">
                Ukuran
              </th>
              <th className="border border-[#bdbdbd] px-2 py-1 text-right w-28">
                Harga
              </th>
              <th className="border border-[#bdbdbd] px-2 py-1 text-right w-16">
                Pcs
              </th>
              <th className="border border-[#bdbdbd] px-2 py-1 text-right w-32">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="text-[#333]">
            {items.map((item: QuotationItemType, index: number) => (
              <tr key={item.id}>
                <td className="border border-[#ddd] px-2 py-1 align-top">
                  {index + 1}
                </td>
                <td className="border border-[#ddd] px-2 py-1 align-top">
                  {item.deskripsi}
                </td>
                <td className="border border-[#ddd] px-2 py-1 align-top">
                  {item.ukuran}
                </td>
                <td className="border border-[#ddd] px-2 py-1 text-right align-top">
                  Rp {item.harga.toLocaleString("id-ID")}
                </td>
                <td className="border border-[#ddd] px-2 py-1 text-right align-top">
                  {item.pcs}
                </td>
                <td className="border border-[#ddd] px-2 py-1 text-right align-top">
                  Rp {item.total.toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
            <tr>
              <td
                colSpan={5}
                className="border border-[#ddd] px-2 py-1 text-right font-semibold"
              >
                Total
              </td>
              <td className="border border-[#ddd] px-2 py-1 text-right font-semibold">
                Rp {totalSemua.toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Penutup */}
      <div className="text-sm space-y-2 mt-4 text-[#333]">
        <p>
          Demikian penawaran ini kami sampaikan, besar harapan kami
          dapat mempertimbangkan penawaran ini. Atas perhatian dan
          kerjasamanya kami ucapkan terima kasih.
        </p>
      </div>

      {/* 🔹 KETERANGAN – diambil dari semua item yang punya keterangan */}
      {keteranganGabung && (
        <div className="mt-4 text-sm text-[#333] leading-relaxed">
          <span className="font-semibold">Keterangan : </span>
          <span className="whitespace-pre-line">
            {keteranganGabung}
          </span>
        </div>
      )}

      {/* Catatan Pembayaran */}
      <div className="mt-4 text-sm border-l-4 border-primary bg-[#f7f7f7] px-4 py-3">
        <p className="font-semibold mb-1">Catatan Pembayaran:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>DP 30% dibayarkan di muka sebelum pekerjaan dimulai.</li>
          <li>
            Sisa 70% dibayarkan setelah pekerjaan selesai dan disetujui.
          </li>
        </ul>
      </div>

      {/* Tanda tangan */}
      <div className="text-sm mt-6 flex justify-end text-[#333]">
        <div className="text-right space-y-1">
          <p>Hormat Saya,</p>
          <p className="mt-10 font-semibold">Samsir</p>
        </div>
      </div>
    </div>
  );
}
