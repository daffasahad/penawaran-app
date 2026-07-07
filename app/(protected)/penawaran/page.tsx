// app/(protected)/penawaran/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, FileText, Trash2 } from "lucide-react";

type Item = {
  deskripsi: string;
  ukuran: string;
  harga: string;
  pcs: string;
  keterangan: string;
};

type QuotationListItem = {
  id: number;
  nomor: string;
  tanggal: string;
  kepadaYth: string;
  total: number;
};

type QuotationDetail = {
  id: number;
  nomor: string;
  tanggal: string;
  kepadaYth: string;
  lampiran: string;
  items: {
    id: number;
    deskripsi: string;
    ukuran: string;
    harga: number;
    pcs: number;
    keterangan: string;
  }[];
};

const emptyItem: Item = {
  deskripsi: "",
  ukuran: "",
  harga: "",
  pcs: "",
  keterangan: "",
};

export default function PenawaranPage() {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [tanggal, setTanggal] = useState("");
  const [kepadaYth, setKepadaYth] = useState("");
  const [lampiran, setLampiran] = useState("-");
  const [items, setItems] = useState<Item[]>([{ ...emptyItem }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [list, setList] = useState<QuotationListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  function handleItemChange(index: number, field: keyof Item, value: string) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addRow() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totalSemua = items.reduce((sum, item) => {
    const harga = Number(item.harga || 0);
    const pcs = Number(item.pcs || 0);
    return sum + harga * pcs;
  }, 0);

  async function loadList() {
    setLoadingList(true);
    try {
      const res = await fetch("/api/penawaran");
      if (!res.ok) throw new Error("Gagal memuat daftar penawaran");
      const data: QuotationListItem[] = await res.json();
      setList(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadList();
  }, []);

  function openAddModal() {
    setEditMode(false);
    setEditId(null);
    setTanggal("");
    setKepadaYth("");
    setLampiran("-");
    setItems([{ ...emptyItem }]);
    setSuccessMsg("");
    setErrorMsg("");
    setShowModal(true);
  }

  async function openEditModal(id: number) {
    try {
      const res = await fetch(`/api/penawaran/${id}`);
      if (!res.ok) throw new Error("Gagal memuat data penawaran");

      const data: QuotationDetail = await res.json();

      setEditMode(true);
      setEditId(id);
      setTanggal(data.tanggal.split("T")[0]);
      setKepadaYth(data.kepadaYth);
      setLampiran(data.lampiran);

      setItems(
        data.items.map((item) => ({
          deskripsi: item.deskripsi,
          ukuran: item.ukuran,
          harga: String(item.harga),
          pcs: String(item.pcs),
          keterangan: item.keterangan,
        }))
      );

      setSuccessMsg("");
      setErrorMsg("");
      setShowModal(true);
    } catch (err: any) {
      alert(err.message);
    }
  }

  function closeModal() {
    setShowModal(false);
    setEditMode(false);
    setEditId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload = {
        tanggal,
        kepadaYth,
        lampiran,
        items: items
          .filter((i) => i.deskripsi && i.harga && i.pcs)
          .map((i) => ({
            deskripsi: i.deskripsi,
            ukuran: i.ukuran,
            harga: Number(i.harga),
            pcs: Number(i.pcs),
            keterangan: i.keterangan,
          })),
      };

      const url = editMode ? `/api/penawaran/${editId}` : "/api/penawaran";
      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gagal menyimpan penawaran");
      }

      setSuccessMsg(
        editMode ? "Penawaran berhasil diupdate." : "Penawaran berhasil dibuat."
      );

      setTimeout(() => {
        closeModal();
        loadList();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = window.confirm("Yakin ingin menghapus penawaran ini?");
    if (!ok) return;

    try {
      setDeleteLoadingId(id);
      const res = await fetch(`/api/penawaran/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus penawaran");
      await loadList();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleteLoadingId(null);
    }
  }

  function handleOpenPdf(id: number) {
    window.open(`/api/penawaran/${id}/pdf`, "_blank");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">
            Daftar Penawaran Harga
          </h1>
          <p className="text-sm text-primary/70">
            Kelola semua penawaran harga Anda
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded bg-primary text-light text-sm font-medium hover:bg-secondary transition"
        >
          + Tambah Data
        </button>
      </div>

      {/* LIST PENAWARAN */}
      <div className="bg-white border border-[#bdbdbd] rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#444]">Semua Penawaran</h2>
          {loadingList && (
            <span className="text-xs text-[#666]">Memuat...</span>
          )}
        </div>

        {list.length === 0 ? (
          <p className="text-xs text-[#666]">
            Belum ada penawaran yang dibuat.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#e6e6e6] text-[#444] font-semibold">
                  <th className="border border-[#bdbdbd] px-2 py-2 text-left">
                    Nomor
                  </th>
                  <th className="border border-[#bdbdbd] px-2 py-2 text-left">
                    Tanggal
                  </th>
                  <th className="border border-[#bdbdbd] px-2 py-2 text-left">
                    Kepada Yth
                  </th>
                  <th className="border border-[#bdbdbd] px-2 py-2 text-right">
                    Total
                  </th>
                  <th className="border border-[#bdbdbd] px-2 py-2 text-center w-36">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="text-[#333]">
                {list.map((q: QuotationListItem) => (
                  <tr key={q.id} className="hover:bg-[#f5f5f5] transition">
                    <td className="border border-[#ddd] px-2 py-2">{q.nomor}</td>

                    <td className="border border-[#ddd] px-2 py-2">
                      {new Date(q.tanggal).toLocaleDateString("id-ID")}
                    </td>

                    <td className="border border-[#ddd] px-2 py-2">
                      {q.kepadaYth}
                    </td>

                    <td className="border border-[#ddd] px-2 py-2 text-right font-medium text-primary">
                      Rp {q.total.toLocaleString("id-ID")}
                    </td>

                    <td className="border border-[#ddd] px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(q.id)}
                          className="p-1 rounded hover:bg-[#e5e7eb]"
                        >
                          <Pencil className="w-4 h-4 text-[#4b5563]" />
                        </button>

                        <button
                          onClick={() => handleOpenPdf(q.id)}
                          className="p-1 rounded hover:bg-[#e5e7eb]"
                        >
                          <FileText className="w-4 h-4 text-[#4b5563]" />
                        </button>

                        <button
                          onClick={() => handleDelete(q.id)}
                          disabled={deleteLoadingId === q.id}
                          className="p-1 rounded hover:bg-red-50 disabled:cursor-not-allowed"
                        >
                          <Trash2
                            className={`w-4 h-4 ${
                              deleteLoadingId === q.id
                                ? "text-red-500 opacity-50"
                                : "text-red-600"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* HEADER MODAL */}
            <div className="sticky top-0 bg-white border-b border-[#ddd] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">
                {editMode ? "Edit Penawaran" : "Tambah Penawaran Baru"}
              </h2>
              <button
                onClick={closeModal}
                className="text-[#666] hover:text-[#333] text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {successMsg && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* INFORMASI SURAT */}
                <div className="bg-[#f9f9f9] border border-muted rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-primary">
                    Informasi Surat
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <label className="block text-primary">Nomor</label>
                      <input
                        disabled
                        value={
                          editMode && editId
                            ? "Tidak berubah"
                            : "Otomatis saat disimpan"
                        }
                        className="w-full border border-muted rounded px-3 py-2 bg-light text-xs text-primary/70"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-primary">Lampiran</label>
                      <input
                        value={lampiran}
                        onChange={(e) => setLampiran(e.target.value)}
                        placeholder="Contoh: 1 (satu) berkas / -"
                        className="w-full border border-muted rounded px-3 py-2 text-sm text-black placeholder-gray-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-primary">Tanggal</label>
                      <input
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        className="w-full border border-muted rounded px-3 py-2 text-sm text-black placeholder-gray-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-primary">Hal</label>
                      <input
                        disabled
                        value="Penawaran Harga"
                        className="w-full border border-muted rounded px-3 py-2 bg-light text-xs text-primary/70"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-primary">Kepada Yth</label>
                      <input
                        value={kepadaYth}
                        onChange={(e) => setKepadaYth(e.target.value)}
                        placeholder="Nama penerima"
                        required
                        className="w-full border border-muted rounded px-3 py-2 text-sm text-black placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* TABEL ITEM */}
                <div className="bg-[#f9f9f9] border border-muted rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-primary">
                    Rincian Penawaran
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted text-[#444] font-semibold">
                          <th className="border border-[#888] px-2 py-1 w-8">
                            No
                          </th>
                          <th className="border border-[#888] px-2 py-1 text-left">
                            Deskripsi
                          </th>
                          <th className="border border-[#888] px-2 py-1 w-28">
                            Ukuran
                          </th>
                          <th className="border border-[#888] px-2 py-1 w-32">
                            Keterangan
                          </th>
                          <th className="border border-[#888] px-2 py-1 text-right w-28">
                            Harga
                          </th>
                          <th className="border border-[#888] px-2 py-1 text-right w-16">
                            Pcs
                          </th>
                          <th className="border border-[#888] px-2 py-1 text-right w-32">
                            Total
                          </th>
                          <th className="border border-[#888] px-2 py-1 w-10"></th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item, index) => {
                          const total =
                            Number(item.harga || 0) *
                            Number(item.pcs || 0);

                          return (
                            <tr key={index}>
                              <td className="border border-[#ccc] px-2 py-1">
                                {index + 1}
                              </td>

                              <td className="border border-[#ccc] px-2 py-1">
                                <textarea
                                  rows={2}
                                  value={item.deskripsi}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "deskripsi",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Deskripsi pekerjaan / material"
                                  className="w-full border border-[#ccc] rounded px-2 py-1 text-xs text-black placeholder-gray-500"
                                />
                              </td>

                              <td className="border border-[#ccc] px-2 py-1">
                                <input
                                  value={item.ukuran}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "ukuran",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ukuran"
                                  className="w-full border border-[#ccc] rounded px-2 py-1 text-xs text-black placeholder-gray-500"
                                />
                              </td>

                              <td className="border border-[#ccc] px-2 py-1">
                                <input
                                  value={item.keterangan}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "keterangan",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Keterangan"
                                  className="w-full border border-[#ccc] rounded px-2 py-1 text-xs text-black placeholder-gray-500"
                                />
                              </td>

                              <td className="border border-[#ccc] px-2 py-1 text-right">
                                <input
                                  value={item.harga}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "harga",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  className="w-full border border-[#ccc] rounded px-2 py-1 text-xs text-right text-black placeholder-gray-500"
                                />
                              </td>

                              <td className="border border-[#ccc] px-2 py-1 text-right">
                                <input
                                  value={item.pcs}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "pcs",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  className="w-full border border-[#ccc] rounded px-2 py-1 text-xs text-right text-black placeholder-gray-500"
                                />
                              </td>

                              <td className="border border-[#ccc] px-2 py-1 text-right font-semibold text-primary">
                                Rp {total.toLocaleString("id-ID")}
                              </td>

                              <td className="border border-[#ccc] px-2 py-1 text-center">
                                {items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeRow(index)}
                                    className="text-xs text-red-600 hover:underline"
                                  >
                                    Hapus
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={addRow}
                    className="mt-2 text-xs text-primary"
                  >
                    + Tambah baris
                  </button>

                  <div className="flex justify-end mt-4 text-sm">
                    <div className="text-right">
                      <p className="text-primary/70">Total</p>
                      <p className="text-lg font-semibold text-primary">
                        Rp {totalSemua.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded border border-[#bdbdbd] text-[#444] hover:bg-[#f5f5f5]"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded bg-primary text-light text-sm font-medium disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Menyimpan..."
                      : editMode
                      ? "Update Penawaran"
                      : "Simpan Penawaran"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
