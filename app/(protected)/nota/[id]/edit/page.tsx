"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface NotaItem {
  no: number;
  jenisBarang: string;
  qty: number;
  harga: number;
  jumlah: number;
}

export default function EditNotaPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [kepadaYth, setKepadaYth] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [items, setItems] = useState<NotaItem[]>([]);
  const [dp, setDp] = useState(0);

  useEffect(() => {
    fetchNota();
  }, []);

  const fetchNota = async () => {
    try {
      const res = await fetch(`/api/nota/${params.id}`);
      const data = await res.json();

      setKepadaYth(data.kepadaYth);
      setNoTelp(data.noTelp);
      setTanggal(new Date(data.tanggal).toISOString().split("T")[0]);
      setItems(data.items);
      setDp(parseFloat(data.dp));
    } catch (error) {
      console.error("Error fetching nota:", error);
      alert("Gagal memuat data nota");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        no: items.length + 1,
        jenisBarang: "",
        qty: 1,
        harga: 0,
        jumlah: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    newItems.forEach((item, i) => {
      item.no = i + 1;
    });
    setItems(newItems);
  };

  const updateItem = (
    index: number,
    field: keyof NotaItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "qty" || field === "harga") {
      newItems[index].jumlah = newItems[index].qty * newItems[index].harga;
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.jumlah, 0);
  };

  const calculateSisa = () => {
    return calculateTotal() - dp;
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!kepadaYth.trim() || !noTelp.trim()) {
      alert("Nama dan nomor telepon harus diisi");
      return;
    }

    if (items.some((item) => !item.jenisBarang.trim())) {
      alert("Semua jenis barang harus diisi");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/nota/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kepadaYth,
          noTelp,
          tanggal,
          items,
          dp,
        }),
      });

      if (!res.ok) throw new Error("Failed to update nota");

      router.push(`/nota/${params.id}`);
    } catch (error) {
      console.error("Error updating nota:", error);
      alert("Gagal mengupdate nota");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/nota/${params.id}`}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <span>←</span> Kembali ke Detail Nota
        </Link>
        <h1 className="text-2xl font-bold text-primary mt-2">Edit Nota</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kepada Yth. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kepadaYth}
              onChange={(e) => setKepadaYth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Telp/HP <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={noTelp}
              onChange={(e) => setNoTelp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700">
              Daftar Barang
            </label>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Tambah Item
            </button>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-12">
                    No
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Jenis Barang
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32">
                    Harga @
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32">
                    Jumlah
                  </th>
                  <th className="px-3 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {item.no}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.jenisBarang}
                        onChange={(e) =>
                          updateItem(index, "jenisBarang", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(index, "qty", parseInt(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        min="1"
                        required
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.harga}
                        onChange={(e) =>
                          updateItem(index, "harga", parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                      {formatRupiah(item.jumlah)}
                    </td>
                    <td className="px-3 py-2">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total:</span>
                <span className="text-lg font-bold">
                  {formatRupiah(calculateTotal())}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">DP:</label>
                <input
                  type="number"
                  value={dp}
                  onChange={(e) => setDp(parseFloat(e.target.value) || 0)}
                  className="w-40 px-3 py-1 border border-gray-300 rounded-md text-right"
                  min="0"
                  max={calculateTotal()}
                  step="0.01"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">Sisa:</span>
                <span className="text-lg font-bold text-red-600">
                  {formatRupiah(calculateSisa())}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <Link
            href={`/nota/${params.id}`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}