"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NotaItem {
  no: number;
  jenisBarang: string;
  qty: number;
  harga: number;
  jumlah: number;
}

export default function CreateNotaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [kepadaYth, setKepadaYth] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState<NotaItem[]>([
    { no: 1, jenisBarang: "", qty: 1, harga: 0, jumlah: 0 },
  ]);
  const [dp, setDp] = useState(0);

  // Add new item row
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

  // Remove item row
  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    // Re-number items
    newItems.forEach((item, i) => {
      item.no = i + 1;
    });
    setItems(newItems);
  };

  // Update item field
  const updateItem = (
    index: number,
    field: keyof NotaItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto calculate jumlah
    if (field === "qty" || field === "harga") {
      newItems[index].jumlah =
        newItems[index].qty * newItems[index].harga;
    }

    setItems(newItems);
  };

  // Calculate totals
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.jumlah, 0);
  };

  const calculateSisa = () => {
    return calculateTotal() - dp;
  };

  // Format rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!kepadaYth.trim()) {
      alert("Nama penerima harus diisi");
      return;
    }
    if (!noTelp.trim()) {
      alert("Nomor telepon harus diisi");
      return;
    }
    if (items.some((item) => !item.jenisBarang.trim())) {
      alert("Semua jenis barang harus diisi");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/nota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kepadaYth,
          noTelp,
          tanggal,
          items,
          dp,
        }),
      });

      if (!res.ok) throw new Error("Failed to create nota");

      const data = await res.json();
      router.push(`/nota/${data.id}`);
    } catch (error) {
      console.error("Error creating nota:", error);
      alert("Gagal membuat nota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href="/nota"
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <span>←</span> Kembali ke Daftar Nota
        </Link>
        <h1 className="text-2xl font-bold text-primary mt-2">Buat Nota Baru</h1>
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
              placeholder="Nama penerima"
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
              placeholder="08xxxxxxxxxx"
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
                        placeholder="Deskripsi barang"
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
                          title="Hapus item"
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
        <div className="border-t pt-6 mt-6">
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 space-y-3">
              {/* Total */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Total:</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatRupiah(calculateTotal())}
                </span>
              </div>

              {/* DP Input */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <label className="text-sm font-medium text-gray-700">DP:</label>
                <input
                  type="number"
                  value={dp}
                  onChange={(e) => setDp(parseFloat(e.target.value) || 0)}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md text-right text-gray-900 bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                  min="0"
                  max={calculateTotal()}
                  step="0.01"
                  placeholder="0"
                />
              </div>

              {/* Sisa */}
              <div className="flex justify-between items-center py-3 bg-red-50 px-4 rounded-md border border-red-200">
                <span className="text-sm font-bold text-gray-700">Sisa:</span>
                <span className="text-xl font-bold text-red-600">
                  {formatRupiah(calculateSisa())}
                </span>
              </div>
            </div>
          </div>
        </div>

 {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/nota"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            {loading ? "Menyimpan..." : "Simpan Nota"}
          </button>
        </div>
      </form>
    </div>
  );
}