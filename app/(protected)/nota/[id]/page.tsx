"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileText, Pencil, Trash2 } from "lucide-react";

interface Nota {
  id: string;
  nomorNota: number;
  tanggal: string;
  kepadaYth: string;
  noTelp: string;
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
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
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

  const calculateTotal = () =>
    items.reduce((sum, item) => sum + Number(item.jumlah || 0), 0);

  const calculateSisa = () => calculateTotal() - Number(dp || 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!kepadaYth.trim()) {
      setErrorMsg("Nama penerima harus diisi.");
      return;
    }

    if (!noTelp.trim()) {
      setErrorMsg("Nomor telepon harus diisi.");
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
        noTelp,
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
        headers: { "Content-Type": "application/json" },
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
      }, 1000);
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
      const res = await fetch(`/api/nota/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus nota");
      await fetchNotas();
    } catch (error: any) {
      console.error("Error deleting nota:", error);
      alert(error.message || "Gagal menghapus nota");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleOpenPdf = (id: string) => {
    window.open(`/api/nota/${id}/pdf`, "_blank");
  };

  const formatRupiah = (amount: number) =>
    `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      <div className="bg-white border border-[#bdbdbd] rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#444]">Semua Nota</h2>
          {loading && <span className="text-xs text-[#666]">Memuat...</span>}
        </div>

        {!loading && notas.length === 0 ? (
          <p className="text-xs text-[#666]">Belum ada nota yang dibuat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#e6e6e6] text-[#444] font-semibold">
                  <th className="border border-[#bdbdbd] px-2 py-2 text-left">Nomor</th>
                  <th className="border border-[#bdbdbd] px-2 py-2 text-left">Tanggal</th>
                  <th className="border border-[#bdbdbd] px-2 py-2 text-left">Kepada Yth</th>
                  <th className="border border-[#bdbdbd] px-2 py-2 text-left">No. Telp</th>
                  <th className="border border-[#bdbdbd] px-2 py-2 text-right">Total</th>
                  <th className="border border-[#bdbdbd] px-2 py-2 text-right">DP</th>
                  <th className="border border-[#bdbdbd] px-2 py-2 text-right">Sisa</th>
                  <th className="border border-[#bdbdbd] px-2 py-2 text-center">Status</th>
                  <th className="border border-[#bdbdbd] px-2 py-2 text-center w-36">Aksi</th>
                </tr>
              </thead>

              <tbody className="text-[#333]">
                {notas.map((nota) => (
                  <tr key={nota.id} className="hover:bg-[#f5f5f5] transition">
                    <td className="border border-[#ddd] px-2 py-2">
                      {String(nota.nomorNota).padStart(4, "0")}
                    </td>
                    <td className="border border-[#ddd] px-2 py-2">
                      {formatDate(nota.tanggal)}
                    </td>
                    <td className="border border-[#ddd] px-2 py-2">
                      {nota.kepadaYth}
                    </td>
                    <td className="border border-[#ddd] px-2 py-2">
                      {nota.noTelp}
                    </td>
                    <td className="border border-[#ddd] px-2 py-2 text-right font-medium text-primary">
                      {formatRupiah(nota.total)}
                    </td>
                    <td className="border border-[#ddd] px-2 py-2 text-right">
                      {formatRupiah(nota.dp)}
                    </td>
                    <td className="border border-[#ddd] px-2 py-2 text-right font-medium text-primary">
                      {formatRupiah(nota.sisa)}
                    </td>
                    <td className="border border-[#ddd] px-2 py-2 text-center">
                      {nota.sisa === 0 ? (
                        <span className="inline-block rounded bg-green-50 border border-green-200 px-2 py-1 text-[11px] font-semibold text-green-700">
                          Lunas
                        </span>
                      ) : nota.dp > 0 ? (
                        <span className="inline-block rounded bg-yellow-50 border border-yellow-200 px-2 py-1 text-[11px] font-semibold text-yellow-700">
                          DP
                        </span>
                      ) : (
                        <span className="inline-block rounded bg-red-50 border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-700">
                          Belum Bayar
                        </span>
                      )}
                    </td>
                    <td className="border border-[#ddd] px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-3">
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#ddd] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">
                {editMode ? "Edit Nota" : "Tambah Nota Baru"}
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
                <div className="bg-[#f9f9f9] border border-muted rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-primary">
                    Informasi Nota
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <label className="block text-primary">Nomor</label>
                      <input
                        disabled
                        value={editMode ? "Tidak berubah" : "Otomatis saat disimpan"}
                        className="w-full border border-muted rounded px-3 py-2 bg-light text-xs text-primary/70"
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
                      <label className="block text-primary">Kepada Yth</label>
                      <input
                        value={kepadaYth}
                        onChange={(e) => setKepadaYth(e.target.value)}
                        placeholder="Nama penerima"
                        className="w-full border border-muted rounded px-3 py-2 text-sm text-black placeholder-gray-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-primary">No. Telp/HP</label>
                      <input
                        value={noTelp}
                        onChange={(e) => setNoTelp(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="w-full border border-muted rounded px-3 py-2 text-sm text-black placeholder-gray-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#f9f9f9] border border-muted rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-primary">
                    Rincian Nota
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted text-[#444] font-semibold">
                          <th className="border border-[#888] px-2 py-1 w-8">No</th>
                          <th className="border border-[#888] px-2 py-1 text-left">Jenis Barang</th>
                          <th className="border border-[#888] px-2 py-1 text-right w-24">Qty</th>
                          <th className="border border-[#888] px-2 py-1 text-right w-32">Harga @</th>
                          <th className="border border-[#888] px-2 py-1 text-right w-32">Jumlah</th>
                          <th className="border border-[#888] px-2 py-1 w-10"></th>
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
                                className="w-full border border-[#ccc] rounded px-2 py-1 text-xs text-black placeholder-gray-500"
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
                                className="w-full border border-[#ccc] rounded px-2 py-1 text-xs text-right text-black placeholder-gray-500"
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
                                className="w-full border border-[#ccc] rounded px-2 py-1 text-xs text-right text-black placeholder-gray-500"
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
                    className="mt-2 text-xs text-primary"
                  >
                    + Tambah baris
                  </button>

                  <div className="flex justify-end mt-4 text-sm">
                    <div className="w-full md:w-1/2 space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-primary/70">
                          Total
                        </span>
                        <span className="text-lg font-semibold text-primary">
                          {formatRupiah(calculateTotal())}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <label className="text-sm font-medium text-primary/70">
                          DP
                        </label>
                        <input
                          type="number"
                          value={dp}
                          onChange={(e) => setDp(parseFloat(e.target.value) || 0)}
                          className="w-44 border border-muted rounded px-3 py-2 text-sm text-right text-black"
                          min="0"
                          max={calculateTotal()}
                          step="0.01"
                        />
                      </div>

                      <div className="flex justify-between items-center py-3 bg-red-50 px-4 rounded-md border border-red-200">
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