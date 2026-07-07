"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileText, Pencil, Trash2 } from "lucide-react";

interface Nota {
  id: string;
  nomorNota: number;
  tanggal: string;
  kepadaYth: string;
  noTelp?: string;
  total: number;
  dp: number;
  sisa: number;
}

interface NotaItem {
  no: number;
  jenisBarang: string;
  qty: number;
  harga: number;
  jumlah: number;
}

interface NotaDetail extends Nota {
  items: NotaItem[];
}

const emptyItem: NotaItem = {
  no: 1,
  jenisBarang: "",
  qty: 1,
  harga: 0,
  jumlah: 0,
};

export default function NotaPage() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [kepadaYth, setKepadaYth] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState<NotaItem[]>([{ ...emptyItem }]);
  const [dp, setDp] = useState(0);

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/nota");
      if (!res.ok) throw new Error("Gagal memuat daftar nota");

      const data = await res.json();
      setNotas(data);
    } catch (error) {
      console.error("Error fetching notas:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setKepadaYth("");
    setNoTelp("");
    setTanggal(new Date().toISOString().split("T")[0]);
    setItems([{ ...emptyItem }]);
    setDp(0);
    setSuccessMsg("");
    setErrorMsg("");
  };

  const openAddModal = () => {
    resetForm();
    setEditMode(false);
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = async (id: string) => {
    try {
      setSuccessMsg("");
      setErrorMsg("");

      const res = await fetch(`/api/nota/${id}`);
      if (!res.ok) throw new Error("Gagal memuat data nota");

      const data: NotaDetail = await res.json();

      setEditMode(true);
      setEditId(id);
      setKepadaYth(data.kepadaYth || "");
      setNoTelp(data.noTelp || "");
      setTanggal(new Date(data.tanggal).toISOString().split("T")[0]);
      setDp(Number(data.dp || 0));

      setItems(
        data.items?.length
          ? data.items.map((item, index) => ({
              no: index + 1,
              jenisBarang: item.jenisBarang || "",
              qty: Number(item.qty || 0),
              harga: Number(item.harga || 0),
              jumlah:
                Number(item.jumlah || 0) ||
                Number(item.qty || 0) * Number(item.harga || 0),
            }))
          : [{ ...emptyItem }]
      );

      setShowModal(true);
    } catch (error: any) {
      alert(error.message || "Gagal memuat data nota");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setEditId(null);
    resetForm();
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        ...emptyItem,
        no: prev.length + 1,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;

    setItems((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          no: i + 1,
        }))
    );
  };

  const updateItem = (
    index: number,
    field: keyof NotaItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const next = [...prev];
      const updated = { ...next[index], [field]: value };

      if (field === "qty" || field === "harga") {
        updated.jumlah = Number(updated.qty || 0) * Number(updated.harga || 0);
      }

      next[index] = updated;
      return next;
    });
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + Number(item.jumlah || 0), 0);
  };

  const calculateSisa = () => {
    return calculateTotal() - Number(dp || 0);
  };

  const formatRupiah = (amount: number) => {
    return `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;
  };

  const formatNumberInput = (amount: number) => {
    if (!amount) return "";
    return Number(amount || 0).toLocaleString("id-ID");
  };

  const parseNumberInput = (value: string) => {
    return Number(value.replace(/\./g, "").replace(/[^0-9]/g, "")) || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!kepadaYth.trim()) {
      setErrorMsg("Nama penerima harus diisi.");
      return;
    }

    if (items.some((item) => !item.jenisBarang.trim())) {
      setErrorMsg("Semua jenis barang harus diisi.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        kepadaYth,
        noTelp: noTelp || "",
        tanggal,
        items: items.map((item, index) => ({
          no: index + 1,
          jenisBarang: item.jenisBarang,
          qty: Number(item.qty || 0),
          harga: Number(item.harga || 0),
          jumlah: Number(item.qty || 0) * Number(item.harga || 0),
        })),
        dp: Number(dp || 0),
      };

      const url = editMode ? `/api/nota/${editId}` : "/api/nota";
      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gagal menyimpan nota");
      }

      setSuccessMsg(editMode ? "Nota berhasil diupdate." : "Nota berhasil dibuat.");

      setTimeout(() => {
        closeModal();
        fetchNotas();
      }, 800);
    } catch (error: any) {
      setErrorMsg(error.message || "Gagal menyimpan nota");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Yakin ingin menghapus nota ini?");
    if (!ok) return;

    try {
      setDeleteLoadingId(id);

      const res = await fetch(`/api/nota/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus nota");

      await fetchNotas();
    } catch (error: any) {
      alert(error.message || "Gagal menghapus nota");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleOpenPdf = (id: string) => {
    window.open(`/api/nota/${id}/pdf`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">
            Daftar Nota Pembayaran
          </h1>
          <p className="text-sm text-primary/70">
            Kelola semua nota pembayaran pelanggan
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded bg-primary text-light text-sm font-medium hover:bg-secondary transition"
        >
          + Tambah Data
        </button>
      </div>

      <div className="bg-white border border-[#bdbdbd] rounded-lg p-5 space-y-5">
        <h2 className="text-sm font-semibold text-[#222]">Semua Nota</h2>

        {loading ? (
          <p className="text-sm text-[#666]">Memuat data...</p>
        ) : notas.length === 0 ? (
          <p className="text-sm text-[#666]">Belum ada nota yang dibuat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#e6e6e6] text-[#222] font-semibold">
                  <th className="border border-black px-3 py-2 text-left">Nomor</th>
                  <th className="border border-black px-3 py-2 text-left">Tanggal</th>
                  <th className="border border-black px-3 py-2 text-left">Kepada Yth</th>
                  <th className="border border-black px-3 py-2 text-left">No. Telp</th>
                  <th className="border border-black px-3 py-2 text-left">Total</th>
                  <th className="border border-black px-3 py-2 text-left">DP</th>
                  <th className="border border-black px-3 py-2 text-left">Sisa</th>
                  <th className="border border-black px-3 py-2 text-left">Status</th>
                  <th className="border border-black px-3 py-2 text-center w-32">Aksi</th>
                </tr>
              </thead>

              <tbody className="text-[#111827]">
                {notas.map((nota) => (
                  <tr key={nota.id}>
                    <td className="border border-black px-3 py-2">
                      {String(nota.nomorNota).padStart(4, "0")}
                    </td>

                    <td className="border border-black px-3 py-2">
                      {formatDate(nota.tanggal)}
                    </td>

                    <td className="border border-black px-3 py-2">
                      {nota.kepadaYth}
                    </td>

                    <td className="border border-black px-3 py-2">
                      {nota.noTelp || "-"}
                    </td>

                    <td className="border border-black px-3 py-2 text-primary font-medium">
                      {formatRupiah(nota.total)}
                    </td>

                    <td className="border border-black px-3 py-2">
                      {formatRupiah(nota.dp)}
                    </td>

                    <td className="border border-black px-3 py-2 text-primary font-medium">
                      {formatRupiah(nota.sisa)}
                    </td>

                    <td className="border border-black px-3 py-2">
                      {nota.sisa === 0 ? (
                        <span className="inline-block rounded border border-green-300 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                          Lunas
                        </span>
                      ) : nota.dp > 0 ? (
                        <span className="inline-block rounded border border-yellow-300 bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700">
                          DP
                        </span>
                      ) : (
                        <span className="inline-block rounded border border-red-300 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                          Belum Bayar
                        </span>
                      )}
                    </td>

                    <td className="border border-black px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => openEditModal(nota.id)}
                          className="p-1 rounded hover:bg-[#e5e7eb]"
                          title="Edit Nota"
                        >
                          <Pencil className="w-4 h-4 text-[#4b5563]" />
                        </button>

                        <button
                          onClick={() => handleOpenPdf(nota.id)}
                          className="p-1 rounded hover:bg-[#e5e7eb]"
                          title="Lihat PDF Nota"
                        >
                          <FileText className="w-4 h-4 text-[#4b5563]" />
                        </button>

                        <button
                          onClick={() => handleDelete(nota.id)}
                          disabled={deleteLoadingId === nota.id}
                          className="p-1 rounded hover:bg-red-50 disabled:cursor-not-allowed"
                          title="Hapus Nota"
                        >
                          <Trash2
                            className={`w-4 h-4 ${
                              deleteLoadingId === nota.id
                                ? "text-red-400"
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#ddd] bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-primary">
                {editMode ? "Edit Nota" : "Tambah Nota Baru"}
              </h2>

              <button
                onClick={closeModal}
                className="text-2xl text-[#666] hover:text-[#333]"
                type="button"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {successMsg && (
                <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3 rounded-lg border border-muted bg-[#f9f9f9] p-4">
                  <h3 className="text-sm font-semibold text-primary">
                    Informasi Nota
                  </h3>

                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="block text-primary">Nomor</label>
                      <input
                        disabled
                        value={editMode ? "Tidak berubah" : "Otomatis saat disimpan"}
                        className="w-full rounded border border-muted bg-light px-3 py-2 text-xs text-primary/70"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-primary">Tanggal</label>
                      <input
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        className="w-full rounded border border-muted px-3 py-2 text-sm text-black"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-primary">Kepada Yth</label>
                      <input
                        value={kepadaYth}
                        onChange={(e) => setKepadaYth(e.target.value)}
                        placeholder="Nama penerima"
                        className="w-full rounded border border-muted px-3 py-2 text-sm text-black placeholder-gray-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-primary">No. Telp/HP</label>
                      <input
                        value={noTelp}
                        onChange={(e) => setNoTelp(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="w-full rounded border border-muted px-3 py-2 text-sm text-black placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-muted bg-[#f9f9f9] p-4">
                  <h3 className="text-sm font-semibold text-primary">
                    Rincian Nota
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-muted font-semibold text-[#444]">
                          <th className="w-8 border border-[#888] px-2 py-1">No</th>
                          <th className="border border-[#888] px-2 py-1 text-left">
                            Jenis Barang
                          </th>
                          <th className="w-24 border border-[#888] px-2 py-1 text-right">
                            Qty
                          </th>
                          <th className="w-32 border border-[#888] px-2 py-1 text-right">
                            Harga @
                          </th>
                          <th className="w-32 border border-[#888] px-2 py-1 text-right">
                            Jumlah
                          </th>
                          <th className="w-14 border border-[#888] px-2 py-1"></th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-[#ccc] px-2 py-1">
                              {index + 1}
                            </td>

                            <td className="border border-[#ccc] px-2 py-1">
                              <input
                                value={item.jenisBarang}
                                onChange={(e) =>
                                  updateItem(index, "jenisBarang", e.target.value)
                                }
                                placeholder="Deskripsi barang"
                                className="w-full rounded border border-[#ccc] px-2 py-1 text-xs text-black placeholder-gray-500"
                                required
                              />
                            </td>

                            <td className="border border-[#ccc] px-2 py-1 text-right">
                              <input
                                type="number"
                                value={item.qty}
                                onChange={(e) =>
                                  updateItem(index, "qty", parseInt(e.target.value) || 0)
                                }
                                className="w-full rounded border border-[#ccc] px-2 py-1 text-right text-xs text-black"
                                min="1"
                                required
                              />
                            </td>

                            <td className="border border-[#ccc] px-2 py-1 text-right">
                              <input
                                type="number"
                                value={item.harga}
                                onChange={(e) =>
                                  updateItem(index, "harga", parseFloat(e.target.value) || 0)
                                }
                                className="w-full rounded border border-[#ccc] px-2 py-1 text-right text-xs text-black"
                                min="0"
                                step="0.01"
                                required
                              />
                            </td>

                            <td className="border border-[#ccc] px-2 py-1 text-right font-semibold text-primary">
                              {formatRupiah(item.jumlah)}
                            </td>

                            <td className="border border-[#ccc] px-2 py-1 text-center">
                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="text-xs text-red-600 hover:underline"
                                >
                                  Hapus
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs text-primary"
                  >
                    + Tambah baris
                  </button>

                  <div className="mt-4 flex justify-end text-sm">
                    <div className="w-full space-y-2 md:w-1/2">
                      <div className="flex items-center justify-between border-b border-gray-200 py-2">
                        <span className="text-sm font-medium text-primary/70">
                          Total
                        </span>
                        <span className="text-lg font-semibold text-primary">
                          {formatRupiah(calculateTotal())}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-gray-200 py-2">
                        <label className="text-sm font-medium text-primary/70">
                          DP
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberInput(dp)}
                          onChange={(e) => setDp(parseNumberInput(e.target.value))}
                          placeholder="0"
                          className="w-44 rounded border border-muted px-3 py-2 text-right text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3">
                        <span className="text-sm font-semibold text-primary">
                          Sisa
                        </span>
                        <span className="text-lg font-bold text-red-600">
                          {formatRupiah(calculateSisa())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded border border-[#bdbdbd] px-4 py-2 text-[#444] hover:bg-[#f5f5f5]"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded bg-primary px-4 py-2 text-sm font-medium text-light disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Menyimpan..."
                      : editMode
                      ? "Update Nota"
                      : "Simpan Nota"}
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