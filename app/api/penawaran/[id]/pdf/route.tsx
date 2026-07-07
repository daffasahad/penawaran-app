import React from "react";
import { NextResponse } from "next/server";
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

/* ================= LOGO ================= */

const logoPath = path.join(
  process.cwd(),
  "public",
  "logo-noBackground.png"
);

const logoBase64 = fs.existsSync(logoPath)
  ? fs.readFileSync(logoPath).toString("base64")
  : null;

/* ================= TANDA TANGAN ================= */

const tandaTanganPath = path.join(
  process.cwd(),
  "public",
  "tanda-tangan.png"
);

const tandaTanganBase64 = fs.existsSync(tandaTanganPath)
  ? fs.readFileSync(tandaTanganPath).toString("base64")
  : null;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
/* ================= PAGE ================= */

page: {
  paddingTop: 18,
  paddingBottom: 18,
  paddingHorizontal: 22,
  fontSize: 8.5,
  fontFamily: "Helvetica",
  color: "#111",
},

/* ================= HEADER ================= */

header: {
  marginBottom: 8,
},

headerTop: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

logoWrapper: {
  width: "42%",
  justifyContent: "center",
  alignItems: "flex-start",
},

logo: {
  width: 190,
  height: 65,
  objectFit: "contain",
},

companyInfo: {
  width: "58%",
  alignItems: "flex-end",
  justifyContent: "center",
},

companyText: {
  fontSize: 8,
  marginBottom: 2,
  lineHeight: 1.3,
  textAlign: "right",
},

headerLine: {
  borderBottom: "1.5pt solid #1e40af",
  marginTop: 6,
},

/* ================= TITLE ================= */

titleWrapper: {
  alignItems: "center",
  marginBottom: 14,
},

title: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#1e40af",
  letterSpacing: 1,
  marginBottom: 3,
},

titleLine: {
  width: 130,
  borderBottom: "1.5pt solid #1e40af",
},

/* ================= INFO ================= */

infoContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 12,
},

infoColumn: {
  width: "48%",
},

infoRow: {
  flexDirection: "row",
  marginBottom: 4,
},

infoLabel: {
  width: 52,
  fontWeight: "bold",
  fontSize: 8,
},

infoColon: {
  width: 8,
  fontSize: 8,
},

infoValue: {
  flex: 1,
  fontSize: 8,
},

/* ================= OPENING ================= */

greeting: {
  marginBottom: 4,
  fontSize: 8,
},

paragraph: {
  marginBottom: 10,
  lineHeight: 1.4,
  fontSize: 8,
  textAlign: "justify",
},

/* ================= TABLE ================= */

table: {
  width: "100%",
  marginBottom: 8,
  border: "1pt solid #d9d9d9",
},

tableHeader: {
  flexDirection: "row",
  backgroundColor: "#1e40af",
  color: "#fff",
  fontWeight: "bold",
  fontSize: 7.5,
  minHeight: 22,
  alignItems: "center",
},

tableRow: {
  flexDirection: "row",
  borderBottom: "1pt solid #ececec",
  fontSize: 7,
  minHeight: 22,
  alignItems: "center",
},

th: {
  paddingVertical: 4,
  paddingHorizontal: 4,
  borderRight: "1pt solid #d9d9d9",
  textAlign: "center",
},

td: {
  paddingVertical: 4,
  paddingHorizontal: 4,
  borderRight: "1pt solid #ececec",
},

noCol: {
  width: "6%",
  textAlign: "center",
},

descCol: {
  width: "42%",
},

sizeCol: {
  width: "15%",
  textAlign: "center",
},

qtyCol: {
  width: "10%",
  textAlign: "center",
},

priceCol: {
  width: "13%",
  textAlign: "right",
},

totalCol: {
  width: "14%",
  textAlign: "right",
  borderRight: 0,
},

/* ================= TOTAL ================= */

totalBar: {
  marginTop: 3,
  backgroundColor: "#1e40af",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 6,
  paddingHorizontal: 10,
  color: "#fff",
  fontWeight: "bold",
  fontSize: 9,
  marginBottom: 10,
},

/* ================= BOTTOM ================= */

bottomWrapper: {
  flexDirection: "row",
  border: "1pt solid #d9d9d9",
  marginBottom: 10,
},

bottomLeft: {
  width: "50%",
  padding: 8,
  borderRight: "1pt solid #d9d9d9",
},

bottomRight: {
  width: "50%",
  padding: 8,
},

sectionTitle: {
  fontWeight: "bold",
  marginBottom: 4,
  fontSize: 8,
},

smallText: {
  fontSize: 6.8,
  lineHeight: 1.4,
  marginBottom: 1,
},

/* ================= CLOSING ================= */

closingText: {
  fontSize: 7,
  lineHeight: 1.4,
  textAlign: "justify",
  marginBottom: 20,
},

/* ================= SIGNATURE ================= */

signature: {
  width: 160,
  alignSelf: "flex-end",
  alignItems: "center",
},

signatureImage: {
  width: 120,
  height: 50,
  marginBottom: 4,
  objectFit: "contain",
},

signatureText: {
  fontSize: 7,
  marginBottom: 4,
  textAlign: "center",
},

signatureName: {
  fontSize: 7.5,
  fontWeight: "bold",
  textAlign: "center",
},

signatureRole: {
  fontSize: 6.5,
  marginTop: 1,
},
});

/* ================= PDF COMPONENT ================= */

/* ================= PDF COMPONENT ================= */

const PenawaranPDF = ({
  quotation,
}: {
  quotation: any;
}) => {

  /* ================= TOTAL ================= */

  const totalAmount = quotation.items.reduce(
    (sum: number, item: any) =>
      sum + item.total,
    0
  );

  /* ================= FORMAT ================= */

  const formatCurrency = (
    value: number
  ) => value.toLocaleString("id-ID");

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  /* ================= SPESIFIKASI MATERIAL ================= */

  const spesifikasiList = [
    ...new Set(
      quotation.items
        .map((item: any) =>
          (item.keterangan || "").trim()
        )
        .filter(
          (v: string) =>
            v.length > 0
        )
    ),
  ];

  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
      >

        {/* ================= HEADER ================= */}

        <View style={styles.header}>

          <View style={styles.headerTop}>

            {/* LOGO */}
            <View style={styles.logoWrapper}>
              {logoBase64 && (
                <Image
                  src={`data:image/png;base64,${logoBase64}`}
                  style={styles.logo}
                />
              )}
            </View>

            {/* COMPANY INFO */}
            <View style={styles.companyInfo}>

              <Text style={styles.companyText}>
                Mengerjakan: Kaca,
                Aluminium, dan
                Sunblasting
              </Text>

              <Text style={styles.companyText}>
                Central Legenda Point
                Blok I No.6 Batam
                Centre
              </Text>

              <Text style={styles.companyText}>
                Telp: 0811779969 |
                Email:
                kreasimandiriglass69@gmail.com
              </Text>

            </View>

          </View>

          {/* GARIS */}
          <View
            style={styles.headerLine}
          />

        </View>

        {/* ================= TITLE ================= */}

        <View style={styles.titleWrapper}>

          <Text style={styles.title}>
            PENAWARAN HARGA
          </Text>

          <View
            style={styles.titleLine}
          />

        </View>

        {/* ================= INFO ================= */}

        <View
          style={styles.infoContainer}
        >

          {/* KIRI */}
          <View
            style={styles.infoColumn}
          >

            <View
              style={styles.infoRow}
            >
              <Text
                style={styles.infoLabel}
              >
                Nomor
              </Text>

              <Text
                style={styles.infoColon}
              >
                :
              </Text>

              <Text
                style={styles.infoValue}
              >
                {quotation.nomor}
              </Text>
            </View>

            {/* LAMPIRAN */}
            <View
              style={styles.infoRow}
            >
              <Text
                style={styles.infoLabel}
              >
                Lampiran
              </Text>

              <Text
                style={styles.infoColon}
              >
                :
              </Text>

              <Text
                style={styles.infoValue}
              >
                {quotation.lampiran ||
                  "-"}
              </Text>
            </View>

            <View
              style={styles.infoRow}
            >
              <Text
                style={styles.infoLabel}
              >
                Kepada
              </Text>

              <Text
                style={styles.infoColon}
              >
                :
              </Text>

              <Text
                style={styles.infoValue}
              >
                {
                  quotation.kepadaYth
                }
              </Text>
            </View>

          </View>

          {/* KANAN */}
          <View
            style={styles.infoColumn}
          >

            <View
              style={styles.infoRow}
            >
              <Text
                style={styles.infoLabel}
              >
                Tanggal
              </Text>

              <Text
                style={styles.infoColon}
              >
                :
              </Text>

              <Text
                style={styles.infoValue}
              >
                {formatDate(
                  quotation.tanggal
                )}
              </Text>
            </View>

            <View
              style={styles.infoRow}
            >
              <Text
                style={styles.infoLabel}
              >
                Perihal
              </Text>

              <Text
                style={styles.infoColon}
              >
                :
              </Text>

              <Text
                style={styles.infoValue}
              >
                Penawaran
                Pekerjaan
              </Text>
            </View>

          </View>

        </View>

        {/* ================= OPENING ================= */}

        <Text style={styles.greeting}>
          Dengan hormat,
        </Text>

        <Text style={styles.paragraph}>
          Bersama surat ini kami
          menyampaikan penawaran
          harga pekerjaan sesuai
          kebutuhan yang telah
          didiskusikan sebelumnya.
        </Text>

        {/* ================= TABLE ================= */}

        <View style={styles.table}>

          {/* HEADER */}
          <View
            style={styles.tableHeader}
          >

            <Text
              style={[
                styles.th,
                styles.noCol,
              ]}
            >
              No
            </Text>

            <Text
              style={[
                styles.th,
                styles.descCol,
              ]}
            >
              Deskripsi
            </Text>

            <Text
              style={[
                styles.th,
                styles.sizeCol,
              ]}
            >
              Ukuran
            </Text>

            <Text
              style={[
                styles.th,
                styles.qtyCol,
              ]}
            >
              Qty
            </Text>

            <Text
              style={[
                styles.th,
                styles.priceCol,
              ]}
            >
              Harga
            </Text>

            <Text
              style={[
                styles.th,
                styles.totalCol,
              ]}
            >
              Total
            </Text>

          </View>

          {/* ITEMS */}
          {quotation.items.map(
            (
              item: any,
              index: number
            ) => (
              <View
                key={index}
                style={styles.tableRow}
              >

                <Text
                  style={[
                    styles.td,
                    styles.noCol,
                  ]}
                >
                  {index + 1}
                </Text>

                <Text
                  style={[
                    styles.td,
                    styles.descCol,
                  ]}
                >
                  {item.deskripsi}
                </Text>

                <Text
                  style={[
                    styles.td,
                    styles.sizeCol,
                  ]}
                >
                  {item.ukuran}
                </Text>

                <Text
                  style={[
                    styles.td,
                    styles.qtyCol,
                  ]}
                >
                  {item.pcs}
                </Text>

                <Text
                  style={[
                    styles.td,
                    styles.priceCol,
                  ]}
                >
                  Rp{" "}
                  {formatCurrency(
                    item.harga
                  )}
                </Text>

                <Text
                  style={[
                    styles.td,
                    styles.totalCol,
                  ]}
                >
                  Rp{" "}
                  {formatCurrency(
                    item.total
                  )}
                </Text>

              </View>
            )
          )}

        </View>

        {/* ================= TOTAL ================= */}

        <View
          style={styles.totalBar}
        >

          <Text>
            TOTAL PENAWARAN
          </Text>

          <Text>
            Rp{" "}
            {formatCurrency(
              totalAmount
            )}
          </Text>

        </View>

        {/* ================= BOTTOM ================= */}

        <View
          style={styles.bottomWrapper}
        >

          {/* KIRI */}
          <View
            style={styles.bottomLeft}
          >

            <Text
              style={styles.sectionTitle}
            >
              Spesifikasi Material
            </Text>

            {/* DYNAMIC KETERANGAN */}
            <View>

  {spesifikasiList.length > 0 ? (

    spesifikasiList.map(
      (item, index) => (
        <View key={index}>

          <Text style={styles.smallText}>
            • {String(item)}
          </Text>

        </View>
      )
    )

  ) : (

    <Text style={styles.smallText}>
      -
    </Text>

  )}

</View>

            <Text
              style={[
                styles.sectionTitle,
                {
                  marginTop: 12,
                },
              ]}
            >
              Estimasi
              Pengerjaan
            </Text>

            <Text
              style={styles.smallText}
            >
              5–7 hari kerja
              setelah DP diterima.
            </Text>

          </View>

          {/* KANAN */}
          <View
            style={
              styles.bottomRight
            }
          >

            <Text
              style={styles.sectionTitle}
            >
              Ketentuan
              Pembayaran
            </Text>

            <Text
              style={styles.smallText}
            >
              • DP 30% sebelum
              pekerjaan dimulai
            </Text>

            <Text
              style={styles.smallText}
            >
              • Pelunasan 70%
              setelah pekerjaan
              selesai
            </Text>

            <Text
              style={[
                styles.sectionTitle,
                {
                  marginTop: 12,
                },
              ]}
            >
              Informasi
              Rekening
            </Text>

            <Text
              style={styles.smallText}
            >
              BCA : 8520123581 - SAMSIR
            </Text>

            <Text
              style={styles.smallText}
            >
              Mandiri :
              9000006393558 - SAMSIR
            </Text>

          </View>

        </View>

        {/* ================= CLOSING ================= */}

        <Text
          style={styles.closingText}
        >
          Demikian penawaran ini
          kami sampaikan. Besar
          harapan kami dapat
          menjalin kerja sama
          yang baik. Atas
          perhatian dan
          kepercayaan yang
          diberikan, kami
          ucapkan terima kasih.
        </Text>

        {/* ================= SIGNATURE ================= */}

      <View
        style={styles.signature}
      >

        <Text
          style={
            styles.signatureText
          }
        >
          Hormat Kami,
        </Text>

        {tandaTanganBase64 && (
          <Image
            src={`data:image/png;base64,${tandaTanganBase64}`}
            style={
              styles.signatureImage
            }
          />
        )}

        <Text
          style={
            styles.signatureName
          }
        >
          Samsir
        </Text>

        <Text
          style={
            styles.signatureRole
          }
        >
          Direktur
        </Text>

      </View>

      </Page>
    </Document>
  );
};

/* ================= ROUTE HANDLER ================= */

export async function GET(
  _req: Request,
  context: any
) {
  try {
    const params =
      await Promise.resolve(
        context.params
      );

    const numericId = parseInt(
      params.id,
      10
    );

    if (
      Number.isNaN(numericId) ||
      numericId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "ID Penawaran tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const quotation =
      await prisma.quotation.findUnique({
        where: {
          id: numericId,
        },
        include: {
          items: true,
        },
      });

    if (!quotation) {
      return NextResponse.json(
        {
          error:
            "Data Penawaran tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    const stream =
      await ReactPDF.renderToStream(
        <PenawaranPDF
          quotation={quotation}
        />
      );

    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer =
      Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          `inline; filename="${quotation.nomor}.pdf"`,

        "Cache-Control":
          "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error(
      "PDF Generation Error:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Gagal membuat PDF",
        message:
          err.message ||
          String(err),
      },
      {
        status: 500,
      }
    );
  }
}