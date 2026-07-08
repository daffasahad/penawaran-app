import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import ReactPDF from "@react-pdf/renderer";

import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const h = React.createElement;

const BLUE = "#1e40af";
const RED = "#dc2626";

const logoPath = path.join(process.cwd(), "public", "logo-noBackground.png");
const tandaTanganPath = path.join(process.cwd(), "public", "tanda-tangan.png");

const logoBase64 = fs.existsSync(logoPath)
  ? fs.readFileSync(logoPath).toString("base64")
  : null;

const tandaTanganBase64 = fs.existsSync(tandaTanganPath)
  ? fs.readFileSync(tandaTanganPath).toString("base64")
  : null;

const formatRupiah = (amount: any) => {
  return `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const bulanRomawi = (date: Date) => {
  const bulan = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];

  return bulan[new Date(date).getMonth()];
};

const getNomorNotaLengkap = (nota: any) => {
  return `${String(nota.nomorNota).padStart(4, "0")}/Nota-KMG/${bulanRomawi(
    nota.tanggal
  )}/${new Date(nota.tanggal).getFullYear()}`;
};

const styles = StyleSheet.create({
  page: {
    width: "16.5cm",
    height: "21.6cm",
    paddingTop: 14,        // was 22
    paddingHorizontal: 26,
    paddingBottom: 0,
    fontFamily: "Helvetica",
    color: BLUE,
    backgroundColor: "#ffffff",
    position: "relative",
  },

  watermark: {
    position: "absolute",
    top: 155,
    left: 40,
    right: 40,
    opacity: 0.04,
    fontSize: 32,
    color: BLUE,
    lineHeight: 1.8,
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,        // was 8
  },

  logo: {
    width: 85,             // was 100
    height: 40,             // was 48
    objectFit: "contain",
  },

  title: {
    fontSize: 18,           // was 30
    fontWeight: "bold",
    color: BLUE,
    textAlign: "right",
    lineHeight: 1.05,
    letterSpacing: 0.5,
  },

  divider: {
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
    marginTop: 2,            // was 4
    marginBottom: 6,         // was 14
  },

  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,         // was 14
  },

  infoLeft: {
    width: "50%",
  },

  infoRight: {
    width: "42%",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,         // was 6
  },

  infoLabelLeft: {
    width: 82,
    fontSize: 8,             // was 9
    fontWeight: "bold",
    color: BLUE,
  },

  infoLabelRight: {
    width: 52,
    fontSize: 8,             // was 9
    fontWeight: "bold",
    color: BLUE,
  },

  infoColon: {
    width: 8,
    fontSize: 8,
    color: BLUE,
  },

  infoValue: {
    flex: 1,
    fontSize: 7.5,           // was 8
    color: "#111111",
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: BLUE,
    borderStyle: "dotted",
    paddingBottom: 1,        // was 2
  },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: BLUE,
    marginTop: 2,            // was 6
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: BLUE,
    minHeight: 16,           // was 24
    alignItems: "center",
  },

  tableRow: {
    flexDirection: "row",
    minHeight: 15,           // was 23
    borderBottomWidth: 1,
    borderBottomColor: BLUE,
    alignItems: "center",
  },

  th: {
    color: "#ffffff",
    fontSize: 8,             // was 9
    fontWeight: "bold",
    paddingVertical: 3,      // was 6
    paddingHorizontal: 4,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#ffffff",
  },

  td: {
    fontSize: 7,             // was 7.5
    color: "#111111",
    paddingVertical: 2,      // was 5
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: BLUE,
  },

  noCol: {
    width: "6%",
    textAlign: "center",
  },

  descCol: {
    width: "52%",
  },

  qtyCol: {
    width: "9%",
    textAlign: "center",
  },

  priceCol: {
    width: "16.5%",
    textAlign: "right",
  },

  totalCol: {
    width: "16.5%",
    textAlign: "right",
    borderRightWidth: 0,
  },

  middleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,            // was 8
  },

  thanks: {
    width: "45%",
    color: BLUE,
    fontSize: 12,            // was 20
    lineHeight: 1.15,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 4,            // was 12
  },

  summary: {
    width: "43%",
    borderWidth: 1,
    borderColor: BLUE,
  },

  summaryRow: {
    flexDirection: "row",
    minHeight: 18,           // was 26
    borderBottomWidth: 1,
    borderBottomColor: BLUE,
  },

  summaryRowLast: {
    flexDirection: "row",
    minHeight: 18,           // was 26
  },

  summaryLabel: {
    width: "40%",
    backgroundColor: BLUE,
    color: "#ffffff",
    fontSize: 7.5,           // was 8.5
    fontWeight: "bold",
    paddingVertical: 4,      // was 8
    paddingHorizontal: 8,
  },

  summaryLabelRed: {
    width: "40%",
    backgroundColor: RED,
    color: "#ffffff",
    fontSize: 7.5,           // was 8.5
    fontWeight: "bold",
    paddingVertical: 4,      // was 8
    paddingHorizontal: 8,
  },

  summaryValue: {
    width: "60%",
    color: "#111111",
    fontSize: 7.5,           // was 8.5
    fontWeight: "bold",
    textAlign: "right",
    paddingVertical: 4,      // was 8
    paddingHorizontal: 8,
  },

  summaryValueRed: {
    width: "60%",
    color: RED,
    fontSize: 7.5,           // was 8.5
    fontWeight: "bold",
    textAlign: "right",
    paddingVertical: 4,      // was 8
    paddingHorizontal: 8,
  },

  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,           // was 22
    paddingHorizontal: 30,
  },

  signatureBox: {
    width: 150,
    alignItems: "center",
  },

  signatureTitle: {
    fontSize: 7.5,           // was 8
    fontWeight: "bold",
    color: BLUE,
    marginBottom: 10,         // was 8
  },

  signatureSpace: {
    height: 34,              // was 38
  },

  signatureImage: {
    width: 800,               // was 80
    height: 32,              // was 38
    objectFit: "contain",
    marginBottom: "2",
  },

  signatureLine: {
    width: 130,
    borderBottomWidth: 1,
    borderBottomColor: BLUE,
    borderStyle: "dotted",
    marginTop: 2,
    marginBottom: 3,
  },

  signatureName: {
    fontSize: 7.5,           // was 8
    fontWeight: "bold",
    color: BLUE,
    textAlign: "center",
  },

  signatureRole: {
    fontSize: 7,             // unchanged
    fontWeight: "bold",
    color: BLUE,
    textAlign: "center",
    marginTop: 1,            // was 2
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 22,              // was 28
    backgroundColor: BLUE,
    color: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 26,
  },

  footerPhone: {
    width: "40%",
    fontSize: 7.5,           // was 8
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "left",
  },

  footerAddress: {
    width: "60%",
    fontSize: 7.5,           // was 8
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
});

function NotaPDF({ nota }: { nota: any }) {
  const nomorNotaLengkap = getNomorNotaLengkap(nota);

  const rows = nota.items;

  return h(
    Document,
    null,
    h(
      Page,
      {
        size: [467.7, 612.3],
        style: styles.page,
      },

      h(
        Text,
        { style: styles.watermark },
        "✧  ◌  ✦  ◌  ✧  ◌  ✦\n◌  ✧  ◌  ✦  ◌  ✧\n✦  ◌  ✧  ◌  ✦  ◌"
      ),

      h(
        View,
        { style: styles.header },
        h(
          View,
          null,
          logoBase64
            ? h(Image, {
                src: `data:image/png;base64,${logoBase64}`,
                style: styles.logo,
              })
            : null
        ),
        h(Text, { style: styles.title }, "NOTA\nPEMBAYARAN")
      ),

      h(View, { style: styles.divider }),

      h(
        View,
        { style: styles.infoContainer },

        h(
          View,
          { style: styles.infoLeft },
          h(
            View,
            { style: styles.infoRow },
            h(Text, { style: styles.infoLabelLeft }, "No. Pembayaran"),
            h(Text, { style: styles.infoColon }, ":"),
            h(Text, { style: styles.infoValue }, nomorNotaLengkap)
          )
        ),

        h(
          View,
          { style: styles.infoRight },
          h(
            View,
            { style: styles.infoRow },
            h(Text, { style: styles.infoLabelRight }, "Nama"),
            h(Text, { style: styles.infoColon }, ":"),
            h(Text, { style: styles.infoValue }, nota.kepadaYth || "-")
          ),
          h(
            View,
            { style: styles.infoRow },
            h(Text, { style: styles.infoLabelRight }, "Tanggal"),
            h(Text, { style: styles.infoColon }, ":"),
            h(Text, { style: styles.infoValue }, formatDate(nota.tanggal))
          ),
          h(
            View,
            { style: styles.infoRow },
            h(Text, { style: styles.infoLabelRight }, "No. Telp"),
            h(Text, { style: styles.infoColon }, ":"),
            h(Text, { style: styles.infoValue }, " ")
          )
        )
      ),

      h(
        View,
        { style: styles.table },

        h(
          View,
          { style: styles.tableHeader },
          h(Text, { style: [styles.th, styles.noCol] }, "No"),
          h(Text, { style: [styles.th, styles.descCol] }, "Deskripsi"),
          h(Text, { style: [styles.th, styles.qtyCol] }, "Jumlah"),
          h(Text, { style: [styles.th, styles.priceCol] }, "Harga"),
          h(Text, { style: [styles.th, styles.totalCol] }, "Total")
        ),

        ...rows.map((item: any) =>
          h(
            View,
            { style: styles.tableRow, key: item.no },
            h(Text, { style: [styles.td, styles.noCol] }, String(item.no || "")),
            h(Text, { style: [styles.td, styles.descCol] }, item.jenisBarang || ""),
            h(
              Text,
              { style: [styles.td, styles.qtyCol] },
              item.qty ? String(item.qty) : ""
            ),
            h(
              Text,
              { style: [styles.td, styles.priceCol] },
              item.harga ? formatRupiah(item.harga) : ""
            ),
            h(
              Text,
              { style: [styles.td, styles.totalCol] },
              item.jumlah ? formatRupiah(item.jumlah) : ""
            )
          )
        )
      ),

      h(
        View,
        { style: styles.middleSection },

        h(Text, { style: styles.thanks }, "TERIMA KASIH\nATAS KUNJUNGAN\nANDA."),

        h(
          View,
          { style: styles.summary },

          h(
            View,
            { style: styles.summaryRow },
            h(Text, { style: styles.summaryLabel }, "Total"),
            h(Text, { style: styles.summaryValue }, formatRupiah(nota.total))
          ),

          h(
            View,
            { style: styles.summaryRow },
            h(Text, { style: styles.summaryLabel }, "DP"),
            h(Text, { style: styles.summaryValue }, formatRupiah(nota.dp))
          ),

          h(
            View,
            { style: styles.summaryRowLast },
            h(Text, { style: styles.summaryLabelRed }, "Sisa"),
            h(Text, { style: styles.summaryValueRed }, formatRupiah(nota.sisa))
          )
        )
      ),

      h(
        View,
        { style: styles.signatureSection },

        h(
          View,
          { style: styles.signatureBox },
          h(Text, { style: styles.signatureTitle }, "Tanda Terima,"),
          h(View, { style: styles.signatureSpace }),
          h(View, { style: styles.signatureLine })
        ),

        h(
          View,
          { style: styles.signatureBox },
          h(Text, { style: styles.signatureTitle }, "Hormat Kami,"),
          tandaTanganBase64
            ? h(Image, {
                src: `data:image/png;base64,${tandaTanganBase64}`,
                style: styles.signatureImage,
              })
            : h(View, { style: styles.signatureSpace }),
          h(View, { style: styles.signatureLine }),
          h(Text, { style: styles.signatureName }, "Samsir"),
          h(Text, { style: styles.signatureRole }, "Direktur")
        )
      ),

      h(
        View,
        { style: styles.footer },
        h(Text, { style: styles.footerPhone }, "☎ 0811 779 969"),
        h(
          Text,
          { style: styles.footerAddress },
          "Ruko Central Legenda Point Blok I Batam Centre - Batam"
        )
      )
    )
  );
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);

    const nota = await prisma.nota.findUnique({
      where: {
        id: params.id,
      },
      include: {
        items: {
          orderBy: {
            no: "asc",
          },
        },
      },
    });

    if (!nota) {
      return NextResponse.json(
        {
          error: "Data Nota tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    const stream = await ReactPDF.renderToStream(
      NotaPDF({ nota }) as React.ReactElement
    );
    
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Nota-${String(
          nota.nomorNota
        ).padStart(4, "0")}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("PDF Nota Generation Error:", err);

    return NextResponse.json(
      {
        error: "Gagal membuat PDF Nota",
        message: err?.message || String(err),
      },
      {
        status: 500,
      }
    );
  }
}